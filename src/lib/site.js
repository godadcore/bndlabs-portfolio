import siteSettings from "../content/site/settings.json" with { type: "json" };
import { sanitizeExternalUrl } from "./urlSecurity.js";

export const SITE_URL = "https://getbndlabs.com";
export const SITE_NAME = "Bndlabs";
export const PERSON_NAME = "Bodunde Emmanuel";
export const PERSON_TITLE = "UI/UX Designer";
export const LOCATION_LABEL = "Lagos, Nigeria";
export const DEFAULT_ROBOTS = "index, follow, max-image-preview:large";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.jpg";
export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} portfolio preview for ${PERSON_NAME}`;
export const DEFAULT_OG_IMAGE_TYPE = "image/jpeg";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

export const BASE_KEYWORDS = [
  "UI UX designer",
  "product designer",
  "brand designer",
  "frontend designer",
  "digital product designer",
  "UI UX designer in Lagos",
  "UI UX designer in Nigeria",
  "product designer in Nigeria",
  "Lagos designer",
  "Nigeria designer",
  "Bodunde Emmanuel",
  "Bndlabs",
];

function uniqueStrings(values) {
  return values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .filter((value, index, items) => items.indexOf(value) === index);
}

function normalizeWhatsAppLink(value) {
  const digits = String(value ?? "").replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.startsWith("234")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/234${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

export function buildSiteSettings(value = {}) {
  const defaults =
    siteSettings && typeof siteSettings === "object"
      ? siteSettings
      : {};
  const input = value && typeof value === "object" ? value : {};

  return {
    contactEmail: String(input?.email || defaults?.email || "hello@getbndlabs.com").trim(),
    whatsappNumber: String(input?.whatsapp_number || defaults?.whatsapp_number || "").trim(),
    socialLinks: {
      linkedin: sanitizeExternalUrl(input?.linkedin || defaults?.linkedin),
      x: sanitizeExternalUrl(input?.x || defaults?.x),
      behance: sanitizeExternalUrl(input?.behance || defaults?.behance),
      instagram: sanitizeExternalUrl(input?.instagram || defaults?.instagram),
      tiktok: sanitizeExternalUrl(input?.tiktok || defaults?.tiktok),
      whatsapp: normalizeWhatsAppLink(input?.whatsapp_number || defaults?.whatsapp_number),
    },
  };
}

export function getFallbackSiteSettings() {
  return buildSiteSettings(siteSettings);
}

const fallbackSiteSettings = getFallbackSiteSettings();

export const CONTACT_EMAIL = fallbackSiteSettings.contactEmail;
export const WHATSAPP_NUMBER = fallbackSiteSettings.whatsappNumber;
export const SOCIAL_LINKS = fallbackSiteSettings.socialLinks;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function toAbsoluteAssetUrl(value) {
  if (!value) return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  if (/^https?:\/\//i.test(value)) return value;
  return absoluteUrl(value);
}

export function keywordContent(keywords = []) {
  return uniqueStrings(Array.isArray(keywords) ? keywords : [keywords]).join(", ");
}

export function buildPersonSchema(siteData = fallbackSiteSettings) {
  const contactEmail = siteData?.contactEmail || CONTACT_EMAIL;
  const socialLinks = siteData?.socialLinks || SOCIAL_LINKS;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSON_NAME,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    jobTitle: PERSON_TITLE,
    description: "UI/UX designer and product designer creating digital experiences.",
    url: SITE_URL,
    email: contactEmail,
    image: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "Nigeria",
    },
    areaServed: ["Lagos", "Nigeria"],
    sameAs: uniqueStrings([
      socialLinks.linkedin,
      socialLinks.x,
      socialLinks.behance,
      socialLinks.instagram,
      socialLinks.tiktok,
    ]),
  };
}

export function buildProjectSeoDescription(project) {
  return uniqueStrings([
    project?.summary,
    project?.description,
    project?.overview,
    project?.result,
    `Case study for ${project?.title || "a digital product"} by ${PERSON_NAME}, a UI/UX designer and product designer in Lagos, Nigeria.`,
  ])[0];
}

export function buildProjectSeoKeywords(project) {
  return uniqueStrings([
    project?.title,
    project?.category,
    ...(Array.isArray(project?.tasks) ? project.tasks : []),
    ...(Array.isArray(project?.tags) ? project.tags : []),
    "UI UX case study",
    "product design project",
    "frontend design project",
    "UI UX designer in Lagos",
    "product designer in Nigeria",
    ...BASE_KEYWORDS,
  ]);
}
