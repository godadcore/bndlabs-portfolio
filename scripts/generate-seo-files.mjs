import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { normalizePost } from "../src/lib/blogData.js";
import { normalizeProject } from "../src/lib/projects.js";
import {
  publishedCaseStudiesQuery,
  publishedLegacyProjectsQuery,
  publishedPostsQuery,
} from "../src/lib/sanity/queries.js";
import {
  BASE_KEYWORDS,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_ROBOTS,
  NIGERIA_LOCATION_KEYWORDS,
  PERSON_NAME,
  SITE_NAME,
  SITE_URL,
  buildBlogPostSchema,
  buildWebPageSchema,
  buildProjectSchema,
  buildProjectSeoDescription,
  buildProjectSeoKeywords,
  keywordContent,
  toAbsoluteAssetUrl,
} from "../src/lib/site.js";
import {
  ensureSanityNoProxy,
  getSanityConfigFromEnv,
  getSanityReadTokenFromEnv,
  loadLocalEnvFiles,
} from "../src/lib/sanity/nodeEnvironment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
loadLocalEnvFiles(rootDir);

const publicDir = path.join(rootDir, "public");
const distDir = path.join(rootDir, "dist");
const {
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
} = getSanityConfigFromEnv();
const sanityReadToken = getSanityReadTokenFromEnv();

ensureSanityNoProxy(sanityProjectId);

