import { useEffect, useMemo, useRef, useState } from "react";
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
import CaseStudyLightbox from "./CaseStudyLightbox";
import CaseStudyMediaCarousel from "./CaseStudyMediaCarousel";
import {
  dedupeStrings,
  flattenPortableText,
  formatPublishedDate,
  parseAnimatedMetric,
  renderPortableText,
} from "./case-study-detail-utils.jsx";
import "../../pages/work/ProjectDetails.css";
import "./case-study-detail.css";

const SECTION_LABELS = {
  overview: "Overview",
  scope: "Project Scope",
  research: "Research",
  wireframes: "Wireframes",
  prototype: "Prototype",
  results: "Final Results",
};

function getSectionKicker(sectionItems, sectionId) {
  const index = sectionItems.findIndex((item) => item.id === sectionId);
  if (index < 0) return SECTION_LABELS[sectionId] || "";
  return `${String(index + 1).padStart(2, "0")} - ${SECTION_LABELS[sectionId] || ""}`;
}

function AnimatedMetric({ value, start, className = "" }) {
  const parsedMetric = useMemo(() => parseAnimatedMetric(value), [value]);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start || parsedMetric.value == null) return undefined;

    let frameId = 0;
    let startTime = 0;
    const duration = 1100;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(parsedMetric.value * eased);

      if (progress < 1) frameId = window.requestAnimationFrame(animate);
    };

    setDisplayValue(0);
    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [parsedMetric.value, start]);

  if (parsedMetric.value == null) {
    return <span className={className}>{String(value || "")}</span>;
  }

  const formattedValue =
    parsedMetric.decimals > 0
      ? displayValue.toFixed(parsedMetric.decimals)
      : Math.round(displayValue).toString();

  return (
    <span className={className}>
      {parsedMetric.prefix}
      {formattedValue}
      {parsedMetric.suffix}
    </span>
  );
}

