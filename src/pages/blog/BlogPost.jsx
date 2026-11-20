import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AudioBlock from "../../components/blog-post/AudioBlock";
import CalloutBlock from "../../components/blog-post/CalloutBlock";
import CodeBlock from "../../components/blog-post/CodeBlock";
import MediaBlock from "../../components/blog-post/MediaBlock";
import TableBlock from "../../components/blog-post/TableBlock";
import Frame from "../../components/paper/Frame";
import BackMark from "../../components/shared/BackMark";
import Footer from "../../components/layout/Footer";
import Seo from "../../components/seo/Seo";
import ShareSection from "../../components/shared/ShareSection";
import { formatBlogDate, getInitialPosts, getPostBySlug, loadAllPosts } from "../../lib/blogData";
import { BASE_KEYWORDS, NIGERIA_LOCATION_KEYWORDS, SITE_NAME, buildBlogPostSchema } from "../../lib/site";
import { useSiteSettings } from "../../providers/siteSettingsContext.js";
import { sanitizeBlogHtml } from "../../components/blog-post/utils";
import "./blog-post.css";

function plain(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function TextBlock({ block }) {
  if (!block?.html) return null;

  const sanitizedHtml = sanitizeBlogHtml(block.html);
  if (!sanitizedHtml) return null;

  return <div className="blogPostText" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
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
  const siteSettings = useSiteSettings();

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
    if (!post?.headings?.length) return undefined;

    const targets = Array.from(document.querySelectorAll(".blogPostSectionHeading[id]"));
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
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.15, 0.35, 0.6],
      }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [post]);

  const hasContent = Boolean(post?.contentBlocks?.length || post?.sections?.length);
  const nextNote = selectRelatedPosts(posts, post?.slug || slug)[0] || null;
  const seoTitle = post?.title ? `${plain(post.title)} | ${SITE_NAME}` : `Notes | ${SITE_NAME}`;
  const seoDescription = plain(post?.excerpt) || "A note from Bndlabs.";
  const cover = post?.image || post?.thumbnail || "";
  const dateLabel = formatBlogDate(post?.date);
  const readLabel = plain(post?.readTime);
  const categoryLabel = plain(post?.tag);
  const authorLabel = plain(post?.author?.name) || "Bodunde Emmanuel";
  const facts = [
    dateLabel ? ["Date", dateLabel] : null,
    readLabel ? ["Reading", readLabel] : null,
    categoryLabel ? ["Category", categoryLabel] : null,
    authorLabel ? ["Author", authorLabel] : null,
  ].filter(Boolean);
  const coverIsFirstImage = Boolean(
    cover
    && post?.contentBlocks?.[0]?.type === "image"
    && post.contentBlocks[0].images?.length === 1
    && post.contentBlocks[0].images[0]?.url === cover
  );
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
    <main className="bnd story">
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalPath={`/notes/${slug}`}
        type="article"
        image={cover || undefined}
        imageAlt={post?.title ? `${plain(post.title)} note preview for ${SITE_NAME}` : `Note preview for ${SITE_NAME}`}
        schema={post ? buildBlogPostSchema(post, siteSettings) : undefined}
      />

      {post && hasContent ? (
        <>
          <header className="wrap storyIntro">
            <BackMark to="/notes" label="Notes" />
            {post.sample ? <span className="sampleTag">SAMPLE</span> : null}
            <h1>{plain(post.title)}</h1>
            {post.headings?.length > 1 ? (
              <nav className="storyIndex" aria-label="On this note">
                {post.headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    aria-current={activeHeading === heading.id ? "true" : undefined}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            ) : null}
            {plain(post.excerpt) ? <p className="noteLead">{plain(post.excerpt)}</p> : null}
            {facts.length ? (
              <dl className="facts">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </header>

          {cover ? (
            <div className="wrap storyCover">
              <Frame src={cover} alt="" variant="cover" />
            </div>
          ) : null}

          <article className="wrap storyBlock is-reading">
            <div className="blogPostBody">
              {post.contentBlocks?.map((block, index) => (
                coverIsFirstImage && index === 0 ? null : renderBlock(block, index)
              ))}
              {post.sections?.map((section, index) => renderFlexibleSection(section, index))}
            </div>
          </article>

          <ShareSection
            className="wrap storyShare"
            path={`/notes/${post.slug || slug}`}
            shareTitle={plain(post.title)}
            iconWeight="regular"
          />

          {nextNote ? (
            <section className="wrap storyNext">
              <h2>Next note</h2>
              <Link to={`/notes/${nextNote.slug}`}>
                {(nextNote.image || nextNote.thumbnail) ? (
                  <Frame src={nextNote.image || nextNote.thumbnail} alt="" variant="next" />
                ) : null}
                <strong>{plain(nextNote.title)}</strong>
              </Link>
              <Link className="liquid is-solid" to={`/notes/${nextNote.slug}`}>Read note</Link>
            </section>
          ) : null}
        </>
      ) : (
        <header className="wrap storyIntro">
          <BackMark to="/notes" label="Notes" />
          <h1>{isLoading ? "Loading note" : "This note is not available."}</h1>
          <p className="noteLead">{isLoading ? "Loading the note." : "New writing is on the way."}</p>
        </header>
      )}
      <Footer />
    </main>
  );
}
