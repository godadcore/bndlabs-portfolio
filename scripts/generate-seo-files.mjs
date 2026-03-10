import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { SITE_URL } from "../src/lib/site.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envFiles = [".env.local", ".env"];

for (const envFile of envFiles) {
  const envPath = path.join(rootDir, envFile);
  try {
    process.loadEnvFile?.(envPath);
  } catch {
    // Ignore missing or unreadable local env files.
  }
}

const projectsDir = path.join(rootDir, "src", "content", "projects");
const publicDir = path.join(rootDir, "public");
const sitemapPath = path.join(publicDir, "sitemap.xml");
const robotsPath = path.join(publicDir, "robots.txt");
const sanityProjectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "u9ziwy8t";
const sanityDataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production";
const sanityApiVersion = process.env.SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION || "2026-03-10";
const sanityReadToken =
  process.env.SANITY_API_READ_TOKEN ||
  process.env.SANITY_READ_TOKEN ||
  process.env.SANITY_WRITE_TOKEN ||
  "";
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

async function loadProjectRoutes() {
  if (sanityClient) {
    try {
      const sanityProjects = await sanityClient.fetch(`*[_type == "project" && coalesce(status, "published") == "published"] {
        "slug": coalesce(slug.current, slug),
        id,
        title,
        date
      } | order(coalesce(date, _createdAt) desc, title asc)`);

      const sanityProjectEntries = Array.isArray(sanityProjects)
        ? sanityProjects
            .map((entry) => {
              const slug = safeLowerSlug(entry?.slug || entry?.id || entry?.title);

              if (!slug) return null;

              return {
                path: `/work/${slug}`,
                lastmod: lastModified(entry?.date),
              };
            })
            .filter(Boolean)
        : [];

      if (sanityProjectEntries.length) {
        sanityProjectEntries.sort((a, b) =>
          a.path.localeCompare(b.path, undefined, { sensitivity: "base" })
        );
        return sanityProjectEntries;
      }
    } catch (error) {
      console.error("SANITY_SITEMAP_FETCH_ERROR", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const files = await fs.readdir(projectsDir);
  const projectEntries = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(projectsDir, file);
    const raw = JSON.parse(await fs.readFile(filePath, "utf8"));
    const slug = safeLowerSlug(raw?.slug || raw?.id || raw?.title || file.replace(/\.json$/i, ""));

    if (!slug) continue;

    projectEntries.push({
      path: `/work/${slug}`,
      lastmod: lastModified(raw?.date),
    });
  }

  projectEntries.sort((a, b) => a.path.localeCompare(b.path, undefined, { sensitivity: "base" }));
  return projectEntries;
}

async function generateSitemap() {
  const projectRoutes = await loadProjectRoutes();
  const staticRoutes = [
    { path: "/", lastmod: new Date().toISOString() },
    { path: "/about", lastmod: new Date().toISOString() },
    { path: "/work", lastmod: new Date().toISOString() },
    { path: "/contact", lastmod: new Date().toISOString() },
  ];

  const urls = [...staticRoutes, ...projectRoutes]
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

  await fs.writeFile(sitemapPath, xml, "utf8");
}

async function generateRobots() {
  const content = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

  await fs.writeFile(robotsPath, content, "utf8");
}

await Promise.all([generateSitemap(), generateRobots()]);
