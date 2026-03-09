export const SITE_URL = "https://getbndlabs.com";
export const SITE_NAME = "Bndlabs";
export const PERSON_NAME = "Bodunde Emmanuel";
export const PERSON_TITLE = "UI/UX Designer";
export const CONTACT_EMAIL = "hello@getbndlabs.com";
export const LOCATION_LABEL = "Lagos, Nigeria";
export const DEFAULT_ROBOTS = "index, follow, max-image-preview:large";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.jpg";
export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} portfolio preview for ${PERSON_NAME}`;
export const DEFAULT_OG_IMAGE_TYPE = "image/jpeg";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Replace these with exact public profile URLs for stronger sameAs signals.
export const SOCIAL_LINKS = {
  linkedin: "https://linkedin.com/in/yourprofile",
  x: "https://x.com",
  behance: "https://www.behance.net",
  instagram: "https://www.instagram.com",
  tiktok: "https://www.tiktok.com",
  whatsapp: "https://wa.me/2340000000000",
};

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

export function buildPersonSchema() {
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
    email: CONTACT_EMAIL,
    image: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "Nigeria",
    },
    areaServed: ["Lagos", "Nigeria"],
    sameAs: uniqueStrings([
      SOCIAL_LINKS.linkedin,
      SOCIAL_LINKS.x,
      SOCIAL_LINKS.behance,
      SOCIAL_LINKS.instagram,
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
    "UI UX case study",
    "product design project",
    "frontend design project",
    "UI UX designer in Lagos",
    "product designer in Nigeria",
    ...BASE_KEYWORDS,
  ]);
}
