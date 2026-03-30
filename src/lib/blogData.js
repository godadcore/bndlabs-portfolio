import { safeLowerSlug } from "./projects.js";

export const BLOG_POST = {
  slug: "why-i-keep-interfaces-simple",
  title: "Why I Keep Interfaces Simple",
  excerpt:
    "A short note on reducing noise, choosing clearer patterns, and keeping product decisions easy to understand.",
  date: "2026-03-18",
  read_time: "3 min read",
  tag: "Design",
  thumb_url: "",
  author: {
    name: "BND Labs",
    initials: "BL",
    avatar_url: null,
  },
  content_blocks: [
    {
      type: "heading",
      text: "Introduction",
    },
    {
      type: "text",
      html:
        "<p>I like interfaces that explain themselves quickly. When a layout is clear, the copy can stay lighter, the visual hierarchy can do more work, and the product feels easier to trust.</p><p>This same thinking shapes how I approach portfolio pieces, landing pages, and product flows. I usually remove before I add.</p>",
    },
    {
      type: "heading",
      text: "What simplicity changes",
    },
    {
      type: "text",
      html:
        "<p>Simple does not mean empty. It means every section has a job, every action has a reason to exist, and repeated patterns stay consistent enough that users do not need to relearn the interface on every screen.</p><p>That usually affects spacing first, then copy, then the number of competing visual accents on the page.</p>",
    },
    {
      type: "heading",
      text: "How I apply it",
    },
    {
      type: "text",
      html:
        "<p>When I design, I look for the fastest path to clarity: a stronger heading, fewer decorative moves, and tighter content structure. If a screen still feels busy after that, the problem is usually not styling, it is prioritization.</p><p>This blog is meant to follow that same rule. One post, one clear structure, and a setup that can grow cleanly when the CMS is ready.</p>",
    },
  ],
  next_post: null,
};

function firstString(...values) {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }

  return "";
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(value, fallback = "section") {
  const slug = safeLowerSlug(value);
  return slug || fallback;
}

function toInitials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "BL";
}

function formatParagraphHtml(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  if (/<p[\s>]/i.test(normalized)) return normalized;

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}

function normalizeImageEntry(item, index) {
  if (!item || typeof item !== "object") return null;

  const url = firstString(item.url, item.src, item.image);
  if (!url) return null;

  return {
    url,
    alt: firstString(item.alt, `Blog media ${index + 1}`),
    caption: firstString(item.caption),
  };
}

function normalizeTableRows(rows) {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      if (Array.isArray(row)) {
        return row.map((cell) => String(cell ?? "").trim());
      }

      if (row && typeof row === "object") {
        const cells = Array.isArray(row.cells)
          ? row.cells
          : Array.isArray(row.columns)
            ? row.columns
            : [];
        return cells.map((cell) => String(cell ?? "").trim());
      }

      return [];
    })
    .filter((row) => row.some(Boolean));
}

function blockTypeFromRaw(rawType) {
  const typeMap = {
    textBlock: "text",
    headingBlock: "heading",
    imageBlock: "image",
    videoBlock: "video",
    gifBlock: "gif",
    codeBlock: "code",
    tableBlock: "table",
    audioBlock: "audio",
    calloutBlock: "callout",
  };

  return typeMap[rawType] || rawType || "";
}

