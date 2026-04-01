import { Link, useNavigate } from "react-router-dom";
import { richTextToInlineHtml } from "../../lib/richText.js";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    width="15" height="15">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

function InlineRichText({ value, fallback = "", as: Tag = "span" }) {
  const html = richTextToInlineHtml(value || fallback);
  if (!html) return null;

  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
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

export default function WorkCard({
  project,
  className = "",
  onArrowEnter,
  onArrowLeave,
  priority = false,
  fullCardLink = false,
  arrowClickable = true,
}) {
  const navigate = useNavigate();

  if (!project) return null;

  const {
    slug,
    title,
    summary,
    description,
    category,
    subtitle,
    tasks,
    tag1,
    tag2,
    image,
    cover,
    thumbnail,
  } = project;
  const imageSrc = image || cover || thumbnail || "";
  const normalizedTasks = Array.isArray(tasks) ? tasks : [];
  const taskParts = [
    ...normalizedTasks,
    subtitle,
    category,
    tag1,
    tag2,
  ].filter((item, idx, arr) => item && arr.indexOf(item) === idx).slice(0, 3);
  const categoryLabel = category || tag1 || tag2 || normalizedTasks[0] || "Case Study";
  const taskLabel =
    summary ||
    description ||
    subtitle ||
    taskParts.join(" / ") ||
    "Product design case study.";
  const titleValue = pickRichTextValue(
    { text: title, content: project.titleContent },
    { text: title, content: project.title }
  );
  const categoryValue = pickRichTextValue(
    { text: categoryLabel, content: project.categoryContent },
    { text: tag1, content: project.tag1Content },
    { text: tag2, content: project.tag2Content },
    { text: normalizedTasks[0], content: project.taskItems?.[0]?.content }
  );
  const taskValue = pickRichTextValue(
    { text: summary, content: project.summaryContent },
    { text: description, content: project.descriptionContent },
    { text: subtitle, content: project.subtitleContent },
    { text: taskLabel, content: taskLabel }
  );
  const href = slug ? `/work/${slug}` : "#";
  const cardLabel = `Open ${title || "project"}`;

  const activateCard = () => {
    if (href === "#") return;
    navigate(href);
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
      className={`workCard ${className}`.trim()}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={fullCardLink ? "link" : undefined}
      tabIndex={fullCardLink ? 0 : undefined}
      aria-label={fullCardLink ? cardLabel : undefined}
      style={fullCardLink ? { cursor: "pointer" } : undefined}
    >

      {/* Visual */}
      <div className="workCard__visual">
        <div className="workCard__image">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={title ? `${title} UI UX design project by Bodunde Emmanuel` : "UI UX design project by Bodunde Emmanuel"}
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

      {/* Footer */}
      <div className="workCard__footer">
        <div className="workCard__text">
          <div className="workCard__meta">
            <h3 className="workCard__title">
              <InlineRichText value={titleValue.content} fallback={titleValue.text || "Untitled"} />
            </h3>
            {categoryValue.text ? (
              <span className="workCard__eyebrow">
                <InlineRichText value={categoryValue.content} fallback={categoryValue.text} />
              </span>
            ) : null}
          </div>
          <p className="workCard__task">
            <InlineRichText value={taskValue.content} fallback={taskValue.text || taskLabel} />
          </p>
        </div>

        {arrowClickable ? (
          <Link
            to={href}
            className="workCard__arrow"
            aria-label={cardLabel}
            onMouseEnter={onArrowEnter}
            onMouseLeave={onArrowLeave}
            draggable={false}
          >
            <ArrowIcon />
          </Link>
        ) : (
          <span className="workCard__arrow" aria-hidden="true">
            <ArrowIcon />
          </span>
        )}
      </div>

    </article>
  );
}
