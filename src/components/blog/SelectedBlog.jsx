import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import BlogCard from "./BlogCard";
import { getInitialPosts } from "../../lib/blogData";
import "../work/selected-work.css";
import "./selected-blog.css";

export default function SelectedBlog({ scrollRootRef }) {
  const posts = getInitialPosts();
  const sectionRef = useRef(null);

  useEffect(() => {
    const root = scrollRootRef?.current;
    const section = sectionRef.current;
    if (!root || !section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("is-inview");
        io.unobserve(entry.target);
      },
      { root, threshold: 0.35 }
    );
    io.observe(section);

    return () => {
      io.disconnect();
    };
  }, [scrollRootRef]);

  const [featured, second, third] = posts;

  if (!featured) return null;

  return (
    <section className="selectedWorkSection selectedBlogSection" ref={sectionRef}>
      <div className="selectedWorkLayout">
        <div className="selectedWorkLeft">
          <h2 className="selectedWorkTitle">
            Latest
            <br />
            blog
          </h2>

          <Link to="/blog" className="whatidoBtn">
            Visit blog
          </Link>
        </div>

        <div className="selectedWorkRight">
          <div className="featuredCard">
            <BlogCard post={featured} priority />
          </div>

          {second || third ? (
            <div className="twoCards">
              {second ? <BlogCard post={second} /> : null}
              {third ? <BlogCard post={third} /> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
