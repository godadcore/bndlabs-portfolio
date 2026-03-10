/* global process */
import path from "node:path";
import nodemailer from "nodemailer";

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
const BRAND_URL = "https://getbndlabs.com";
const BRAND_LOGO_URL = `${BRAND_URL}/favicon.svg`;
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 160;
const MAX_SOURCE_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 5000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map();

const SOCIAL_LINKS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/2349052321666",
    badge: "WA",
    bg: "#ecfdf3",
    fg: "#0f9f4f",
  },
  {
    label: "X",
    href: "https://x.com/Bndlabs",
    badge: "X",
    bg: "#f3f4f6",
    fg: "#111111",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/bndlabs",
    badge: "IG",
    bg: "#fff1f7",
    fg: "#e1306c",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/bodundeemmanuel",
    badge: "in",
    bg: "#eef4ff",
    fg: "#0a66c2",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@bndlabs",
    badge: "TT",
    bg: "#f4f4f5",
    fg: "#111111",
  },
];

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

function getMailConfig() {
  const smtpHost = firstEnvValue("SMTP_HOST") || "smtp.zoho.com";
  const smtpPort = parsePort(firstEnvValue("SMTP_PORT"), 465);
  const smtpSecure = parseBoolean(firstEnvValue("SMTP_SECURE"), smtpPort === 465);
  const smtpUser = firstEnvValue("SMTP_USER", "ZOHO_USER");
  const smtpPass = firstEnvValue("SMTP_PASS", "ZOHO_PASS");
  const contactToEmail = firstEnvValue("CONTACT_TO_EMAIL") || smtpUser;
  const contactFromEmail = firstEnvValue("CONTACT_FROM_EMAIL") || smtpUser;
  const autoReplySubject =
    firstEnvValue("CONTACT_AUTO_REPLY_SUBJECT") || "Thanks for contacting BndLabs";

  return {
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

function escapeHtml(value = "") {
  return safeString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSocialLinks() {
  return SOCIAL_LINKS.map(
    (item) => `
      <tr>
        <td style="padding:0 12px 12px 0;">
          <a
            href="${item.href}"
            style="display:inline-block;padding:10px 14px;border-radius:999px;background:#fafafe;border:1px solid #ececf4;text-decoration:none;color:#111111;"
          >
            <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:999px;background:${item.bg};color:${item.fg};font-size:11px;font-weight:700;vertical-align:middle;">
              ${item.badge}
            </span>
            <span style="display:inline-block;margin-left:10px;font-size:14px;line-height:28px;font-weight:600;vertical-align:middle;color:#111111;">
              ${item.label}
            </span>
          </a>
        </td>
      </tr>
    `
  ).join("");
}

function renderDetails({ name, email }) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:22px;">
      <tr>
        <td style="padding:0 0 14px;">
          <div style="font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:0.08em;color:#7a7a8c;margin-bottom:6px;">Name</div>
          <div style="font-size:16px;line-height:1.5;font-weight:600;color:#111111;">${name}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:0;">
          <div style="font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:0.08em;color:#7a7a8c;margin-bottom:6px;">Email</div>
          <div style="font-size:16px;line-height:1.5;font-weight:600;color:#111111;">
            <a href="mailto:${email}" style="color:#5b45ff;text-decoration:none;">${email}</a>
          </div>
        </td>
      </tr>
    </table>
  `;
}

function renderEmailCard({ subtitle, intro, name, email, message, footerTitle }) {
  return `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f4f5f8;font-family:Inter, Helvetica, Arial, sans-serif;color:#111111;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f5f8;margin:0;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:680px;width:100%;">
            <tr>
              <td style="padding:0 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border:1px solid #ebe7f7;border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(17,17,17,0.08);">
                  <tr>
                    <td style="padding:30px 32px 22px;background:linear-gradient(135deg,#fbfbff 0%,#f3f1ff 100%);border-bottom:1px solid #ece8ff;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="width:52px;vertical-align:middle;padding-right:12px;">
                            <img
                              src="${BRAND_LOGO_URL}"
                              alt="${BRAND_NAME} logo"
                              width="40"
                              height="40"
                              style="display:block;border:0;outline:none;text-decoration:none;border-radius:10px;"
                            />
                          </td>
                          <td style="vertical-align:middle;">
                            <div style="font-size:20px;line-height:1.2;font-weight:700;color:#111111;">${BRAND_NAME}</div>
                            <div style="font-size:13px;line-height:1.5;color:#666666;">${subtitle}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <div style="font-size:14px;line-height:1.7;color:#555555;margin-bottom:22px;">${intro}</div>
                      ${renderDetails({ name, email })}
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fafafe;border:1px solid #ececf4;border-radius:20px;">
                        <tr>
                          <td style="padding:24px;">
                            <div style="font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:0.08em;color:#7a7a8c;margin-bottom:10px;">Message</div>
                            <div style="font-size:15px;line-height:1.8;color:#222222;">${message}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 32px 32px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #efeff5;padding-top:24px;">
                        <tr>
                          <td style="font-size:13px;line-height:1.6;color:#666666;padding-bottom:14px;">${footerTitle}</td>
                        </tr>
                        ${renderSocialLinks()}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildOwnerEmailHtml({ name, email, message }) {
  const safeName = escapeHtml(name || "Website Visitor");
  const safeEmail = escapeHtml(email || "");
  const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br />");

  return renderEmailCard({
    subtitle: "New contact form submission",
    intro: "You received a new message from your portfolio contact form.",
    name: safeName,
    email: safeEmail,
    message: safeMessage,
    footerTitle: `Stay connected with ${BRAND_NAME}`,
  });
}

function buildAutoReplyHtml({ firstName, name, email, message }) {
  const safeName = escapeHtml(name || "there");
  const safeEmail = escapeHtml(email || "");
  const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br />");
  const greetingName = escapeHtml(firstName || name || "there");

  return renderEmailCard({
    subtitle: "Message received",
    intro: `Hi ${greetingName}, thank you for reaching out! I received your message and will respond shortly.`,
    name: safeName,
    email: safeEmail,
    message: safeMessage,
    footerTitle: `Follow ${BRAND_NAME}`,
  });
}

function buildOwnerEmailText({ name, email, subject, source, subscribe, message }) {
  return [
    `New Message from ${name} via BndLabs Contact Form`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Source: ${source}`,
    `Subscribed: ${subscribe ? "Yes" : "No"}`,
    "",
    "Message:",
    message,
  ].join("\n");
}

function buildAutoReplyText({ firstName, name, message }) {
  return [
    `Hi ${firstName || name}, thank you for reaching out! I received your message and will respond shortly.`,
    "",
    "Your message:",
    message,
    "",
    "Bndlabs",
  ].join("\n");
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

function validatePayload(payload) {
  const rawMessage = safeString(payload?.message);
  const name = truncate(normalizeName(payload), MAX_NAME_LENGTH);
  const firstName = truncate(singleLine(payload?.firstName) || singleLine(name.split(" ")[0]), MAX_NAME_LENGTH);
  const email = singleLine(payload?.email).toLowerCase();
  const subject = truncate(singleLine(payload?.subject) || "New contact message", MAX_SUBJECT_LENGTH);
  const message = truncate(rawMessage, MAX_MESSAGE_LENGTH);
  const source = truncate(singleLine(payload?.source) || "website", MAX_SOURCE_LENGTH);
  const subscribe = Boolean(payload?.subscribe);
  const honeypot = singleLine(payload?.company || payload?.website || payload?.fax || payload?.botField);

  if (honeypot) {
    return { ignored: true };
  }

  if (!name || !email || !message) {
    return { error: "All fields required" };
  }

  if (!EMAIL_PATTERN.test(email)) {
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
    },
  };
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

  const { name, firstName, email, subject, message, source, subscribe } = validation.value;
  const {
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPass,
    contactToEmail,
    contactFromEmail,
    autoReplySubject,
  } = getMailConfig();

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

  const ownerSubject = `New Message from ${name} via BndLabs Contact Form`;
  const autoReplyText = `Hi ${firstName || name}, thank you for reaching out! I received your message and will respond shortly.`;
  const ownerHtml = buildOwnerEmailHtml({ name, email, message });
  const ownerText = buildOwnerEmailText({
    name,
    email,
    subject,
    source,
    subscribe,
    message,
  });
  const autoReplyHtml = buildAutoReplyHtml({ firstName, name, email, message });
  const autoReplyTextBody = buildAutoReplyText({ firstName, name, message });

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await Promise.all([
      transporter.sendMail({
        from: contactFromEmail,
        to: contactToEmail,
        replyTo: email,
        subject: ownerSubject,
        text: ownerText,
        html: ownerHtml,
      }),
      transporter.sendMail({
        from: contactFromEmail,
        to: email,
        replyTo: contactToEmail,
        subject: autoReplySubject,
        text: autoReplyTextBody,
        html: autoReplyHtml,
      }),
    ]);

    sendJson(res, 200, {
      ok: true,
      mode: "email",
      message: "Message sent successfully",
      autoReply: autoReplyText,
    });
  } catch (error) {
    console.error("CONTACT_API_ERROR", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name,
      email,
      source,
      subscribe,
      clientIp,
    });
    sendJson(res, 500, {
      error: "Unable to send your message right now. Please try again shortly.",
    });
  }
}
