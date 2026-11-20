import { createElement, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BlogCard from "../../components/blog/BlogCard";
import AudioBlock from "../../components/blog-post/AudioBlock";
import CalloutBlock from "../../components/blog-post/CalloutBlock";
import CodeBlock from "../../components/blog-post/CodeBlock";
import MediaBlock from "../../components/blog-post/MediaBlock";
import TableBlock from "../../components/blog-post/TableBlock";
import TocSidebar from "../../components/blog-post/TocSidebar";
import BackMark from "../../components/shared/BackMark";
import Footer from "../../components/layout/Footer";
import Seo from "../../components/seo/Seo";
import ShareSection from "../../components/shared/ShareSection";
import usePullToRefresh from "../../hooks/usePullToRefresh";
import { formatBlogDate, getInitialPosts, getPostBySlug, loadAllPosts } from "../../lib/blogData";
import { BASE_KEYWORDS, NIGERIA_LOCATION_KEYWORDS, SITE_NAME, buildBlogPostSchema } from "../../lib/site";
import { useSiteSettings } from "../../providers/siteSettingsContext.js";
import { sanitizeBlogHtml } from "../../components/blog-post/utils";
import OptimizedImage from "../../components/shared/OptimizedImage";
import "./blog-post.css";

function AuthorMark() {
  return <div className="blogPostAuthorAvatar" aria-hidden="true">UX</div>;
}

function TextBlock({ block }) {
  if (!block?.html) return null;

  const sanitizedHtml = sanitizeBlogHtml(block.html);
  if (!sanitizedHtml) return null;

  return <div className="blogPostText" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

function accentTitle(html) {
  const value = String(html || "");
  if (!value || /<em\b|<i\b/i.test(value)) return value;
  const skip = new Set(["the", "a", "an", "of", "to", "and", "or", "for", "on", "in", "why", "how", "your"]);
  const parts = value.split(/(\s+)/);
  let words = 0;
  for (let index = 0; index < parts.length; index += 1) {
    if (!/[A-Za-z]/.test(parts[index])) continue;
    const bare = parts[index].replace(/<[^>]+>/g, "").replace(/[^A-Za-z]/g, "").toLowerCase();
    words += 1;
    if (words > 1 && bare && !skip.has(bare)) {
      parts[index] = `<em>${parts[index]}</em>`;
      break;
    }
  }
  return parts.join("");
}

function InlineHtml({ html, className = "", as: Tag = "span" }) {
  const sanitizedHtml = sanitizeBlogHtml(html);
  if (!sanitizedHtml) return null;

  return createElement(Tag, {
    className,
    dangerouslySetInnerHTML: { __html: sanitizedHtml },
  });
}


function renderFlexibleSection(section, index) {
  if (!section) return null;

  if (section.type === "text") {
    return (
      <div key={String(index)} className="blogPostSectionBlock textSection">
        {section.heading && (
          <h2 dangerouslySetInnerHTML={{ __html: section.headingHtml || section.heading }} />
        )}
        {section.body && (
          <div className="blogPostText" dangerouslySetInnerHTML={{ __html: section.bodyHtml || section.body }} />
        )}
      </div>
    );
  }

  if (section.type === "image" && section.image) {
    return (
      <MediaBlock
        key={String(index)}
        block={{
          type: "image",
          images: [{ url: section.image.src, caption: section.image.caption, alt: section.image.alt }]
        }}
        videoIndex={index}
      />
    );
  }

  if (section.type === "video" && section.video) {
    return (
      <MediaBlock
        key={String(index)}
        block={{
          type: "video",
          url: section.video.src,
          caption: section.video.caption
        }}
        videoIndex={index}
      />
    );
  }

  if (section.type === "audio" && section.audio) {
    return (
      <AudioBlock
        key={String(index)}
        block={{
          type: "audio",
          url: section.audio.src,
          caption: section.audio.caption
        }}
      />
    );
  }

  if (section.type === "table" && section.table) {
    return (
      <TableBlock
        key={String(index)}
        block={{
          type: "table",
          headers: section.table.columns || [],
          rows: section.table.rows || []
        }}
      />
    );
  }

  if (section.type === "embed" && section.embedUrl) {
    return (
      <div key={String(index)} className="projectCaseEmbed">
        <iframe
          src={section.embedUrl}
          title="Embedded content"
          allowFullScreen
          loading="lazy"
          className="projectCaseEmbedFrame"
        />
      </div>
    );
  }

  if (section.type === "code" && section.code) {
    return (
      <CodeBlock
        key={String(index)}
        block={{
          type: "code",
          code: section.code,
          language: section.language || "code"
        }}
      />
    );
  }

  return null;
}

function renderBlock(block, index) {
  if (!block) return null;

  if (block.type === "heading") {
    const headingHtml = sanitizeBlogHtml(block.html);
    return (
      <h2
        className="blogPostSectionHeading"
        id={block.id}
        key={block.id}
        dangerouslySetInnerHTML={{ __html: headingHtml || block.text }}
      />
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

function selectRelatedPosts(posts, currentSlug) {
  const normalizedCurrentSlug = String(currentSlug || "").trim();

  return (Array.isArray(posts) ? posts : [])
    .filter((candidate) => {
      const candidateSlug = String(candidate?.slug || "").trim();
      return candidateSlug && candidateSlug !== normalizedCurrentSlug;
    })
    .slice(0, 2);
}

export default function BlogPost() {
  const { slug } = useParams();
  return <BlogPostContent key={slug || "blog-post"} slug={slug || ""} />;
}

function BlogPostContent({ slug }) {
  const initialPost = getPostBySlug(slug);
  const [posts, setPosts] = useState(() => getInitialPosts());
  const [post, setPost] = useState(() => initialPost);
  const [isLoading, setIsLoading] = useState(() => !initialPost);
  const [activeHeading, setActiveHeading] = useState(() => initialPost?.headings?.[0]?.id || "");
  const scrollRootRef = useRef(null);
  const siteSettings = useSiteSettings();

  usePullToRefresh(scrollRootRef);

  useEffect(() => {
    let isMounted = true;

    loadAllPosts({ force: true })
      .then((loadedPosts) => {
        if (!isMounted) return;

        if (Array.isArray(loadedPosts)) {
          setPosts(loadedPosts);
        }

        const loadedPost = Array.isArray(loadedPosts)
          ? loadedPosts.find((candidate) => candidate.slug === slug || candidate.id === slug) || null
          : null;

        setPost(loadedPost || getPostBySlug(slug));
        setActiveHeading((loadedPost || getPostBySlug(slug))?.headings?.[0]?.id || "");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

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

  const hasContent = Boolean(post?.contentBlocks?.length || post?.sections?.length);
  const relatedPosts = selectRelatedPosts(posts, post?.slug || slug);
  const hasRelatedPosts = relatedPosts.length > 0;
  const seoTitle = post?.title ? `${post.title} | ${SITE_NAME}` : `Notes | ${SITE_NAME}`;
  const seoDescription = post?.excerpt || "A note from Bndlabs.";
  const seoKeywords = post
    ? [
        ...BASE_KEYWORDS,
        ...NIGERIA_LOCATION_KEYWORDS,
        post.title,
        post.tag,
        "notes",
        "product design notes",
        "UI UX notes Nigeria",
      ].filter(Boolean)
    : [...BASE_KEYWORDS, ...NIGERIA_LOCATION_KEYWORDS, "notes", "product design notes"];

  return (
    <main className="page blogPostPage">
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalPath={`/notes/${slug}`}
        type="article"
        image={post?.thumbnail || post?.image || undefined}
        imageAlt={post?.title ? `${post.title} note preview for ${SITE_NAME}` : `Note preview for ${SITE_NAME}`}
        schema={post ? buildBlogPostSchema(post, siteSettings) : undefined}
      />

      <section className="hero aboutCard" aria-label="Note">
        <div className="cardScroll" ref={scrollRootRef}>
          <section className="blogPostSection" id="top" aria-label="Note">
            <div className="blogPostInner">
              <div className="blogPostToolbar">
                <BackMark to="/notes" label="Notes" />
              </div>

              <div className="blogPostLayout">
                <article className="blogPostArticle">
                  {post && hasContent ? (
                    <>
                      <div className="blogPostMeta">
                        {formatBlogDate(post.date) ? <span>{formatBlogDate(post.date)}</span> : null}
                        {formatBlogDate(post.date) && post.readTime ? <span className="blogPostMetaDot" /> : null}
                        {post.readTime ? (
                          <InlineHtml as="span" html={post.readTimeHtml || post.readTime} />
                        ) : null}
                        {post.tag ? (
                          <>
                            {(formatBlogDate(post.date) || post.readTime) ? <span className="blogPostMetaDot" /> : null}
                            <InlineHtml
                              as="span"
                              className="blogPostMetaTag"
                              html={post.tagHtml || post.tag}
                            />
                          </>
                        ) : null}
                      </div>

                      <InlineHtml
                        as="h1"
                        className="blogPostTitle"
                        html={accentTitle(post.titleHtml || post.title)}
                      />

                      <div className="blogPostAuthorRow">
                        <AuthorMark />
                        <div className="blogPostAuthorInfo">
                          <InlineHtml
                            as="p"
                            className="blogPostAuthorName"
                            html={post.author?.nameHtml || post.author?.name || "Bodunde Emmanuel"}
                          />
                          <p className="blogPostAuthorDate">
                            {formatBlogDate(post.date) ? `Posted on ${formatBlogDate(post.date)}` : "Published on Bndlabs"}
                          </p>
                        </div>
                      </div>

                      <div className="blogPostBody">
                        {post.contentBlocks?.map((block, index) => renderBlock(block, index))}
                        {post.sections?.map((section, index) => renderFlexibleSection(section, index))}
                      </div>

                      <ShareSection
                        className="blogPostShare"
                        path={`/notes/${post.slug || slug}`}
                        shareTitle={seoTitle}
                      />

                      {hasRelatedPosts ? (
                        <section className="blogPostMore" aria-labelledby="blog-post-more-title">
                          <p className="blogPostMoreLabel">Related Posts</p>
                          <h2 className="blogPostMoreTitle" id="blog-post-more-title">
                            More notes
                          </h2>

                          <div className="blogPostMoreGrid">
                            {relatedPosts.map((relatedPost, index) => (
                              <div
                                className="blogPostMoreCard"
                                key={relatedPost.id || relatedPost.slug || index}
                              >
                                <BlogCard
                                  post={relatedPost}
                                  className="blogCard--related"
                                  priority={index === 0}
                                />
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : null}
                    </>
                  ) : null}

                  {!post || !hasContent ? (
                    <div className="blogPostEmptyState">
                      <h1>{isLoading ? "Loading note" : "This note is not available."}</h1>
                      <p>{isLoading ? "Loading the note." : "New writing is on the way."}</p>
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
