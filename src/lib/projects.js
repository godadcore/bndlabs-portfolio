// Single source of truth for Projects.
// Decap CMS writes JSON files into src/content/projects/.

import {
  normalizeRichTextValue,
  richTextToPlainText,
} from "./richText.js";
import { sanitizeExternalUrl, sanitizeUrl } from "./urlSecurity.js";

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} subtitle
 * @property {string} summary
 * @property {string} description
 * @property {string} category
 * @property {string[]} tasks
 * @property {string} tag1
 * @property {string} tag2
 * @property {string} image
 * @property {string} cover
 * @property {string} thumbnail
 * @property {string} client
 * @property {string} industry
 * @property {string} status
 * @property {string} date - ISO string
 * @property {string} overview
 * @property {string} problem
 * @property {string} solution
 * @property {string} result
 * @property {{label: string, value: string}[]} highlights
 * @property {{title: string, description: string}[]} process
 * @property {Array<Object>} sections
 * @property {{src: string, alt: string}[]} gallery
 * @property {string[]} nextSteps
 * @property {{enabled: boolean, text: string, url: string}} liveProject
 * @property {string} liveProjectUrl
 * @property {Object} caseStudy
 */

export function safeLowerSlug(value) {
  const normalizedValue =
    value && typeof value === "object" && !Array.isArray(value)
      ? value.current || value.slug || richTextToPlainText(value.content) || ""
      : Array.isArray(value)
        ? richTextToPlainText(value)
      : value;

  return String(normalizedValue || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidISODate(value) {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function yearFromDate(value) {
  if (!isValidISODate(value)) return "";
  return String(new Date(value).getFullYear());
}

function firstString(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const normalizedArrayValue = richTextToPlainText(value);
      if (normalizedArrayValue) return normalizedArrayValue;
      continue;
    }

    if (value && typeof value === "object") {
      const slugValue = String(value.current ?? value.slug ?? "").trim();
      if (slugValue) return slugValue;

      const richContentValue = firstPlainText(
        value.content,
        value.text,
        value.title,
        value.label,
        value.value,
        value.description,
        value.body
      );
      if (richContentValue) return richContentValue;

      continue;
    }

    const normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }
  return "";
}

function firstPlainText(...values) {
  for (const value of values) {
    const normalized = richTextToPlainText(value);
    if (normalized) return normalized;
  }
  return "";
}

function firstRichTextValue(...values) {
  for (const value of values) {
    const normalized = normalizeRichTextValue(value);
    if (Array.isArray(normalized) && normalized.length) return normalized;
    if (typeof normalized === "string" && normalized) return normalized;
  }
  return "";
}

function uniqueStrings(values) {
  return values
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index);
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return uniqueStrings(
    value.map((item) =>
      typeof item === "object"
        ? firstString(
            item?.content,
            item?.text,
            item?.title,
            item?.label,
            item?.value,
            item?.description,
            item?.body
          )
        : item
    )
  );
}

function normalizeInlineContentItem(value) {
  if (value == null) return null;

  const content =
    typeof value === "object" && !Array.isArray(value)
      ? firstRichTextValue(
          value?.content,
          value?.text,
          value?.title,
          value?.label,
          value?.value,
          value?.description,
          value?.body
        )
      : firstRichTextValue(value);
  const text =
    typeof value === "object" && !Array.isArray(value)
      ? firstPlainText(
          value?.content,
          value?.text,
          value?.title,
          value?.label,
          value?.value,
          value?.description,
          value?.body
        )
      : firstPlainText(value);

  if (!text) return null;

  return {
    text,
    content: content || text,
  };
}

function normalizeInlineContentList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeInlineContentItem(item))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,|\/|•/g)
      .map((item) => normalizeInlineContentItem(item))
      .filter(Boolean);
  }

  const item = normalizeInlineContentItem(value);
  return item ? [item] : [];
}

function toObjectArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object");
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value == null) return fallback;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return fallback;
}

function sanitizeMediaUrl(value) {
  return sanitizeUrl(value, { allowRelative: true });
}

function makePlaceholderImage(seed) {
  const safeSeed = encodeURIComponent(safeLowerSlug(seed) || "project");
  return `https://picsum.photos/seed/${safeSeed}/1600/1000`;
}

function firstHighlightValue(items, matcher) {
  const match = items.find((item) => matcher.test(item.label));
  return firstString(match?.value);
}

function normalizeTextCards(value, fallbackItems) {
  const source = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? [value]
      : [];

  const items = source
    .map((item, index) => ({
      title: firstString(item?.title, item?.label, fallbackItems[index]?.title, `Item ${index + 1}`),
      text: firstPlainText(
        item?.text,
        item?.description,
        item?.body,
        fallbackItems[index]?.text
      ),
    }))
    .filter((item) => item.title && item.text);

  if (items.length) return items;
  return fallbackItems.filter((item) => item?.title && item?.text);
}

function buildFallbackPainPoints({ title, industry, problem, overview, solution }) {
  return [
    {
      title: "Unclear hierarchy",
      text: firstString(
        problem,
        `The ${industry || "product"} experience needed a clearer hierarchy so users could identify the most important next step without hesitation.`
      ),
    },
    {
      title: "Fragmented flow",
      text: firstString(
        overview,
        `${title} needed a more connected journey so users could move from one task to the next without losing context.`
      ),
    },
    {
      title: "Low confidence",
      text: firstString(
        solution,
        "The product needed more consistent guidance, states, and feedback so decisions felt easier and more trustworthy."
      ),
    },
  ];
}

function buildFallbackFindings({ problem, solution, result }) {
  return [
    {
      title: "Users needed stronger visual guidance",
      text: firstString(
        problem,
        "The most important actions were not always obvious, which slowed down decisions in the core flow."
      ),
    },
    {
      title: "Simpler structure reduced hesitation",
      text: firstString(
        solution,
        "Streamlining the layout and clarifying the interaction pattern improved confidence across the journey."
      ),
    },
    {
      title: "Consistency increased trust",
      text: firstString(
        result,
        "A more coherent system made the product feel easier to use and more ready for scale."
      ),
    },
  ];
}

