import { Link, useNavigate } from "react-router-dom";
import { formatBlogDate } from "../../lib/blogData";
import { richTextToInlineHtml } from "../../lib/richText.js";
import "./blog-card.css";

function InlineRichText({ value, fallback = "", className = "", as: Tag = "span" }) {
  const html = richTextToInlineHtml(value || fallback);
  if (!html) return null;

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function pickRichTextValue(...entries) {
  for (const entry of entries) {
    const text = String(entry?.text || "").trim();
    const content = entry?.content || text;

    if (text) {
      return {
        text,
        content,
      };
    }
  }

  return { text: "", content: "" };
}

export default function BlogCard({
  post,
  project = null,
  className = "",
  priority = false,
  fullCardLink = true,
  href = "",
  linkLabel = "",
}) {
  const navigate = useNavigate();
  const content = project || post;
  const isProjectCard = Boolean(project);

  if (!content) return null;

  const {
    title,
    description,
    excerpt,
    summary,
    subtitle,
    image,
    thumbnail,
    cover,
    slug,
    date,
  } = content;
  const cardLabel = isProjectCard
    ? `Open ${title || "case study"}`
    : `Read ${title || "blog post"}`;
  const resolvedHref =
    href ||
    (isProjectCard ? (slug ? `/work/${slug}` : "/work") : slug ? `/blog/${slug}` : "/blog");
  const cardImage = image || thumbnail || cover || "";
  const titleValue = pickRichTextValue(
    { text: title, content: content.titleContent },
    { text: title, content: content.title }
  );
  const cardTextValue = pickRichTextValue(
    { text: description, content: content.descriptionContent },
    { text: excerpt, content: content.excerptContent },
    { text: summary, content: content.summaryContent },
    { text: subtitle, content: content.subtitleContent }
  );
  const publishedDate = isProjectCard ? "" : formatBlogDate(date);
  const ctaLabel = linkLabel || (isProjectCard ? "View Case Study" : "Read More");
  const imageAlt = isProjectCard
    ? title
      ? `${title} case study cover image`
      : "Case study cover image"
    : title
      ? `${title} blog cover image`
      : "Blog cover image";

  const activateCard = () => {
    if (!resolvedHref) return;
    navigate(resolvedHref);
  };

  const handleCardClick = (event) => {
    if (!fullCardLink) return;
    if (event.target instanceof Element && event.target.closest("a")) return;
    activateCard();
  };

  const handleCardKeyDown = (event) => {
    if (!fullCardLink) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateCard();
  };

  return (
    <article
      className={`workCard blogCard ${className}`.trim()}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={fullCardLink ? "link" : undefined}
      tabIndex={fullCardLink ? 0 : undefined}
      aria-label={fullCardLink ? cardLabel : undefined}
      style={fullCardLink ? { cursor: "pointer" } : undefined}
    >
      <div className="workCard__visual">
        <div className="workCard__image">
          {cardImage ? (
            <img
              src={cardImage}
              alt={imageAlt}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
              decoding="async"
              draggable={false}
            />
          ) : (
            <div className="workCard__placeholder" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="workCard__footer blogCard__footer">
        <div className="workCard__text">
          <div className="workCard__meta">
            {publishedDate ? <p className="blogCard__date">{publishedDate}</p> : null}
            <h3 className="workCard__title">
              <InlineRichText value={titleValue.content} fallback={titleValue.text || "Untitled"} />
            </h3>
          </div>
          {cardTextValue.text ? (
            <p className="workCard__task">
              <InlineRichText value={cardTextValue.content} fallback={cardTextValue.text} />
            </p>
          ) : null}
          <Link
            className="blogCard__button"
            aria-label={cardLabel}
            to={resolvedHref}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
