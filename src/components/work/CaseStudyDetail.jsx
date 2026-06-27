import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Cancel01Icon,
  Clock01Icon,
  File02Icon,
  Tick01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import OptimizedImage from "../shared/OptimizedImage";
import { Link } from "react-router-dom";
import BlogCard from "../blog/BlogCard";
import Footer from "../layout/Footer";
import Seo from "../seo/Seo";
import ShareSection from "../shared/ShareSection";
import HugeIcon from "../shared/HugeIcon";
import usePullToRefresh from "../../hooks/usePullToRefresh";
import { loadAllProjects } from "../../lib/projectData";
import { richTextToHtml, richTextToInlineHtml, richTextToPlainText } from "../../lib/richText.js";
import {
  BASE_KEYWORDS,
  SITE_NAME,
  buildProjectSchema,
  buildProjectSeoDescription,
  buildProjectSeoKeywords,
} from "../../lib/site";
import { useSiteSettings } from "../../providers/siteSettingsContext.js";
import "../../pages/work/work.css";
import "../../pages/blog/blog.css";
import "../../pages/work/ProjectDetails.css";

const RELATED_CASE_STUDIES_MOBILE_BREAKPOINT = 640;
const STANDARD_CASE_SECTION_COUNT = 7;

function buildFlexibleSectionMeta(section, index) {
  const label = firstString(section?.heading, `Section ${index + 1}`);
  const token = normalizeSectionToken(firstString(section?.id, section?.heading, label));

  return {
    ...section,
    sectionLabel: label,
    renderId: `project-section-${token || index + 1}-${index + 1}`,
  };
}

