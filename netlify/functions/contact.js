/* global process */

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function safeString(value) {
  return String(value ?? "").trim();
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

function escapeHtml(value) {
  return safeString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseBody(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function normalizeName(payload) {
  const explicitName = safeString(payload?.name);
  if (explicitName) return explicitName;

  const firstName = safeString(payload?.firstName);
  const lastName = safeString(payload?.lastName);
  return [firstName, lastName].filter(Boolean).join(" ");
}

async function sendWithResend({ apiKey, from, to, subject, html, text, replyTo }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to: replyTo ? [replyTo] : undefined,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      "Email service rejected the request.";
    throw new Error(errorMessage);
  }

  return data;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const payload = parseBody(event.body);
  if (!payload) {
    return json(400, { error: "Invalid JSON payload." });
  }

  const name = normalizeName(payload);
  const firstName = safeString(payload?.firstName) || safeString(name.split(" ")[0]);
  const email = safeString(payload?.email);
  const subject = safeString(payload?.subject) || "New contact message";
  const message = safeString(payload?.message);
  const source = safeString(payload?.source) || "website";
  const subscribe = Boolean(payload?.subscribe);

  if (!name || !email || !message) {
    return json(400, { error: "Name, email, and message are required." });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return json(400, { error: "Please enter a valid email address." });
  }

  const toEmail = safeString(process.env.CONTACT_TO_EMAIL || "hello@getbndlabs.com");
  const resendApiKey = safeString(process.env.RESEND_API_KEY);
  const ownerFromEmail = safeString(process.env.CONTACT_FROM_EMAIL);
  const autoReplyFromEmail = safeString(process.env.CONTACT_AUTOREPLY_FROM_EMAIL || ownerFromEmail);

  const autoReplyText = `Hi ${firstName || name}, thank you for reaching out! I received your message and will respond shortly.`;

  const ownerHtml = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">New website contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Source:</strong> ${escapeHtml(source)}</p>
      <p><strong>Subscribed:</strong> ${subscribe ? "Yes" : "No"}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
    </div>
  `;

  const ownerText = [
    "New website contact message",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Source: ${source}`,
    `Subscribed: ${subscribe ? "Yes" : "No"}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const autoReplyHtml = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <p>Hi ${escapeHtml(firstName || name)},</p>
      <p>Thank you for reaching out! I received your message and will respond shortly.</p>
      <p>Message received:</p>
      <blockquote style="margin: 16px 0; padding-left: 12px; border-left: 3px solid #6b46ff; color: #444;">
        ${escapeHtml(message).replace(/\n/g, "<br />")}
      </blockquote>
      <p>Bndlabs</p>
    </div>
  `;

  const autoReplyTextBody = [
    autoReplyText,
    "",
    "Message received:",
    message,
    "",
    "Bndlabs",
  ].join("\n");

  const canSendRealEmails = Boolean(resendApiKey && ownerFromEmail && autoReplyFromEmail);

  try {
    if (canSendRealEmails) {
      await Promise.all([
        sendWithResend({
          apiKey: resendApiKey,
          from: ownerFromEmail,
          to: toEmail,
          subject: `[Bndlabs] ${subject}`,
          html: ownerHtml,
          text: ownerText,
          replyTo: email,
        }),
        sendWithResend({
          apiKey: resendApiKey,
          from: autoReplyFromEmail,
          to: email,
          subject: "Thanks for reaching out to Bndlabs",
          html: autoReplyHtml,
          text: autoReplyTextBody,
        }),
      ]);
    } else {
      console.log("CONTACT_MESSAGE_LOG", {
        toEmail,
        name,
        email,
        subject,
        source,
        subscribe,
        message,
      });

      console.log("CONTACT_AUTOREPLY_LOG", {
        to: email,
        subject: "Thanks for reaching out to Bndlabs",
        message: autoReplyTextBody,
      });
    }

    return json(200, {
      ok: true,
      mode: canSendRealEmails ? "email" : "log",
      message: "Message received successfully.",
      autoReply: autoReplyText,
    });
  } catch (error) {
    console.error("CONTACT_FUNCTION_ERROR", error);
    return json(500, {
      error: "Unable to send your message right now. Please try again shortly.",
    });
  }
}
