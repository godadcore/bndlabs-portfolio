/* global process */
const STATE_COOKIE = "decap-cms-state";

function safeString(value) {
  return String(value ?? "").trim();
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) return acc;
      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function getOrigin(req) {
  const forwardedProto = safeString(req.headers["x-forwarded-proto"]);
  const protocol = forwardedProto || "https";
  const host = safeString(req.headers["x-forwarded-host"] || req.headers.host);
  return `${protocol}://${host}`;
}

function escapeScriptValue(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function sendAuthPage(res, status, type, payload) {
  const message = `authorization:github:${type}:${JSON.stringify(payload)}`;
  const escapedMessage = escapeScriptValue(message);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(status).send(`<!doctype html>
<html lang="en">
  <body>
    <script>
      (function () {
        function receiveMessage(event) {
          if (!window.opener) {
            window.close();
            return;
          }

          var targetOrigin = event.origin || window.location.origin;
          window.opener.postMessage('${escapedMessage}', targetOrigin);
          window.removeEventListener('message', receiveMessage, false);
          window.close();
        }

        window.addEventListener('message', receiveMessage, false);

        if (window.opener) {
          window.opener.postMessage('authorizing:github', window.location.origin);
        }
      })();
    </script>
  </body>
</html>`);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method Not Allowed");
    return;
  }

  const clientId = safeString(process.env.CMS_GITHUB_CLIENT_ID);
  const clientSecret = safeString(process.env.CMS_GITHUB_CLIENT_SECRET);
  if (!clientId || !clientSecret) {
    console.error("DECAP_CALLBACK_CONFIG_ERROR", {
      missingClientId: !clientId,
      missingClientSecret: !clientSecret,
    });
    sendAuthPage(res, 500, "error", {
      message: "CMS GitHub OAuth is not configured.",
      provider: "github",
    });
    return;
  }

  const code = safeString(req.query?.code);
  const state = safeString(req.query?.state);
  const error = safeString(req.query?.error);
  const errorDescription = safeString(req.query?.error_description);
  const cookies = parseCookies(req.headers.cookie);
  const savedState = safeString(cookies[STATE_COOKIE]);

  res.setHeader(
    "Set-Cookie",
    `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );

  if (error) {
    console.error("DECAP_CALLBACK_GITHUB_ERROR", {
      error,
      errorDescription,
    });
    sendAuthPage(res, 400, "error", {
      message: errorDescription || error,
      provider: "github",
    });
    return;
  }

  if (!code || !state || !savedState || state !== savedState) {
    console.error("DECAP_CALLBACK_STATE_ERROR", {
      hasCode: Boolean(code),
      hasState: Boolean(state),
      hasSavedState: Boolean(savedState),
      stateMatches: state && savedState ? state === savedState : false,
    });
    sendAuthPage(res, 400, "error", {
      message: "Invalid CMS authentication state.",
      provider: "github",
    });
    return;
  }

  const origin = getOrigin(req);
  const redirectUri = `${origin}/api/decap/callback`;

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        state,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !safeString(data?.access_token)) {
      console.error("DECAP_CALLBACK_TOKEN_ERROR", {
        status: response.status,
        data,
      });
      sendAuthPage(res, 500, "error", {
        message: safeString(data?.error_description) || "Unable to complete CMS sign in.",
        provider: "github",
      });
      return;
    }

    sendAuthPage(res, 200, "success", {
      token: data.access_token,
      provider: "github",
    });
  } catch (tokenError) {
    console.error("DECAP_CALLBACK_REQUEST_ERROR", {
      message: tokenError instanceof Error ? tokenError.message : String(tokenError),
      stack: tokenError instanceof Error ? tokenError.stack : undefined,
    });
    sendAuthPage(res, 500, "error", {
      message: "Unable to complete CMS sign in.",
      provider: "github",
    });
  }
}