function normalizeWhatsAppNumber(value) {
  const digits = String(value ?? "").replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

function buildHeroWhatsAppUrl({ number, url, message }) {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  if (normalizedNumber) {
    return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
  }

  if (!url) return "";

  try {
    const whatsappUrl = new URL(url);
    whatsappUrl.searchParams.set("text", message);
    return whatsappUrl.toString();
  } catch {
    return "";
  }
}

function IconRole() {
  return <HugeIcon icon={UserCircleIcon} size={20} strokeWidth={1.75} />;
}

function IconSnapshot() {
  return <HugeIcon icon={File02Icon} size={20} strokeWidth={1.75} />;
}

function IconTimeline() {
  return <HugeIcon icon={Clock01Icon} size={20} strokeWidth={1.75} />;
}

function IconClose() {
  return <HugeIcon icon={Cancel01Icon} size={20} strokeWidth={1.9} />;
}

function IconArrowLeft() {
  return <HugeIcon icon={ArrowLeft01Icon} size={18} strokeWidth={1.9} />;
}

function IconExternal() {
  return <HugeIcon icon={ArrowUpRight01Icon} size={18} strokeWidth={1.9} />;
}

function IconChevronLeft() {
  return <HugeIcon icon={ArrowLeft01Icon} size={18} strokeWidth={1.9} />;
}

function IconChevronRight() {
  return <HugeIcon icon={ArrowRight01Icon} size={18} strokeWidth={1.9} />;
}

function IconCheck() {
  return <HugeIcon icon={Tick01Icon} size={18} strokeWidth={2} />;
}

function firstString(...values) {
  for (const value of values) {
    if (value == null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
}

function uniqueStrings(values) {
  return values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeSectionToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getProjectTimestamp(project) {
  const candidates = [project?.date, project?.createdAt, project?.updatedAt];

  for (const value of candidates) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }

  return 0;
}

function buildProjectSignalSet(project) {
  return new Set(
    uniqueStrings([
      firstString(project?.category),
      firstString(project?.industry),
      ...normalizeTextList(project?.tasks),
      ...normalizeTextList(project?.tags),
      ...normalizeTextList(project?.caseStudy?.tasks),
      ...normalizeTextList(project?.caseStudy?.tags),
      ...normalizeTextList(project?.caseStudy?.role),
      ...normalizeTextList(project?.caseStudy?.tools),
    ]).map((item) => item.toLowerCase())
  );
}

function buildRelatedProjects(currentProject, projects, limit) {
  if (!currentProject || !Array.isArray(projects) || limit < 1) return [];

  const currentSignals = buildProjectSignalSet(currentProject);
  const currentCategory = firstString(currentProject.category).toLowerCase();
  const currentIndustry = firstString(currentProject.industry).toLowerCase();

  return [...projects]
    .filter((candidate) => {
      if (!candidate) return false;
      if (!candidate.slug && !candidate.id) return false;
      if (candidate.slug && candidate.slug === currentProject.slug) return false;
      if (candidate.id && candidate.id === currentProject.id) return false;
      return true;
    })
    .map((candidate) => {
      let score = 0;
      const candidateCategory = firstString(candidate.category).toLowerCase();
      const candidateIndustry = firstString(candidate.industry).toLowerCase();

      if (currentCategory && candidateCategory && currentCategory === candidateCategory) {
        score += 4;
      }

      if (currentIndustry && candidateIndustry && currentIndustry === candidateIndustry) {
        score += 3;
      }

      const candidateSignals = buildProjectSignalSet(candidate);
      candidateSignals.forEach((signal) => {
        if (currentSignals.has(signal)) {
          score += 1;
        }
      });

      return {
        project: candidate,
        score,
        timestamp: getProjectTimestamp(candidate),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
      return String(a.project?.title || "").localeCompare(String(b.project?.title || ""), undefined, {
        sensitivity: "base",
      });
    })
    .slice(0, limit)
    .map((item) => item.project);
}

function normalizeTextList(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(
      value.map((item) =>
        typeof item === "object"
          ? firstString(
              item?.title,
              item?.label,
              richTextToPlainText(item?.text),
              richTextToPlainText(item?.description),
              richTextToPlainText(item?.content)
            )
          : item
      )
    );
  }
  if (typeof value === "string") {
    return uniqueStrings(value.split(/\r?\n|,|\/|•/g));
  }
  return [];
}

function normalizeInlineItem(value) {
  if (value == null) return null;

  if (Array.isArray(value)) {
    const looksLikePortableText = value.some(
      (item) => item && typeof item === "object" && (item._type || item.children)
    );

    if (looksLikePortableText) {
      const text = richTextToPlainText(value);
      return text
        ? {
            text,
            content: value,
          }
        : null;
    }

    return null;
  }

  if (typeof value === "object") {
    const content =
      value?.content ||
      value?.titleContent ||
      value?.headingContent ||
      value?.labelContent ||
      value?.metricContent ||
      value?.captionContent ||
      value?.descriptionContent ||
      value?.nameContent ||
      value?.industryContent ||
      value?.categoryContent ||
      value?.clientContent ||
      value?.tagContent ||
      value?.readTimeContent ||
      value?.title ||
      value?.heading ||
      value?.label ||
      value?.metric ||
      value?.caption ||
      value?.description ||
      value?.name ||
      value?.content;
    const text = firstString(
      richTextToPlainText(value?.content),
      richTextToPlainText(value?.titleContent),
      richTextToPlainText(value?.headingContent),
      richTextToPlainText(value?.labelContent),
      richTextToPlainText(value?.metricContent),
      richTextToPlainText(value?.captionContent),
      richTextToPlainText(value?.descriptionContent),
      richTextToPlainText(value?.nameContent),
      richTextToPlainText(value?.industryContent),
      richTextToPlainText(value?.categoryContent),
      richTextToPlainText(value?.clientContent),
      value?.text,
      value?.title,
      value?.heading,
      value?.label,
      value?.metric,
      value?.caption,
      value?.description,
      value?.name
    );

    return text
      ? {
          text,
          content: content || text,
        }
      : null;
  }

  const text = richTextToPlainText(value);
  return text
    ? {
        text,
        content: value,
      }
    : null;
}

function normalizeInlineItems(value) {
  if (Array.isArray(value)) {
    const looksLikePortableText = value.some(
      (item) => item && typeof item === "object" && (item._type || item.children)
    );

    if (looksLikePortableText) {
      const item = normalizeInlineItem(value);
      return item ? [item] : [];
    }

    return value.flatMap((item) => {
      const normalized = normalizeInlineItem(item);
      return normalized ? [normalized] : [];
    });
  }

  const item = normalizeInlineItem(value);
  return item ? [item] : [];
}

function uniqueInlineItems(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = String(item?.text || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatProjectDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatStatus(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim();
}

function splitProjectTitle(title) {
  const words = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < 2) return { lead: firstString(title), accent: "" };
  return { lead: words.slice(0, -1).join(" "), accent: words.at(-1) };
}

function hasDecoratedInlineContent(value) {
  if (!Array.isArray(value)) return false;

  return value.some(
    (block) =>
      block &&
      typeof block === "object" &&
      (Array.isArray(block.children) &&
        block.children.some(
          (child) => Array.isArray(child?.marks) && child.marks.length
        ))
  );
}

function normalizeImageItem(value, fallbackAlt = "Project image") {
  if (!value) return null;
  if (typeof value === "string") {
    const src = firstString(value);
    return src ? { src, alt: fallbackAlt, caption: "", captionContent: "", label: "" } : null;
  }
  const src = firstString(
    value?.src,
    value?.url,
    value?.asset?.url,
    value?.image?.src,
    value?.image?.url,
    value?.image?.asset?.url
  );
  if (!src) return null;
  return {
    src,
    alt: firstString(value?.alt, value?.image?.alt, fallbackAlt),
    caption: firstString(value?.caption, value?.image?.caption),
    captionContent: value?.captionContent || value?.caption || value?.image?.caption,
    label: firstString(value?.label, value?.title),
  };
}

function normalizeImageList(items, fallbackAlt = "Project image") {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => normalizeImageItem(item, `${fallbackAlt} ${index + 1}`))
    .filter((item) => item?.src);
}

function flattenSectionImages(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.flatMap((section, index) => {
    const label = firstString(section?.heading, `Project section ${index + 1}`);
    if (section?.type === "story") {
      const image = normalizeImageItem(section?.image, label);
      return image ? [image] : [];
    }
    if (section?.type === "frames") {
      return normalizeImageList(section?.frames, label);
    }
    if (section?.type === "video") {
      const poster = normalizeImageItem(section?.poster, `${label} poster`);
      return poster ? [poster] : [];
    }
    return [];
  });
}

function buildInfoTable(section) {
  const rows = Array.isArray(section?.table?.rows) ? section.table.rows : [];
  return rows.reduce((acc, row) => {
    if (!Array.isArray(row)) return acc;
    const key = String(row[0]?.text ?? row[0] ?? "").trim().toLowerCase();
    const value = String(row[1]?.text ?? row[1] ?? "").trim();
    if (key && value) acc[key] = value;
    return acc;
  }, {});
}

function buildObjectives(project, caseStudy) {
  const explicitObjectives = Array.isArray(caseStudy?.objectives)
    ? caseStudy.objectives
        .map((item) => ({
          title: firstString(item?.title, item?.label, "Goal"),
          text: firstString(
            richTextToPlainText(item?.text),
            richTextToPlainText(item?.description)
          ),
          status: /progress/i.test(firstString(item?.status))
            ? "in_progress"
            : /complete|done|live/i.test(firstString(item?.status))
              ? "completed"
              : "",
        }))
        .filter((item) => item.text)
    : [];

  if (explicitObjectives.length) {
    return explicitObjectives.map((item) => ({
      ...item,
      done: item.status !== "in_progress",
      tag: item.status === "in_progress" ? "In Progress" : "Completed",
    }));
  }

  const items = [];

  if (caseStudy?.goal) items.push({ title: "Primary goal", text: caseStudy.goal });

  const painPoints = Array.isArray(caseStudy?.painPoints) ? caseStudy.painPoints : [];
  painPoints.forEach((item) => {
    const text = firstString(
      richTextToPlainText(item?.text),
      richTextToPlainText(item?.description)
    );
    if (text) items.push({ title: firstString(item?.title, "Focus area"), text });
  });

  const findings = Array.isArray(caseStudy?.usabilityFindings) ? caseStudy.usabilityFindings : [];
  findings.slice(0, 2).forEach((item) => {
    const text = firstString(
      richTextToPlainText(item?.text),
      richTextToPlainText(item?.description)
    );
    if (text) items.push({ title: firstString(item?.title, "Research insight"), text });
  });

  if (!items.length) {
    uniqueStrings([project?.problem, caseStudy?.goal, project?.solution, project?.result]).forEach(
      (text, index) => items.push({ title: index === 0 ? "Problem statement" : `Focus ${index + 1}`, text })
    );
  }

  const dedupedItems = uniqueBy(items, (item) => `${item.title}:${item.text}`).slice(0, 4);

  return dedupedItems.map((item, index) => {
    const isLastItem = index === dedupedItems.length - 1;
    const isDone = dedupedItems.length > 1 ? !isLastItem : true;

    return {
      ...item,
      done: isDone,
      tag: isDone ? "Completed" : "In Progress",
    };
  });
}

function buildResultCards(project, caseStudy) {
  const results = Array.isArray(caseStudy?.results)
    ? caseStudy.results
        .map((item) => ({
          metric: normalizeInlineItem(item?.metricContent || item?.metric || item?.value),
          description: item?.descriptionContent || item?.description || item?.text,
        }))
        .filter((item) => item.metric?.text && richTextToPlainText(item.description))
    : [];
  if (results.length || caseStudy?.contentModel === "caseStudy") return results.slice(0, 4);

  const cards = [];
  if (caseStudy?.impact) {
    cards.push({
      metric: normalizeInlineItem(caseStudy.impactContent || caseStudy.impact),
      description:
        caseStudy?.outcomeIntroContent ||
        caseStudy?.outcomeIntro ||
        "A concise summary of the most meaningful product impact from the final direction.",
    });
  }
  if (Array.isArray(project?.highlights)) {
    project.highlights.forEach((item) => {
      const metric = normalizeInlineItem(item?.valueContent || item?.value);
      const description = firstString(item?.label);
      if (metric?.text && description) cards.push({ metric, description });
    });
  }
  if (caseStudy?.learned) {
    cards.push({
      metric: normalizeInlineItem("Key learning"),
      description: caseStudy.learnedContent || caseStudy.learned,
    });
  }
  if (!cards.length) {
    cards.push({
      metric: normalizeInlineItem(firstString(project?.status, "Delivered")),
      description: project?.descriptionContent || project?.summaryContent || project?.result || project?.summary || project?.description,
    });
  }
  return uniqueBy(cards, (item) => `${item.metric?.text}:${richTextToPlainText(item.description)}`).slice(0, 4);
}

function buildProblemItems(caseStudy) {
  if (!Array.isArray(caseStudy?.problems)) return [];

  return caseStudy.problems
    .map((item, index) => ({
      title: normalizeInlineItem(item?.titleContent || item?.title || `Problem ${index + 1}`),
      description: item?.descriptionContent || item?.description,
    }))
    .filter((item) => item.title?.text || richTextToPlainText(item.description));
}

function MediaSlider({ items, label, onOpen, className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef(0);
  const didSwipeRef = useRef(false);
  const itemSignature = items.map((item) => item?.src || "").join("|");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setCurrentIndex(0);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [itemSignature]);

  if (!items.length) return null;

  const hasMultiple = items.length > 1;
  const activeItem = items[currentIndex] || items[0];

  const showNext = () => {
    if (!hasMultiple) return;
    setCurrentIndex((value) => (value + 1) % items.length);
  };

  const showPrevious = () => {
    if (!hasMultiple) return;
    setCurrentIndex((value) => (value - 1 + items.length) % items.length);
  };

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? 0;
    didSwipeRef.current = false;
  };

  const handleTouchEnd = (event) => {
    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const delta = touchStartXRef.current - endX;

    if (delta > 50) {
      showNext();
      didSwipeRef.current = true;
      return;
    }

    if (delta < -50) {
      showPrevious();
      didSwipeRef.current = true;
    }
  };

  const handleImageClick = (event) => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      event.preventDefault();
      return;
    }

    onOpen?.(items, currentIndex);
  };

  return (
    <figure className={`projectCaseImageSlider ${className}`.trim()} aria-label={label}>
      <div
        className="projectCaseImageSliderViewport image-slider projectCaseSectionCard"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasMultiple ? (
          <button
            type="button"
            className="projectCaseImageSliderArrow prev"
            onClick={showPrevious}
            aria-label={`Show previous ${label}`}
          >
            <IconChevronLeft />
          </button>
        ) : null}

        <button
          type="button"
          className="projectCaseMediaButton projectCaseImageSliderButton"
          onClick={handleImageClick}
          aria-label={`Open ${label} ${currentIndex + 1}`}
        >
          <OptimizedImage
            className="projectCaseImageSliderImage slider-image"
            image={activeItem.sanityImage || activeItem}
            alt={activeItem.alt || `${label} ${currentIndex + 1}`}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 94vw, 840px"
          />
        </button>

        {hasMultiple ? (
          <button
            type="button"
            className="projectCaseImageSliderArrow next"
            onClick={showNext}
            aria-label={`Show next ${label}`}
          >
            <IconChevronRight />
          </button>
        ) : null}
      </div>

      {activeItem.label || activeItem.caption ? (
        <figcaption className="projectCaseCarouselCaption">
          <InlineRichTextContent
            value={activeItem.captionContent || activeItem.caption || activeItem.label}
          />
        </figcaption>
      ) : null}
    </figure>
  );
}