function createFallbackPersona({ title, industry, region, description, goal, problem }) {
  return {
    image: "",
    name: firstString(`${title} user`, "Primary user"),
    age: "28",
    gender: "N/A",
    occupation: firstString(industry ? `${industry} professional` : "", "Digital product user"),
    location: firstString(region, "Global"),
    education: "Undergraduate",
    quote: `"I need a clearer way to move through ${title}'s core experience without extra friction."`,
    bio: firstString(
      description,
      "This persona represents the primary audience the product was designed around."
    ),
    goals: uniqueStrings([
      goal,
      "Complete the main task quickly.",
      "Understand what happens next at a glance.",
    ]).slice(0, 3),
    frustrations: uniqueStrings([
      problem,
      "Too many competing elements on screen.",
      "Weak feedback and inconsistent interaction states.",
    ]).slice(0, 3),
  };
}

function normalizePersonas(value, fallbackPersona) {
  const source = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? [value]
      : [];

  const items = source
    .map((item) => ({
      image: firstString(item?.image, item?.avatar),
      name: firstString(item?.name, item?.title),
      age: firstString(item?.age),
      gender: firstString(item?.gender),
      occupation: firstString(item?.occupation, item?.role),
      location: firstString(item?.location, item?.region),
      education: firstString(item?.education),
      quote: firstString(item?.quote),
      bio: firstString(item?.bio, item?.description),
      goals: toStringArray(item?.goals),
      frustrations: toStringArray(item?.frustrations),
    }))
    .filter((item) => item.name || item.quote || item.bio);

  if (!items.length) return [fallbackPersona];

  return items.map((item) => ({
    ...fallbackPersona,
    ...item,
    goals: item.goals.length ? item.goals : fallbackPersona.goals,
    frustrations: item.frustrations.length ? item.frustrations : fallbackPersona.frustrations,
  }));
}

function normalizeMockupScreens(value, fallbackImages) {
  const labels = ["Screen 01", "Screen 02", "Screen 03", "Screen 04", "Screen 05"];
  const source = Array.isArray(value) ? value : [];
  const items = source
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          src: sanitizeMediaUrl(firstString(item, fallbackImages[index])),
          label: labels[index] || `Screen ${index + 1}`,
        };
      }

      return {
        src: sanitizeMediaUrl(
          firstString(item?.src, item?.image, item?.url, fallbackImages[index])
        ),
        label: firstString(item?.label, item?.title, labels[index] || `Screen ${index + 1}`),
      };
    })
    .filter((item) => item.src);

  if (items.length) return items;

  return fallbackImages.slice(0, 5).map((src, index) => ({
    src: sanitizeMediaUrl(src),
    label: labels[index] || `Screen ${index + 1}`,
  }));
}

function normalizeGalleryItems(value, title) {
  const source = Array.isArray(value) ? value : [];

  return source
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          src: sanitizeMediaUrl(firstString(item)),
          alt: `${title} gallery image ${index + 1}`,
        };
      }

      return {
        src: sanitizeMediaUrl(firstString(item?.src, item?.image, item?.url)),
        alt: firstString(item?.alt, `${title} gallery image ${index + 1}`),
      };
    })
    .filter((item) => item.src);
}

function normalizePortableText(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object");
}

function normalizeSanityImage(value, fallbackAlt = "") {
  if (!value) return null;

  if (typeof value === "string") {
    return {
      src: sanitizeMediaUrl(firstString(value)),
      alt: firstString(fallbackAlt),
      caption: "",
    };
  }

  const src = sanitizeMediaUrl(
    firstString(
      value?.url,
      value?.src,
      value?.asset?.url,
      value?.image?.url,
      value?.image?.asset?.url
    )
  );
  if (!src) return null;

  return {
    src,
    alt: firstString(value?.alt, value?.image?.alt, fallbackAlt),
    caption: firstPlainText(value?.caption),
    captionContent: firstRichTextValue(value?.caption),
  };
}

function normalizeSanityImageArray(value, title, label) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) =>
      normalizeSanityImage(item, `${title} ${label.toLowerCase()} ${index + 1}`)
    )
    .filter((item) => item?.src);
}

function normalizeCaseStudyStats(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const numericValue =
        typeof item?.value === "number"
          ? item.value
          : Number.parseFloat(String(item?.value ?? "").trim());

      return {
        value: Number.isFinite(numericValue) ? numericValue : null,
        label: firstPlainText(item?.label),
        labelContent: firstRichTextValue(item?.label),
      };
    })
    .filter((item) => item.label && item.value != null);
}

function normalizeCaseStudyResults(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      metric: firstPlainText(item?.metric, item?.value),
      metricContent: firstRichTextValue(item?.metric, item?.value),
      description: firstPlainText(item?.description, item?.text),
      descriptionContent: firstRichTextValue(item?.description, item?.text),
    }))
    .filter((item) => item.metric && item.description);
}

function normalizeCaseStudyProblems(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      title: firstPlainText(item?.title, item?.label),
      titleContent: firstRichTextValue(item?.title, item?.label),
      description: firstPlainText(item?.description, item?.text),
      descriptionContent: firstRichTextValue(item?.description, item?.text),
    }))
    .filter((item) => item.title || item.description);
}

function normalizeSanityFile(value) {
  if (!value) return null;

  const src = sanitizeMediaUrl(
    firstString(value?.url, value?.src, value?.asset?.url, value)
  );

  if (!src) return null;

  return {
    src,
    alt: firstString(value?.alt),
    caption: firstString(value?.caption),
  };
}

function normalizeTableRows(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((row) => {
      if (Array.isArray(row)) {
        return row
          .map((cell) => normalizeInlineContentItem(cell))
          .filter(Boolean);
      }

      if (row && typeof row === "object") {
        const cells = Array.isArray(row.cells)
          ? row.cells
          : Array.isArray(row.columns)
            ? row.columns
            : [];

        return cells
          .map((cell) => normalizeInlineContentItem(cell))
          .filter(Boolean);
      }

      return [];
    })
    .filter((row) => row.some((cell) => cell?.text));
}

