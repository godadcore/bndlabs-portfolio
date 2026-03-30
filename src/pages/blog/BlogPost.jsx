import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AudioBlock from "../../components/blog-post/AudioBlock";
import CalloutBlock from "../../components/blog-post/CalloutBlock";
import CodeBlock from "../../components/blog-post/CodeBlock";
import MediaBlock from "../../components/blog-post/MediaBlock";
import NextPostCard from "../../components/blog-post/NextPostCard";
import TableBlock from "../../components/blog-post/TableBlock";
import TocSidebar from "../../components/blog-post/TocSidebar";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import Seo from "../../components/seo/Seo";
import usePullToRefresh from "../../hooks/usePullToRefresh";
import { formatBlogDate, getPostBySlug, loadPostBySlug } from "../../lib/blogData";
import { BASE_KEYWORDS, SITE_NAME } from "../../lib/site";
import { sanitizeUrl } from "../../lib/urlSecurity";
import "./blog-post.css";

function AuthorAvatar({ author }) {
  if (author?.avatarUrl) {
    return (
      <div className="blogPostAuthorAvatar">
        <img src={author.avatarUrl} alt={author.name || "Author"} loading="lazy" decoding="async" />
      </div>
    );
  }

  return <div className="blogPostAuthorAvatar">{author?.initials || "BE"}</div>;
}

