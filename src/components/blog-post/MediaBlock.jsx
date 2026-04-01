import { sanitizeBlogHtml, toggleVideo } from "./utils";

function MediaCaption({ html, fallback = "" }) {
  const sanitizedHtml = sanitizeBlogHtml(html || fallback);
  if (!sanitizedHtml) return null;

  return <div className="blogPostMediaCaption" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

function MediaImage({ item }) {
  if (!item?.url) return null;

  return (
    <div className="blogPostMediaBlock">
      <img src={item.url} alt={item.alt || "Blog media"} loading="lazy" decoding="async" />
      <MediaCaption html={item.captionHtml} fallback={item.caption} />
    </div>
  );
}

export default function MediaBlock({ block, videoIndex = 0 }) {
  if (!block) return null;

  if (block.type === "image") {
    const images = Array.isArray(block.images) ? block.images : [];
    if (!images.length) return null;

    if (images.length > 1) {
      return (
        <div className="blogPostImageGrid">
          {images.map((item, index) => (
            <MediaImage item={item} key={`${block.id}-image-${index}`} />
          ))}
        </div>
      );
    }

    return <MediaImage item={images[0]} />;
  }

  if (block.type === "gif") {
    return (
      <div className="blogPostMediaBlock">
        <img src={block.url} alt={block.alt || "Blog GIF"} loading="lazy" decoding="async" />
        <MediaCaption html={block.captionHtml} fallback={block.caption} />
      </div>
    );
  }

  if (block.type === "video") {
    const wrapperId = `vid${videoIndex}`;
    const videoId = `videoEl${videoIndex}`;

    return (
      <div className="blogPostMediaBlock blogPostMediaBlock--video" id={wrapperId}>
        <video id={videoId} src={block.url} loop muted playsInline />
        <button
          type="button"
          className="blogPostPlayBtn"
          aria-label="Play or pause video"
          onClick={() => toggleVideo(videoId, wrapperId)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <MediaCaption html={block.captionHtml} fallback={block.caption} />
      </div>
    );
  }

  return null;
}