function createCaseStudySectionId(value, fallback) {
  return safeLowerSlug(value) || fallback;
}

function createStorySection({ id, heading, text, content, image }) {
  if (!image?.src && !heading && !text) return null;

  return {
    id,
    type: "story",
    heading,
    text,
    content,
    image: image?.src ? image : null,
  };
}

function createFramesSection({ id, heading, text, content, frames }) {
  const normalizedFrames = Array.isArray(frames) ? frames.filter((item) => item?.src) : [];
  if (!normalizedFrames.length) return null;

  return {
    id,
    type: "frames",
    heading,
    text,
    content,
    frames: normalizedFrames,
  };
}

function createVideoSection({ id, heading, text, content, video, poster }) {
  if (!video?.src) return null;

  return {
    id,
    type: "video",
    heading,
    text,
    content,
    video,
    poster: poster?.src ? poster : null,
  };
}

function createAudioSection({ id, heading, text, content, audio }) {
  if (!audio?.src) return null;

  return {
    id,
    type: "audio",
    heading,
    text,
    content,
    audio,
  };
}

function createTableSection({ id, heading, text, content, columns, rows }) {
  const normalizedColumns = normalizeInlineContentList(columns);
  const normalizedRows = normalizeTableRows(rows);

  if (!normalizedColumns.length && !normalizedRows.length) return null;

  return {
    id,
    type: "table",
    heading,
    text,
    content,
    table: {
      columns: normalizedColumns,
      rows: normalizedRows,
    },
  };
}

function normalizeFlexibleCaseStudySection(section, index, projectTitle) {
  if (!section || typeof section !== "object") return null;

  const headingContent = firstRichTextValue(section?.heading, section?.title);
  const heading = firstPlainText(section?.heading, section?.title, `Section ${index + 1}`);
  const content = firstRichTextValue(section?.body, section?.description, section?.text);
  const text = richTextToPlainText(content);
  const icon = firstString(section?.icon);
  const id = createCaseStudySectionId(
    section?._key || heading || `${projectTitle}-section-${index + 1}`,
    `section-${index + 1}`
  );

  if (
    section?._type === "tableSection" ||
    Array.isArray(section?.columns) ||
    Array.isArray(section?.rows)
  ) {
    const tableSection = createTableSection({
      id,
      heading,
      text,
      content,
      columns: section?.columns || section?.headers,
      rows: section?.rows,
    });

    return tableSection
      ? {
          ...tableSection,
          headingContent,
          icon,
        }
      : null;
  }

  if (section?._type === "audioSection" || section?.audio || section?.audioUrl) {
    const audio = normalizeSanityFile(section?.audio || section?.audioUrl);
    const audioSection = createAudioSection({
      id,
      heading,
      text,
      content,
      audio: audio
        ? {
            ...audio,
            caption: firstPlainText(section?.caption, audio.caption),
            captionContent: firstRichTextValue(section?.caption, audio.captionContent, audio.caption),
          }
        : null,
    });

    return audioSection
      ? {
          ...audioSection,
          headingContent,
          icon,
        }
      : null;
  }

  if (section?._type === "videoSection" || section?.video || section?.videoUrl) {
    const video = normalizeSanityFile(section?.video || section?.videoUrl);
    const videoSection = createVideoSection({
      id,
      heading,
      text,
      content,
      video: video
        ? {
            ...video,
            caption: firstPlainText(section?.caption, video.caption),
            captionContent: firstRichTextValue(section?.caption, video.captionContent, video.caption),
          }
        : null,
      poster: normalizeSanityImage(section?.poster),
    });

    return videoSection
      ? {
          ...videoSection,
          headingContent,
          icon,
        }
      : null;
  }

  const frames = normalizeSanityImageArray(
    section?.frames || section?.images,
    heading || projectTitle,
    "Frame"
  );

  if (section?._type === "frameGroupSection" || frames.length > 1) {
    const frameSection = createFramesSection({
      id,
      heading,
      text,
      content,
      frames,
    });

    return frameSection
      ? {
          ...frameSection,
          icon,
        }
      : null;
  }

  const image = normalizeSanityImage(
    section?.image || (frames.length === 1 ? frames[0] : null),
    `${heading || projectTitle} image`
  );
  const storyImage = image
    ? {
        ...image,
        alt: firstString(section?.alt, image.alt),
        caption: firstPlainText(section?.caption, image.caption),
        captionContent: firstRichTextValue(section?.caption, image.captionContent, image.caption),
      }
    : null;

  const storySection = createStorySection({
    id,
    heading,
    text,
    content,
    image: storyImage,
  });

  return storySection
    ? {
        ...storySection,
        headingContent,
        icon,
      }
    : null;
}

function buildCaseStudyInfoRows({
  role = [],
  tools = [],
  timeline = [],
  category = "",
  client = "",
  industry = "",
  status = "",
}) {
  return [
    ["Role", toStringArray(role).join(", ")],
    ["Tools", toStringArray(tools).join(", ")],
    ["Duration", toStringArray(timeline).join(", ")],
    ["Platform", firstString(category, industry)],
    ["Client", firstString(client)],
    ["Status", firstString(status)],
  ].filter(([, value]) => value);
}

function buildCaseStudySummaryTableSection(details) {
  const rows = buildCaseStudyInfoRows(details);
  if (!rows.length) return null;

  const section = createTableSection({
    id: "project-details",
    heading: "Project details",
    text: "A quick summary of the role, tools, duration, and platform behind the work.",
    columns: ["Item", "Details"],
    rows,
  });

  return section
    ? {
        ...section,
        isAutoSummary: true,
      }
    : null;
}

function buildModernCaseStudySections({
  title,
  role,
  tools,
  timeline,
  category,
  client,
  industry,
  status,
  sections,
}) {
  const explicitSections = toObjectArray(sections)
    .map((section, index) => normalizeFlexibleCaseStudySection(section, index, title))
    .filter(Boolean);

  const infoSection = buildCaseStudySummaryTableSection({
    role,
    tools,
    timeline,
    category,
    client,
    industry,
    status,
  });

  if (explicitSections.length) {
    if (infoSection && !explicitSections.some((section) => section.type === "table")) {
      return [infoSection, ...explicitSections];
    }

    return explicitSections;
  }

  const fallbackSections = [];

  if (infoSection) {
    fallbackSections.push(infoSection);
  }

  return fallbackSections.filter(Boolean);
}

