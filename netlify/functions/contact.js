/* global process */

import nodemailer from "nodemailer";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const BRAND_NAME = "Bndlabs";
const BRAND_URL = "https://getbndlabs.com";
const BRAND_LOGO_URL = `${BRAND_URL}/favicon.svg`;

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

function json(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
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

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method Not Allowed" });
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
    return json(400, { error: "All fields required" });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return json(400, { error: "Please enter a valid email address." });
  }

  const zohoUser = safeString(process.env.ZOHO_USER || process.env.CONTACT_TO_EMAIL || "hello@getbndlabs.com");
  const zohoPass = safeString(process.env.ZOHO_PASS);
  const autoReplyText = `Hi ${firstName || name}, thank you for reaching out! I received your message and will respond shortly.`;
  const ownerSubject = `New Message from ${name} via BndLabs Contact Form`;

  const ownerHtml = buildOwnerEmailHtml({
    name,
    email,
    message,
    subject,
    source,
    subscribe,
  });
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

  if (!zohoUser || !zohoPass) {
    console.log("CONTACT_MESSAGE_LOG", {
      to: zohoUser,
      subject: ownerSubject,
      name,
      email,
      source,
      subscribe,
      message,
    });
    console.log("CONTACT_AUTOREPLY_LOG", {
      to: email,
      subject: "Thanks for contacting BndLabs",
      body: autoReplyTextBody,
    });

    return json(200, {
      ok: true,
      mode: "log",
      message: "Message received successfully.",
      autoReply: autoReplyText,
    });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: zohoUser,
      pass: zohoPass,
    },
  });

  try {
    await Promise.all([
      transporter.sendMail({
        from: `"BndLabs Contact" <${zohoUser}>`,
        to: zohoUser,
        replyTo: email,
        subject: ownerSubject,
        text: ownerText,
        html: ownerHtml,
      }),
      transporter.sendMail({
        from: `"BndLabs" <${zohoUser}>`,
        to: email,
        subject: "Thanks for contacting BndLabs",
        text: autoReplyTextBody,
        html: autoReplyHtml,
      }),
    ]);

    return json(200, {
      ok: true,
      mode: "email",
      message: "Message sent successfully",
      autoReply: autoReplyText,
    });
  } catch (error) {
    console.error("CONTACT_FUNCTION_ERROR", error);
    return json(500, {
      error: "Unable to send your message right now. Please try again shortly.",
    });
  }
}
