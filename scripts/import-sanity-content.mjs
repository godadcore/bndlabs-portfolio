import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { BLOG_POST } from "../src/lib/blogData.js";
import {
  ensureSanityNoProxy,
  getSanityConfigFromEnv,
  getSanityWriteTokenFromEnv,
  loadLocalEnvFiles,
} from "../src/lib/sanity/nodeEnvironment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
loadLocalEnvFiles(rootDir);

const studioDir = path.join(rootDir, "getbndlabs");
const projectsDir = path.join(rootDir, "src", "content", "projects");
const siteSettingsPath = path.join(rootDir, "src", "content", "site", "settings.json");

const { projectId, dataset, apiVersion } = getSanityConfigFromEnv();
const token = getSanityWriteTokenFromEnv();
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

ensureSanityNoProxy(projectId);

const client = token
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })
  : null;

function safeLowerSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeString(value) {
  return String(value ?? "").trim();
}

function isValidDate(value) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => safeString(item))
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index);
}

function toObjectArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object");
}

function makeKey(prefix, index) {
  return `${prefix}-${index + 1}-${randomUUID().slice(0, 8)}`;
}

function pruneValue(value) {
  if (Array.isArray(value)) {
    const nextItems = value
      .map((item) => pruneValue(item))
      .filter((item) => item !== undefined);

    return nextItems.length ? nextItems : undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, pruneValue(item)])
      .filter(([, item]) => item !== undefined);

    return entries.length ? Object.fromEntries(entries) : undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized ? normalized : undefined;
  }

  if (value === null || value === undefined) {
    return undefined;
  }

  return value;
}

function createTypedObject(type, payload, index) {
  const normalizedPayload = pruneValue(payload);

  if (!normalizedPayload || typeof normalizedPayload !== "object") {
    return undefined;
  }

  return {
    _type: type,
    _key: makeKey(type, index),
    ...normalizedPayload,
  };
}

function mapTextCardArray(value, type, bodyField = "text") {
  return toObjectArray(value)
    .map((item, index) =>
      createTypedObject(
        type,
        {
          title: safeString(item?.title || item?.label),
          [bodyField]: safeString(item?.[bodyField] || item?.description || item?.body || item?.text),
        },
        index
      )
    )
    .filter(Boolean);
}

function mapGalleryArray(value, type) {
  return (Array.isArray(value) ? value : [])
    .map((item, index) => {
      const payload =
        typeof item === "string"
          ? {
              src: safeString(item),
              alt: `Gallery image ${index + 1}`,
            }
          : {
              src: safeString(item?.src || item?.image || item?.url),
              alt: safeString(item?.alt),
            };

      return createTypedObject(type, payload, index);
    })
    .filter(Boolean);
}

function mapStepArray(value) {
  return toObjectArray(value)
    .map((item, index) =>
      createTypedObject(
        "step",
        {
          title: safeString(item?.title),
          description: safeString(item?.description || item?.text),
        },
        index
      )
    )
    .filter(Boolean);
}

function mapPersonaArray(value) {
  return toObjectArray(value)
    .map((item, index) =>
      createTypedObject(
        "persona_entry",
        {
          image: safeString(item?.image || item?.avatar),
          name: safeString(item?.name || item?.title),
          age: safeString(item?.age),
          gender: safeString(item?.gender),
          occupation: safeString(item?.occupation || item?.role),
          location: safeString(item?.location || item?.region),
          education: safeString(item?.education),
          quote: safeString(item?.quote),
          bio: safeString(item?.bio || item?.description),
          goals: toStringArray(item?.goals),
          frustrations: toStringArray(item?.frustrations),
        },
        index
      )
    )
    .filter(Boolean);
}

