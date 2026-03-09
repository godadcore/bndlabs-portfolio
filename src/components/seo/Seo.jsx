import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_ROBOTS,
  PERSON_NAME,
  SITE_NAME,
  absoluteUrl,
  buildPersonSchema,
  keywordContent,
  toAbsoluteAssetUrl,
} from "../../lib/site";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value == null || value === "") {
      element.removeAttribute(key);
      return;
    }

    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value == null || value === "") {
      element.removeAttribute(key);
      return;
    }

    element.setAttribute(key, value);
  });
}

function upsertJsonLd(scriptId, value) {
  let element = document.head.querySelector(`#${scriptId}`);

  if (!value) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = scriptId;
    document.head.appendChild(element);
  }

  element.textContent = value;
}

export default function Seo({
  title,
  description,
  keywords = [],
  canonicalPath,
  url,
  robots = DEFAULT_ROBOTS,
  image = DEFAULT_OG_IMAGE_PATH,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
  type = "website",
  schema,
}) {
  const location = useLocation();
  const canonicalUrl = absoluteUrl(url || canonicalPath || location.pathname || "/");
  const ogImage = toAbsoluteAssetUrl(image);
  const defaultOgImage = toAbsoluteAssetUrl(DEFAULT_OG_IMAGE_PATH);
  const usesDefaultOgImage = ogImage === defaultOgImage;
  const metaKeywords = keywordContent(keywords);
  const schemaValue = schema === null ? null : JSON.stringify(schema ?? buildPersonSchema());

  useEffect(() => {
    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="keywords"]', { name: "keywords", content: metaKeywords });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[name="author"]', { name: "author", content: PERSON_NAME });

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
    upsertMeta('meta[property="og:image:secure_url"]', { property: "og:image:secure_url", content: ogImage });
    upsertMeta('meta[property="og:image:type"]', {
      property: "og:image:type",
      content: usesDefaultOgImage ? DEFAULT_OG_IMAGE_TYPE : "",
    });
    upsertMeta('meta[property="og:image:width"]', {
      property: "og:image:width",
      content: usesDefaultOgImage ? String(DEFAULT_OG_IMAGE_WIDTH) : "",
    });
    upsertMeta('meta[property="og:image:height"]', {
      property: "og:image:height",
      content: usesDefaultOgImage ? String(DEFAULT_OG_IMAGE_HEIGHT) : "",
    });
    upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: imageAlt });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: ogImage });
    upsertMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt", content: imageAlt });

    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
    upsertJsonLd("seo-person-schema", schemaValue);
  }, [canonicalUrl, description, imageAlt, metaKeywords, ogImage, robots, schemaValue, title, type, usesDefaultOgImage]);

  return null;
}