function normalizeContentBlock(block, index) {
  if (!block || typeof block !== "object") return null;

  const type = blockTypeFromRaw(block.type || block._type);
  if (!type) return null;

  if (type === "text") {
    const html = formatParagraphHtml(firstString(block.html, block.body, block.text));
    if (!html) return null;

    return {
      id: `text-${index}`,
      type,
      html,
      plainText: stripHtml(html),
    };
  }

  if (type === "heading") {
    const text = firstString(block.text, block.title);
    if (!text) return null;

    return {
      id: slugifyHeading(text, `section-${index}`),
      type,
      text,
    };
  }

  if (type === "image") {
    const images = Array.isArray(block.images)
      ? block.images.map(normalizeImageEntry).filter(Boolean)
      : [];
    const singleUrl = firstString(block.url, block.src, block.image);

    if (!images.length && !singleUrl) return null;

    return {
      id: `image-${index}`,
      type,
      images: images.length
        ? images
        : [
            {
              url: singleUrl,
              alt: firstString(block.alt, `Blog image ${index + 1}`),
              caption: firstString(block.caption),
            },
          ],
    };
  }

  if (type === "gif") {
    const url = firstString(block.url, block.src, block.image);
    if (!url) return null;

    return {
      id: `gif-${index}`,
      type,
      url,
      alt: firstString(block.alt, `Blog GIF ${index + 1}`),
      caption: firstString(block.caption),
    };
  }

  if (type === "video") {
    const url = firstString(block.url, block.src);
    if (!url) return null;

    return {
      id: `video-${index}`,
      type,
      url,
      caption: firstString(block.caption),
    };
  }

  if (type === "code") {
    const code = String(block.code ?? "");
    if (!code.trim()) return null;

    return {
      id: `code-${index}`,
      type,
      language: firstString(block.language, "Code"),
      filename: firstString(block.filename, `snippet-${index + 1}.txt`),
      code,
    };
  }

  if (type === "table") {
    const headers = toStringArray(block.headers);
    const rows = normalizeTableRows(block.rows);
    if (!headers.length && !rows.length) return null;

    return {
      id: `table-${index}`,
      type,
      headers,
      rows,
    };
  }

  if (type === "audio") {
    const url = firstString(block.url, block.src);
    if (!url) return null;

    return {
      id: `audio-${index}`,
      type,
      url,
    };
  }

  if (type === "callout") {
    const body = firstString(block.body, block.text);
    if (!body) return null;

    return {
      id: `callout-${index}`,
      type,
      emoji: firstString(block.emoji, "Note"),
      title: firstString(block.title),
      body,
    };
  }

  return null;
}

function postExcerptFromBlocks(contentBlocks) {
  const firstTextBlock = contentBlocks.find((block) => block?.type === "text");
  return firstTextBlock ? stripHtml(firstTextBlock.html).slice(0, 180) : "";
}

function normalizeAuthor(author) {
  const name = firstString(author?.name, "BND Labs");

  return {
    name,
    initials: firstString(author?.initials, toInitials(name)),
    avatarUrl: firstString(author?.avatar_url, author?.avatarUrl),
  };
}

export function normalizePostSummary(raw) {
  const slug = safeLowerSlug(raw?.slug || raw?.id || raw?.title);
  const title = firstString(raw?.title, "Untitled");
  const thumbnail = firstString(
    raw?.thumb_url,
    raw?.thumbnail,
    raw?.image,
    raw?.cover_image_url,
    raw?.coverImageUrl
  );
  const author = normalizeAuthor(raw?.author);
  const excerpt = firstString(
    raw?.excerpt,
    raw?.description,
    stripHtml(raw?.summary),
    stripHtml(raw?.content),
    stripHtml(raw?.html)
  );

  return {
    id: firstString(raw?.id, slug, title),
    slug,
    title,
    description: excerpt,
    excerpt,
    image: thumbnail,
    thumbnail,
    href: slug ? `/blog/${slug}` : "/blog",
    date: firstString(raw?.date, raw?._createdAt),
    readTime: firstString(raw?.read_time, raw?.readTime, "5 min read"),
    tag: firstString(raw?.tag, "Blog"),
    author,
  };
}

export function normalizePost(raw) {
  const summary = normalizePostSummary(raw);
  const headingIdCounts = new Map();
  const contentBlocks = Array.isArray(raw?.content_blocks)
    ? raw.content_blocks
        .map(normalizeContentBlock)
        .filter(Boolean)
        .map((block) => {
          if (block.type !== "heading") return block;

          const count = (headingIdCounts.get(block.id) || 0) + 1;
          headingIdCounts.set(block.id, count);

          return count === 1
            ? block
            : {
                ...block,
                id: `${block.id}-${count}`,
              };
        })
    : [];
  const headings = contentBlocks
    .filter((block) => block.type === "heading")
    .map((block) => ({
      id: block.id,
      text: block.text,
    }));
  const nextPost = raw?.next_post ? normalizePostSummary(raw.next_post) : null;
  const excerpt = firstString(summary.excerpt, postExcerptFromBlocks(contentBlocks));

  return {
    ...summary,
    description: excerpt,
    excerpt,
    contentBlocks,
    headings,
    nextPost,
    updatedAt: firstString(raw?._updatedAt, raw?.updatedAt, raw?.date),
  };
}

const NORMALIZED_BLOG_POST = normalizePost(BLOG_POST);

export const BLOG_POSTS = [normalizePostSummary(BLOG_POST)];

export function getInitialPosts() {
  return BLOG_POSTS;
}

export function getPostBySlug(slug) {
  const normalizedSlug = safeLowerSlug(slug);
  if (!normalizedSlug) return null;

  return NORMALIZED_BLOG_POST.slug === normalizedSlug ? NORMALIZED_BLOG_POST : null;
}

export function formatBlogDate(value) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}
