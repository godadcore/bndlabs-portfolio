import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "../../components/layout/Footer";
import Seo from "../../components/seo/Seo";
import { NOTES_LABEL } from "../../content/labels";
import { formatBlogDate, loadAllPosts } from "../../lib/blogData";
import { SITE_NAME } from "../../lib/site";

function plain(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadAllPosts().then((items) => {
      if (active) setPosts(Array.isArray(items) ? items : []);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="bnd">
      <Seo
        title={`${NOTES_LABEL} | ${SITE_NAME}`}
        description="Notes on design, software, and AI."
        canonicalPath="/notes"
      />
      <div className="pageFrame pageStack">
      <header className="pageIntro">
        <h1>{NOTES_LABEL}</h1>
        <p>Writing on design, software, and AI.</p>
      </header>
      <section className="noteIndex">
        {loading ? <p>Loading notes.</p> : null}
        <ul className="noteList">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={post.href || `/notes/${post.slug}`}>
                <span className="noteTag">{post.tag || "Note"}</span>
                <span className="noteCopy">
                  <strong>{plain(post.title)}</strong>
                  <em>
                    {formatBlogDate(post.date)}
                    {post.readTime ? ` · ${plain(post.readTime)}` : ""}
                  </em>
                </span>
                {plain(post.excerpt || post.description) ? <p>{plain(post.excerpt || post.description)}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      </div>
      <Footer />
    </main>
  );
}