function buildLegacyCaseStudySections(project, caseStudyData, rawSections = []) {
  const explicitSections = toObjectArray(rawSections)
    .map((section, index) => normalizeFlexibleCaseStudySection(section, index, project?.title))
    .filter(Boolean);

  const timelineValue =
    firstHighlightValue(project?.highlights || [], /timeline|duration|weeks|months/i) || "";

  const infoSection = buildCaseStudySummaryTableSection({
    role: project?.tasks || [],
    tools: project?.tags || [project?.tag1, project?.tag2].filter(Boolean),
    timeline: timelineValue ? [timelineValue] : [],
    category: project?.category,
    client: project?.client,
    industry: project?.industry,
    status: project?.status,
  });

  const sections = [];

  if (infoSection && !explicitSections.some((section) => section.type === "table")) {
    sections.push(infoSection);
  }

  sections.push(...explicitSections);

  const gallerySection = createFramesSection({
    id: "selected-screens",
    heading: "Selected screens",
    text: "Key interface views and supporting visuals from the case study.",
    frames: project?.gallery || [],
  });

  if (gallerySection) {
    sections.push(gallerySection);
  }

  const nextStepsRows = toStringArray(caseStudyData?.nextSteps)
    .map((item) => ["Next step", item])
    .filter((row) => row[1]);

  const nextStepsSection = createTableSection({
    id: "next-steps",
    heading: "Next steps",
    text: "A short list of follow-up opportunities for the product after delivery.",
    columns: ["Focus", "Details"],
    rows: nextStepsRows,
  });

  if (nextStepsSection) {
    sections.push(nextStepsSection);
  }

  return sections.filter(Boolean);
}

function buildBrokenLinkMessage(pageUrl = "[page url]") {
  return `Hi, this page is broken on my portfolio: ${pageUrl}`;
}

function buildWhatsAppUrl(number, pageUrl = "[page url]") {
  const normalized = String(number || "").replace(/[^\d]/g, "");
  if (!normalized) return "";

  return `https://wa.me/${normalized}?text=${encodeURIComponent(buildBrokenLinkMessage(pageUrl))}`;
}

function normalizeModernCaseStudy(raw) {
  const looksLikeCaseStudy =
    raw &&
    typeof raw === "object" &&
    (raw?._type === "caseStudy" ||
      "publishedDate" in raw ||
      "brandLogo" in raw ||
      "prototypeUrl" in raw ||
      "whatsappNumber" in raw ||
      Array.isArray(raw?.stats));

  if (!looksLikeCaseStudy) return null;

  const slug = safeLowerSlug(raw?.slug || raw?.id || raw?.title);
  const id = safeLowerSlug(raw?._id || raw?.id || slug || raw?.title);
  const titleContent = firstRichTextValue(raw?.title);
  const title = firstPlainText(raw?.title, "Untitled Case Study");
  const overviewBlocks = normalizePortableText(raw?.overview);
  const descriptionContent = firstRichTextValue(raw?.description);
  const description = richTextToPlainText(descriptionContent);
  const overviewTextContent = firstRichTextValue(raw?.overviewText);
  const overviewText = richTextToPlainText(overviewTextContent);
  const overviewDescriptionContent = firstRichTextValue(raw?.overviewDescription);
  const overviewDescription = richTextToPlainText(overviewDescriptionContent);
  const brandLogo = normalizeSanityImage(raw?.brandLogo, `${title} logo`);
  const heroImage = normalizeSanityImage(raw?.heroImage, `${title} hero image`);
  const overviewImage = normalizeSanityImage(raw?.overviewImage, `${title} overview image`);
  const researchImages = normalizeSanityImageArray(raw?.researchImages, title, "Research image");
  const wireframeImages = normalizeSanityImageArray(raw?.wireframeImages, title, "Wireframe image");
  const prototypeImages = normalizeSanityImageArray(raw?.prototypeImages, title, "Prototype image");
  const finalImages = normalizeSanityImageArray(raw?.finalImages, title, "Final image");
  const researchTextContent = firstRichTextValue(raw?.researchText);
  const researchText = richTextToPlainText(researchTextContent);
  const wireframeTextContent = firstRichTextValue(raw?.wireframeText);
  const wireframeText = richTextToPlainText(wireframeTextContent);
  const prototypeTextContent = firstRichTextValue(raw?.prototypeText);
  const prototypeText = richTextToPlainText(prototypeTextContent);
  const stats = normalizeCaseStudyStats(raw?.stats);
  const problems = normalizeCaseStudyProblems(raw?.problems);
  const results = normalizeCaseStudyResults(raw?.results);
  const roleItems = normalizeInlineContentList(raw?.role);
  const toolsItems = normalizeInlineContentList(raw?.tools);
  const timelineItems = normalizeInlineContentList(raw?.timeline);
  const tasksItems = normalizeInlineContentList(raw?.tasks);
  const tagsItems = normalizeInlineContentList(raw?.tags);
  const nextStepItems = normalizeInlineContentList(raw?.nextSteps);
  const role = toStringArray(raw?.role);
  const tools = toStringArray(raw?.tools);
  const timeline = toStringArray(raw?.timeline);
  const tasks = toStringArray(raw?.tasks);
  const tags = toStringArray(raw?.tags);
  const nextSteps = toStringArray(raw?.nextSteps);
  const publishedDate = firstString(raw?.publishedDate, raw?.date, raw?._createdAt);
  const fallbackImage =
    heroImage?.src ||
    overviewImage?.src ||
    makePlaceholderImage(slug || title);
  const liveUrl = sanitizeExternalUrl(firstString(raw?.liveUrl, raw?.liveProjectUrl));
  const prototypeUrl = sanitizeExternalUrl(firstString(raw?.prototypeUrl));
  const twitterUrl = sanitizeExternalUrl(firstString(raw?.twitterUrl));
  const whatsappNumber = firstString(raw?.whatsappNumber);
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber);
  const categoryContent = firstRichTextValue(raw?.category, raw?.industry);
  const category = firstPlainText(raw?.category, raw?.industry, "Case Study");
  const status = firstString(raw?.status, "Concept");
  const clientContent = firstRichTextValue(raw?.client);
  const client = firstPlainText(raw?.client);
  const industryContent = firstRichTextValue(raw?.industry, raw?.category);
  const industry = firstPlainText(raw?.industry, raw?.category, category);
  const normalizedSections = buildModernCaseStudySections({
    title,
    role,
    tools,
    timeline,
    category,
    client,
    industry,
    status,
    sections: raw?.sections,
  });
  const displayTasks = uniqueStrings(
    tasks.length
      ? tasks
      : [
          ...role.slice(0, 2),
          ...tools.slice(0, 1),
          category,
        ],
  ).slice(0, 3);

  return {
    id,
    slug,
    createdAt: firstString(raw?._createdAt),
    updatedAt: firstString(raw?._updatedAt),
    title,
    titleContent,
    subtitle: description,
    subtitleContent: descriptionContent,
    summary: description,
    summaryContent: descriptionContent,
    description,
    descriptionContent,
    category,
    categoryContent,
    tasks: displayTasks,
    taskItems: tasksItems,
    tasksItems,
    tags: uniqueStrings(tags.length ? tags : [...role, ...tools, ...timeline]),
    tagItems: tagsItems,
    tagsItems,
    tag1: role[0] || category,
    tag2: tools[0] || status,
    image: fallbackImage,
    cover: heroImage?.src || fallbackImage,
    thumbnail: fallbackImage,
    client,
    clientContent,
    industry,
    industryContent,
    status,
    date: publishedDate,
    overview: firstString(overviewText, overviewDescription),
    problem: "",
    solution: "",
    result: results[0]?.description || description,
    highlights: stats.map((item) => ({
      label: item.label,
      value: String(item.value),
    })),
    process: [],
    sections: normalizedSections,
    gallery: finalImages,
    nextSteps,
    liveProject: {
      enabled: Boolean(liveUrl),
      text: "Visit Website",
      url: liveUrl,
    },
    liveProjectUrl: liveUrl,
    caseStudy: {
      contentModel: "caseStudy",
      brandLogo: brandLogo?.src || "",
      heroImage: heroImage?.src || fallbackImage,
      title,
      titleContent,
      description,
      descriptionContent,
      category,
      categoryContent,
      publishedDate,
      status,
      overviewImage: overviewImage?.src ? overviewImage : null,
      overviewText,
      overviewTextContent,
      overviewDescription,
      overviewDescriptionContent,
      sections: normalizedSections,
      overviewBlocks,
      stats,
      role,
      roleItems,
      tools,
      toolsItems,
      timeline,
      timelineItems,
      problems,
      tasks,
      tasksItems,
      tags,
      tagsItems,
      client,
      clientContent,
      industry,
      industryContent,
      nextSteps,
      nextStepItems,
      researchText,
      researchTextContent,
      researchImages,
      wireframeText,
      wireframeTextContent,
      wireframeImages,
      prototypeText,
      prototypeTextContent,
      prototypeImages,
      results,
      finalImages,
      liveUrl,
      liveProjectUrl: sanitizeExternalUrl(firstString(raw?.liveProjectUrl)),
      prototypeUrl,
      twitterUrl,
      whatsappNumber,
      whatsappUrl,
    },
  };
}

