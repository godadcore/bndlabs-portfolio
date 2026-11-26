import { BRAND, escapeHtml, renderButton, renderEmail } from "./layout.js";

export function buildConfirmationEmail({ firstName }) {
  const greeting = escapeHtml(firstName || "there");
  const content = `
    <p class="email-ink" style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#0e0b16;">Hello ${greeting},</p>
    <p class="email-ink" style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#0e0b16;">Thank you for reaching out to ${BRAND.name}. Your message has been received successfully.</p>
    <p class="email-ink" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#0e0b16;">We appreciate your interest in working with us. We'll review your enquiry and get back to you as soon as possible.</p>
  `;

  return {
    subject: "We've received your message",
    html: renderEmail({
      preheader: `Thank you for reaching out to ${BRAND.name}. Your message has been received.`,
      kicker: "Message received",
      title: "We've received your message.",
      intro: "This note confirms that your enquiry arrived safely.",
      content,
      action: renderButton({ href: BRAND.url, label: "Visit Bndlabs" }),
      footerNote: "Product Design. Software Engineering. Creative Technology.",
    }),
    text: [
      "We've received your message.",
      "",
      `Hello ${firstName || "there"},`,
      "",
      `Thank you for reaching out to ${BRAND.name}. Your message has been received successfully.`,
      "",
      "We appreciate your interest in working with us. We'll review your enquiry and get back to you as soon as possible.",
      "",
      `Visit ${BRAND.name}: ${BRAND.url}`,
      "",
      BRAND.name,
      "Product Design. Software Engineering. Creative Technology.",
    ].join("\n"),
  };
}
