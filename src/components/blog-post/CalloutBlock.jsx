export default function CalloutBlock({ block }) {
  if (!block?.body) return null;

  return (
    <div className="blogPostCallout">
      <span className="blogPostCalloutEmoji" aria-hidden="true">
        {block.emoji || "💡"}
      </span>
      <div>
        {block.title ? <strong>{block.title}</strong> : null} {block.body}
      </div>
    </div>
  );
}