function SvgIcon({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

function ScopeCard({ title, icon, items, order }) {
  if (!Array.isArray(items) || !items.length) return null;

  return (
    <article
      className="cs-scopeCard pd-reveal pd-reveal--card pd-parallax"
      data-pd-depth="0.3"
      style={{ "--pd-motion-order": order }}
    >
      <div className="cs-scopeCardIcon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={`${title}-${item}`}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export default function CaseStudyDetail({ slug }) {
  const [project, setProject] = useState(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [visibleSections, setVisibleSections] = useState(() => new Set());
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const scrollRootRef = useRef(null);
  const motionScopeRef = useRef(null);

  usePullToRefresh(scrollRootRef);

  useEffect(() => {
    let isMounted = true;
    setVisibleSections(new Set());
    setLightboxIndex(-1);

    loadAllProjects({ force: true }).then((loadedProjects) => {
      if (!isMounted) return;

      const safeProjects = Array.isArray(loadedProjects) ? loadedProjects : [];
      const normalizedSlug = String(slug || "").trim().toLowerCase();
      const loadedProject =
        safeProjects.find(
          (item) => item.slug === normalizedSlug || item.id === normalizedSlug
        ) || null;

      setProject(loadedProject);
      setIsProjectLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const caseStudy = project?.caseStudy || {};
  const heroPills = useMemo(
    () => dedupeStrings([...(caseStudy.role || []), ...(caseStudy.tools || [])]).slice(0, 5),
    [caseStudy.role, caseStudy.tools]
  );

  const researchImages = useMemo(
    () => (Array.isArray(caseStudy.researchImages) ? caseStudy.researchImages : []).map((item, index) => ({ ...item, key: `research-${index}` })),
    [caseStudy.researchImages]
  );
  const wireframeImages = useMemo(
    () => (Array.isArray(caseStudy.wireframeImages) ? caseStudy.wireframeImages : []).map((item, index) => ({ ...item, key: `wireframe-${index}` })),
    [caseStudy.wireframeImages]
  );
  const prototypeImages = useMemo(
    () => (Array.isArray(caseStudy.prototypeImages) ? caseStudy.prototypeImages : []).map((item, index) => ({ ...item, key: `prototype-${index}` })),
    [caseStudy.prototypeImages]
  );
  const finalGallery = useMemo(
    () => (Array.isArray(caseStudy.finalGallery) ? caseStudy.finalGallery : []).map((item, index) => ({ ...item, key: `final-${index}` })),
    [caseStudy.finalGallery]
  );

  const allLightboxItems = useMemo(() => {
    const items = caseStudy.heroImage
      ? [{
          key: "hero-image",
          src: caseStudy.heroImage,
          alt: `${project?.title || "Case study"} hero image`,
          caption: project?.title || "",
        }]
      : [];
    return [...items, ...researchImages, ...wireframeImages, ...prototypeImages, ...finalGallery].filter((item) => item?.src);
  }, [caseStudy.heroImage, finalGallery, project?.title, prototypeImages, researchImages, wireframeImages]);

  const overviewBlocks =
    Array.isArray(caseStudy.overviewBlocks) && caseStudy.overviewBlocks.length
      ? caseStudy.overviewBlocks
      : [{
          _key: "fallback-overview",
          _type: "block",
          style: "normal",
          children: [{ _key: "fallback-overview-child", _type: "span", text: caseStudy.description || project?.description || "" }],
        }];

  const sectionItems = useMemo(
    () =>
      [
        { id: "overview", show: true },
        { id: "scope", show: Boolean((caseStudy.role || []).length || (caseStudy.tools || []).length || (caseStudy.timeline || []).length) },
        { id: "research", show: researchImages.length > 0 },
        { id: "wireframes", show: wireframeImages.length > 0 },
        { id: "prototype", show: prototypeImages.length > 0 },
        { id: "results", show: Boolean((caseStudy.results || []).length || finalGallery.length) },
      ].filter((item) => item.show),
    [caseStudy.results, caseStudy.role, caseStudy.timeline, caseStudy.tools, finalGallery.length, prototypeImages.length, researchImages.length, wireframeImages.length]
  );

  useEffect(() => {
    if (!project) return undefined;

    const root = scrollRootRef.current;
    const scope = motionScopeRef.current;
    if (!root || !scope) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(scope.querySelectorAll(".pd-reveal"));

    if (prefersReducedMotion) {
      targets.forEach((target) => target.classList.add("is-inview"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      { root, threshold: 0.18, rootMargin: "0px 0px -12% 0px" }
    );

    targets.forEach((target) => {
      if (!target.classList.contains("is-inview")) observer.observe(target);
    });

    return () => observer.disconnect();
  }, [project]);

  useEffect(() => {
    if (!project) return undefined;

    const root = scrollRootRef.current;
    const scope = motionScopeRef.current;
    if (!root || !scope) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const mobileMotionQuery = window.matchMedia("(max-width: 860px)");
    const targets = Array.from(scope.querySelectorAll(".pd-parallax"));
    if (!targets.length) return undefined;

    let rafId = 0;
    const update = () => {
      const minimizeMotion = mobileMotionQuery.matches;
      const rootRect = root.getBoundingClientRect();
      const viewportCenter = rootRect.top + rootRect.height / 2;

      targets.forEach((target) => {
        if (minimizeMotion) {
          target.style.setProperty("--pd-parallax-y", "0px");
          target.style.setProperty("--pd-parallax-rotate", "0deg");
          target.style.setProperty("--pd-parallax-scale", "1");
          return;
        }

        const rect = target.getBoundingClientRect();
        const targetCenter = rect.top + rect.height / 2;
        const normalizedDistance = (targetCenter - viewportCenter) / rootRect.height;
        const depth = Number.parseFloat(target.dataset.pdDepth || "1");
        const clampedDistance = Math.max(-1.2, Math.min(1.2, normalizedDistance));
        const offsetY = clampedDistance * -24 * depth;
        const rotate = clampedDistance * -0.9 * Math.min(depth, 1.2);
        const scale = 1 + (1 - Math.min(Math.abs(clampedDistance), 1)) * 0.012 * Math.min(depth, 1.1);

        target.style.setProperty("--pd-parallax-y", `${offsetY.toFixed(2)}px`);
        target.style.setProperty("--pd-parallax-rotate", `${rotate.toFixed(2)}deg`);
        target.style.setProperty("--pd-parallax-scale", scale.toFixed(4));
      });

      rafId = 0;
    };

    const queueUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    root.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    queueUpdate();

    return () => {
      root.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [project]);

  useEffect(() => {
    if (!project) return undefined;

    const root = scrollRootRef.current;
    if (!root || !sectionItems.length) return undefined;

    const updateActiveSection = () => {
      const rootRect = root.getBoundingClientRect();
      let currentSection = sectionItems[0]?.id || "overview";

      sectionItems.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.top - rootRect.top <= rootRect.height * 0.38) currentSection = id;
      });

      setActiveSection(currentSection);
    };

    root.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();
    return () => root.removeEventListener("scroll", updateActiveSection);
  }, [project, sectionItems]);

  useEffect(() => {
    if (!project) return undefined;

    const root = scrollRootRef.current;
    if (!root || !sectionItems.length) return undefined;

    const observedSections = sectionItems.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          setVisibleSections((previous) => {
            if (previous.has(id)) return previous;
            const next = new Set(previous);
            next.add(id);
            return next;
          });
        });
      },
      { root, threshold: 0.2, rootMargin: "0px 0px -16% 0px" }
    );

    observedSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [project, sectionItems]);

  const openLightbox = (key) => {
    const nextIndex = allLightboxItems.findIndex((item) => item.key === key);
    if (nextIndex >= 0) setLightboxIndex(nextIndex);
  };

  const actionButtons = [
    caseStudy.liveUrl ? { key: "live", label: "Visit Website", href: caseStudy.liveUrl, className: "cs-btn cs-btn--primary", icon: <SvgIcon><path d="M7 17 17 7" /><path d="M9 7h8v8" /></SvgIcon> } : null,
    caseStudy.prototypeUrl ? { key: "prototype", label: "View Prototype", href: caseStudy.prototypeUrl, className: "cs-btn cs-btn--ghost", icon: <SvgIcon><path d="M8 5v14l11-7-11-7Z" /></SvgIcon> } : null,
    caseStudy.twitterUrl ? { key: "x", label: "View on X", href: caseStudy.twitterUrl, className: "cs-btn cs-btn--ghost", icon: <SvgIcon><path d="M4 4 20 20" /><path d="M20 4 4 20" /></SvgIcon> } : null,
    caseStudy.whatsappUrl ? { key: "whatsapp", label: "Broken link? WhatsApp me", href: caseStudy.whatsappUrl, className: "cs-btn cs-btn--warning", icon: <SvgIcon><path d="M6.8 19.2 7.7 16A7 7 0 1 1 19 9.7a7 7 0 0 1-10.5 6.1l-1.7.5Z" /><path d="m9.5 8.8.7 1.6c.1.2 0 .5-.2.7l-.4.5a.7.7 0 0 0 0 .8 8.3 8.3 0 0 0 2.1 2.1.7.7 0 0 0 .8 0l.5-.4c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.5.2.8l-.4.8a1.5 1.5 0 0 1-1.7.8c-1.3-.3-2.7-1.1-4.1-2.5-1.4-1.4-2.2-2.8-2.5-4.1a1.5 1.5 0 0 1 .8-1.7l.8-.4c.3-.2.7 0 .8.3Z" /></SvgIcon> } : null,
  ].filter(Boolean);

  const statusLabel = String(caseStudy.status || "Concept");
  const statusClassName = statusLabel === "Live" ? "is-live" : statusLabel === "In Progress" ? "is-progress" : "is-concept";

  if (!project && isProjectLoading) {
    return (
      <main className="page projectDetailsPage"><section className="hero aboutCard"><div className="cardScroll" ref={scrollRootRef}><section className="aboutHeroShell"><div className="aboutShell"><Header active="work" /></div></section><section className="projectDetailsSection"><div className="projectDetailsInner" /></section><Footer /></div></section></main>
    );
  }

  if (!project) {
    return (
      <main className="page projectDetailsPage">
        <Seo title={`Case Study Not Found | ${SITE_NAME}`} description={`The requested case study could not be found on the ${SITE_NAME} portfolio.`} keywords={[...BASE_KEYWORDS, "case study", "portfolio project"]} canonicalPath={`/work/${slug || ""}`} robots="noindex, nofollow" imageAlt={`Case study not found page preview for ${SITE_NAME}`} />
        <section className="hero aboutCard"><div className="cardScroll" ref={scrollRootRef}><section className="aboutHeroShell"><div className="aboutShell"><Header active="work" /></div></section><section className="projectDetailsSection"><div className="projectDetailsInner"><article className="projectEmptyState"><h1>Case study not found</h1><p>This project slug does not exist in the current CMS data.</p><Link className="projectBackBtn" to="/work">Back to Work</Link></article></div></section><Footer /></div></section>
      </main>
    );
  }

  return (
    <main className="page projectDetailsPage">
      <Seo title={`${project.title} Case Study | ${SITE_NAME}`} description={buildProjectSeoDescription(project)} keywords={buildProjectSeoKeywords(project)} canonicalPath={`/work/${project.slug}`} type="article" imageAlt={`${project.title} case study preview for ${SITE_NAME}`} />

      <section className="hero aboutCard" aria-label="Case study page">
        <div className="cardScroll" ref={scrollRootRef}>
          <section className="aboutHeroShell" id="top"><div className="aboutShell"><Header active="work" /></div></section>
          <section className="projectDetailsSection" aria-label="Case study body">
            <div className="projectDetailsInner">
              <div className="projectDetailsToolbar"><Link className="projectBackBtn" to="/work">Back to Work</Link></div>
              <div className="pd-motion-scope" ref={motionScopeRef}>
                <article className="projectCase caseStudyPage">
                  <section className="cs-hero pd-reveal pd-reveal--hero">
                    <div className="cs-heroGrid">
                      <div className="cs-heroCopy pd-parallax" data-pd-depth="0.45">
                        <div className="cs-heroMeta"><span className="cs-categoryTag">{caseStudy.category || project.category || "Case Study"}</span></div>
                        <h1 className="cs-heroTitle">{project.title}</h1>
                        {caseStudy.brandLogo ? <div className="cs-brandRow"><div className="cs-brandLogoWrap"><img src={caseStudy.brandLogo} alt={`${project.title} brand logo`} loading="lazy" decoding="async" /></div></div> : null}
                        <p className="cs-heroDescription">{caseStudy.description || project.description}</p>
                        {actionButtons.length ? <div className="cs-actions">{actionButtons.map((button) => <a key={button.key} href={button.href} className={button.className} target="_blank" rel="noreferrer">{button.icon}<span>{button.label}</span></a>)}</div> : null}
                        {heroPills.length ? <div className="cs-chipRow">{heroPills.map((item) => <span className="cs-chip" key={item}>{item}</span>)}</div> : null}
                        <div className="cs-metaGrid">
                          <div className="cs-metaCell"><p className="cs-metaLabel">Category</p><p className="cs-metaValue">{caseStudy.category || project.category || "Case Study"}</p></div>
                          <div className="cs-metaCell"><p className="cs-metaLabel">Published</p><p className="cs-metaValue">{formatPublishedDate(caseStudy.publishedDate) || "Recent"}</p></div>
                          <div className="cs-metaCell"><p className="cs-metaLabel">Status</p><p className={`cs-metaValue cs-statusValue ${statusClassName}`}><span className="cs-statusDot" aria-hidden="true" />{statusLabel}</p></div>
                        </div>
                      </div>
                      <div className="cs-heroVisualWrap pd-parallax" data-pd-depth="1.05">
                        <button type="button" className="cs-heroVisual" onClick={() => openLightbox("hero-image")} aria-label="Open hero image">
                          {caseStudy.heroImage ? <img src={caseStudy.heroImage} alt={`${project.title} hero`} loading="eager" fetchPriority="high" decoding="async" /> : <div className="cs-imageFallback" aria-hidden="true" />}
                        </button>
                      </div>
                    </div>
                  </section>

                  <div className="cs-layout">
                    <aside className="cs-sideNav" aria-label="Case study navigation">
                      <ul className="cs-sideNavList">
                        {sectionItems.map((section, index) => (
                          <li key={section.id} className="cs-sideNavItem">
                            <button type="button" className={`cs-sideNavLink ${activeSection === section.id ? "is-active" : ""}`} onClick={() => {
                              const root = scrollRootRef.current;
                              const target = document.getElementById(section.id);
                              if (!root || !target) return;
                              const rootRect = root.getBoundingClientRect();
                              const targetRect = target.getBoundingClientRect();
                              root.scrollTo({ top: root.scrollTop + (targetRect.top - rootRect.top) - 28, behavior: "smooth" });
                            }}>
                              <span className="cs-sideNavIcon">{index + 1}</span>
                              <span>{SECTION_LABELS[section.id]}</span>
                            </button>
                            {index < sectionItems.length - 1 ? <span className={`cs-sideNavDot ${sectionItems.findIndex((item) => item.id === activeSection) >= index ? "is-lit" : ""}`} aria-hidden="true" /> : null}
                          </li>
                        ))}
                      </ul>
                    </aside>

                    <div className="cs-content">
                      <section id="overview" className="cs-section pd-reveal pd-reveal--soft">
                        <p className="cs-sectionLabel">{getSectionKicker(sectionItems, "overview")}</p>
                        <h2 className="cs-sectionTitle">About the Project</h2>
                        <div className="cs-richText">{renderPortableText(overviewBlocks)}</div>
                        {(caseStudy.stats || []).length ? <div className="cs-statsGrid">{caseStudy.stats.map((item) => <article className="cs-statCard" key={`${item.label}-${item.value}`}><AnimatedMetric className="cs-statValue" value={item.value} start={visibleSections.has("overview")} /><p className="cs-statLabel">{item.label}</p></article>)}</div> : null}
                      </section>

                      {sectionItems.some((item) => item.id === "scope") ? <section id="scope" className="cs-section"><div className="pd-reveal pd-reveal--soft"><p className="cs-sectionLabel">{getSectionKicker(sectionItems, "scope")}</p><h2 className="cs-sectionTitle">Scope &amp; Setup</h2><p className="cs-sectionIntro">A concise breakdown of the role, tools, and timeline behind the work.</p></div><div className="cs-scopeGrid"><ScopeCard title="Role" icon={<SvgIcon><circle cx="12" cy="8" r="3.5" /><path d="M5 19c1.8-3 4.1-4.5 7-4.5s5.2 1.5 7 4.5" /></SvgIcon>} items={caseStudy.role} order={0} /><ScopeCard title="Tools" icon={<SvgIcon><path d="M14.5 5.5a3.2 3.2 0 0 0 4.2 4.2l-8.5 8.5a2 2 0 1 1-2.8-2.8l8.5-8.5Z" /><path d="m13 7 4 4" /></SvgIcon>} items={caseStudy.tools} order={1} /><ScopeCard title="Timeline" icon={<SvgIcon><path d="M6 3.5v4" /><path d="M18 3.5v4" /><rect x="4" y="5.5" width="16" height="14" rx="2" /><path d="M4 10.5h16" /></SvgIcon>} items={caseStudy.timeline} order={2} /></div></section> : null}
                      {researchImages.length ? <section id="research" className="cs-section"><div className="pd-reveal pd-reveal--soft"><p className="cs-sectionLabel">{getSectionKicker(sectionItems, "research")}</p><h2 className="cs-sectionTitle">Research &amp; Exploration</h2><p className="cs-sectionIntro">References, research boards, and visual exploration that informed the direction of the project.</p></div><div className="pd-reveal pd-reveal--panel"><CaseStudyMediaCarousel title="research" images={researchImages} onOpen={openLightbox} /></div></section> : null}
                      {wireframeImages.length ? <section id="wireframes" className="cs-section"><div className="pd-reveal pd-reveal--soft"><p className="cs-sectionLabel">{getSectionKicker(sectionItems, "wireframes")}</p><h2 className="cs-sectionTitle">Mapping the Structure</h2><p className="cs-sectionIntro">Low-fidelity structure and core screen studies used to shape the final layout system.</p></div><div className="pd-reveal pd-reveal--panel"><CaseStudyMediaCarousel title="wireframe" images={wireframeImages} onOpen={openLightbox} /></div></section> : null}
                      {prototypeImages.length ? <section id="prototype" className="cs-section"><div className="pd-reveal pd-reveal--soft"><p className="cs-sectionLabel">{getSectionKicker(sectionItems, "prototype")}</p><h2 className="cs-sectionTitle">Bringing it to Life</h2><p className="cs-sectionIntro">High-fidelity previews and interactive flows used to validate motion, hierarchy, and product feel.</p></div><div className="pd-reveal pd-reveal--panel"><CaseStudyMediaCarousel title="prototype" images={prototypeImages} onOpen={openLightbox} /></div></section> : null}
                      {(caseStudy.results || []).length || finalGallery.length ? <section id="results" className="cs-section"><div className="pd-reveal pd-reveal--soft"><p className="cs-sectionLabel">{getSectionKicker(sectionItems, "results")}</p><h2 className="cs-sectionTitle">What Changed</h2><p className="cs-sectionIntro">{flattenPortableText(overviewBlocks) || "The outcome of the work, expressed through measurable results and final visuals."}</p></div>{(caseStudy.results || []).length ? <div className="cs-resultsGrid">{caseStudy.results.map((item, index) => <article className="cs-resultCard pd-reveal pd-reveal--card" key={`${item.metric}-${index}`} style={{ "--pd-motion-order": index }}><AnimatedMetric className="cs-resultMetric" value={item.metric} start={visibleSections.has("results")} /><p className="cs-resultDescription">{item.description}</p></article>)}</div> : null}{finalGallery.length ? <div className="pd-reveal pd-reveal--panel"><CaseStudyMediaCarousel title="final gallery" images={finalGallery} onOpen={openLightbox} /></div> : null}</section> : null}
                    </div>
                  </div>

                  <section className="cs-footerCta pd-reveal pd-reveal--soft"><h2>Want to work together?</h2><p>Have a project in mind? Let&apos;s talk about it.</p><Link to="/contact" className="cs-btn cs-btn--primary"><SvgIcon><path d="M7 17 17 7" /><path d="M9 7h8v8" /></SvgIcon><span>Get in touch</span></Link></section>
                </article>
              </div>
            </div>
          </section>
          <Footer />
        </div>

        <CaseStudyLightbox
          items={allLightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onPrev={() => setLightboxIndex((previous) => previous <= 0 ? allLightboxItems.length - 1 : previous - 1)}
          onNext={() => setLightboxIndex((previous) => previous >= allLightboxItems.length - 1 ? 0 : previous + 1)}
        />
      </section>
    </main>
  );
}
