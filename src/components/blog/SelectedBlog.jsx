import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import BlogCard from "./BlogCard";
import { getInitialPosts, loadAllPosts } from "../../lib/blogData";
import "../work/selected-work.css";
import "./selected-blog.css";

export default function SelectedBlog({ scrollRootRef }) {
  const [posts, setPosts] = useState(() => getInitialPosts());
  const sectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    loadAllPosts().then((loadedPosts) => {
      if (!isMounted || !Array.isArray(loadedPosts)) return;
      setPosts(loadedPosts);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const root = scrollRootRef?.current;
    const section = sectionRef.current;
    if (!section) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !root || typeof IntersectionObserver !== "function") {
      section.classList.add("is-inview");
      section.classList.remove("is-observing");
      return undefined;
    }

    section.classList.add("is-observing");

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
      section.classList.remove("is-observing");
      io.disconnect();
    };
  }, [scrollRootRef]);

  const [featured, second, third] = posts.slice(0, 3);

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
