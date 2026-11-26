/* global process */
import { createHash } from "node:crypto";
import path from "node:path";
import nodemailer from "nodemailer";
import { buildConfirmationEmail } from "./email/confirmation.js";
import { buildEnquiryEmail } from "./email/enquiry.js";

const rootDir = process.cwd();
const envFiles = [".env.local", ".env"];

for (const envFile of envFiles) {
  const envPath = path.join(rootDir, envFile);
  try {
    process.loadEnvFile?.(envPath);
  } catch {
    // Ignore missing local env files.
  }
}

const BRAND_NAME = "Bndlabs";
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 160;
const MAX_SOURCE_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 5000;
const OFFICIAL_EMAIL = "hello@bndlabs.tech";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map();
const recentSubmissions = new Map();

function safeString(value) {
  return String(value ?? "").trim();
}

function singleLine(value) {
  return safeString(value).replace(/[\r\n]+/g, " ");
}

function truncate(value, maxLength) {
  return safeString(value).slice(0, maxLength);
}

function firstEnvValue(...names) {
  for (const name of names) {
    const value = safeString(process.env[name]);
    if (value) return value;
  }

  return "";
}

function parsePort(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value, fallback) {
  const normalized = safeString(value).toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;

  return fallback;
}

function emailDomain(value) {
  return safeString(value).toLowerCase().split("@").pop() || "";
}

function officialMailbox(value) {
  const address = safeString(value).toLowerCase();
  if (!address || address.endsWith("@getbndlabs.com")) return OFFICIAL_EMAIL;
  return address;
}

function getMailConfig() {
  const smtpHost = firstEnvValue("SMTP_HOST") || "smtp.zoho.com";
  const smtpPort = parsePort(firstEnvValue("SMTP_PORT"), 465);
  const smtpSecure = parseBoolean(firstEnvValue("SMTP_SECURE"), smtpPort === 465);
  const smtpUser = firstEnvValue("SMTP_USER", "ZOHO_USER");
  const smtpPass = firstEnvValue("SMTP_PASS", "ZOHO_PASS");
  const contactToEmail = officialMailbox(firstEnvValue("CONTACT_TO_EMAIL", "CONTACT_EMAIL"));
  const contactFromEmail = officialMailbox(firstEnvValue("CONTACT_FROM_EMAIL", "FROM_EMAIL"));
  const autoReplySubject =
    firstEnvValue("CONTACT_AUTO_REPLY_SUBJECT") || "We've received your message";

  if (emailDomain(smtpUser) && emailDomain(smtpUser) !== emailDomain(contactFromEmail)) {
    console.error("CONTACT_SMTP_DOMAIN_MISMATCH", {
      authenticatedDomain: emailDomain(smtpUser),
      senderDomain: emailDomain(contactFromEmail),
    });
  }

  return {
    turnstileSecret: firstEnvValue("TURNSTILE_SECRET_KEY"),
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPass,
    contactToEmail,
    contactFromEmail,
    autoReplySubject,
  };
}

function sendJson(res, status, body) {
  Object.entries(JSON_HEADERS).forEach(([key, value]) => res.setHeader(key, value));
  res.status(status).json(body);
}

function parsePayload(body) {
  if (!body) return null;

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }

  if (typeof body === "object") return body;
  return null;
}

function normalizeName(payload) {
  const explicitName = singleLine(payload?.name);
  if (explicitName) return explicitName;

  const firstName = singleLine(payload?.firstName);
  const lastName = singleLine(payload?.lastName);
  return [firstName, lastName].filter(Boolean).join(" ");
}

function getClientIp(req) {
  const forwardedFor = safeString(req?.headers?.["x-forwarded-for"] || req?.headers?.["X-Forwarded-For"]);
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return safeString(req?.socket?.remoteAddress || req?.connection?.remoteAddress || "unknown");
}

function pruneRateLimitStore(now) {
  for (const [ip, timestamps] of rateLimitStore.entries()) {
    const freshTimestamps = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
    if (freshTimestamps.length) {
      rateLimitStore.set(ip, freshTimestamps);
    } else {
      rateLimitStore.delete(ip);
    }
  }

  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp >= RATE_LIMIT_WINDOW_MS) recentSubmissions.delete(key);
  }
}

function isRateLimited(ip) {
  const now = Date.now();
  pruneRateLimitStore(now);

  const timestamps = rateLimitStore.get(ip) || [];
  const freshTimestamps = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (freshTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, freshTimestamps);
    return true;
  }

  freshTimestamps.push(now);
  rateLimitStore.set(ip, freshTimestamps);
  return false;
}

function submissionKey(value) {
  return createHash("sha256")
    .update(`${value.email}\n${value.subject}\n${value.message}`)
    .digest("hex");
}

function isDuplicateSubmission(value) {
  const now = Date.now();
  pruneRateLimitStore(now);
  const key = submissionKey(value);
  const previous = recentSubmissions.get(key);
  return typeof previous === "number" && now - previous < RATE_LIMIT_WINDOW_MS;
}

function rememberSubmission(value) {
  recentSubmissions.set(submissionKey(value), Date.now());
}

