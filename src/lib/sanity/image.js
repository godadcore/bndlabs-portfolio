import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "./client.js";

const BUILDER = sanityClient ? imageUrlBuilder(sanityClient) : null;

const DEFAULT_WIDTHS = [320, 480, 640, 768, 960, 1200, 1440, 1600, 1920, 2560];

function getSanityAssetRef(source) {
  return source?.asset?._ref || source?.asset?.ref || source?.asset?.id || "";
}

function getSanityAssetMeta(source) {
  return source?.asset?.metadata || source?.metadata || {};
}

function getSanityAssetInfo(source) {
  const metadata = getSanityAssetMeta(source);
  const dimensions = metadata?.dimensions || {};

  return {
    ref: getSanityAssetRef(source),
    width: Number(dimensions.width) || 0,
    height: Number(dimensions.height) || 0,
    aspectRatio:
      dimensions.width && dimensions.height ? dimensions.width / dimensions.height : 0,
    extension: String(source?.asset?.extension || source?.extension || "").toLowerCase(),
    mimeType: String(source?.asset?.mimeType || source?.mimeType || "").toLowerCase(),
  };
}

export function isSanityImageSource(source) {
  return Boolean(source && typeof source === "object" && getSanityAssetRef(source));
}

export function getSanityImageDimensions(source) {
  const { width, height, aspectRatio } = getSanityAssetInfo(source);
  return { width, height, aspectRatio };
}

function getFallbackFormat(source) {
  const { extension, mimeType } = getSanityAssetInfo(source);

  if (extension === "png" || mimeType === "image/png") return "png";
  if (extension === "webp" || mimeType === "image/webp") return "webp";
  return "jpg";
}

export function buildSanityImageUrl(source, { width, format } = {}) {
  if (!BUILDER || !isSanityImageSource(source)) return "";

  let builder = BUILDER.image(source).fit("max").auto("format");

  if (width) {
    builder = builder.width(Math.round(width));
  }

  if (format) {
    builder = builder.format(format);
  }

  return builder.url();
}

export function getResponsiveWidths(maxWidth = 0) {
  const cap = Number(maxWidth) > 0 ? Number(maxWidth) : 0;
  const widths = cap ? DEFAULT_WIDTHS.filter((value) => value <= cap) : DEFAULT_WIDTHS;

  if (!widths.length) return [320];

  const last = widths[widths.length - 1];
  if (cap && last !== cap) widths.push(cap);
  return widths;
}

export function buildSanityResponsiveSources(source, maxWidth = 0) {
  if (!isSanityImageSource(source)) return null;

  const widths = getResponsiveWidths(maxWidth);

  return {
    avif: widths.map((width) => `${buildSanityImageUrl(source, { width, format: "avif" })} ${width}w`).join(", "),
    webp: widths.map((width) => `${buildSanityImageUrl(source, { width, format: "webp" })} ${width}w`).join(", "),
    fallback: widths
      .map((width) => `${buildSanityImageUrl(source, { width, format: getFallbackFormat(source) })} ${width}w`)
      .join(", "),
    fallbackSrc: buildSanityImageUrl(source, {
      width: widths[Math.min(1, widths.length - 1)],
      format: getFallbackFormat(source),
    }),
    widths,
  };
}
