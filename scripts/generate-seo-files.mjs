import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL } from "../src/lib/site.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const projectsDir = path.join(rootDir, "src", "content", "projects");
const publicDir = path.join(rootDir, "public");
const sitemapPath = path.join(publicDir, "sitemap.xml");
const robotsPath = path.join(publicDir, "robots.txt");

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