function TextBlock({ block }) {
  if (!block?.html) return null;

  const sanitizedHtml = sanitizeHtmlFragment(block.html);
  if (!sanitizedHtml) return null;

  return <div className="blogPostText" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

function sanitizeHtmlFragment(value) {
  const rawHtml = String(value ?? "").trim();
  if (!rawHtml) return "";

  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return rawHtml.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  }

  const allowedTags = new Set([
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "em",
    "i",
    "li",
    "ol",
    "p",
    "strong",
    "u",
    "ul",
  ]);
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${rawHtml}</body>`, "text/html");

  const sanitizeNode = (node) => {
    if (node.nodeType === window.Node.TEXT_NODE) {
      return doc.createTextNode(node.textContent || "");
    }

    if (node.nodeType !== window.Node.ELEMENT_NODE) {
      return null;
    }

    const tagName = node.nodeName.toLowerCase();
    const childNodes = Array.from(node.childNodes)
      .map(sanitizeNode)
      .filter(Boolean);

    if (!allowedTags.has(tagName)) {
      const fragment = doc.createDocumentFragment();
      childNodes.forEach((childNode) => fragment.appendChild(childNode));
      return fragment;
    }

    const sanitizedElement = doc.createElement(tagName);

    if (tagName === "a") {
      const safeHref = sanitizeUrl(node.getAttribute("href"), {
        allowRelative: true,
        allowedProtocols: ["http:", "https:", "mailto:", "tel:"],
      });

      if (!safeHref) {
        const fragment = doc.createDocumentFragment();
        childNodes.forEach((childNode) => fragment.appendChild(childNode));
        return fragment;
      }

      sanitizedElement.setAttribute("href", safeHref);

      if (/^https?:/i.test(safeHref)) {
        sanitizedElement.setAttribute("target", "_blank");
        sanitizedElement.setAttribute("rel", "noreferrer noopener");
      }
    }

    childNodes.forEach((childNode) => sanitizedElement.appendChild(childNode));
    return sanitizedElement;
  };

  const wrapper = doc.createElement("div");
  Array.from(doc.body.childNodes)
    .map(sanitizeNode)
    .filter(Boolean)
    .forEach((node) => wrapper.appendChild(node));

  return wrapper.innerHTML.trim();
}

function renderBlock(block, index) {
  if (!block) return null;

  if (block.type === "heading") {
    return (
      <h2 className="blogPostSectionHeading" id={block.id} key={block.id}>
        {block.text}
      </h2>
    );
  }

  if (block.type === "text") {
    return <TextBlock block={block} key={block.id} />;
  }

  if (block.type === "image" || block.type === "video" || block.type === "gif") {
    return <MediaBlock block={block} key={block.id} videoIndex={index + 1} />;
  }

  if (block.type === "code") {
    return <CodeBlock block={block} key={block.id} />;
  }

  if (block.type === "table") {
    return <TableBlock block={block} key={block.id} />;
  }

  if (block.type === "audio") {
    return <AudioBlock block={block} key={block.id} />;
  }

  if (block.type === "callout") {
    return <CalloutBlock block={block} key={block.id} />;
  }

  return null;
}

export default function BlogPost() {
  const { slug } = useParams();
  return <BlogPostContent key={slug || "blog-post"} slug={slug || ""} />;
}

function BlogPostContent({ slug }) {
  const initialPost = getPostBySlug(slug);
  const [post, setPost] = useState(() => initialPost);
  const [isLoading, setIsLoading] = useState(() => !initialPost);
  const [activeHeading, setActiveHeading] = useState("");
  const scrollRootRef = useRef(null);

  usePullToRefresh(scrollRootRef);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setPost(getPostBySlug(slug));

    loadPostBySlug(slug).then((loadedPost) => {
      if (!isMounted) return;
      setPost(loadedPost);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    setActiveHeading(post?.headings?.[0]?.id || "");
  }, [post]);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root || !post?.headings?.length) return undefined;

    const targets = Array.from(root.querySelectorAll(".blogPostSectionHeading[id]"));
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!activeEntry) return;
        setActiveHeading(activeEntry.target.id);
      },
      {
        root,
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.15, 0.35, 0.6],
      }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [post]);

  const hasContent = Boolean(post?.contentBlocks?.length);
  const seoTitle = post?.title ? `${post.title} | Blog | ${SITE_NAME}` : `Blog Post | ${SITE_NAME}`;
  const seoDescription = post?.excerpt || "A blog post from Bndlabs.";
  const seoKeywords = post
    ? [...BASE_KEYWORDS, post.title, post.tag, "design blog", "product design notes"].filter(Boolean)
    : [...BASE_KEYWORDS, "design blog", "product design notes"];

  return (
    <main className="page blogPostPage">
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalPath={`/blog/${slug}`}
        type="article"
        image={post?.thumbnail || undefined}
        imageAlt={post?.title ? `${post.title} blog post preview for ${SITE_NAME}` : `Blog post preview for ${SITE_NAME}`}
      />

      <section className="hero aboutCard" aria-label="Blog post">
        <div className="cardScroll" ref={scrollRootRef}>
          <section className="aboutHeroShell" id="top">
            <div className="aboutShell">
              <Header active="blog" />
            </div>
          </section>

          <section className="blogPostSection" aria-label="Blog post content">
            <div className="blogPostInner">
              <div className="blogPostToolbar">
                <Link className="blogPostBackBtn" to="/blog">
                  Back to Blog
                </Link>
              </div>

              <div className="blogPostLayout">
                <article className="blogPostArticle">
                  {post && hasContent ? (
                    <>
                      <div className="blogPostMeta">
                        {formatBlogDate(post.date) ? <span>{formatBlogDate(post.date)}</span> : null}
                        {formatBlogDate(post.date) && post.readTime ? <span className="blogPostMetaDot" /> : null}
                        {post.readTime ? <span>{post.readTime}</span> : null}
                        {post.tag ? (
                          <>
                            {(formatBlogDate(post.date) || post.readTime) ? <span className="blogPostMetaDot" /> : null}
                            <span className="blogPostMetaTag">{post.tag}</span>
                          </>
                        ) : null}
                      </div>

                      <h1 className="blogPostTitle">{post.title}</h1>

                      <div className="blogPostAuthorRow">
                        <AuthorAvatar author={post.author} />
                        <div className="blogPostAuthorInfo">
                          <p className="blogPostAuthorName">{post.author?.name || "Bodunde Emmanuel"}</p>
                          <p className="blogPostAuthorDate">
                            {formatBlogDate(post.date) ? `Posted on ${formatBlogDate(post.date)}` : "Published on BND Labs"}
                          </p>
                        </div>
                      </div>

                      <div className="blogPostBody">
                        {post.contentBlocks.map((block, index) => renderBlock(block, index))}
                      </div>

                      <NextPostCard post={post.nextPost} />
                    </>
                  ) : null}

                  {!post || !hasContent ? (
                    <div className="blogPostEmptyState">
                      <h1>{isLoading ? "Loading post" : "No content yet"}</h1>
                      <p>
                        {isLoading
                          ? "Fetching the latest blog content from Sanity."
                          : "No content yet - start adding blocks in your CMS."}
                      </p>
                    </div>
                  ) : null}
                </article>

                <TocSidebar headings={post?.headings || []} activeHeading={activeHeading} />
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </section>
    </main>
  );
}