function buildProcessField(rawProcess) {
  if (Array.isArray(rawProcess)) {
    return pruneValue({
      steps: mapStepArray(rawProcess),
    });
  }

  const processRoot = rawProcess && typeof rawProcess === "object" ? rawProcess : {};
  const design = processRoot?.design && typeof processRoot.design === "object" ? processRoot.design : {};
  const delivery = processRoot?.delivery && typeof processRoot.delivery === "object" ? processRoot.delivery : {};
  const structure = processRoot?.structure && typeof processRoot.structure === "object" ? processRoot.structure : {};

  return pruneValue({
    structure: {
      intro: safeString(structure?.intro),
      image: safeString(structure?.image),
    },
    design: {
      intro: safeString(design?.intro),
      image: safeString(design?.image),
      overview_image: safeString(design?.overview_image),
      screens: (Array.isArray(design?.screens) ? design.screens : [])
        .map((item, index) =>
          createTypedObject(
            "screen",
            typeof item === "string"
              ? {
                  src: safeString(item),
                  label: `Screen ${String(index + 1).padStart(2, "0")}`,
                }
              : {
                  src: safeString(item?.src || item?.image || item?.url),
                  label: safeString(item?.label || item?.title),
                },
            index
          )
        )
        .filter(Boolean),
    },
    delivery: {
      intro: safeString(delivery?.intro),
      prototype_screen: safeString(delivery?.prototype_screen),
      bullets: toStringArray(delivery?.bullets),
    },
    integration: safeString(processRoot?.integration),
    steps: mapStepArray(processRoot?.steps),
    next_steps: toStringArray(processRoot?.next_steps || processRoot?.nextSteps),
  });
}

function buildUserResearchField(rawUserResearch) {
  const userResearch =
    rawUserResearch && typeof rawUserResearch === "object" ? rawUserResearch : {};
  const journeyMapping =
    userResearch?.journey_mapping && typeof userResearch.journey_mapping === "object"
      ? userResearch.journey_mapping
      : {};

  return pruneValue({
    method: safeString(userResearch?.method),
    persona: mapPersonaArray(userResearch?.persona),
    journey_mapping: {
      goal: safeString(journeyMapping?.goal),
      image: safeString(journeyMapping?.image),
    },
    findings: mapTextCardArray(userResearch?.findings, "finding"),
  });
}

function buildOutcomesField(rawOutcomes) {
  const outcomes = rawOutcomes && typeof rawOutcomes === "object" ? rawOutcomes : {};

  return pruneValue({
    intro: safeString(outcomes?.intro),
    impact: safeString(outcomes?.impact),
    learned: safeString(outcomes?.learned),
  });
}

function buildImagesField(raw) {
  const images = raw?.images && typeof raw.images === "object" ? raw.images : {};

  return pruneValue({
    cover: safeString(images?.cover || raw?.cover),
    thumbnail: safeString(images?.thumbnail || raw?.thumbnail),
    gallery: mapGalleryArray(images?.gallery, "gallery_item"),
  });
}

function mapPostImageEntries(value) {
  return toObjectArray(value)
    .map((item, index) =>
      createTypedObject(
        "image_item",
        {
          url: safeString(item?.url || item?.src || item?.image),
          alt: safeString(item?.alt),
          caption: safeString(item?.caption),
        },
        index
      )
    )
    .filter(Boolean);
}

function mapTableRows(value) {
  return (Array.isArray(value) ? value : [])
    .map((row, index) => {
      const cells = Array.isArray(row)
        ? row.map((cell) => safeString(cell)).filter(Boolean)
        : Array.isArray(row?.cells)
          ? row.cells.map((cell) => safeString(cell)).filter(Boolean)
          : Array.isArray(row?.columns)
            ? row.columns.map((cell) => safeString(cell)).filter(Boolean)
            : [];

      return createTypedObject("table_row", { cells }, index);
    })
    .filter(Boolean);
}

