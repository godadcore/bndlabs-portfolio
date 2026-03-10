/* global process */
import crypto from "node:crypto";

const STATE_COOKIE = "decap-cms-state";
const COOKIE_MAX_AGE = 60 * 10;

function safeString(value) {
  return String(value ?? "").trim();
}

function getOrigin(req) {
  const forwardedProto = safeString(req.headers["x-forwarded-proto"]);
  const protocol = forwardedProto || "https";
  const host = safeString(req.headers["x-forwarded-host"] || req.headers.host);
  return `${protocol}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method Not Allowed");
    return;
  }

  const provider = safeString(req.query?.provider || "github").toLowerCase();
  const scope = safeString(req.query?.scope) || "repo";
  if (provider !== "github") {
    res.status(400).send("Unsupported CMS provider.");
    return;
  }

  const clientId = safeString(process.env.CMS_GITHUB_CLIENT_ID);
  if (!clientId) {
    console.error("DECAP_AUTH_CONFIG_ERROR", {
      missingClientId: true,
    });
    res.status(500).send("CMS GitHub OAuth is not configured.");
    return;
  }

  const origin = getOrigin(req);
  const state = crypto.randomBytes(24).toString("hex");
  const redirectUri = `${origin}/api/decap/callback`;
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");

  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", scope);
  authorizeUrl.searchParams.set("state", state);

  res.setHeader(
    "Set-Cookie",
    `${STATE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`
  );
  res.redirect(302, authorizeUrl.toString());
}