function MediaCarousel({ slides, label, onOpen, className = "" }) {
  return <MediaSlider items={slides} label={label} onOpen={onOpen} className={className} />;
}

function MediaGallery({ items, label, onOpen, className = "" }) {
  return <MediaSlider items={items} label={label} onOpen={onOpen} className={className} />;
}

function FeatureMedia({ media, fallbackLabel, onOpen }) {
  if (!media) return null;
  if (media.kind === "video") {
    return (
      <figure className="projectCaseFeatureMedia">
        <video controls playsInline preload="metadata" poster={media.poster || undefined}>
          <source src={media.src} />
        </video>
        {media.caption ? (
          <figcaption>
            <InlineRichTextContent value={media.captionContent || media.caption} />
          </figcaption>
        ) : null}
      </figure>
    );
  }
  if (media.kind === "audio") {
    return (
      <div className="projectCaseAudioCard">
        <p className="projectCaseAudioLabel">Voice note</p>
        <audio controls preload="metadata">
          <source src={media.src} />
        </audio>
        {media.caption ? (
          <p className="projectCaseAudioCaption">
            <InlineRichTextContent value={media.captionContent || media.caption} />
          </p>
        ) : null}
      </div>
    );
  }
  return (
    <figure className="projectCaseFeatureMedia">
      <button
        type="button"
        className="projectCaseMediaButton"
        onClick={() => onOpen?.([{ ...media, alt: media.alt || fallbackLabel }], 0)}
        aria-label={`Open ${fallbackLabel}`}
      >
        <OptimizedImage image={media.sanityImage || media} alt={media.alt || fallbackLabel} loading="lazy" decoding="async" sizes="(max-width: 768px) 94vw, 900px" />
      </button>
      {media.caption ? (
        <figcaption>
          <InlineRichTextContent value={media.captionContent || media.caption} />
        </figcaption>
      ) : null}
    </figure>
  );
}