function mapPostContentBlocks(value) {
  return toObjectArray(value)
    .map((block, index) => {
      const rawType = safeString(block?.type || block?._type);

      if (rawType === "text" || rawType === "textBlock") {
        return createTypedObject(
          "textBlock",
          {
            html: safeString(block?.html),
            body: safeString(block?.body || block?.text),
          },
          index
        );
      }

      if (rawType === "heading" || rawType === "headingBlock") {
        return createTypedObject(
          "headingBlock",
          {
            text: safeString(block?.text || block?.title),
          },
          index
        );
      }

      if (rawType === "image" || rawType === "imageBlock") {
        return createTypedObject(
          "imageBlock",
          {
            url: safeString(block?.url || block?.src || block?.image),
            alt: safeString(block?.alt),
            caption: safeString(block?.caption),
            images: mapPostImageEntries(block?.images),
          },
          index
        );
      }

      if (rawType === "video" || rawType === "videoBlock") {
        return createTypedObject(
          "videoBlock",
          {
            url: safeString(block?.url || block?.src),
            caption: safeString(block?.caption),
          },
          index
        );
      }

      if (rawType === "gif" || rawType === "gifBlock") {
        return createTypedObject(
          "gifBlock",
          {
            url: safeString(block?.url || block?.src || block?.image),
            alt: safeString(block?.alt),
            caption: safeString(block?.caption),
          },
          index
        );
      }

      if (rawType === "code" || rawType === "codeBlock") {
        return createTypedObject(
          "codeBlock",
          {
            language: safeString(block?.language),
            filename: safeString(block?.filename),
            code: safeString(block?.code),
          },
          index
        );
      }

      if (rawType === "table" || rawType === "tableBlock") {
        return createTypedObject(
          "tableBlock",
          {
            headers: toStringArray(block?.headers),
            rows: mapTableRows(block?.rows),
          },
          index
        );
      }

      if (rawType === "audio" || rawType === "audioBlock") {
        return createTypedObject(
          "audioBlock",
          {
            url: safeString(block?.url || block?.src),
          },
          index
        );
      }

      if (rawType === "callout" || rawType === "calloutBlock") {
        return createTypedObject(
          "calloutBlock",
          {
            emoji: safeString(block?.emoji),
            title: safeString(block?.title),
            body: safeString(block?.body || block?.text),
          },
          index
        );
      }

      return undefined;
    })
    .filter(Boolean);
}

function buildPostSummary(raw) {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  return pruneValue({
    title: safeString(raw?.title),
    slug: safeLowerSlug(raw?.slug || raw?.id || raw?.title),
    excerpt: safeString(raw?.excerpt || raw?.description),
    date: safeString(raw?.date),
    read_time: safeString(raw?.read_time || raw?.readTime),
    tag: safeString(raw?.tag),
    thumb_url: safeString(
      raw?.thumb_url || raw?.thumbnail || raw?.image || raw?.cover_image_url || raw?.coverImageUrl
    ),
    author: pruneValue({
      name: safeString(raw?.author?.name),
      initials: safeString(raw?.author?.initials),
      avatar_url: safeString(raw?.author?.avatar_url || raw?.author?.avatarUrl),
    }),
  });
}

function toSanityPostDocument(raw) {
  const slug = safeLowerSlug(raw?.slug || raw?.id || raw?.title);

  if (!slug) {
    return undefined;
  }

  return pruneValue({
    _id: `post.${slug}`,
    _type: "post",
    title: safeString(raw?.title),
    slug: {
      _type: "slug",
      current: slug,
    },
    excerpt: safeString(raw?.excerpt),
    date: safeString(raw?.date),
    read_time: safeString(raw?.read_time || raw?.readTime),
    tag: safeString(raw?.tag),
    thumb_url: safeString(raw?.thumb_url),
    author: pruneValue({
      name: safeString(raw?.author?.name),
      initials: safeString(raw?.author?.initials),
      avatar_url: safeString(raw?.author?.avatar_url || raw?.author?.avatarUrl),
    }),
    content_blocks: mapPostContentBlocks(raw?.content_blocks),
    next_post: buildPostSummary(raw?.next_post),
  });
}

function toSanityProjectDocument(raw, slug) {
  return pruneValue({
    _id: `project.${slug}`,
    _type: "project",
    id: safeString(raw?.id) || slug,
    slug: {
      _type: "slug",
      current: slug,
    },
    title: safeString(raw?.title || raw?.projectTitle),
    subtitle: safeString(raw?.subtitle),
    summary: safeString(raw?.summary),
    description: safeString(raw?.description),
    category: safeString(raw?.category),
    tag1: safeString(raw?.tag1),
    tag2: safeString(raw?.tag2),
    goal: safeString(raw?.goal),
    solution: safeString(raw?.solution),
    my_role: safeString(raw?.my_role || raw?.myRole),
    challenges: mapTextCardArray(raw?.challenges, "challenge"),
    discovery: safeString(raw?.discovery),
    overview: safeString(raw?.overview),
    problem: safeString(raw?.problem),
    result: safeString(raw?.result),
    highlights: toObjectArray(raw?.highlights)
      .map((item, index) =>
        createTypedObject(
          "highlight",
          {
            label: safeString(item?.label || item?.title),
            value: safeString(item?.value || item?.text),
          },
          index
        )
      )
      .filter(Boolean),
    process: buildProcessField(raw?.process),
    user_research: buildUserResearchField(raw?.user_research),
    outcomes: buildOutcomesField(raw?.outcomes),
    images: buildImagesField(raw),
    image: safeString(raw?.image),
    cover: safeString(raw?.cover),
    thumbnail: safeString(raw?.thumbnail),
    sections: mapTextCardArray(raw?.sections || raw?.contentSections, "section", "body"),
    gallery: mapGalleryArray(raw?.gallery, "gallery_entry"),
    nextSteps: toStringArray(raw?.nextSteps),
    tasks: toStringArray(raw?.tasks || raw?.services),
    tags: toStringArray(raw?.tags),
    client: safeString(raw?.client),
    industry: safeString(raw?.industry),
    status: safeString(raw?.status) || "published",
    date: safeString(raw?.date),
  });
}