const sanityClient =
  sanityProjectId && sanityDataset
    ? createClient({
        projectId: sanityProjectId,
        dataset: sanityDataset,
        apiVersion: sanityApiVersion,
        useCdn: true,
        perspective: "published",
        stega: false,
        ...(sanityReadToken ? { token: sanityReadToken } : {}),
      })
    : null;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanMetaContent(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeLowerSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidDate(value) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function lastModified(value) {
  if (isValidDate(value)) {
    return new Date(value).toISOString();
  }

  return new Date().toISOString();
}

function absoluteUrl(pathname) {
  return new URL(pathname, SITE_URL).toString();
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeGeneratedFile(relativePath, content) {
  const targets = [path.join(publicDir, relativePath)];

  if (await pathExists(distDir)) {
    targets.push(path.join(distDir, relativePath));
  }

  await Promise.all(
    targets.map(async (targetPath) => {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content, "utf8");
    })
  );
}

async function fetchSanityList(query, label) {
  if (!sanityClient) return [];

  try {
    const result = await sanityClient.fetch(query);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error(`SANITY_${label}_FETCH_ERROR`, {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

async function loadProjects() {
  const [caseStudies, legacyProjects] = await Promise.all([
    fetchSanityList(publishedCaseStudiesQuery, "PROJECTS"),
    fetchSanityList(publishedLegacyProjectsQuery, "LEGACY_PROJECTS"),
  ]);

  return [...caseStudies, ...legacyProjects]
    .filter(Boolean)
    .map((project) => normalizeProject(project))
    .filter((project) => project?.title && project?.slug);
}

async function loadPosts() {
  const posts = await fetchSanityList(publishedPostsQuery, "POSTS");

  return posts
    .filter(Boolean)
    .map((post) => normalizePost(post))
    .filter((post) => post?.title && post?.slug);
}

function buildProjectRoutes(projects) {
  return projects
    .map((project) => {
      const slug = safeLowerSlug(project?.slug || project?.title);
      if (!slug) return null;

      return {
        path: `/work/${slug}`,
        lastmod: lastModified(project?.updatedAt || project?.date || project?.createdAt),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.path.localeCompare(b.path, undefined, { sensitivity: "base" }));
}

function buildPostRoutes(posts) {
  return posts
    .map((post) => {
      const slug = safeLowerSlug(post?.slug || post?.title);
      if (!slug) return null;

      return {
        path: `/blog/${slug}`,
        lastmod: lastModified(post?.updatedAt || post?.date || post?.createdAt),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.path.localeCompare(b.path, undefined, { sensitivity: "base" }));
}

async function generateSitemap(projectRoutes, postRoutes) {
  const staticRoutes = [
    { path: "/", lastmod: new Date().toISOString() },
    { path: "/about", lastmod: new Date().toISOString() },
    { path: "/blog", lastmod: new Date().toISOString() },
    { path: "/work", lastmod: new Date().toISOString() },
    { path: "/contact", lastmod: new Date().toISOString() },
  ];

  const urls = [...staticRoutes, ...projectRoutes, ...postRoutes]
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  await writeGeneratedFile("sitemap.xml", xml);
}

async function generateRobots() {
  const content = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

  await writeGeneratedFile("robots.txt", content);
}

function setTitle(html, title) {
  const tag = `<title>${escapeHtml(cleanMetaContent(title))}</title>`;
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, () => tag);
  }

  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function setMeta(html, attrName, attrValue, content) {
  const escapedAttrValue = escapeRegExp(attrValue);
  const regex = new RegExp(`<meta\\s+[^>]*${attrName}=["']${escapedAttrValue}["'][^>]*>`, "i");
  const cleanContent = cleanMetaContent(content);

  if (!cleanContent) {
    return html.replace(regex, "");
  }

  const tag = `<meta ${attrName}="${escapeHtml(attrValue)}" content="${escapeHtml(cleanContent)}" />`;
  if (regex.test(html)) {
    return html.replace(regex, () => tag);
  }

  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function setCanonical(html, href) {
  const regex = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;

  if (regex.test(html)) {
    return html.replace(regex, () => tag);
  }

  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function setJsonLd(html, scriptId, value) {
  const regex = new RegExp(`<script\\s+[^>]*id=["']${escapeRegExp(scriptId)}["'][^>]*>[\\s\\S]*?<\\/script>`, "i");

  if (!value) {
    return html.replace(regex, "");
  }

  const tag = `<script type="application/ld+json" id="${escapeHtml(scriptId)}">${JSON.stringify(value)}</script>`;

  if (regex.test(html)) {
    return html.replace(regex, () => tag);
  }

  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function renderRouteHtml(baseHtml, metadata) {
  const imageUrl = toAbsoluteAssetUrl(metadata.image || DEFAULT_OG_IMAGE_PATH);
  const defaultImageUrl = toAbsoluteAssetUrl(DEFAULT_OG_IMAGE_PATH);
  const usesDefaultImage = imageUrl === defaultImageUrl;
  let html = baseHtml;

  html = setTitle(html, metadata.title);
  html = setMeta(html, "name", "description", metadata.description);
  html = setMeta(html, "name", "keywords", metadata.keywords);
  html = setMeta(html, "name", "robots", metadata.robots || DEFAULT_ROBOTS);
  html = setMeta(html, "name", "author", PERSON_NAME);
  html = setCanonical(html, metadata.url);

  html = setMeta(html, "property", "og:title", metadata.title);
  html = setMeta(html, "property", "og:description", metadata.description);
  html = setMeta(html, "property", "og:image", imageUrl);
  html = setMeta(html, "property", "og:image:url", imageUrl);
  html = setMeta(html, "property", "og:image:secure_url", imageUrl);
  html = setMeta(html, "property", "og:image:type", usesDefaultImage ? DEFAULT_OG_IMAGE_TYPE : null);
  html = setMeta(html, "property", "og:image:width", usesDefaultImage ? String(DEFAULT_OG_IMAGE_WIDTH) : null);
  html = setMeta(html, "property", "og:image:height", usesDefaultImage ? String(DEFAULT_OG_IMAGE_HEIGHT) : null);
  html = setMeta(html, "property", "og:image:alt", metadata.imageAlt || DEFAULT_OG_IMAGE_ALT);
  html = setMeta(html, "property", "og:url", metadata.url);
  html = setMeta(html, "property", "og:type", metadata.type || "website");
  html = setMeta(html, "property", "og:site_name", SITE_NAME);
  html = setMeta(html, "property", "og:locale", "en_US");

  html = setMeta(html, "name", "twitter:card", "summary_large_image");
  html = setMeta(html, "name", "twitter:title", metadata.title);
  html = setMeta(html, "name", "twitter:description", metadata.description);
  html = setMeta(html, "name", "twitter:url", metadata.url);
  html = setMeta(html, "name", "twitter:image", imageUrl);
  html = setMeta(html, "name", "twitter:image:src", imageUrl);
  html = setMeta(html, "name", "twitter:image:alt", metadata.imageAlt || DEFAULT_OG_IMAGE_ALT);
  html = setJsonLd(
    html,
    "seo-person-schema",
    metadata.schema ||
      buildWebPageSchema({
        title: metadata.title,
        description: metadata.description,
        url: metadata.url,
        image: metadata.image,
        type: metadata.type,
      })
  );

  return html;
}

async function writeRouteHtml(routePath, html) {
  const relativeRoute = routePath.replace(/^\/+/, "");
  const targetPaths = relativeRoute
    ? [
        path.join(distDir, relativeRoute, "index.html"),
        path.join(distDir, `${relativeRoute}.html`),
      ]
    : [path.join(distDir, "index.html")];

  await Promise.all(
    targetPaths.map(async (targetPath) => {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, html, "utf8");
    })
  );
}

function projectMetadata(project) {
  const pathName = `/work/${project.slug}`;
  const image = project.cover || project.image || project.thumbnail || DEFAULT_OG_IMAGE_PATH;

  return {
    title: `${project.title} UI/UX Case Study by Bodunde Emmanuel | ${SITE_NAME}`,
    description: buildProjectSeoDescription(project),
    keywords: keywordContent(buildProjectSeoKeywords(project)),
    url: absoluteUrl(pathName),
    image,
    imageAlt: `${project.title} case study preview for ${SITE_NAME}`,
    type: "article",
    schema: buildProjectSchema(project),
  };
}

function postMetadata(post) {
  const pathName = `/blog/${post.slug}`;
  const image = post.thumbnail || post.image || DEFAULT_OG_IMAGE_PATH;
  const keywords = [
    ...BASE_KEYWORDS,
    ...NIGERIA_LOCATION_KEYWORDS,
    post.title,
    post.tag,
    "design blog",
    "product design notes",
    "UI UX design blog Nigeria",
    "frontend development blog Nigeria",
  ].filter(Boolean);

  return {
    title: `${post.title} | Design Blog by Bodunde Emmanuel | ${SITE_NAME}`,
    description: post.excerpt || post.description || "A blog post from bndlabs.",
    keywords: keywordContent(keywords),
    url: absoluteUrl(pathName),
    image,
    imageAlt: `${post.title} blog post preview for ${SITE_NAME}`,
    type: "article",
    schema: buildBlogPostSchema(post),
  };
}

function staticPageMetadata() {
  const homepageKeywords = keywordContent([
    ...BASE_KEYWORDS,
    ...NIGERIA_LOCATION_KEYWORDS,
    "UI UX designer portfolio",
    "frontend developer portfolio",
    "brand systems designer",
  ]);

  const pages = [
    {
      path: "/",
      title: `Bodunde Emmanuel | UI/UX Designer in Nigeria, Product Designer & Frontend Developer | ${SITE_NAME}`,
      description:
        "Portfolio of Bodunde Emmanuel, the designer behind Bndlabs: a UI/UX designer, product designer, and frontend developer in Lagos serving clients across Nigeria, including Abuja, Ibadan, Port Harcourt, Kano, Enugu, and Benin City.",
      keywords: homepageKeywords,
      url: absoluteUrl("/"),
      image: DEFAULT_OG_IMAGE_PATH,
      imageAlt: `${SITE_NAME} home page preview for Bodunde Emmanuel`,
      type: "website",
    },
    {
      path: "/about",
      title: `About Bodunde Emmanuel | UI/UX Designer & Product Designer in Lagos, Nigeria | ${SITE_NAME}`,
      description:
        "Learn about Bodunde Emmanuel, founder of Bndlabs and a Lagos-based UI/UX designer, product designer, and frontend developer creating thoughtful websites, apps, and design systems for clients across Nigeria.",
      keywords: keywordContent([...BASE_KEYWORDS, ...NIGERIA_LOCATION_KEYWORDS, "About Bodunde Emmanuel", "product designer Lagos", "frontend developer Nigeria"]),
      url: absoluteUrl("/about"),
      image: DEFAULT_OG_IMAGE_PATH,
      imageAlt: `About ${SITE_NAME} portfolio preview for Bodunde Emmanuel`,
      type: "profile",
    },
    {
      path: "/work",
      title: `UI/UX Design Case Studies in Nigeria by Bodunde Emmanuel | ${SITE_NAME}`,
      description:
        "Explore UI/UX, product design, website design, app design, and frontend development case studies by Bodunde Emmanuel, the designer behind Bndlabs in Lagos, Nigeria.",
      keywords: keywordContent([
        ...BASE_KEYWORDS,
        ...NIGERIA_LOCATION_KEYWORDS,
        "UI UX projects",
        "product design case studies",
        "selected work portfolio",
        "digital product designer portfolio",
        "frontend developer portfolio Nigeria",
      ]),
      url: absoluteUrl("/work"),
      image: DEFAULT_OG_IMAGE_PATH,
      imageAlt: `Selected work page preview for ${SITE_NAME}`,
      type: "website",
    },
    {
      path: "/blog",
      title: `UI/UX Design & Frontend Blog in Nigeria by Bodunde Emmanuel | ${SITE_NAME}`,
      description:
        "Design notes, product thinking, UI/UX process, frontend development lessons, and digital product reflections from Bodunde Emmanuel of Bndlabs in Lagos, Nigeria.",
      keywords: keywordContent([
        ...BASE_KEYWORDS,
        ...NIGERIA_LOCATION_KEYWORDS,
        "design blog",
        "product design notes",
        "UI UX writing",
        "frontend development notes",
      ]),
      url: absoluteUrl("/blog"),
      image: DEFAULT_OG_IMAGE_PATH,
      imageAlt: `Blog page preview for ${SITE_NAME}`,
      type: "website",
    },
    {
      path: "/contact",
      title: `Hire Bodunde Emmanuel | UI/UX Designer & Frontend Developer in Nigeria | ${SITE_NAME}`,
      description:
        "Contact Bodunde Emmanuel of Bndlabs for UI/UX design, product design, website design, app design, design systems, and frontend development from Lagos for clients across Nigeria.",
      keywords: keywordContent([...BASE_KEYWORDS, ...NIGERIA_LOCATION_KEYWORDS, "contact UI UX designer", "hire product designer in Nigeria", "contact frontend developer Lagos"]),
      url: absoluteUrl("/contact"),
      image: DEFAULT_OG_IMAGE_PATH,
      imageAlt: `Contact page preview for ${SITE_NAME}`,
      type: "website",
    },
  ];

  return pages.map((metadata) => ({
    ...metadata,
    schema: buildWebPageSchema({
      title: metadata.title,
      description: metadata.description,
      path: metadata.path,
      image: metadata.image,
      type: metadata.type,
    }),
  }));
}

async function generateRouteHtml(projects, posts) {
  const indexPath = path.join(distDir, "index.html");

  if (!(await pathExists(indexPath))) {
    return;
  }

  const baseHtml = await fs.readFile(indexPath, "utf8");
  const staticPages = staticPageMetadata().map((metadata) => ({
    path: metadata.path,
    html: renderRouteHtml(baseHtml, metadata),
  }));
  const projectPages = projects.map((project) => ({
    path: `/work/${project.slug}`,
    html: renderRouteHtml(baseHtml, projectMetadata(project)),
  }));
  const postPages = posts.map((post) => ({
    path: `/blog/${post.slug}`,
    html: renderRouteHtml(baseHtml, postMetadata(post)),
  }));

  await Promise.all(
    [...staticPages, ...projectPages, ...postPages].map((page) => writeRouteHtml(page.path, page.html))
  );
}

const [projects, posts] = await Promise.all([loadProjects(), loadPosts()]);
const projectRoutes = buildProjectRoutes(projects);
const postRoutes = buildPostRoutes(posts);

await Promise.all([
  generateSitemap(projectRoutes, postRoutes),
  generateRobots(),
  generateRouteHtml(projects, posts),
]);
