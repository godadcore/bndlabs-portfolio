import { BRAND, escapeHtml, formatMessageHtml, renderButton, renderEmail, renderField } from "./layout.js";

export function replyHref(email, subject) {
  return `mailto:${String(email).trim()}?subject=${encodeURIComponent(subject)}`;
}

export function buildEnquiryEmail({ name, email, subject, message, submittedAt }) {
  const replySubject = `Re: ${subject}`;
  const href = replyHref(email, replySubject);
  const safeEmail = escapeHtml(email);
  const content = `
    <p class="email-ink" style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#0e0b16;">Someone contacted ${BRAND.name} through the portfolio website.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${renderField("Name", escapeHtml(name))}
      ${renderField("Email", `<a class="email-accent" href="mailto:${safeEmail}" style="color:#6a3fdc;text-decoration:none;">${safeEmail}</a>`)}
      ${renderField("Subject", escapeHtml(subject))}
      ${renderField("Received", escapeHtml(submittedAt))}
    </table>
    <div class="email-muted" style="margin:4px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#3f3852;">Message</div>
    <div class="email-panel email-ink" style="border:1px solid #0e0b16;background:#f3effb;padding:18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#0e0b16;word-break:break-word;overflow-wrap:anywhere;">
      ${formatMessageHtml(message)}
    </div>
  `;

  return {
    subject: `New Project Enquiry from ${name}`,
    html: renderEmail({
      preheader: `${name} sent a project enquiry: ${subject}`,
      kicker: "Portfolio contact",
      title: "New Project Enquiry",
      intro: "A new enquiry is ready for review.",
      content,
      action: renderButton({ href, label: "Reply to Enquiry" }),
      footerNote: "Product Design. Software Engineering. Creative Technology.",
    }),
    text: [
      "New Project Enquiry",
      "",
      `Someone contacted ${BRAND.name} through the portfolio website.`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      `Received: ${submittedAt}`,
      "",
      "Message:",
      message,
      "",
      `Reply: ${href}`,
      "",
      BRAND.name,
      "Product Design. Software Engineering. Creative Technology.",
      BRAND.url,
    ].join("\n"),
  };
}
