const BRAND_NAME = "Bndlabs";
const BRAND_URL = "https://www.bndlabs.tech";

export function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatMessageHtml(value = "") {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />");
}

export function renderButton({ href, label }) {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="email-button" bgcolor="#6a3fdc" style="background:#6a3fdc;border:1px solid #6a3fdc;">
          <!--[if mso]>
          <v:rect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeHref}" style="height:46px;v-text-anchor:middle;width:220px;" stroke="f" fillcolor="#6a3fdc">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">${safeLabel}</center>
          </v:rect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a class="email-button" href="${safeHref}" style="display:inline-block;padding:15px 22px;background:#6a3fdc;border:1px solid #6a3fdc;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;line-height:1;letter-spacing:0.01em;text-decoration:none;">
            ${safeLabel}
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>
  `;
}

export function renderField(label, value) {
  return `
    <tr>
      <td class="email-pad-field" style="padding:0 0 18px;">
        <div class="email-muted" style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#3f3852;">${escapeHtml(label)}</div>
        <div class="email-ink" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;font-weight:600;color:#0e0b16;word-break:break-word;">${value}</div>
      </td>
    </tr>
  `;
}

export function renderEmail({ preheader, kicker, title, intro, content, action, footerNote }) {
  const safePreheader = escapeHtml(preheader || title);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: light dark; supported-color-schemes: light dark; }
      body, table, td { margin: 0; padding: 0; }
      img { border: 0; outline: none; text-decoration: none; }
      a { color: #6a3fdc; }
      @media only screen and (max-width: 600px) {
        .email-shell { padding: 20px 10px !important; }
        .email-pad { padding: 28px 18px !important; }
      }
      @media (prefers-color-scheme: dark) {
        .email-bg, .email-bg td { background: #14101c !important; }
        .email-card { background: #14101c !important; border-color: #c4b6f5 !important; }
        .email-ink, .email-ink span { color: #f4f1fb !important; }
        .email-muted { color: #cbbfe0 !important; }
        .email-accent { color: #c4b6f5 !important; }
        .email-rule { border-color: #3a3154 !important; }
        .email-panel { background: #1c1728 !important; border-color: #c4b6f5 !important; }
        .email-button, .email-button a { background: #c4b6f5 !important; border-color: #c4b6f5 !important; color: #14101c !important; }
      }
    </style>
  </head>
  <body class="email-bg" bgcolor="#f3effb" style="margin:0;padding:0;background:#f3effb;color:#0e0b16;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safePreheader}</div>
    <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3effb" style="background:#f3effb;">
      <tr>
        <td class="email-shell" align="center" style="padding:36px 16px;">
          <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #0e0b16;border-top:4px solid #6a3fdc;">
            <tr>
              <td class="email-pad" style="padding:32px 32px 8px;">
                <div class="email-ink" style="font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:1;font-weight:700;letter-spacing:-0.04em;color:#0e0b16;">
                  Bnd<span class="email-accent" style="color:#6a3fdc;">labs</span>
                </div>
                <div class="email-muted" style="margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6a3fdc;">${escapeHtml(kicker)}</div>
              </td>
            </tr>
            <tr>
              <td class="email-pad" style="padding:18px 32px 0;">
                <h1 class="email-ink" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:1.15;font-weight:700;letter-spacing:-0.03em;color:#0e0b16;">${escapeHtml(title)}</h1>
                <p class="email-muted" style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3f3852;">${intro}</p>
              </td>
            </tr>
            <tr>
              <td class="email-pad" style="padding:24px 32px 8px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td class="email-pad" style="padding:8px 32px 28px;">
                ${action || ""}
              </td>
            </tr>
            <tr>
              <td class="email-pad" style="padding:0 32px 28px;">
                <div class="email-rule" style="border-top:1px solid #d8cdf6;padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#3f3852;">
                  <div class="email-ink" style="font-weight:700;color:#0e0b16;">${BRAND_NAME}</div>
                  <div class="email-muted">${escapeHtml(footerNote)}</div>
                  <div style="margin-top:8px;"><a class="email-accent" href="${BRAND_URL}" style="color:#6a3fdc;text-decoration:none;">${BRAND_URL.replace("https://", "")}</a></div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export const BRAND = {
  name: BRAND_NAME,
  url: BRAND_URL,
};
