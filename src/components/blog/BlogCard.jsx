import { Link } from "react-router-dom";
import "./blog-card.css";

export default function BlogCard({ post, className = "", priority = false }) {
  if (!post) return null;

  const { title, description, excerpt, image, thumbnail, slug } = post;
  const cardLabel = `Read ${title || "blog post"}`;
  const resolvedHref = slug ? `/blog/${slug}` : "/blog";
  const cardImage = image || thumbnail || "";
  const cardText = description || excerpt || "New writing coming soon.";

  return (
    <article className={`workCard blogCard ${className}`.trim()}>
      <div className="workCard__visual">
        <div className="workCard__image">
          {cardImage ? (
            <img
              src={cardImage}
              alt={title ? `${title} blog placeholder artwork` : "Blog placeholder artwork"}
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
            <h3 className="workCard__title">{title || "Untitled"}</h3>
          </div>
          <p className="workCard__task">{cardText}</p>
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