async function loadProjectDocuments() {
  const files = await fs.readdir(projectsDir);
  const documents = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(projectsDir, file);
    const raw = JSON.parse(await fs.readFile(filePath, "utf8"));
    const slug = safeLowerSlug(raw?.slug || raw?.id || raw?.title || file.replace(/\.json$/i, ""));
    documents.push(toSanityProjectDocument(raw, slug));
  }

  documents.sort((a, b) => {
    const aHasDate = isValidDate(a?.date);
    const bHasDate = isValidDate(b?.date);

    if (aHasDate && bHasDate) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (aHasDate && !bHasDate) return -1;
    if (!aHasDate && bHasDate) return 1;

    return safeString(a?.title).localeCompare(safeString(b?.title), undefined, {
      sensitivity: "base",
    });
  });

  return documents;
}

async function loadSiteSettingsDocument() {
  const rawSettings = JSON.parse(await fs.readFile(siteSettingsPath, "utf8"));

  return pruneValue({
    ...rawSettings,
    _id: "siteSettings.main",
    _type: "siteSettings",
  });
}

async function loadPostDocuments() {
  return [toSanityPostDocument(BLOG_POST)].filter(Boolean);
}

function toNdjson(documents) {
  return `${documents.map((document) => JSON.stringify(document)).join("\n")}\n`;
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const child = isWindows
      ? spawn("cmd.exe", ["/d", "/s", "/c", [command, ...args].join(" ")], {
          cwd,
          stdio: "inherit",
          env: process.env,
        })
      : spawn(command, args, {
          cwd,
          stdio: "inherit",
          env: process.env,
        });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(" ")}`));
    });
  });
}

async function importDocumentsWithCli(allDocuments) {
  const ndjsonPath = path.join(
    os.tmpdir(),
    `getbndlabs-sanity-import-${Date.now()}-${randomUUID().slice(0, 8)}.ndjson`
  );

  await fs.writeFile(ndjsonPath, toNdjson(allDocuments), "utf8");

  try {
    console.log(`Importing ${allDocuments.length} documents with the authenticated Sanity CLI...`);
    await runCommand(
      npmCommand,
      ["exec", "sanity", "--", "dataset", "import", ndjsonPath, dataset, "--replace"],
      studioDir
    );
    console.log(`Imported ${allDocuments.length} documents into ${projectId}/${dataset} with the Sanity CLI.`);
  } finally {
    await fs.unlink(ndjsonPath).catch(() => {});
  }
}

async function importDocumentsWithToken(allDocuments) {
  if (!client) {
    throw new Error("Missing Sanity client configuration.");
  }

  for (const document of allDocuments) {
    await client.createOrReplace(document);
    console.log(`Imported ${document._id}`);
  }

  console.log(`Imported ${allDocuments.length} documents into ${projectId}/${dataset}.`);
}

async function importDocuments() {
  const projectDocuments = await loadProjectDocuments();
  const postDocuments = await loadPostDocuments();
  const siteSettingsDocument = await loadSiteSettingsDocument();
  const allDocuments = [...projectDocuments, ...postDocuments, siteSettingsDocument];

  if (client) {
    await importDocumentsWithToken(allDocuments);
    return;
  }

  const hasStudioPackage = await fs
    .access(path.join(studioDir, "package.json"))
    .then(() => true)
    .catch(() => false);

  if (!hasStudioPackage) {
    throw new Error(
      "Missing a Sanity write token, and no local Sanity Studio was found for CLI-authenticated import."
    );
  }

  await importDocumentsWithCli(allDocuments);
}

await importDocuments();
