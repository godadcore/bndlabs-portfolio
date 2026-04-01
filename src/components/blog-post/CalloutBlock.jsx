import { sanitizeBlogHtml } from "./utils";

export default function CalloutBlock({ block }) {
  if (!block?.body) return null;

  const titleHtml = sanitizeBlogHtml(block.titleHtml || block.title);
  const bodyHtml = sanitizeBlogHtml(block.bodyHtml || block.body);
  if (!bodyHtml) return null;

  return (
    <div className="blogPostCallout">
      <span className="blogPostCalloutEmoji" aria-hidden="true">
        {block.emoji || "Note"}
      </span>
      <div>
        {titleHtml ? <strong dangerouslySetInnerHTML={{ __html: titleHtml }} /> : null}{" "}
        <span dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </div>
    </div>
  );
}
