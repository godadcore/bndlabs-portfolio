import { forwardRef, useMemo } from "react";
import {
  buildSanityResponsiveSources,
  getSanityImageDimensions,
  isSanityImageSource,
} from "../../lib/sanity/image.js";

function firstNumber(...values) {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) return num;
  }
  return 0;
}

function normalizeSource(source, src) {
  if (source) return source;
  if (typeof src === "object" && src) return src;
  if (typeof src === "string" && src) return src;
  return null;
}

const OptimizedImage = forwardRef(function OptimizedImage(
  {
    src,
    image,
    alt = "",
    width,
    height,
    sizes = "100vw",
    className = "",
    style,
    priority = false,
    loading,
    decoding = "async",
    fetchPriority,
    draggable = false,
    ...props
  },
  ref
) {
  const source = normalizeSource(image, src);
  const isSanitySource = isSanityImageSource(source);
  const dimensions = isSanitySource ? getSanityImageDimensions(source) : {};
  const resolvedWidth = firstNumber(width, dimensions.width);
  const resolvedHeight =
    firstNumber(height, dimensions.height) ||
    (resolvedWidth && dimensions.aspectRatio ? Math.round(resolvedWidth / dimensions.aspectRatio) : 0);
  const responsiveSources = useMemo(
    () => (isSanitySource ? buildSanityResponsiveSources(source, resolvedWidth || dimensions.width) : null),
    [dimensions.width, isSanitySource, resolvedWidth, source]
  );

  if (!source) return null;

  const imageProps = {
    ref,
    alt,
    className,
    style,
    width: resolvedWidth || undefined,
    height: resolvedHeight || undefined,
    loading: loading || (priority ? "eager" : "lazy"),
    decoding,
    fetchPriority: fetchPriority || (priority ? "high" : undefined),
    draggable,
    ...props,
  };

  if (isSanitySource && responsiveSources) {
    return (
      <picture>
        <source
          type="image/avif"
          srcSet={responsiveSources.avif}
          sizes={sizes}
        />
        <source
          type="image/webp"
          srcSet={responsiveSources.webp}
          sizes={sizes}
        />
        <img
          {...imageProps}
          src={responsiveSources.fallbackSrc || responsiveSources.widths?.[0]}
          srcSet={responsiveSources.fallback}
          sizes={sizes}
        />
      </picture>
    );
  }

  const fallbackSrc = typeof source === "string" ? source : typeof src === "string" ? src : source?.src || "";

  return <img {...imageProps} src={fallbackSrc} />;
});

export default OptimizedImage;
