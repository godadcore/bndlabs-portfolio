import siteSettings from "../content/site/settings.json" with { type: "json" };
import { sanitizeExternalUrl } from "./urlSecurity.js";

export const SITE_URL = "https://getbndlabs.com";
export const SITE_NAME = "bndlabs";
export const PERSON_NAME = "Bodunde Emmanuel";
export const PERSON_TITLE = "UI/UX Designer, Product Designer and Frontend Developer";
export const LOCATION_LABEL = "Lagos, Nigeria";
export const DEFAULT_ROBOTS = "index, follow, max-image-preview:large";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";
export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} portfolio preview for ${PERSON_NAME}`;
export const DEFAULT_OG_IMAGE_TYPE = "image/png";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

export const NIGERIA_PRIORITY_CITIES = [
  "Lagos",
  "Abuja",
  "Ibadan",
  "Port Harcourt",
  "Kano",
  "Enugu",
  "Benin City",
  "Abeokuta",
  "Ilorin",
  "Akure",
  "Ekiti",
];

export const NIGERIA_LOCATION_KEYWORDS = [
  "UI UX designer in Abuja",
  "UI UX designer in Ibadan",
  "UI UX designer in Port Harcourt",
  "UI UX designer in Kano",
  "UI UX designer in Enugu",
  "UI UX designer in Benin City",
  "UI UX designer in Abeokuta",
  "UI UX designer in Ilorin",
  "UI UX designer in Akure",
  "UI UX designer in Ekiti",
  "product designer in Abuja",
  "frontend developer in Abuja",
  "website designer in Lagos",
  "website designer in Abuja",
  "app designer in Lagos",
  "app designer in Abuja",
  "freelance UI UX designer in Lagos",
  "freelance UI UX designer in Abuja",
  "Bodunde Emmanuel UI UX designer",
  "Bndlabs UI UX designer",
];

export const BASE_KEYWORDS = [
  "UI UX designer",
  "product designer",
  "frontend developer",
  "website designer",
  "app designer",
  "freelance UI UX designer",
  "digital product designer",
  "UI UX designer in Lagos",
  "UI UX designer in Nigeria",
  "product designer in Lagos",
  "product designer in Nigeria",
  "frontend developer in Lagos",
  "frontend developer in Nigeria",
  "website designer in Nigeria",
  "app designer in Nigeria",
  "freelance UI UX designer in Nigeria",
  "Lagos designer",
  "Nigeria designer",
  "Bodunde Emmanuel",
  "bndlabs",
  ...NIGERIA_LOCATION_KEYWORDS,
];

export const NIGERIA_SERVICE_AREAS = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "Abuja FCT",
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

const SERVICE_OFFERINGS = [
  {
    name: "UI/UX Design",
    description: "User interface and user experience design for websites, apps, SaaS products, and digital platforms.",
  },
  {
    name: "Product Design",
    description: "Product strategy, UX flows, design systems, prototypes, and polished product interfaces.",
  },
  {
    name: "Frontend Development",
    description: "Responsive frontend implementation for high-quality websites, portfolios, and product interfaces.",
  },
  {
    name: "Website Design",
    description: "Modern website design for Nigerian businesses, startups, founders, and personal brands.",
  },
  {
    name: "App Design",
    description: "Mobile and web app interface design with clear journeys, accessible layouts, and consistent systems.",
  },
];

function areaType(name) {
  if (name === "Nigeria") return "Country";
  if (NIGERIA_PRIORITY_CITIES.includes(name)) return "City";
  return "AdministrativeArea";
}

function buildAreaServed() {
  return uniqueStrings(["Nigeria", ...NIGERIA_PRIORITY_CITIES, ...NIGERIA_SERVICE_AREAS]).map((name) => ({
    "@type": areaType(name),
    name,
  }));
}

function buildOfferCatalog() {
  return {
    "@type": "OfferCatalog",
    name: "Bndlabs design and frontend services",
    itemListElement: SERVICE_OFFERINGS.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        provider: {
          "@id": `${SITE_URL}/#design-service`,
        },
        areaServed: buildAreaServed(),
      },
    })),
  };
}