function deliveryError(error) {
  return String(error instanceof Error ? error.message : error || "delivery failed")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/pass(word)?[=:]\s*\S+/gi, "pass=[redacted]")
    .slice(0, 180);
}

function formatSubmittedAt(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
    timeZoneName: "short",
  }).format(date);
}

async function verifyTurnstile(token, secret, ip) {
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false };

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const result = await response.json().catch(() => null);
    return { ok: Boolean(result?.success) };
  } catch {
    return { ok: false };
  }
}

function validatePayload(payload) {
  const rawMessage = safeString(payload?.message);
  const name = truncate(normalizeName(payload), MAX_NAME_LENGTH);
  const firstName = truncate(singleLine(payload?.firstName) || singleLine(name.split(" ")[0]), MAX_NAME_LENGTH);
  const email = singleLine(payload?.email).toLowerCase();
  const subject = truncate(singleLine(payload?.subject), MAX_SUBJECT_LENGTH);
  const message = truncate(rawMessage, MAX_MESSAGE_LENGTH);
  const source = truncate(singleLine(payload?.source) || "website", MAX_SOURCE_LENGTH);
  const subscribe = Boolean(payload?.subscribe);
  const turnstileToken = singleLine(payload?.turnstileToken);
  const honeypot = singleLine(payload?.company || payload?.website || payload?.fax || payload?.botField);

  if (honeypot) {
    return { ignored: true };
  }

  if (!name || !email || !subject || !message) {
    return { error: "Add your name, email, subject, and message." };
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Please enter a valid email address." };
  }

  if (rawMessage.length > MAX_MESSAGE_LENGTH) {
    return { error: "Message is too long. Please keep it under 5000 characters." };
  }

  return {
    value: {
      name,
      firstName,
      email,
      subject,
      message,
      source,
      subscribe,
      turnstileToken,
    },
  };
}

function formatFrom(address) {
  return `${BRAND_NAME} <${address}>`;
}

function createTransport(config) {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    sendJson(res, 429, {
      error: "Too many requests. Please wait a few minutes and try again.",
    });
    return;
  }

  const payload = parsePayload(req.body);
  if (!payload) {
    sendJson(res, 400, { error: "Invalid JSON payload." });
    return;
  }

  const validation = validatePayload(payload);
  if (validation.ignored) {
    sendJson(res, 200, { ok: true, ignored: true });
    return;
  }

  if (validation.error) {
    sendJson(res, 400, { error: validation.error });
    return;
  }

  const { name, firstName, email, subject, message, turnstileToken } = validation.value;
  const mailConfig = getMailConfig();
  const {
    turnstileSecret,
    smtpUser,
    smtpPass,
    contactToEmail,
    contactFromEmail,
    autoReplySubject,
  } = mailConfig;

  const turnstile = await verifyTurnstile(turnstileToken, turnstileSecret, clientIp);
  if (!turnstile.ok) {
    console.warn("CONTACT_SPAM_REJECTED");
    sendJson(res, 403, { error: "Spam check failed. Please try again." });
    return;
  }

  if (isDuplicateSubmission({ email, subject, message })) {
    sendJson(res, 409, {
      error: "This message was already sent. Please wait a few minutes before sending it again.",
    });
    return;
  }

  if (!smtpUser || !smtpPass || !contactToEmail || !contactFromEmail) {
    console.error("CONTACT_API_CONFIG_ERROR", {
      missingSmtpUser: !smtpUser,
      missingSmtpPass: !smtpPass,
      missingContactToEmail: !contactToEmail,
      missingContactFromEmail: !contactFromEmail,
    });
    sendJson(res, 500, {
      error: "Email service is not configured. Please try again later.",
    });
    return;
  }

  const submittedAt = formatSubmittedAt();
  const enquiry = buildEnquiryEmail({ name, email, subject, message, submittedAt });
  const confirmation = buildConfirmationEmail({ firstName });
  const fromAddress = formatFrom(contactFromEmail);
  const transporter = createTransport(mailConfig);

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: contactToEmail,
      replyTo: email,
      subject: singleLine(enquiry.subject),
      text: enquiry.text,
      html: enquiry.html,
    });
  } catch (error) {
    console.error("CONTACT_EMAIL_FAILED", {
      transport: "zoho-smtp",
      stage: "enquiry",
      reason: deliveryError(error),
    });
    sendJson(res, 500, {
      error: "Unable to send your message right now. Please try again shortly.",
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      replyTo: contactToEmail,
      subject: singleLine(autoReplySubject || confirmation.subject),
      text: confirmation.text,
      html: confirmation.html,
    });
  } catch (error) {
    console.error("CONTACT_EMAIL_FAILED", {
      transport: "zoho-smtp",
      stage: "confirmation",
      reason: deliveryError(error),
    });
    sendJson(res, 500, {
      error: "Your enquiry reached Bndlabs, but the confirmation email could not be sent. Please try again shortly.",
    });
    return;
  }

  rememberSubmission({ email, subject, message });
  console.info("CONTACT_EMAIL_SENT", { transport: "zoho-smtp" });
  sendJson(res, 200, {
    ok: true,
    mode: "email",
    message: "Message sent successfully",
  });
}
