import { Link, useNavigate } from "react-router-dom";
import { formatBlogDate } from "../../lib/blogData";
import "./blog-card.css";

export default function BlogCard({
  post,
  className = "",
  priority = false,
  fullCardLink = true,
}) {
  const navigate = useNavigate();

  if (!post) return null;

  const { title, description, excerpt, image, thumbnail, slug, date } = post;
  const cardLabel = `Read ${title || "blog post"}`;
  const resolvedHref = slug ? `/blog/${slug}` : "/blog";
  const cardImage = image || thumbnail || "";
  const cardText = description || excerpt || "";
  const publishedDate = formatBlogDate(date);

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
              alt={title ? `${title} blog cover image` : "Blog cover image"}
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
            <h3 className="workCard__title">{title || "Untitled"}</h3>
          </div>
          {cardText ? <p className="workCard__task">{cardText}</p> : null}
          <Link
            className="blogCard__button"
            aria-label={cardLabel}
            to={resolvedHref}
          >
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
}
