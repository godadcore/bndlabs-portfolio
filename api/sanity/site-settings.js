import { siteSettingsQuery } from "../../src/lib/sanity/queries.js";
import { hasSanityServerConfig, sanityServerClient } from "./client.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  if (!hasSanityServerConfig || !sanityServerClient) {
    res.status(500).json({ error: "Sanity server configuration is missing." });
    return;
  }

  try {
    const siteSettings = await sanityServerClient.fetch(siteSettingsQuery);

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      source: "sanity",
      siteSettings: siteSettings || null,
    });
  } catch (error) {
    console.error("SANITY_SITE_SETTINGS_API_ERROR", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(502).json({ error: "Unable to load Sanity site settings." });
  }
}
