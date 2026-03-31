import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Seo from "../seo/Seo";
import usePullToRefresh from "../../hooks/usePullToRefresh";
import { loadAllProjects } from "../../lib/projectData";
import {
  BASE_KEYWORDS,
  SITE_NAME,
  buildProjectSeoDescription,
  buildProjectSeoKeywords,
} from "../../lib/site";
import { useSiteSettings } from "../../providers/siteSettingsContext.js";
import "../../pages/work/ProjectDetails.css";

const NAV_SECTIONS = [
  { id: "overview", label: "Overview", Icon: IconOverview },
  { id: "scope", label: "Project Scope", Icon: IconScope },
  { id: "research", label: "User Research", Icon: IconResearch },
  { id: "problem", label: "Problem & Goals", Icon: IconProblem },
  { id: "wireframe", label: "Wireframe", Icon: IconWireframe },
  { id: "prototype", label: "Prototype", Icon: IconPrototype },
  { id: "results", label: "Final Results", Icon: IconResults },
];

function IconOverview() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

function IconScope() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="6" height="6" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="5" width="6" height="6" stroke="currentColor" strokeWidth="1.7" />
      <rect x="5" y="13" width="6" height="6" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="13" width="6" height="6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconResearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M16 16l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconProblem() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4 18 6.5v4.7c0 4-2.4 6.8-6 8.8-3.6-2-6-4.8-6-8.8V6.5L12 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWireframe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4.5 10.5h15M10.5 19V10.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPrototype() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 7.5v9l7-4.5-7-4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconResults() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 14.5h3l2-5 3.2 9 2.2-6H19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 18.5c1.8-2.8 4.1-4.2 6.5-4.2s4.7 1.4 6.5 4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSnapshot() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M8.5 10.5h7M8.5 14h4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTimeline() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 7.5V12l3 1.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 5h5v5M10 14 19 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

function normalizeTextList(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(
      value.map((item) =>
        typeof item === "object"
          ? firstString(item?.title, item?.label, item?.text, item?.description)
          : item
      )
    );
  }
  if (typeof value === "string") {
    return uniqueStrings(value.split(/\r?\n|,|\/|•/g));
  }
  return [];
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

function normalizeImageItem(value, fallbackAlt = "Project image") {
  if (!value) return null;
  if (typeof value === "string") {
    const src = firstString(value);
    return src ? { src, alt: fallbackAlt, caption: "", label: "" } : null;
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
    const key = String(row[0] ?? "").trim().toLowerCase();
    const value = String(row[1] ?? "").trim();
    if (key && value) acc[key] = value;
    return acc;
  }, {});
}

function buildObjectives(project, caseStudy) {
  const explicitObjectives = Array.isArray(caseStudy?.objectives)
    ? caseStudy.objectives
        .map((item) => ({
          title: firstString(item?.title, item?.label, "Goal"),
          text: firstString(item?.text, item?.description),
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
    const text = firstString(item?.text, item?.description);
    if (text) items.push({ title: firstString(item?.title, "Focus area"), text });
  });

  const findings = Array.isArray(caseStudy?.usabilityFindings) ? caseStudy.usabilityFindings : [];
  findings.slice(0, 2).forEach((item) => {
    const text = firstString(item?.text, item?.description);
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
          metric: firstString(item?.metric, item?.value),
          description: firstString(item?.description, item?.text),
        }))
        .filter((item) => item.metric && item.description)
    : [];
  if (results.length || caseStudy?.contentModel === "caseStudy") return results.slice(0, 4);

  const cards = [];
  if (caseStudy?.impact) {
    cards.push({
      metric: caseStudy.impact,
      description: firstString(
        caseStudy?.outcomeIntro,
        "A concise summary of the most meaningful product impact from the final direction."
      ),
    });
  }
  if (Array.isArray(project?.highlights)) {
    project.highlights.forEach((item) => {
      const metric = firstString(item?.value);
      const description = firstString(item?.label);
      if (metric && description) cards.push({ metric, description });
    });
  }
  if (caseStudy?.learned) cards.push({ metric: "Key learning", description: caseStudy.learned });
  if (!cards.length) {
    cards.push({
      metric: firstString(project?.status, "Delivered"),
      description: firstString(project?.result, project?.summary, project?.description),
    });
  }
  return uniqueBy(cards, (item) => `${item.metric}:${item.description}`).slice(0, 4);
}