export function buildPersonSchema(siteData = fallbackSiteSettings) {
  const contactEmail = siteData?.contactEmail || CONTACT_EMAIL;
  const socialLinks = siteData?.socialLinks || SOCIAL_LINKS;
  const sameAs = uniqueStrings([
    socialLinks.linkedin,
    socialLinks.x,
    socialLinks.behance,
    socialLinks.instagram,
    socialLinks.tiktok,
  ]);
  const areaServed = buildAreaServed();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#bodunde-emmanuel`,
        name: PERSON_NAME,
        jobTitle: PERSON_TITLE,
        description:
          "Bodunde Emmanuel is a UI/UX designer, product designer, and frontend developer in Lagos, Nigeria, creating clear digital products, websites, apps, and design systems for clients across Nigeria.",
        url: SITE_URL,
        email: contactEmail,
        image: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
        nationality: {
          "@type": "Country",
          name: "Nigeria",
        },
        homeLocation: {
          "@type": "City",
          name: "Lagos",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lagos",
          addressCountry: "Nigeria",
        },
        worksFor: {
          "@id": `${SITE_URL}/#bndlabs`,
        },
        knowsAbout: [
          "UI/UX Design",
          "Product Design",
          "Frontend Development",
          "Website Design",
          "App Design",
          "Design Systems",
          "Brand Identity",
        ],
        knowsLanguage: ["en"],
        areaServed,
        sameAs,
      },
      {
        "@type": "Brand",
        "@id": `${SITE_URL}/#bndlabs`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/brand-logo.png"),
        founder: {
          "@id": `${SITE_URL}/#bodunde-emmanuel`,
        },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#design-service`,
        name: "Bndlabs design and frontend development",
        url: SITE_URL,
        image: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
        email: contactEmail,
        description:
          "Bndlabs is the portfolio and independent design practice of Bodunde Emmanuel, offering UI/UX design, product design, website design, app design, and frontend development from Lagos to clients across Nigeria.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lagos",
          addressCountry: "Nigeria",
        },
        priceRange: "$$",
        founder: {
          "@id": `${SITE_URL}/#bodunde-emmanuel`,
        },
        areaServed,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Project inquiries",
          email: contactEmail,
          areaServed: "NG",
          availableLanguage: ["English"],
        },
        serviceType: [
          "UI/UX Design",
          "Product Design",
          "Frontend Development",
          "Website Design",
          "App Design",
          "Design Systems",
        ],
        hasOfferCatalog: buildOfferCatalog(),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "en",
        publisher: {
          "@id": `${SITE_URL}/#bndlabs`,
        },
      },
    ],
  };
}

export function buildWebPageSchema({
  title,
  description,
  path = "/",
  url,
  image = DEFAULT_OG_IMAGE_PATH,
  type = "WebPage",
  siteData = fallbackSiteSettings,
} = {}) {
  const pageUrl = url || absoluteUrl(path);
  const graph = buildPersonSchema(siteData)["@graph"];

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...graph,
      {
        "@type": type === "profile" ? "ProfilePage" : "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        headline: title,
        description,
        inLanguage: "en",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: toAbsoluteAssetUrl(image),
        },
        about: {
          "@id": `${SITE_URL}/#bodunde-emmanuel`,
        },
        publisher: {
          "@id": `${SITE_URL}/#bndlabs`,
        },
      },
    ],
  };
}

