import { buildSiteSettings, getFallbackSiteSettings } from "./site";

let cachedSiteSettingsPromise = null;
const SITE_SETTINGS_API_PATH = "/api/sanity/site-settings";

function hasRemoteSiteSettings(rawSettings) {
  if (!rawSettings || typeof rawSettings !== "object") return false;

  return Boolean(
    rawSettings?.email ||
      rawSettings?.linkedin ||
      rawSettings?.behance ||
      rawSettings?.instagram ||
      rawSettings?.x ||
      rawSettings?.tiktok ||
      rawSettings?.whatsapp_number
  );
}

async function fetchSiteSettingsFromSanity() {
  const fallbackSiteSettings = getFallbackSiteSettings();

  const response = await fetch(SITE_SETTINGS_API_PATH, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Sanity site settings API returned ${response.status}`);
  }

  const payload = await response.json();
  const rawSettings = payload?.siteSettings || null;

  if (hasRemoteSiteSettings(rawSettings)) {
    return buildSiteSettings(rawSettings);
  }

  console.warn("SANITY_SITE_SETTINGS_FALLBACK", {
    reason: "empty_or_unusable_response",
    source: payload?.source || "unknown",
  });
  return fallbackSiteSettings;
}

export async function loadSiteSettings() {
  if (!cachedSiteSettingsPromise) {
    cachedSiteSettingsPromise = fetchSiteSettingsFromSanity().catch((error) => {
      console.error("SANITY_SITE_SETTINGS_FETCH_ERROR", {
        message: error instanceof Error ? error.message : String(error),
      });
      return getFallbackSiteSettings();
    });
  }

  return cachedSiteSettingsPromise;
}

export function resetSiteSettingsCache() {
  cachedSiteSettingsPromise = null;
}
