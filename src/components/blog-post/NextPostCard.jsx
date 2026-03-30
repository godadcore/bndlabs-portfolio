import { Link } from "react-router-dom";
import { formatBlogDate } from "../../lib/blogData";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NextPostCard({ post }) {
  if (!post?.slug) return null;

  return (
    <div className="blogPostNext">
      <p className="blogPostNextLabel">Up Next</p>
      <Link className="blogPostNextCard" to={`/blog/${post.slug}`}>
        {post.thumbnail ? (
          <div className="blogPostNextThumb">
            <img src={post.thumbnail} alt={post.title || "Next post"} loading="lazy" decoding="async" />
          </div>
        ) : null}
        <div className="blogPostNextBody">
          <p className="blogPostNextMeta">
            {[formatBlogDate(post.date), post.readTime].filter(Boolean).join(" - ")}
          </p>
          <h2 className="blogPostNextTitle">{post.title}</h2>
        </div>
        <span className="blogPostNextArrow">
          <ArrowIcon />
        </span>
      </Link>
    </div>
  );
}