export function buildProjectSchema(project, siteData = fallbackSiteSettings) {
  const path = `/work/${project?.slug || ""}`;
  const image = toAbsoluteAssetUrl(project?.cover || project?.image || project?.thumbnail);

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...buildPersonSchema(siteData)["@graph"],
      {
        "@type": "WebPage",
        "@id": `${absoluteUrl(path)}#webpage`,
        url: absoluteUrl(path),
        name: `${project?.title || "Project"} UI/UX case study`,
        headline: `${project?.title || "Project"} case study`,
        description: buildProjectSeoDescription(project),
        inLanguage: "en",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: image,
        },
        about: {
          "@id": `${absoluteUrl(path)}#case-study`,
        },
        publisher: {
          "@id": `${SITE_URL}/#bndlabs`,
        },
      },
      {
        "@type": "CreativeWork",
        "@id": `${absoluteUrl(path)}#case-study`,
        name: project?.title,
        headline: `${project?.title || "Project"} case study`,
        description: buildProjectSeoDescription(project),
        url: absoluteUrl(path),
        image,
        thumbnailUrl: image,
        inLanguage: "en",
        keywords: keywordContent(buildProjectSeoKeywords(project)),
        mainEntityOfPage: {
          "@id": `${absoluteUrl(path)}#webpage`,
        },
        datePublished: project?.date || project?.createdAt || undefined,
        dateModified: project?.updatedAt || project?.date || project?.createdAt || undefined,
        author: {
          "@id": `${SITE_URL}/#bodunde-emmanuel`,
        },
        publisher: {
          "@id": `${SITE_URL}/#bndlabs`,
        },
        about: uniqueStrings([
          project?.category,
          ...(Array.isArray(project?.tasks) ? project.tasks : []),
          ...(Array.isArray(project?.tags) ? project.tags : []),
          "UI/UX Design",
          "Product Design",
        ]),
      },
    ],
  };
}

export function buildBlogPostSchema(post, siteData = fallbackSiteSettings) {
  const path = `/blog/${post?.slug || ""}`;
  const image = toAbsoluteAssetUrl(post?.thumbnail || post?.image);

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...buildPersonSchema(siteData)["@graph"],
      {
        "@type": "WebPage",
        "@id": `${absoluteUrl(path)}#webpage`,
        url: absoluteUrl(path),
        name: post?.title,
        headline: post?.title,
        description: post?.excerpt || post?.description,
        inLanguage: "en",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: image,
        },
        about: {
          "@id": `${absoluteUrl(path)}#blog-post`,
        },
        publisher: {
          "@id": `${SITE_URL}/#bndlabs`,
        },
      },
      {
        "@type": "BlogPosting",
        "@id": `${absoluteUrl(path)}#blog-post`,
        headline: post?.title,
        description: post?.excerpt || post?.description,
        url: absoluteUrl(path),
        image,
        thumbnailUrl: image,
        inLanguage: "en",
        keywords: keywordContent([
          ...BASE_KEYWORDS,
          post?.title,
          post?.tag,
          "UI UX design blog Nigeria",
          "frontend development blog Nigeria",
        ]),
        mainEntityOfPage: {
          "@id": `${absoluteUrl(path)}#webpage`,
        },
        datePublished: post?.date || post?.createdAt || undefined,
        dateModified: post?.updatedAt || post?.date || post?.createdAt || undefined,
        author: {
          "@id": `${SITE_URL}/#bodunde-emmanuel`,
        },
        publisher: {
          "@id": `${SITE_URL}/#bndlabs`,
        },
      },
    ],
  };
}

export function buildProjectSeoDescription(project) {
  const base = uniqueStrings([
    project?.summary,
    project?.description,
    project?.overview,
    project?.result,
    `Case study for ${project?.title || "a digital product"} by ${PERSON_NAME}, a UI/UX designer and product designer in Lagos, Nigeria.`,
  ])[0];
  const normalizedBase = String(base || "").replace(/\s+/g, " ").trim();
  const suffix = `${PERSON_NAME} of Bndlabs designed this case study with UI/UX, product design, and frontend clarity from Lagos, Nigeria.`;

  if (!normalizedBase) return suffix;
  if (/nigeria|lagos/i.test(normalizedBase)) return normalizedBase;
  return `${normalizedBase.replace(/[.\s]*$/, ".")} ${suffix}`;
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
    "UI UX designer in Abuja",
    "product designer in Nigeria",
    "frontend developer in Nigeria",
    "website designer in Nigeria",
    ...BASE_KEYWORDS,
  ]);
}