function normalizeCaseStudy(raw, project) {
  const caseStudyRaw = raw?.caseStudy || {};
  const processRoot = raw?.process && typeof raw.process === "object" && !Array.isArray(raw.process)
    ? raw.process
    : {};
  const userResearchRaw = raw?.user_research && typeof raw.user_research === "object"
    ? raw.user_research
    : {};
  const outcomesRaw = raw?.outcomes && typeof raw.outcomes === "object"
    ? raw.outcomes
    : {};
  const structureSection = processRoot?.structure && typeof processRoot.structure === "object"
    ? processRoot.structure
    : {};
  const designSection = processRoot?.design && typeof processRoot.design === "object"
    ? processRoot.design
    : {};
  const deliverySection = processRoot?.delivery && typeof processRoot.delivery === "object"
    ? processRoot.delivery
    : {};
  const journeyMapping = userResearchRaw?.journey_mapping && typeof userResearchRaw.journey_mapping === "object"
    ? userResearchRaw.journey_mapping
    : {};
  const personaSource = userResearchRaw?.persona || userResearchRaw?.personas || caseStudyRaw.personas;
  const integrationNote = firstString(processRoot?.integration);
  const roleFromHighlights = firstHighlightValue(project.highlights, /role/i);
  const outcomeFromHighlights = firstHighlightValue(
    project.highlights,
    /outcome|impact|result|conversion|uplift/i
  );
  const fallbackImages = uniqueStrings([
    caseStudyRaw.heroImage,
    raw?.images?.cover,
    project.cover,
    project.image,
    project.thumbnail,
    structureSection?.image,
    designSection?.image,
    designSection?.overview_image,
    deliverySection?.prototype_screen,
    ...project.sections.map((item) => item.image),
    ...project.gallery.map((item) => item.src),
  ]);
  const region = firstString(caseStudyRaw.region, raw?.region, raw?.location, "Global");
  const goalContent = firstRichTextValue(
    raw?.goal,
    caseStudyRaw.goal,
    project.solution
  );
  const goal = firstPlainText(
    raw?.goal,
    caseStudyRaw.goal,
    project.solution,
    "Create a clearer, more consistent experience that helps users complete their key tasks with less friction."
  );
  const responsibilities = toStringArray(caseStudyRaw.responsibilities);
  const fallbackResponsibilities = responsibilities.length
    ? responsibilities
    : project.tasks.length
      ? project.tasks
      : project.process.map((item) => item.title);
  const fallbackPersona = createFallbackPersona({
    title: project.title,
    industry: project.industry,
    region,
    description: project.description,
    goal,
    problem: project.problem,
  });
  const painPoints = normalizeTextCards(
    raw?.challenges || caseStudyRaw.painPoints,
    buildFallbackPainPoints({
      title: project.title,
      industry: project.industry,
      problem: project.problem,
      overview: project.overview,
      solution: project.solution,
    })
  );
  const usabilityFindings = normalizeTextCards(
    userResearchRaw?.findings || caseStudyRaw.usabilityFindings,
    buildFallbackFindings({
      problem: project.problem,
      solution: project.solution,
      result: project.result,
    })
  );
  const protoList = toStringArray(deliverySection?.bullets || caseStudyRaw.protoList);
  const fallbackProtoList = protoList.length
    ? protoList
    : uniqueStrings([
        ...project.process.map((item) => item.description),
        ...project.nextSteps,
        integrationNote,
      ]).slice(0, 4);
  const nextSteps = toStringArray(processRoot?.next_steps || caseStudyRaw.nextSteps);
  const liveUrl = sanitizeExternalUrl(
    firstString(caseStudyRaw.liveUrl, caseStudyRaw.liveProjectUrl, raw?.liveUrl, raw?.liveProjectUrl)
  );
  const prototypeUrl = sanitizeExternalUrl(
    firstString(caseStudyRaw.prototypeUrl, raw?.prototypeUrl)
  );
  const twitterUrl = sanitizeExternalUrl(
    firstString(caseStudyRaw.twitterUrl, raw?.twitterUrl)
  );
  const whatsappNumber = firstString(caseStudyRaw.whatsappNumber, raw?.whatsappNumber);
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber);
  const learnedContent = firstRichTextValue(
    outcomesRaw?.learned,
    caseStudyRaw.learned,
    raw?.learned
  );
  const learned = firstPlainText(
    outcomesRaw?.learned,
    caseStudyRaw.learned,
    raw?.learned,
    "The project reinforced how much stronger a product becomes when structure, testing, and visual refinement are treated as one connected system."
  );
  const impactContent = firstRichTextValue(
    outcomesRaw?.impact,
    caseStudyRaw.impact,
    outcomeFromHighlights,
    project.result
  );
  const impact = firstPlainText(
    outcomesRaw?.impact,
    caseStudyRaw.impact,
    outcomeFromHighlights,
    project.result,
    "The final direction created a clearer and more scalable experience ready for continued iteration."
  );
  const overviewIntroContent = firstRichTextValue(
    raw?.description,
    caseStudyRaw.overviewIntro,
    raw?.overviewIntro,
    project.overview,
    project.summary,
    project.description
  );
  const myRoleContent = firstRichTextValue(
    raw?.my_role,
    caseStudyRaw.myRole,
    raw?.myRole,
    raw?.role,
    roleFromHighlights
  );
  const researchIntroContent = firstRichTextValue(
    userResearchRaw?.method,
    raw?.discovery,
    caseStudyRaw.researchIntro,
    raw?.researchIntro
  );
  const journeyGoalContent = firstRichTextValue(
    journeyMapping?.goal,
    caseStudyRaw.journeyGoal,
    goalContent || goal
  );
  const wireframesIntroContent = firstRichTextValue(
    structureSection?.intro,
    raw?.discovery,
    caseStudyRaw.wireframesIntro,
    raw?.wireframesIntro
  );
  const appmapDescContent = firstRichTextValue(
    structureSection?.description,
    structureSection?.intro,
    caseStudyRaw.appmapDesc,
    project.process[1]?.description,
    project.sections[0]?.body
  );
  const digitalWireDescContent = firstRichTextValue(
    designSection?.description,
    designSection?.intro,
    caseStudyRaw.digitalWireDesc,
    project.sections[1]?.body,
    project.process[2]?.description,
    processRoot?.integration
  );
  const usabilityIntroContent = firstRichTextValue(
    userResearchRaw?.method,
    raw?.discovery,
    caseStudyRaw.usabilityIntro,
    raw?.usabilityIntro,
    project.result
  );
  const designIntroContent = firstRichTextValue(
    designSection?.intro,
    caseStudyRaw.designIntro,
    raw?.designIntro,
    project.solution
  );
  const mockupsDescContent = firstRichTextValue(
    designSection?.mockups,
    designSection?.intro,
    caseStudyRaw.mockupsDesc,
    project.sections[1]?.body,
    project.solution
  );
  const protoDescContent = firstRichTextValue(
    deliverySection?.intro,
    deliverySection?.description,
    caseStudyRaw.protoDesc,
    raw?.protoDesc,
    processRoot?.integration,
    project.result
  );
  const outcomeIntroContent = firstRichTextValue(
    outcomesRaw?.intro,
    raw?.outcomes,
    caseStudyRaw.outcomeIntro,
    raw?.outcomeIntro,
    project.result,
    project.summary
  );
  const normalizedSections = buildLegacyCaseStudySections(
    project,
    {
      nextSteps: nextSteps.length ? nextSteps : project.nextSteps,
    },
    raw?.sections || raw?.contentSections
  );

  return {
    contentModel: "legacy",
    brandName: firstString(caseStudyRaw.brandName, project.client, project.title),
    region,
    year: firstString(caseStudyRaw.year, yearFromDate(project.date), "Recent"),
    heroImage: firstString(caseStudyRaw.heroImage, project.cover, project.image, fallbackImages[0]),
    overviewIntro: firstPlainText(
      raw?.description,
      caseStudyRaw.overviewIntro,
      raw?.overviewIntro,
      project.overview,
      project.summary,
      project.description
    ),
    overviewIntroContent,
    goal,
    goalContent,
    myRole: firstPlainText(
      raw?.my_role,
      caseStudyRaw.myRole,
      raw?.myRole,
      raw?.role,
      roleFromHighlights,
      project.tasks.slice(0, 2).join(" / "),
      "Product Designer"
    ),
    myRoleContent,
    responsibilities: fallbackResponsibilities,
    researchIntro: firstPlainText(
      userResearchRaw?.method,
      raw?.discovery,
      caseStudyRaw.researchIntro,
      raw?.researchIntro,
      `Research focused on understanding where the ${project.industry || "product"} experience created friction and what needed to change to make ${project.title} feel clearer, faster, and easier to trust.`
    ),
    researchIntroContent,
    painPoints,
    personas: normalizePersonas(personaSource, fallbackPersona),
    journeyGoal: firstPlainText(journeyMapping?.goal, caseStudyRaw.journeyGoal, goal),
    journeyGoalContent,
    journeyMapImage: firstString(
      journeyMapping?.image,
      caseStudyRaw.journeyMapImage,
      project.gallery[0]?.src,
      structureSection?.image,
      project.sections[0]?.image,
      fallbackImages[0]
    ),
    wireframesIntro: firstPlainText(
      structureSection?.intro,
      raw?.discovery,
      caseStudyRaw.wireframesIntro,
      raw?.wireframesIntro,
      `The early design phase translated research into a clearer structure, making it easier to define content hierarchy, core screens, and the overall product flow.`
    ),
    wireframesIntroContent,
    appmapDesc: firstPlainText(
      structureSection?.description,
      structureSection?.intro,
      caseStudyRaw.appmapDesc,
      project.process[1]?.description,
      project.sections[0]?.body,
      "The app map clarified how users should move through the product and which screens needed to carry the most important information."
    ),
    appmapDescContent,
    appmapImage: firstString(
      structureSection?.image,
      caseStudyRaw.appmapImage,
      project.sections[0]?.image,
      project.gallery[1]?.src,
      fallbackImages[0]
    ),
    digitalWireDesc: firstPlainText(
      designSection?.description,
      designSection?.intro,
      caseStudyRaw.digitalWireDesc,
      project.sections[1]?.body,
      project.process[2]?.description,
      integrationNote,
      "Digital wireframes translated the structure into a clearer interface and helped validate content priority before visual refinement."
    ),
    digitalWireDescContent,
    digitalWireImage: firstString(
      designSection?.image,
      caseStudyRaw.digitalWireImage,
      project.sections[1]?.image,
      project.gallery[2]?.src,
      fallbackImages[0]
    ),
    usabilityIntro: firstPlainText(
      userResearchRaw?.method,
      raw?.discovery,
      caseStudyRaw.usabilityIntro,
      raw?.usabilityIntro,
      project.result,
      "Usability review helped surface where the experience needed stronger guidance, clearer feedback, and more consistent states."
    ),
    usabilityIntroContent,
    usabilityFindings,
    designIntro: firstPlainText(
      designSection?.intro,
      caseStudyRaw.designIntro,
      raw?.designIntro,
      project.solution,
      "The final design phase focused on refining hierarchy, strengthening consistency, and preparing the product for a polished handoff."
    ),
    designIntroContent,
    mockupsDesc: firstPlainText(
      designSection?.mockups,
      designSection?.intro,
      caseStudyRaw.mockupsDesc,
      project.sections[1]?.body,
      project.solution,
      "The mockups brought the structure to life with a more considered visual system, stronger hierarchy, and implementation-ready states."
    ),
    mockupsDescContent,
    mockupOverviewImage: firstString(
      designSection?.overview_image,
      caseStudyRaw.mockupOverviewImage,
      project.gallery[2]?.src,
      project.sections[2]?.image,
      fallbackImages[0]
    ),
    mockupScreens: normalizeMockupScreens(designSection?.screens || caseStudyRaw.mockupScreens, fallbackImages),
    protoDesc: firstPlainText(
      deliverySection?.intro,
      deliverySection?.description,
      caseStudyRaw.protoDesc,
      raw?.protoDesc,
      integrationNote,
      project.result,
      "The high-fidelity prototype connected the main screens into a single flow so the final interactions could be reviewed more realistically."
    ),
    protoDescContent,
    protoScreenImage: firstString(
      deliverySection?.prototype_screen,
      caseStudyRaw.protoScreenImage,
      project.gallery[3]?.src,
      project.cover,
      fallbackImages[0]
    ),
    protoList: fallbackProtoList.length
      ? fallbackProtoList
      : [
          "Clarified the entry point into the main journey.",
          "Reduced friction across the most important interaction states.",
          "Prepared a more consistent prototype for handoff and iteration.",
        ],
    outcomeIntro: firstPlainText(
      outcomesRaw?.intro,
      raw?.outcomes,
      caseStudyRaw.outcomeIntro,
      raw?.outcomeIntro,
      project.result,
      project.summary
    ),
    outcomeIntroContent,
    impact,
    impactContent,
    learned,
    learnedContent,
    nextSteps: nextSteps.length ? nextSteps : project.nextSteps,
    liveUrl,
    liveProjectUrl: liveUrl,
    prototypeUrl,
    twitterUrl,
    whatsappNumber,
    whatsappUrl,
    sections: normalizedSections,
  };
}

