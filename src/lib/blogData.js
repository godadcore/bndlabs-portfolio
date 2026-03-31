import { safeLowerSlug } from "./projects.js";
import { sanitizeUrl } from "./urlSecurity.js";

let cachedRemotePostsPromise = null;
const POSTS_API_PATH = "/api/sanity/posts";

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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function normalizeImageEntry(item, index) {
  if (!item || typeof item !== "object") return null;

  const url = sanitizeUrl(firstString(item.url, item.src, item.image), {
    allowRelative: true,
  });
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
    const singleUrl = sanitizeUrl(firstString(block.url, block.src, block.image), {
      allowRelative: true,
    });

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
    const url = sanitizeUrl(firstString(block.url, block.src, block.image), {
      allowRelative: true,
    });
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
    const url = sanitizeUrl(firstString(block.url, block.src), {
      allowRelative: true,
    });
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
    const url = sanitizeUrl(firstString(block.url, block.src), {
      allowRelative: true,
    });
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
    avatarUrl: sanitizeUrl(firstString(author?.avatar_url, author?.avatarUrl), {
      allowRelative: true,
    }),
  };
}

export function normalizePostSummary(raw) {
  const slug = safeLowerSlug(raw?.slug || raw?.id || raw?.title);
  const title = firstString(raw?.title, "Untitled");
  const thumbnail = firstString(
    raw?.thumb_url,
    raw?.thumbnail,
    raw?.mainImage?.url,
    raw?.image?.url,
    raw?.heroImage?.url,
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
    image: sanitizeUrl(thumbnail, { allowRelative: true }),
    thumbnail: sanitizeUrl(thumbnail, { allowRelative: true }),
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
    createdAt: firstString(raw?._createdAt, raw?.createdAt, raw?.date),
    updatedAt: firstString(raw?._updatedAt, raw?.updatedAt, raw?._createdAt, raw?.date),
  };
}

function hasPostImage(post) {
  return Boolean(String(post?.image ?? post?.thumbnail ?? "").trim());
}

function hasPostExcerpt(post) {
  return Boolean(String(post?.description ?? post?.excerpt ?? "").trim());
}

function hasPostDate(post) {
  return Boolean(String(post?.date ?? post?.createdAt ?? post?.updatedAt ?? "").trim());
}

function isDisplayablePost(post) {
  return Boolean(
    post?.title &&
      post?.slug &&
      post?.id &&
      hasPostImage(post) &&
      hasPostExcerpt(post) &&
      hasPostDate(post)
  );
}

let cachedPostsSnapshot = [];

function isValidPostDate(value) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function postSortTimestamp(post) {
  const candidates = [post?.date, post?.createdAt, post?.updatedAt];
  const firstValidDate = candidates.find((value) => isValidPostDate(value));
  return firstValidDate ? new Date(firstValidDate).getTime() : null;
}

export function sortPostsNewestFirst(items) {
  return [...items].sort((a, b) => {
    const aTimestamp = postSortTimestamp(a);
    const bTimestamp = postSortTimestamp(b);

    if (aTimestamp && bTimestamp) {
      return bTimestamp - aTimestamp;
    }
    if (aTimestamp && !bTimestamp) return -1;
    if (!aTimestamp && bTimestamp) return 1;

    return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, {
      sensitivity: "base",
    });
  });
}

async function fetchPostsPayload() {
  const response = await fetch(POSTS_API_PATH, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Sanity posts API returned ${response.status}`);
  }

  return response.json();
}

async function fetchPostsFromSanity() {
  const payload = await fetchPostsPayload();
  const rawPosts = Array.isArray(payload?.posts) ? payload.posts : [];
  const normalizedPosts = rawPosts
    .filter(Boolean)
    .map((post) => normalizePost(post))
    .filter(isDisplayablePost);

  if (!normalizedPosts.length) {
    console.warn("SANITY_POSTS_EMPTY", {
      reason: "empty_or_unusable_response",
      source: payload?.source || "unknown",
    });
    cachedPostsSnapshot = [];
    return cachedPostsSnapshot;
  }

  cachedPostsSnapshot = sortPostsNewestFirst(normalizedPosts);
  return cachedPostsSnapshot;
}

export const BLOG_POSTS = [];

export function getInitialPosts() {
  return cachedPostsSnapshot;
}

export function getPostBySlug(slug) {
  const normalizedSlug = safeLowerSlug(slug);
  if (!normalizedSlug) return null;

  return (
    cachedPostsSnapshot.find(
      (post) => post.slug === normalizedSlug || post.id === normalizedSlug
    ) || null
  );
}

export async function loadAllPosts(options = {}) {
  const forceRefresh = options?.force === true;

  if (!cachedRemotePostsPromise || forceRefresh) {
    cachedRemotePostsPromise = fetchPostsFromSanity().catch((error) => {
      console.error("SANITY_POSTS_FETCH_ERROR", {
        message: error instanceof Error ? error.message : String(error),
      });
      cachedPostsSnapshot = [];
      return cachedPostsSnapshot;
    });
  }

  return cachedRemotePostsPromise;
}

export async function loadPostBySlug(slug, options = {}) {
  const normalizedSlug = safeLowerSlug(slug);
  if (!normalizedSlug) return null;

  const posts = await loadAllPosts(options);
  return (
    posts.find((post) => post.slug === normalizedSlug || post.id === normalizedSlug) ||
    getPostBySlug(normalizedSlug)
  );
}

export function resetBlogDataCache() {
  cachedRemotePostsPromise = null;
  cachedPostsSnapshot = [];
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