function ScopeCard({ label, items, icon }) {
  return (
    <div className="projectCaseScopeCard">
      <div className="projectCaseScopeIcon">{icon}</div>
      <p className="projectCaseScopeLabel">{label}</p>
      <ul className="projectCaseList">
        {items.map((item) => (
          <li className="projectCaseListItem" key={`${label}-${item.text}`}>
            <span className="projectCaseListDot" aria-hidden="true" />
            <span>
              <InlineRichTextContent value={item.content || item.text} fallback={item.text} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ObjectiveItem({ title, text, done, tag }) {
  return (
    <li className={`projectCaseObjective ${done ? "is-done" : ""}`.trim()}>
      <span className="projectCaseObjectiveMark" aria-hidden="true">
        {done ? <IconCheck /> : null}
      </span>
      <div className="projectCaseObjectiveBody">
        <p className="projectCaseObjectiveText">
          <strong>{title}</strong> {text}
        </p>
        <span className={`projectCaseObjectiveTag ${done ? "is-done" : ""}`.trim()}>{tag}</span>
      </div>
    </li>
  );
}

function ProblemCard({ title, description }) {
  return (
    <article className="projectCaseProblemCard projectCaseSectionCard">
      {title ? (
        <h3 className="projectCaseProblemTitle">
          <InlineRichTextContent value={title.content || title.text || title} fallback={title.text || title} />
        </h3>
      ) : null}
      <RichTextContent
        value={description}
        className="projectCaseProblemDescription projectCaseRichText"
      />
    </article>
  );
}

function ResultCard({ metric, description }) {
  return (
    <article className="projectCaseResultCard">
      <p className="projectCaseResultMetric">
        <InlineRichTextContent value={metric.content || metric.text || metric} fallback={metric.text || metric} />
      </p>
      <RichTextContent
        value={description}
        className="projectCaseResultDescription projectCaseRichText"
      />
    </article>
  );
}

function normalizeContentEntries(value) {
  if (value == null) return [];

  if (Array.isArray(value)) {
    const looksLikePortableText = value.some(
      (item) => item && typeof item === "object" && (item._type || item.children)
    );

    if (looksLikePortableText) {
      return richTextToPlainText(value) ? [value] : [];
    }

    return value.flatMap((item) => normalizeContentEntries(item));
  }

  if (richTextToPlainText(value)) {
    return [value];
  }

  return [];
}

function RichTextContent({ value, className = "", as = "div" }) {
  const html = richTextToHtml(value);
  if (!html) return null;

  const Tag = as;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function InlineRichTextContent({ value, fallback = "", className = "", as = "span" }) {
  const html = richTextToInlineHtml(value || fallback);
  if (!html) return null;

  const Tag = as;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function CaseStudyTable({ columns, rows }) {
  const normalizedColumns = Array.isArray(columns)
    ? columns.filter((column) => String(column?.text ?? column ?? "").trim())
    : [];
  const normalizedRows = Array.isArray(rows)
    ? rows.filter((row) => Array.isArray(row) && row.some((cell) => String(cell?.text ?? cell ?? "").trim()))
    : [];

  if (!normalizedColumns.length && !normalizedRows.length) return null;

  return (
    <div className="projectCaseTableWrap projectCaseSectionCard">
      <table className="projectCaseTable">
        {normalizedColumns.length ? (
          <thead>
            <tr>
              {normalizedColumns.map((column) => (
                <th key={column.text || JSON.stringify(column)} scope="col">
                  <InlineRichTextContent value={column.content || column.text || column} fallback={column.text || column} />
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {normalizedRows.map((row, rowIndex) => (
            <tr key={`table-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => {
                const value = String(cell?.text ?? cell ?? "").trim();
                const CellTag =
                  !normalizedColumns.length && cellIndex === 0 ? "th" : "td";

                return (
                  <CellTag
                    key={`table-cell-${rowIndex}-${cellIndex}`}
                    {...(CellTag === "th" ? { scope: "row" } : {})}
                  >
                    <InlineRichTextContent value={cell?.content || cell?.text || value} fallback={value} />
                  </CellTag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlexibleCaseStudySection({ section, index, onOpen }) {
  const title = firstString(section?.heading, section?.sectionLabel, `Section ${index}`);
  const titleContent = section?.headingContent || section?.heading || title;
  const label = firstString(section?.sectionLabel, title);
  const fallbackLabel = `${title} media`;

  let content = null;

  if (section?.type === "story" && section?.image?.src) {
    content = (
      <FeatureMedia
        media={{ kind: "image", ...section.image }}
        fallbackLabel={fallbackLabel}
        onOpen={onOpen}
      />
    );
  } else if (section?.type === "frames") {
    content = (
      <MediaGallery
        items={Array.isArray(section.frames) ? section.frames : []}
        label={fallbackLabel}
        onOpen={onOpen}
      />
    );
  } else if (section?.type === "video" && section?.video?.src) {
    content = (
      <FeatureMedia
        media={{
          kind: "video",
          src: section.video.src,
          poster: firstString(section.poster?.src),
          caption: firstString(section.video.caption, section.heading),
          captionContent: section.video.captionContent || section.headingContent || section.heading,
        }}
        fallbackLabel={fallbackLabel}
        onOpen={onOpen}
      />
    );
  } else if (section?.type === "audio" && section?.audio?.src) {
    content = (
      <FeatureMedia
        media={{
          kind: "audio",
          src: section.audio.src,
          caption: firstString(section.audio.caption, section.heading),
          captionContent: section.audio.captionContent || section.headingContent || section.heading,
        }}
        fallbackLabel={fallbackLabel}
        onOpen={onOpen}
      />
    );
  } else if (section?.type === "table") {
    content = (
      <CaseStudyTable
        columns={section.table?.columns}
        rows={section.table?.rows}
      />
    );
  } else if (section?.type === "image" && section?.image?.src) {
    content = (
      <FeatureMedia
        media={{ kind: "image", ...section.image }}
        fallbackLabel={fallbackLabel}
        onOpen={onOpen}
      />
    );
  } else if (section?.type === "embed") {
    if (section?.embedUrl) {
      content = (
        <div className="projectCaseEmbed">
          <iframe
            src={section.embedUrl}
            title={title || "Embedded content"}
            allowFullScreen
            loading="lazy"
            className="projectCaseEmbedFrame"
          />
        </div>
      );
    } else if (section?.code) {
      content = (
        <div className="projectCaseCode">
          {section.language && (
            <div className="projectCaseCodeLang">{section.language}</div>
          )}
          <pre>
            <code>{section.code}</code>
          </pre>
        </div>
      );
    }
  }

  return (
    <CaseSection
      id={section.renderId}
      index={index}
      label={label}
      title={title}
      titleContent={titleContent}
      copy={section.content || section.text}
    >
      {content}
    </CaseSection>
  );
}

function CaseSection({ id, index, label, title, titleContent, copy, children }) {
  const copyItems = normalizeContentEntries(copy);

  return (
    <section className="projectCaseSection" id={id}>
      <p className="projectCaseEyebrow">
        {String(index).padStart(2, "0")} / {label}
      </p>
      <h2 className="projectCaseSectionTitle">
        <InlineRichTextContent value={titleContent || title} fallback={title} />
      </h2>
      {copyItems.map((item, lineIndex) => (
        <RichTextContent
          as="div"
          className={`projectCaseLead projectCaseRichText ${lineIndex > 0 ? "projectCaseLead--secondary" : ""}`.trim()}
          key={`${id}-copy-${lineIndex}`}
          value={item}
        />
      ))}
      {children}
    </section>
  );
}

function Lightbox({ items, index, onClose, onNext, onPrev }) {
  const activeItem = items[index];
  const closeButtonRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  useEffect(() => {
    if (!items.length) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && items.length > 1) onNext();
      if (event.key === "ArrowLeft" && items.length > 1) onPrev();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items.length, onClose, onNext, onPrev]);

  useEffect(() => {
    if (!items.length) return undefined;

    const html = document.documentElement;
    const body = document.body;
    const scrollRoots = Array.from(document.querySelectorAll(".cardScroll"));
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    const scrollRootState = scrollRoots.map((root) => ({
      root,
      overflowY: root.style.overflowY,
      touchAction: root.style.touchAction,
    }));
    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    html.classList.add("project-lightbox-open");
    body.classList.add("project-lightbox-open");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    scrollRoots.forEach((root) => {
      root.style.overflowY = "hidden";
      root.style.touchAction = "none";
    });

    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      html.classList.remove("project-lightbox-open");
      body.classList.remove("project-lightbox-open");
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
      scrollRootState.forEach(({ root, overflowY, touchAction }) => {
        root.style.overflowY = overflowY;
        root.style.touchAction = touchAction;
      });
      previousActiveElementRef.current?.focus?.({ preventScroll: true });
      previousActiveElementRef.current = null;
    };
  }, [items.length]);

  if (!activeItem || typeof document === "undefined") return null;

  return createPortal(
    <div className="projectDetailsPage projectCaseLightboxPortal">
      <div className="projectCaseLightbox" role="dialog" aria-modal="true" aria-label="Expanded project media">
        <button
          type="button"
          className="projectCaseLightboxBackdrop"
          onClick={onClose}
          aria-label="Close media preview"
        />
        <div className="projectCaseLightboxPanel">
          <button
            type="button"
            className="projectCaseLightboxClose"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close media preview"
          >
            <IconClose />
          </button>
          {items.length > 1 ? (
            <div className="projectCaseLightboxNav">
              <button type="button" className="projectCaseLightboxArrow" onClick={onPrev} aria-label="Previous image">
                <IconChevronLeft />
              </button>
              <button type="button" className="projectCaseLightboxArrow" onClick={onNext} aria-label="Next image">
                <IconChevronRight />
              </button>
            </div>
          ) : null}
          <figure className="projectCaseLightboxFigure">
            <OptimizedImage image={activeItem.sanityImage || activeItem} alt={activeItem.alt || activeItem.label || "Expanded project media"} sizes="(max-width: 768px) 94vw, 980px" />
            {activeItem.caption || activeItem.label ? (
              <figcaption className="projectCaseLightboxCaption">
                <InlineRichTextContent
                  value={activeItem.captionContent || activeItem.caption || activeItem.label}
                />
              </figcaption>
            ) : null}
          </figure>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function CaseStudyDetail({ slug }) {
  const [allProjects, setAllProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const scrollRootRef = useRef(null);
  const siteSettings = useSiteSettings();
  const { socialLinks, whatsappNumber: siteWhatsAppNumber } = siteSettings;

  usePullToRefresh(scrollRootRef);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) return;
      setIsProjectLoading(true);
      setLightboxItems([]);
      setLightboxIndex(-1);
    });

    loadAllProjects().then((loadedProjects) => {
      if (!isMounted) return;
      const safeProjects = Array.isArray(loadedProjects) ? loadedProjects : [];
      setAllProjects(safeProjects);
      const normalizedSlug = String(slug || "").trim().toLowerCase();
      const loadedProject =
        safeProjects.find((item) => item.slug === normalizedSlug || item.id === normalizedSlug) ||
        null;
      setProject(loadedProject);
      setIsProjectLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const scrollToCaseSection = (id) => {
    const root = scrollRootRef.current;
    const section = root?.querySelector(`[id="${id}"]`) || document.getElementById(id);
    if (!section) return;

    if (!root) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const rootBounds = root.getBoundingClientRect();
    const sectionBounds = section.getBoundingClientRect();
    const sectionStyles = window.getComputedStyle(section);
    const scrollOffset = Number.parseFloat(sectionStyles.scrollMarginTop || "0") || 0;
    const targetTop = root.scrollTop + (sectionBounds.top - rootBounds.top) - scrollOffset;

    root.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  };

  if (!project && isProjectLoading) {
    return (
      <main className="page projectDetailsPage">
        <section className="hero aboutCard">
          <div className="cardScroll" ref={scrollRootRef}>
            <section className="projectDetailsSection" id="top">
              <div className="projectDetailsInner">
                <div className="projectDetailsToolbar">
                  <Link className="projectBackBtn" to="/work">
                    <IconArrowLeft />
                    <span>Back to Work</span>
                  </Link>
                </div>
                <article className="projectCaseStudy">
                  <div className="projectCaseLoadingPanel">Loading case study...</div>
                </article>
              </div>
            </section>
            <Footer />
          </div>
        </section>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="page projectDetailsPage">
        <Seo
          title={`Case Study Not Found | ${SITE_NAME}`}
          description={`The requested case study could not be found on the ${SITE_NAME} portfolio.`}
          keywords={[...BASE_KEYWORDS, "case study", "portfolio project"]}
          canonicalPath={`/work/${slug || ""}`}
          robots="noindex, nofollow"
          imageAlt={`Case study not found page preview for ${SITE_NAME}`}
        />
        <section className="hero aboutCard">
          <div className="cardScroll" ref={scrollRootRef}>
            <section className="projectDetailsSection" id="top">
              <div className="projectDetailsInner">
                <div className="projectDetailsToolbar">
                  <Link className="projectBackBtn" to="/work">
                    <IconArrowLeft />
                    <span>Back to Work</span>
                  </Link>
                </div>
                <article className="projectCaseStudy">
                  <div className="projectCaseLoadingPanel">
                    <h1 className="projectCaseMissingTitle">Case study not found</h1>
                    <p className="projectCaseMissingText">This project slug does not exist in the current CMS data.</p>
                  </div>
                </article>
              </div>
            </section>
            <Footer />
          </div>
        </section>
      </main>
    );
  }

  const caseStudy = project.caseStudy || {};
  const isModernCaseStudy = caseStudy.contentModel === "caseStudy";
  const sections = Array.isArray(caseStudy.sections) ? caseStudy.sections.filter(Boolean) : [];
  const infoSection =
    sections.find(
      (section) => section?.isAutoSummary === true
    ) ||
    sections.find(
      (section) =>
        section.type === "table" &&
        /(project details|project-details|summary|details)/i.test(`${section.id || ""} ${section.heading || ""}`)
    ) || null;
  const flexibleSections = sections
    .filter((section) => section && section !== infoSection)
    .map((section, index) => buildFlexibleSectionMeta(section, index));
  const relatedProjects = buildRelatedProjects(
    project,
    allProjects,
    viewportWidth <= RELATED_CASE_STUDIES_MOBILE_BREAKPOINT ? 2 : 3
  );
  const infoTable = buildInfoTable(infoSection);

  const roleItems = uniqueInlineItems([
    ...(Array.isArray(caseStudy.roleItems) ? caseStudy.roleItems : normalizeInlineItems(caseStudy.role)),
    ...normalizeInlineItems(caseStudy.responsibilities),
    ...normalizeInlineItems(caseStudy.myRoleContent || caseStudy.myRole),
    ...normalizeInlineItems(infoTable.role),
  ]);
  const toolsItems = uniqueInlineItems([
    ...(Array.isArray(caseStudy.toolsItems) ? caseStudy.toolsItems : normalizeInlineItems(caseStudy.tools)),
    ...normalizeInlineItems(infoTable.tools),
  ]);
  const timelineItems = uniqueInlineItems([
    ...(Array.isArray(caseStudy.timelineItems) ? caseStudy.timelineItems : normalizeInlineItems(caseStudy.timeline)),
    ...normalizeInlineItems(infoTable.duration),
    ...normalizeInlineItems(infoTable.timeline),
    ...normalizeInlineItems(formatProjectDate(caseStudy.publishedDate || project.date)),
  ]);

  const brandName = firstString(caseStudy.brandName, project.client, project.title);
  const projectTitle = firstString(project.title, brandName);
  const { lead: titleLead, accent: titleAccent } = splitProjectTitle(projectTitle);
  const shouldRenderRichHeroTitle = hasDecoratedInlineContent(project.titleContent);
  const projectDate = firstString(
    formatProjectDate(caseStudy.publishedDate),
    formatProjectDate(project.date),
    formatProjectDate(project.createdAt)
  );
  const statusLabel = firstString(
    formatStatus(caseStudy.status),
    formatStatus(project.status),
    formatStatus(infoTable.status)
  );
  const visitUrl = firstString(caseStudy.liveUrl, caseStudy.liveProjectUrl, project.liveProjectUrl, project.liveProject?.url);
  const prototypeUrl = firstString(caseStudy.prototypeUrl);
  const twitterUrl = firstString(caseStudy.twitterUrl, socialLinks?.x);
  const currentPageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://getbndlabs.com/work/${project.slug}`;
  const brokenLinkMessage = `Hi, this page is broken on my portfolio: ${currentPageUrl}`;
  const whatsappUrl = buildHeroWhatsAppUrl({
    number: firstString(caseStudy.whatsappNumber, siteWhatsAppNumber),
    url: firstString(caseStudy.whatsappUrl, socialLinks?.whatsapp),
    message: brokenLinkMessage,
  });
  const primaryActionUrl = firstString(visitUrl, prototypeUrl);
  const primaryActionLabel = visitUrl ? "Visit Website" : "View Prototype";

  const categoryItems = uniqueInlineItems([
    ...normalizeInlineItems(caseStudy.categoryContent || caseStudy.category),
    ...normalizeInlineItems(project.categoryContent || project.category),
    ...normalizeInlineItems(project.industryContent || project.industry),
    ...normalizeInlineItems(infoTable.platform),
  ]).slice(0, 3);
  const features = uniqueInlineItems([
    ...(Array.isArray(caseStudy.tasksItems) ? caseStudy.tasksItems : normalizeInlineItems(caseStudy.tasks)),
    ...(Array.isArray(project.taskItems) ? project.taskItems : normalizeInlineItems(project.tasks)),
    ...(Array.isArray(caseStudy.tagsItems) ? caseStudy.tagsItems : normalizeInlineItems(caseStudy.tags)),
    ...(Array.isArray(project.tagItems) ? project.tagItems : normalizeInlineItems(project.tags)),
  ]).slice(0, 8);

  const problemItems = isModernCaseStudy
    ? buildProblemItems(caseStudy)
    : buildObjectives(project, caseStudy);
  const resultCards = buildResultCards(project, caseStudy);
  const heroImage = normalizeImageItem(caseStudy.heroImage || project.cover, `${project.title} hero image`);
  const overviewImage = normalizeImageItem(caseStudy.overviewImage, `${project.title} overview image`);
  const sectionImages = isModernCaseStudy ? [] : flattenSectionImages(sections);
  const galleryImages = isModernCaseStudy
    ? []
    : normalizeImageList(project.gallery, `${project.title} gallery image`);
  const caseImages = uniqueBy(
    [
      heroImage,
      ...normalizeImageList(caseStudy.images, `${project.title} project image`),
      ...normalizeImageList(caseStudy.researchImages, `${project.title} research image`),
      ...normalizeImageList(caseStudy.wireframeImages, `${project.title} wireframe image`),
      ...normalizeImageList(caseStudy.prototypeImages, `${project.title} prototype image`),
      ...normalizeImageList(caseStudy.finalGallery, `${project.title} final image`),
      ...normalizeImageList(caseStudy.mockupScreens, `${project.title} screen`),
      ...sectionImages,
      ...galleryImages,
    ].filter(Boolean),
    (item) => item.src
  );

  const coverImage = isModernCaseStudy
    ? heroImage || overviewImage || null
    : normalizeImageItem(caseStudy.heroImage || project.cover, `${project.title} cover image`) ||
      overviewImage ||
      caseImages[0] ||
      null;
  const overviewGallery = isModernCaseStudy
    ? overviewImage
      ? [overviewImage]
      : []
    : uniqueBy(
        [
          ...normalizeImageList(caseStudy.images, `${project.title} project image`),
          ...sectionImages,
          ...galleryImages,
          coverImage,
        ].filter(Boolean),
        (item) => item.src
      ).slice(0, 4);
  const researchSlides = isModernCaseStudy
    ? normalizeImageList(caseStudy.researchImages, `${project.title} research image`)
    : uniqueBy(
        [
          ...normalizeImageList(caseStudy.researchImages, `${project.title} research image`),
          normalizeImageItem(caseStudy.journeyMapImage, `${project.title} journey map`),
          ...caseImages,
        ].filter(Boolean),
        (item) => item.src
      ).slice(0, 5);
  const wireSlides = isModernCaseStudy
    ? normalizeImageList(caseStudy.wireframeImages, `${project.title} wireframe image`)
    : uniqueBy(
        [
          ...normalizeImageList(caseStudy.wireframeImages, `${project.title} wireframe image`),
          normalizeImageItem(caseStudy.appmapImage, `${project.title} app map`),
          normalizeImageItem(caseStudy.digitalWireImage, `${project.title} digital wireframe`),
          ...normalizeImageList(caseStudy.mockupScreens, `${project.title} screen`),
          ...caseImages,
        ].filter(Boolean),
        (item) => item.src
      ).slice(0, 5);
  const prototypeSlides = isModernCaseStudy
    ? normalizeImageList(caseStudy.prototypeImages, `${project.title} prototype image`)
    : [];
  const finalSlides = isModernCaseStudy
    ? normalizeImageList(caseStudy.finalImages, `${project.title} final image`)
    : uniqueBy(
        [
          ...normalizeImageList(caseStudy.finalGallery, `${project.title} final image`),
          normalizeImageItem(caseStudy.mockupOverviewImage, `${project.title} mockup overview`),
          ...normalizeImageList(caseStudy.mockupScreens, `${project.title} screen`),
          ...caseImages,
        ].filter(Boolean),
        (item) => item.src
      ).slice(0, 6);

  const wireImage = isModernCaseStudy
    ? null
    : normalizeImageItem(caseStudy.appmapImage, `${project.title} app map`) ||
      normalizeImageItem(caseStudy.digitalWireImage, `${project.title} wireframe image`) ||
      wireSlides[0] ||
      coverImage;

  const videoSection = isModernCaseStudy
    ? null
    : sections.find((section) => section.type === "video") || null;
  const audioSection = isModernCaseStudy
    ? null
    : sections.find((section) => section.type === "audio") || null;
  const protoImage = isModernCaseStudy
    ? null
    : normalizeImageItem(caseStudy.protoScreenImage || caseStudy.mockupOverviewImage, `${project.title} prototype image`) ||
      finalSlides[0] ||
      null;
  const prototypeMedia = isModernCaseStudy
    ? null
    : videoSection?.video?.src
      ? {
          kind: "video",
          src: videoSection.video.src,
          poster: firstString(videoSection.poster?.src),
          caption: firstString(videoSection.video.caption, videoSection.heading),
          captionContent: videoSection.video.captionContent || videoSection.headingContent || videoSection.heading,
        }
      : protoImage
        ? { kind: "image", ...protoImage }
        : audioSection?.audio?.src
          ? {
              kind: "audio",
              src: audioSection.audio.src,
              caption: firstString(audioSection.audio.caption, audioSection.heading),
              captionContent: audioSection.audio.captionContent || audioSection.headingContent || audioSection.heading,
            }
          : null;

  const scopeCards = [
    {
      label: "My Role",
      items: roleItems.length ? roleItems : normalizeInlineItems(caseStudy.myRoleContent || caseStudy.myRole || "Product Design"),
      icon: <IconRole />,
    },
    {
      label: toolsItems.length ? "Tools Used" : "Project Snapshot",
      items: toolsItems.length
        ? toolsItems
        : uniqueInlineItems([
            ...normalizeInlineItems(project.clientContent || project.client || brandName),
            ...normalizeInlineItems(project.industryContent || project.industry),
            ...normalizeInlineItems(statusLabel),
          ]).slice(0, 3),
      icon: <IconSnapshot />,
    },
    {
      label: "Timeline",
      items: timelineItems.length
        ? timelineItems
        : uniqueInlineItems([
            ...normalizeInlineItems(projectDate),
            ...normalizeInlineItems(project.categoryContent || project.category),
            ...normalizeInlineItems(statusLabel),
          ]).slice(0, 3),
      icon: <IconTimeline />,
    },
  ];

  const overviewCopy = isModernCaseStudy
    ? [
        caseStudy.overviewTextContent || caseStudy.overviewText,
        caseStudy.overviewDescriptionContent || caseStudy.overviewDescription,
        caseStudy.overviewBlocks,
      ].filter((item) => Boolean(richTextToPlainText(item)))
    : caseStudy.overviewIntroContent ||
      caseStudy.overviewIntro ||
      project.descriptionContent ||
      project.overview ||
      caseStudy.description ||
      project.description ||
      project.summary;
  const researchCopy = isModernCaseStudy
    ? caseStudy.researchTextContent || caseStudy.researchText
    : caseStudy.researchIntroContent ||
      caseStudy.researchIntro ||
      caseStudy.usabilityIntroContent ||
      caseStudy.usabilityIntro ||
      firstString(
        project.problem,
        "The project began with a close read of user friction, category patterns, and where the experience needed stronger guidance."
      );
  const problemCopy = isModernCaseStudy
    ? ""
    : caseStudy.goalContent ||
      caseStudy.goal ||
      firstString(
        project.problem,
        "The goal was to reduce confusion, create a stronger hierarchy, and give users a clearer path through the product."
      );
  const wireCopy = isModernCaseStudy
    ? caseStudy.wireframeTextContent || caseStudy.wireframeText
    : caseStudy.wireframesIntroContent ||
      caseStudy.wireframesIntro ||
      caseStudy.appmapDescContent ||
      caseStudy.appmapDesc ||
      firstString(
        "The structure phase focused on information hierarchy, content flow, and deciding what each screen needed to communicate first."
      );
  const wireCopyTwo = isModernCaseStudy
    ? ""
    : caseStudy.digitalWireDescContent ||
      caseStudy.digitalWireDesc ||
      project.descriptionContent ||
      firstString(
        project.solution,
        "The wireframe direction created a stronger foundation for layout, interaction states, and scalable implementation."
      );
  const prototypeCopy = isModernCaseStudy
    ? caseStudy.prototypeTextContent || caseStudy.prototypeText
    : caseStudy.protoDescContent ||
      caseStudy.protoDesc ||
      caseStudy.designIntroContent ||
      caseStudy.designIntro ||
      project.descriptionContent ||
      firstString(
        project.result,
        "The prototype turned the structure into an interactive flow that could be reviewed, refined, and prepared for handoff."
      );
  const resultsCopy = isModernCaseStudy
    ? ""
    : caseStudy.outcomeIntroContent ||
      caseStudy.outcomeIntro ||
      caseStudy.impactContent ||
      caseStudy.impact ||
      firstString(
        project.result,
        "The final direction brought the system together into a clearer, more confident experience with measurable improvement."
      );
  const protoPoints = isModernCaseStudy
    ? []
    : uniqueStrings([
        ...normalizeTextList(caseStudy.protoList),
        ...normalizeTextList(project.process?.map((item) => item?.description)),
        ...normalizeTextList(caseStudy.nextSteps),
      ]).slice(0, 4);

  const openLightbox = (items, index = 0) => {
    setLightboxItems(items);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxItems([]);
    setLightboxIndex(-1);
  };

  const showNextLightboxItem = () => {
    setLightboxIndex((current) => (current + 1) % lightboxItems.length);
  };

  const showPreviousLightboxItem = () => {
    setLightboxIndex((current) => (current - 1 + lightboxItems.length) % lightboxItems.length);
  };

  return (
    <main className="page projectDetailsPage">
      <Seo
        title={`${project.title} UI/UX Case Study by Bodunde Emmanuel | ${SITE_NAME}`}
        description={buildProjectSeoDescription(project)}
        keywords={buildProjectSeoKeywords(project)}
        canonicalPath={`/work/${project.slug}`}
        type="article"
        image={coverImage?.src || undefined}
        imageAlt={`${project.title} case study preview for ${SITE_NAME}`}
        schema={buildProjectSchema(project, siteSettings)}
      />

      <section className="hero aboutCard" aria-label="Case study page">
        <div className="cardScroll" ref={scrollRootRef}>
          <section className="projectDetailsSection" id="top" aria-label="Project details">
            <div className="projectDetailsInner">
              <article className="projectCaseStudy">
                <header className="projectCaseHero">
                  <div className="projectDetailsToolbar">
                    <Link className="projectBackBtn" to="/work">
                      <IconArrowLeft />
                      <span>Back to Work</span>
                    </Link>
                    {categoryItems.length ? (
                      <div className="projectCaseCategoryRow" aria-label="Project categories">
                        {categoryItems.map((category) => (
                          <span className="projectCaseCategoryChip" key={category.text}>
                            <InlineRichTextContent value={category.content || category.text} fallback={category.text} />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="projectCaseHeroText">
                    {shouldRenderRichHeroTitle ? (
                      <h1 className="projectCaseTitle">
                        <InlineRichTextContent value={project.titleContent} fallback={projectTitle} />
                      </h1>
                    ) : (
                      <h1 className="projectCaseTitle">
                        {titleLead}
                        {titleAccent ? (
                          <>
                            {" "}
                            <span className="projectCaseTitleAccent">{titleAccent}</span>
                          </>
                        ) : null}
                      </h1>
                    )}
                    {caseStudy.brandLogo ? (
                      <OptimizedImage className="projectCaseBrandLogo" image={caseStudy.brandLogo?.sanityImage || caseStudy.brandLogo} alt={brandName} loading="lazy" decoding="async" sizes="160px" />
                    ) : (
                      <p className="projectCaseBrandName">{brandName}</p>
                    )}
                    <RichTextContent
                      value={
                        caseStudy.descriptionContent ||
                        caseStudy.description ||
                        project.descriptionContent ||
                        project.summaryContent ||
                        project.description ||
                        project.summary
                      }
                      className="projectCaseDescription projectCaseRichText"
                    />
                  </div>

                  <div className="projectCaseActions">
                    {primaryActionUrl ? (
                      <a className="projectCaseActionLink is-primary" href={primaryActionUrl} target="_blank" rel="noreferrer noopener">
                        <IconExternal />
                        <span>{primaryActionLabel}</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="projectCaseActionLink projectCaseActionButton is-primary"
                        onClick={() => scrollToCaseSection("prototype")}
                      >
                        <IconExternal />
                        <span>{primaryActionLabel}</span>
                      </button>
                    )}
                    <a className="projectCaseActionLink" href={twitterUrl} target="_blank" rel="noreferrer noopener">
                      <span>View on X</span>
                    </a>
                    <a className="projectCaseActionLink is-soft" href={whatsappUrl} target="_blank" rel="noreferrer noopener">
                      <span>Broken Link? WhatsApp Me</span>
                    </a>
                  </div>

                  {features.length ? (
                    <div className="projectCaseFeatureStrip">
                      <span className="projectCaseFeatureLabel">Features</span>
                      {features.map((feature) => (
                        <span className="projectCaseFeatureChip" key={feature.text}>
                          <InlineRichTextContent value={feature.content || feature.text} fallback={feature.text} />
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="projectCaseMetaGrid">
                    <div className="projectCaseMetaItem">
                      <p className="projectCaseMetaLabel">Category</p>
                      <p className="projectCaseMetaValue">
                        <InlineRichTextContent
                          value={categoryItems[0]?.content || project.categoryContent || project.category || "Case Study"}
                          fallback={categoryItems[0]?.text || project.category || "Case Study"}
                        />
                      </p>
                    </div>
                    <div className="projectCaseMetaItem">
                      <p className="projectCaseMetaLabel">Published</p>
                      <p className="projectCaseMetaValue">{firstString(projectDate, "Recent work")}</p>
                    </div>
                    <div className="projectCaseMetaItem">
                      <p className="projectCaseMetaLabel">Status</p>
                      <p className="projectCaseMetaValue is-accent">{firstString(statusLabel, "Published")}</p>
                    </div>
                  </div>

                  {coverImage ? (
                    <div className="projectCaseCoverWrap">
                      <button
                        type="button"
                        className="projectCaseCoverButton"
                        onClick={() => openLightbox([coverImage], 0)}
                        aria-label={`Open ${project.title} cover image`}
                      >
                        <OptimizedImage
                          className="projectCaseCoverImage"
                          image={coverImage.sanityImage || coverImage}
                          alt={coverImage.alt || `${project.title} cover image`}
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                          sizes="(max-width: 768px) 94vw, 980px"
                        />
                      </button>
                    </div>
                  ) : null}
                </header>

                <div className="projectCaseBody">
                  <div className="projectCaseContent">
                    <CaseSection id="overview" index={1} label="Overview" title="About the Project" copy={overviewCopy}>
                      {isModernCaseStudy ? (
                        <MediaGallery
                          items={overviewGallery}
                          label="Overview image"
                          onOpen={openLightbox}
                          className="projectCaseOverviewMedia"
                        />
                      ) : overviewGallery.length ? (
                        <MediaGallery
                          items={overviewGallery}
                          label="Overview image"
                          onOpen={openLightbox}
                          className="projectCaseOverviewMedia"
                        />
                      ) : null}
                    </CaseSection>

                    <CaseSection
                      id="project-scope"
                      index={2}
                      label="Project Scope"
                      title="Scope & Setup"
                      copy=""
                    >
                      <div className="projectCaseScopeGrid">
                        {scopeCards.map((card) => (
                          <ScopeCard key={card.label} label={card.label} items={card.items} icon={card.icon} />
                        ))}
                      </div>
                    </CaseSection>

                    <CaseSection id="research" index={3} label="User Research" title="Understanding the Users" copy={researchCopy}>
                      {isModernCaseStudy ? (
                        <MediaGallery
                          items={researchSlides}
                          label="Research images"
                          onOpen={openLightbox}
                        />
                      ) : (
                        <MediaCarousel slides={researchSlides} label="Research slides" onOpen={openLightbox} />
                      )}
                    </CaseSection>

                    <CaseSection id="problem" index={4} label="Problem & Goals" title="What We Set Out to Solve" copy={problemCopy}>
                      {isModernCaseStudy ? (
                        <div className="projectCaseProblemGrid">
                          {problemItems.map((item) => (
                            <ProblemCard
                              key={`${item.title?.text || item.title}-${richTextToPlainText(item.description)}`}
                              title={item.title}
                              description={item.description}
                            />
                          ))}
                        </div>
                      ) : (
                        <ul className="projectCaseObjectiveList">
                          {problemItems.map((item) => (
                            <ObjectiveItem key={`${item.title}-${item.text}`} title={item.title} text={item.text} done={item.done} tag={item.tag} />
                          ))}
                        </ul>
                      )}
                    </CaseSection>

                    <CaseSection id="wireframe" index={5} label="Wireframe" title="Mapping the Structure" copy={wireCopy}>
                      {isModernCaseStudy ? (
                        <MediaGallery
                          items={wireSlides}
                          label="Wireframe images"
                          onOpen={openLightbox}
                        />
                      ) : (
                        <>
                          <div className="projectCaseSplitGrid">
                            <FeatureMedia
                              media={wireImage ? { kind: "image", ...wireImage } : null}
                              fallbackLabel={`${project.title} wireframe image`}
                              onOpen={openLightbox}
                            />
                            <div className="projectCaseSplitCopy">
                              <h3 className="projectCaseSplitTitle">Structure before polish</h3>
                              <RichTextContent
                                value={wireCopy}
                                className="projectCaseSplitText projectCaseRichText"
                              />
                              <RichTextContent
                                value={wireCopyTwo}
                                className="projectCaseSplitText projectCaseRichText"
                              />
                            </div>
                          </div>
                          <MediaCarousel slides={wireSlides} label="Wireframe slides" onOpen={openLightbox} />
                        </>
                      )}
                    </CaseSection>

                    <CaseSection id="prototype" index={6} label="Prototype" title="Bringing it to Life" copy={prototypeCopy}>
                      {isModernCaseStudy ? (
                        <MediaGallery
                          items={prototypeSlides}
                          label="Prototype images"
                          onOpen={openLightbox}
                        />
                      ) : (
                        <div className="projectCasePrototypeGrid">
                          <div className="projectCasePrototypeCard">
                            <p className="projectCasePrototypeLabel">Key decisions</p>
                            <ul className="projectCaseDecisionList">
                              {protoPoints.map((point) => (
                                <li className="projectCaseDecisionItem" key={point}>
                                  <span className="projectCaseDecisionMark" aria-hidden="true">
                                    <IconCheck />
                                  </span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <FeatureMedia media={prototypeMedia} fallbackLabel={`${project.title} prototype preview`} onOpen={openLightbox} />
                        </div>
                      )}
                    </CaseSection>

                    <CaseSection id="final-results" index={7} label="Final Results" title="What We Shipped & What Changed" copy={resultsCopy}>
                      {resultCards.length ? (
                        <div className="projectCaseResultGrid">
                          {resultCards.map((card) => (
                            <ResultCard
                              key={`${card.metric?.text || card.metric}-${richTextToPlainText(card.description)}`}
                              metric={card.metric}
                              description={card.description}
                            />
                          ))}
                        </div>
                      ) : null}
                      {isModernCaseStudy ? (
                        <MediaGallery
                          items={finalSlides}
                          label="Final project screens"
                          onOpen={openLightbox}
                          className="projectCaseFinalGallery"
                        />
                      ) : (
                        <MediaCarousel slides={finalSlides} label="Final project screens" onOpen={openLightbox} />
                      )}
                    </CaseSection>

                    {flexibleSections.map((section, sectionIndex) => (
                      <FlexibleCaseStudySection
                        key={section.renderId}
                        section={section}
                        index={STANDARD_CASE_SECTION_COUNT + sectionIndex + 1}
                        onOpen={openLightbox}
                      />
                    ))}

                    <ShareSection
                      path={`/work/${project.slug}`}
                      shareTitle={`${project.title} Case Study | ${SITE_NAME}`}
                    />

                    {relatedProjects.length ? (
                      <section className="projectCaseRelated" aria-labelledby="related-case-studies-title">
                        <div className="workPage blogPage">
                          <section className="workGridSection">
                            <div className="workGridHead">
                              <h2 className="workGridTitle" id="related-case-studies-title">
                                Related Case Studies
                              </h2>
                            </div>

                            <div className="workProjectsGrid blogProjectsGrid">
                              {relatedProjects.map((relatedProject, relatedIndex) => (
                                <div
                                  className="workGridCard"
                                  key={relatedProject.id || relatedProject.slug || relatedIndex}
                                >
                                  <BlogCard
                                    project={relatedProject}
                                    priority={relatedIndex === 0}
                                    fullCardLink
                                  />
                                </div>
                              ))}
                            </div>
                          </section>
                        </div>
                      </section>
                    ) : null}
                  </div>
                </div>

                <section className="projectCaseClosing">
                  <h2 className="projectCaseClosingTitle">Want to work together?</h2>
                  <p className="projectCaseClosingText">Have a project in mind? Let&apos;s talk about how we can shape it.</p>
                  <Link className="projectCaseClosingLink" to="/contact">
                    Get in touch
                  </Link>
                </section>
              </article>
            </div>
          </section>

          <Footer />
        </div>

        {lightboxItems.length ? (
          <Lightbox
            items={lightboxItems}
            index={lightboxIndex}
            onClose={closeLightbox}
            onNext={showNextLightboxItem}
            onPrev={showPreviousLightboxItem}
          />
        ) : null}
      </section>
    </main>
  );
}