export function normalizeProject(raw) {
  const modernCaseStudy = normalizeModernCaseStudy(raw);
  if (modernCaseStudy) {
    return modernCaseStudy;
  }

  const processRoot = raw?.process && typeof raw.process === "object" && !Array.isArray(raw.process)
    ? raw.process
    : {};
  const outcomesRaw = raw?.outcomes && typeof raw.outcomes === "object"
    ? raw.outcomes
    : {};
  const imagesRaw = raw?.images && typeof raw.images === "object"
    ? raw.images
    : {};
  const slug = safeLowerSlug(raw?.slug || raw?.id || raw?.title);
  const id = safeLowerSlug(raw?.id || slug || raw?.title);
  const titleContent = firstRichTextValue(raw?.title, raw?.projectTitle);
  const title = firstPlainText(raw?.title, raw?.projectTitle);

  const tasks = toStringArray(raw?.tasks || raw?.services);
  const taskItems = normalizeInlineContentList(raw?.tasks || raw?.services);
  const tags = toStringArray(raw?.tags);
  const tagItems = normalizeInlineContentList(raw?.tags);
  const categoryContent = firstRichTextValue(raw?.category, raw?.tag1);
  const category = firstPlainText(raw?.category, raw?.tag1, tags[0], tasks[0]);
  const tag1Content = firstRichTextValue(raw?.tag1, raw?.category);
  const tag1 = firstPlainText(raw?.tag1, raw?.category, tags[0], tasks[0], category);
  const tag2Content = firstRichTextValue(raw?.tag2);
  const tag2 = firstPlainText(raw?.tag2, tags[1], tasks[1]);
  const summaryContent = firstRichTextValue(raw?.summary, raw?.subtitle, raw?.description);
  const summary = firstPlainText(raw?.summary, raw?.subtitle, raw?.description);
  const descriptionContent = firstRichTextValue(raw?.description, raw?.summary);
  const description = firstPlainText(raw?.description, raw?.summary);
  const subtitleContent = firstRichTextValue(raw?.subtitle);
  const subtitle = firstPlainText(raw?.subtitle);
  const placeholderImage = makePlaceholderImage(slug || id || title);
  const image = sanitizeMediaUrl(
    firstString(raw?.image, imagesRaw?.cover, raw?.cover, imagesRaw?.thumbnail, raw?.thumbnail, placeholderImage)
  );
  const cover = sanitizeMediaUrl(
    firstString(imagesRaw?.cover, raw?.cover, image, imagesRaw?.thumbnail, raw?.thumbnail, placeholderImage)
  );
  const thumbnail = sanitizeMediaUrl(
    firstString(imagesRaw?.thumbnail, raw?.thumbnail, image, cover, placeholderImage)
  );
  const overview = firstString(raw?.overview, raw?.description, summary, description);
  const firstChallenge = Array.isArray(raw?.challenges) ? raw.challenges[0] : null;
  const problem = firstString(raw?.problem, firstChallenge?.text, firstChallenge?.description, raw?.challenges);
  const solution = firstString(raw?.solution, processRoot?.integration);
  const result = firstString(raw?.result, outcomesRaw?.intro, outcomesRaw?.impact);

  const highlights = toObjectArray(raw?.highlights)
    .map((item, index) => ({
      label: firstString(item?.label, item?.title, `Metric ${index + 1}`),
      value: firstString(item?.value, item?.text),
    }))
    .filter((item) => item.label && item.value);

  const process = toObjectArray(Array.isArray(raw?.process) ? raw.process : raw?.process?.steps)
    .map((item) => ({
      title: firstString(item?.title),
      description: firstString(item?.description, item?.text),
    }))
    .filter((item) => item.title && item.description);

  const sections = toObjectArray(raw?.sections || raw?.contentSections)
    .map((item, index) => ({
      title: firstString(item?.title, `Section ${index + 1}`),
      body: firstString(item?.body, item?.description, item?.text),
      image: firstString(item?.image, item?.src),
    }))
    .filter((item) => item.title && item.body);

  const gallery = normalizeGalleryItems(raw?.images?.gallery || raw?.gallery, title);

  const nextSteps = toStringArray(raw?.process?.next_steps || raw?.nextSteps);
  const liveProjectRaw = raw?.liveProject && typeof raw.liveProject === "object" ? raw.liveProject : {};
  const liveProjectUrl = sanitizeExternalUrl(
    firstString(raw?.liveProjectUrl, liveProjectRaw?.url)
  );
  const liveProject = {
    enabled: toBoolean(liveProjectRaw?.enabled, Boolean(liveProjectUrl)),
    text: firstPlainText(liveProjectRaw?.text, "View Live Project"),
    textContent: firstRichTextValue(liveProjectRaw?.text),
    url: liveProjectUrl,
  };

  const project = {
    id,
    slug,
    createdAt: firstString(raw?._createdAt, raw?.createdAt),
    updatedAt: firstString(raw?._updatedAt, raw?.updatedAt),
    title,
    titleContent,
    subtitle,
    subtitleContent,
    summary,
    summaryContent,
    description,
    descriptionContent,
    category,
    categoryContent,
    tasks: tasks.length ? tasks : [tag1, tag2].filter(Boolean),
    taskItems,
    tags,
    tagItems,
    tag1,
    tag1Content,
    tag2,
    tag2Content,
    image,
    cover,
    thumbnail,
    client: firstPlainText(raw?.client),
    clientContent: firstRichTextValue(raw?.client),
    industry: firstPlainText(raw?.industry),
    industryContent: firstRichTextValue(raw?.industry),
    status: firstString(raw?.status, "published"),
    date: firstString(raw?.date),
    overview,
    problem,
    solution,
    result,
    highlights,
    process,
    sections,
    gallery,
    nextSteps,
    liveProject,
    liveProjectUrl,
  };

  return {
    ...project,
    caseStudy: normalizeCaseStudy(raw, project),
  };
}