function buildProblemItems(caseStudy) {
  if (!Array.isArray(caseStudy?.problems)) return [];

  return caseStudy.problems
    .map((item, index) => ({
      title: firstString(item?.title, `Problem ${index + 1}`),
      description: firstString(item?.description),
    }))
    .filter((item) => item.title || item.description);
}

function MediaCarousel({ slides, label, onOpen }) {
  const trackRef = useRef(null);
  if (!slides.length) return null;

  const scroll = (direction) => {
    trackRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  };

  return (
    <div className="projectCaseCarousel" aria-label={label}>
      <div className="projectCaseCarouselTrack" ref={trackRef}>
        {slides.map((slide, index) => (
          <figure className="projectCaseCarouselSlide" key={`${slide.src}-${index}`}>
            <button
              type="button"
              className="projectCaseMediaButton"
              onClick={() => onOpen?.(slides, index)}
              aria-label={`Open ${label} ${index + 1}`}
            >
              <img
                src={slide.src}
                alt={slide.alt || `${label} ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
            </button>
            {slide.label || slide.caption ? (
              <figcaption className="projectCaseCarouselCaption">{slide.label || slide.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="projectCaseCarouselControls">
          <button type="button" className="projectCaseCarouselButton" onClick={() => scroll(-1)} aria-label={`Scroll ${label} left`}>
            <IconChevronLeft />
          </button>
          <button type="button" className="projectCaseCarouselButton" onClick={() => scroll(1)} aria-label={`Scroll ${label} right`}>
            <IconChevronRight />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MediaGallery({ items, label, onOpen, className = "" }) {
  if (!items.length) return null;

  return (
    <div className={`projectCaseMediaGallery ${className}`.trim()} aria-label={label}>
      {items.map((item, index) => (
        <figure className="projectCaseMediaFigure projectCaseSectionCard" key={`${item.src}-${index}`}>
          <button
            type="button"
            className="projectCaseMediaButton"
            onClick={() => onOpen?.(items, index)}
            aria-label={`Open ${label} ${index + 1}`}
          >
            <img
              src={item.src}
              alt={item.alt || `${label} ${index + 1}`}
              loading="lazy"
              decoding="async"
            />
          </button>
          {item.label || item.caption ? (
            <figcaption className="projectCaseCarouselCaption">{item.label || item.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

function FeatureMedia({ media, fallbackLabel, onOpen }) {
  if (!media) return null;
  if (media.kind === "video") {
    return (
      <figure className="projectCaseFeatureMedia">
        <video controls playsInline preload="metadata" poster={media.poster || undefined}>
          <source src={media.src} />
        </video>
        {media.caption ? <figcaption>{media.caption}</figcaption> : null}
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
        {media.caption ? <p className="projectCaseAudioCaption">{media.caption}</p> : null}
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
        <img src={media.src} alt={media.alt || fallbackLabel} loading="lazy" decoding="async" />
      </button>
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
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
          <li className="projectCaseListItem" key={`${label}-${item}`}>
            <span className="projectCaseListDot" aria-hidden="true" />
            <span>{item}</span>
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
      {title ? <h3 className="projectCaseProblemTitle">{title}</h3> : null}
      {description ? <p className="projectCaseProblemDescription">{description}</p> : null}
    </article>
  );
}

function ResultCard({ metric, description }) {
  return (
    <article className="projectCaseResultCard">
      <p className="projectCaseResultMetric">{metric}</p>
      <p className="projectCaseResultDescription">{description}</p>
    </article>
  );
}

function CaseSection({ id, index, label, title, copy, children }) {
  const copyLines = Array.isArray(copy)
    ? uniqueStrings(copy.map((item) => firstString(item)))
    : firstString(copy)
      ? [firstString(copy)]
      : [];

  return (
    <section className="projectCaseSection" id={id}>
      <span className="projectCaseSectionObserver" data-section-id={id} aria-hidden="true" />
      <p className="projectCaseEyebrow">
        {String(index).padStart(2, "0")} / {label}
      </p>
      <h2 className="projectCaseSectionTitle">{title}</h2>
      {copyLines.map((line, lineIndex) => (
        <p
          className={`projectCaseLead ${lineIndex > 0 ? "projectCaseLead--secondary" : ""}`.trim()}
          key={`${id}-copy-${lineIndex}`}
        >
          {line}
        </p>
      ))}
      {children}
    </section>
  );
}

function Lightbox({ items, index, onClose, onNext, onPrev }) {
  const activeItem = items[index];

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

  if (!activeItem) return null;

  return (
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
          <img src={activeItem.src} alt={activeItem.alt || activeItem.label || "Expanded project media"} />
          {activeItem.caption || activeItem.label ? (
            <figcaption className="projectCaseLightboxCaption">
              {activeItem.caption || activeItem.label}
            </figcaption>
          ) : null}
        </figure>
      </div>
    </div>
  );
}

export default function CaseStudyDetail({ slug }) {
  const [project, setProject] = useState(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const scrollRootRef = useRef(null);
  const navButtonRefs = useRef({});
  const { socialLinks, whatsappNumber: siteWhatsAppNumber } = useSiteSettings();

  usePullToRefresh(scrollRootRef);

  useEffect(() => {
    let isMounted = true;
    setIsProjectLoading(true);
    setActiveSection("overview");
    setLightboxItems([]);
    setLightboxIndex(-1);

    loadAllProjects().then((loadedProjects) => {
      if (!isMounted) return;
      const safeProjects = Array.isArray(loadedProjects) ? loadedProjects : [];
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

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root || !project) return undefined;
    const targets = Array.from(root.querySelectorAll(".projectCaseSectionObserver"));
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (!visible.length) return;

        const nextSectionId = visible[0].target.getAttribute("data-section-id");
        if (nextSectionId) setActiveSection(nextSectionId);
      },
      { root, rootMargin: "-12% 0px -72% 0px", threshold: 0.6 }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [project]);

  useEffect(() => {
    const activeButton = navButtonRefs.current[activeSection];
    if (!activeButton) return;

    activeButton.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeSection]);

  if (!project && isProjectLoading) {
    return (
      <main className="page projectDetailsPage">
        <section className="hero aboutCard">
          <div className="cardScroll" ref={scrollRootRef}>
            <section className="aboutHeroShell">
              <div className="aboutShell">
                <Header active="work" />
              </div>
            </section>
            <section className="projectDetailsSection">
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
            <section className="aboutHeroShell">
              <div className="aboutShell">
                <Header active="work" />
              </div>
            </section>
            <section className="projectDetailsSection">
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
      (section) =>
        section.type === "table" &&
        /(project details|project-details|summary|details)/i.test(`${section.id || ""} ${section.heading || ""}`)
    ) || null;
  const infoTable = buildInfoTable(infoSection);

  const roleItems = uniqueStrings([
    ...normalizeTextList(caseStudy.role),
    ...normalizeTextList(caseStudy.responsibilities),
    ...normalizeTextList(caseStudy.myRole),
    ...normalizeTextList(infoTable.role),
  ]);
  const toolsItems = uniqueStrings([
    ...normalizeTextList(caseStudy.tools),
    ...normalizeTextList(infoTable.tools),
  ]);
  const timelineItems = uniqueStrings([
    ...normalizeTextList(caseStudy.timeline),
    ...normalizeTextList(infoTable.duration),
    ...normalizeTextList(infoTable.timeline),
    firstString(formatProjectDate(caseStudy.publishedDate || project.date)),
  ]);

  const brandName = firstString(caseStudy.brandName, project.client, project.title);
  const projectTitle = firstString(project.title, brandName);
  const { lead: titleLead, accent: titleAccent } = splitProjectTitle(projectTitle);
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

  const categories = uniqueStrings([
    firstString(caseStudy.category, project.category, infoTable.platform),
    firstString(project.industry),
  ]).slice(0, 3);
  const features = uniqueStrings([
    ...normalizeTextList(caseStudy.tasks),
    ...normalizeTextList(project.tasks),
    ...normalizeTextList(caseStudy.tags),
    ...normalizeTextList(project.tags),
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
        }
      : protoImage
        ? { kind: "image", ...protoImage }
        : audioSection?.audio?.src
          ? { kind: "audio", src: audioSection.audio.src, caption: firstString(audioSection.audio.caption, audioSection.heading) }
          : null;

  const scopeCards = [
    {
      label: "My Role",
      items: roleItems.length ? roleItems : [firstString(caseStudy.myRole, "Product Design")],
      icon: <IconRole />,
    },
    {
      label: toolsItems.length ? "Tools Used" : "Project Snapshot",
      items: toolsItems.length
        ? toolsItems
        : uniqueStrings([firstString(project.client, brandName), firstString(project.industry), firstString(statusLabel)]).slice(0, 3),
      icon: <IconSnapshot />,
    },
    {
      label: "Timeline",
      items: timelineItems.length
        ? timelineItems
        : uniqueStrings([firstString(projectDate), firstString(project.category), firstString(statusLabel)]).slice(0, 3),
      icon: <IconTimeline />,
    },
  ];

  const overviewCopy = isModernCaseStudy
    ? [firstString(caseStudy.overviewText), firstString(caseStudy.overviewDescription)].filter(Boolean)
    : firstString(caseStudy.overviewIntro, project.overview, caseStudy.description, project.description, project.summary);
  const researchCopy = isModernCaseStudy
    ? firstString(caseStudy.researchText)
    : firstString(
        caseStudy.researchIntro,
        caseStudy.usabilityIntro,
        project.problem,
        "The project began with a close read of user friction, category patterns, and where the experience needed stronger guidance."
      );
  const problemCopy = isModernCaseStudy
    ? ""
    : firstString(
        project.problem,
        caseStudy.goal,
        "The goal was to reduce confusion, create a stronger hierarchy, and give users a clearer path through the product."
      );
  const wireCopy = isModernCaseStudy
    ? firstString(caseStudy.wireframeText)
    : firstString(
        caseStudy.wireframesIntro,
        caseStudy.appmapDesc,
        "The structure phase focused on information hierarchy, content flow, and deciding what each screen needed to communicate first."
      );
  const wireCopyTwo = isModernCaseStudy
    ? ""
    : firstString(
        caseStudy.digitalWireDesc,
        project.solution,
        "The wireframe direction created a stronger foundation for layout, interaction states, and scalable implementation."
      );
  const prototypeCopy = isModernCaseStudy
    ? firstString(caseStudy.prototypeText)
    : firstString(
        caseStudy.protoDesc,
        caseStudy.designIntro,
        project.result,
        "The prototype turned the structure into an interactive flow that could be reviewed, refined, and prepared for handoff."
      );
  const resultsCopy = isModernCaseStudy
    ? ""
    : firstString(
        caseStudy.outcomeIntro,
        caseStudy.impact,
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

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        title={`${project.title} Case Study | ${SITE_NAME}`}
        description={buildProjectSeoDescription(project)}
        keywords={buildProjectSeoKeywords(project)}
        canonicalPath={`/work/${project.slug}`}
        type="article"
        image={coverImage?.src || undefined}
        imageAlt={`${project.title} case study preview for ${SITE_NAME}`}
      />

      <section className="hero aboutCard" aria-label="Case study page">
        <div className="cardScroll" ref={scrollRootRef}>
          <section className="aboutHeroShell" id="top">
            <div className="aboutShell">
              <Header active="work" />
            </div>
          </section>

          <section className="projectDetailsSection" aria-label="Project details">
            <div className="projectDetailsInner">
              <article className="projectCaseStudy">
                <header className="projectCaseHero">
                  <div className="projectDetailsToolbar">
                    <Link className="projectBackBtn" to="/work">
                      <IconArrowLeft />
                      <span>Back to Work</span>
                    </Link>
                    {categories.length ? (
                      <div className="projectCaseCategoryRow" aria-label="Project categories">
                        {categories.map((category) => (
                          <span className="projectCaseCategoryChip" key={category}>
                            {category}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="projectCaseHeroText">
                    <h1 className="projectCaseTitle">
                      {titleLead}
                      {titleAccent ? (
                        <>
                          {" "}
                          <span className="projectCaseTitleAccent">{titleAccent}</span>
                        </>
                      ) : null}
                    </h1>
                    {caseStudy.brandLogo ? (
                      <img className="projectCaseBrandLogo" src={caseStudy.brandLogo} alt={brandName} loading="lazy" decoding="async" />
                    ) : (
                      <p className="projectCaseBrandName">{brandName}</p>
                    )}
                    <p className="projectCaseDescription">
                      {firstString(caseStudy.description, project.description, project.summary)}
                    </p>
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
                        onClick={() => scrollToSection("prototype")}
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
                        <span className="projectCaseFeatureChip" key={feature}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="projectCaseMetaGrid">
                    <div className="projectCaseMetaItem">
                      <p className="projectCaseMetaLabel">Category</p>
                      <p className="projectCaseMetaValue">{firstString(categories.join(", "), project.category, "Case Study")}</p>
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
                        <img
                          className="projectCaseCoverImage"
                          src={coverImage.src}
                          alt={coverImage.alt || `${project.title} cover image`}
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    </div>
                  ) : null}
                </header>

                <div className="projectCaseBody">
                  <aside className="projectCaseNav" aria-label="Case study sections">
                    <ul className="projectCaseNavList">
                      {NAV_SECTIONS.map((section, index) => {
                        const isActive = activeSection === section.id;
                        const completed = NAV_SECTIONS.findIndex((item) => item.id === activeSection) > index;
                        return (
                          <li className="projectCaseNavItem" key={section.id}>
                            <button
                              type="button"
                              className={`projectCaseNavButton ${isActive ? "is-active" : ""}`.trim()}
                              onClick={() => scrollToSection(section.id)}
                              ref={(node) => {
                                if (node) {
                                  navButtonRefs.current[section.id] = node;
                                } else {
                                  delete navButtonRefs.current[section.id];
                                }
                              }}
                            >
                              <span className="projectCaseNavIcon">
                                <section.Icon />
                              </span>
                              <span>{section.label}</span>
                            </button>
                            {index < NAV_SECTIONS.length - 1 ? (
                              <span className={`projectCaseNavConnector ${completed ? "is-complete" : ""}`.trim()} aria-hidden="true" />
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </aside>

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
                        <div className="projectCaseOverviewGallery" data-count={overviewGallery.length}>
                          {overviewGallery.map((image, index) => (
                            <button
                              type="button"
                              className={`projectCaseOverviewTile projectCaseOverviewTile--${index + 1}`.trim()}
                              key={`${image.src}-${index}`}
                              onClick={() => openLightbox(overviewGallery, index)}
                              aria-label={`Open project image ${index + 1}`}
                            >
                              <img src={image.src} alt={image.alt || `${project.title} project image ${index + 1}`} loading="lazy" decoding="async" />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </CaseSection>

                    <CaseSection
                      id="scope"
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
                              key={`${item.title}-${item.description}`}
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
                              <p className="projectCaseSplitText">{wireCopy}</p>
                              <p className="projectCaseSplitText">{wireCopyTwo}</p>
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

                    <CaseSection id="results" index={7} label="Final Results" title="What We Shipped & What Changed" copy={resultsCopy}>
                      {resultCards.length ? (
                        <div className="projectCaseResultGrid">
                          {resultCards.map((card) => (
                            <ResultCard key={`${card.metric}-${card.description}`} metric={card.metric} description={card.description} />
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
