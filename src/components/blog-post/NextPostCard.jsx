import { Link } from "react-router-dom";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { formatBlogDate } from "../../lib/blogData";
import HugeIcon from "../shared/HugeIcon";

function ArrowIcon() {
  return <HugeIcon icon={ArrowRight01Icon} size={20} strokeWidth={1.9} />;
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