let cachedProjects = null;
let cachedProjectMap = null;

/**
 * Load all project JSON files.
 * Vite bundles these at build time while Decap CMS edits the source JSON.
 *
 * @returns {Project[]}
 */
export function getAllProjects() {
  if (cachedProjects) return cachedProjects;

  const modules = import.meta.glob("../content/projects/*.json", {
    eager: true,
    import: "default",
  });

  /** @type {Project[]} */
  const items = Object.values(modules)
    .filter(Boolean)
    .map((entry) => normalizeProject(entry))
    .filter((project) => project.title && project.slug && project.id);

  // Newest first when valid dates exist; otherwise fallback to title.
  items.sort((a, b) => {
    const aHasDate = isValidISODate(a.date);
    const bHasDate = isValidISODate(b.date);

    if (aHasDate && bHasDate) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (aHasDate && !bHasDate) return -1;
    if (!aHasDate && bHasDate) return 1;

    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  });

  cachedProjects = items;
  cachedProjectMap = new Map(
    items.flatMap((project) => [
      [project.slug, project],
      [project.id, project],
    ])
  );

  return cachedProjects;
}

export function getProjectBySlug(projectSlug) {
  const normalized = safeLowerSlug(projectSlug);
  if (!cachedProjects || !cachedProjectMap) {
    getAllProjects();
  }

  return cachedProjectMap?.get(normalized);
}

export function formatProjectDate(iso) {
  return yearFromDate(iso);
}
