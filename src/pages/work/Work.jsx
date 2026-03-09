import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import WorkCard from "../../components/work/WorkCard";
import Seo from "../../components/seo/Seo";
import usePullToRefresh from "../../hooks/usePullToRefresh";
import { getAllProjects } from "../../lib/projects";
import { BASE_KEYWORDS, SITE_NAME } from "../../lib/site";
import "./work.css";

const DRAG_THRESHOLD = 50;
const FEATURED_COUNT = 5;
const MOBILE_BREAKPOINT = 640;
const MOBILE_GRID_BREAKPOINT = 767;
const DESKTOP_INITIAL_VISIBLE_COUNT = 5;
const MOBILE_INITIAL_VISIBLE_COUNT = 4;
const LOAD_MORE_STEP = 3;

function isValidProjectDate(date) {
  const d = new Date(date);
  return !Number.isNaN(d.getTime());
}

function sortProjectsNewestFirst(items) {
  return [...items].sort((a, b) => {
    const aHasDate = isValidProjectDate(a?.date);
    const bHasDate = isValidProjectDate(b?.date);

    if (aHasDate && bHasDate) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (aHasDate && !bHasDate) return -1;
    if (!aHasDate && bHasDate) return 1;

    return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, {
      sensitivity: "base",
    });
  });
}

function shuffleProjects(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    width="18" height="18">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    width="18" height="18">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function Work() {
  const navigate = useNavigate();
  const orderedProjects = useMemo(
    () => sortProjectsNewestFirst(getAllProjects()),
    []
  );
  const featuredProjects = useMemo(
    () => shuffleProjects(orderedProjects).slice(0, FEATURED_COUNT),
    [orderedProjects]
  );
  const totalFeatured = featuredProjects.length;

  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [loadMoreClicks, setLoadMoreClicks] = useState(0);
  const [vw, setVw] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const startX = useRef(0);
  const dragDistanceRef = useRef(0);
  const autoplayRef = useRef(null);
  const isDraggingRef = useRef(false);
  const scrollRootRef = useRef(null);
  const motionScopeRef = useRef(null);

  usePullToRefresh(scrollRootRef);

  const isMobile = vw <= 640;
  const isTablet = vw > 640 && vw <= 980;

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const root = scrollRootRef.current;
    const scope = motionScopeRef.current;
    if (!root || !scope) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(scope.querySelectorAll(".workReveal"));

    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add("is-inview"));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        });
      },
      {
        root,
        threshold: 0.22,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    targets.forEach((el) => {
      if (!el.classList.contains("is-inview")) io.observe(el);
    });

    return () => io.disconnect();
  }, [loadMoreClicks, orderedProjects.length, totalFeatured]);

  useEffect(() => {
    const root = scrollRootRef.current;
    const scope = motionScopeRef.current;
    if (!root || !scope) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;
    const mobileMotionQuery = window.matchMedia("(max-width: 768px)");

    const parallaxCards = Array.from(scope.querySelectorAll(".workGridCard.workParallax"));
    if (!parallaxCards.length) return undefined;

    let rafId = 0;

    const update = () => {
      const minimizeMotion = mobileMotionQuery.matches;
      const rootRect = root.getBoundingClientRect();
      const viewportCenter = rootRect.top + rootRect.height / 2;

      parallaxCards.forEach((card) => {
        if (minimizeMotion) {
          card.style.setProperty("--work-parallax-y", "0px");
          return;
        }

        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const normalizedDistance = (cardCenter - viewportCenter) / rootRect.height;
        const offsetY = Math.max(-10, Math.min(10, normalizedDistance * -18));
        card.style.setProperty("--work-parallax-y", `${offsetY.toFixed(2)}px`);
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
      parallaxCards.forEach((card) => card.style.removeProperty("--work-parallax-y"));
    };
  }, [loadMoreClicks, orderedProjects.length]);

  const goTo = useCallback((idx) => {
    if (!totalFeatured) return;
    setCurrent(((idx % totalFeatured) + totalFeatured) % totalFeatured);
  }, [totalFeatured]);

  const next = useCallback(
    () => setCurrent((p) => (totalFeatured ? (p + 1) % totalFeatured : 0)),
    [totalFeatured]
  );

  const prev = useCallback(
    () => setCurrent((p) => (totalFeatured ? (p - 1 + totalFeatured) % totalFeatured : 0)),
    [totalFeatured]
  );

  const stopAutoplay = useCallback(() => clearInterval(autoplayRef.current), []);

  const startAutoplay = useCallback(() => {
    clearInterval(autoplayRef.current);
    if (totalFeatured < 2) return;
    autoplayRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % totalFeatured);
    }, 2200);
  }, [totalFeatured]);

  useEffect(() => {
    startAutoplay();
    return () => clearInterval(autoplayRef.current);
  }, [startAutoplay]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") { next(); stopAutoplay(); }
      if (e.key === "ArrowLeft") { prev(); stopAutoplay(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, stopAutoplay]);

  const onPointerDown = (e) => {
    stopAutoplay();
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    setIsDragging(true);
    startX.current = e.clientX;
    setDragOffset(0);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - startX.current;
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(delta));
    setDragOffset(delta);
  };

  const onPointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (dragOffset < -DRAG_THRESHOLD) next();
    else if (dragOffset > DRAG_THRESHOLD) prev();
    setDragOffset(0);
    startAutoplay();
  };

  const getCardStyle = (i) => {
    let offset = i - current;
    if (offset > totalFeatured / 2) offset -= totalFeatured;
    if (offset < -totalFeatured / 2) offset += totalFeatured;

    const abs = Math.abs(offset);
    const sign = Math.sign(offset);
    const nudge = abs <= 1 ? dragOffset * 0.08 : 0;

    let scale;
    let opacity;
    let z;
    let tx;
    let ty;
    let blur;
    let width;
    let maxWidth;

    if (isMobile) {
      switch (abs) {
        case 0:
          scale = 1; opacity = 1; z = 10;
          tx = nudge; ty = 0; blur = 0; break;
        case 1:
          scale = 0.92; opacity = 0.1; z = 4;
          tx = sign * (vw * 0.82) + nudge; ty = 8; blur = 0; break;
        default:
          scale = 0.76; opacity = 0; z = 0;
          tx = sign * vw; ty = 14; blur = 0;
      }
      width = "100%";
      maxWidth = "100%";
    } else if (isTablet) {
      switch (abs) {
        case 0:
          scale = 1; opacity = 1; z = 10;
          tx = nudge; ty = 0; blur = 0; break;
        case 1:
          scale = 0.84; opacity = 0.42; z = 5;
          tx = sign * 250 + nudge; ty = 24; blur = 0; break;
        case 2:
          scale = 0.7; opacity = 0.16; z = 2;
          tx = sign * 390; ty = 34; blur = 0.5; break;
        default:
          scale = 0.45; opacity = 0; z = 0;
          tx = sign * vw; ty = 40; blur = 1;
      }
      width = "70vw";
      maxWidth = "560px";
    } else {
      switch (abs) {
        case 0:
          scale = 1; opacity = 1; z = 10;
          tx = nudge; ty = -8; blur = 0; break;
        case 1:
          scale = 0.84; opacity = 0.54; z = 5;
          tx = sign * 470 + nudge; ty = 30; blur = 0; break;
        case 2:
          scale = 0.72; opacity = 0.24; z = 2;
          tx = sign * 760; ty = 42; blur = 0.8; break;
        default:
          scale = 0.45; opacity = 0; z = 0;
          tx = sign * vw; ty = 70; blur = 2;
      }
      width = "66vw";
      maxWidth = "1180px";
    }

    return {
      position: "absolute",
      top: "50%", left: "50%",
      width, maxWidth,
      transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`,
      opacity,
      zIndex: z,
      filter: blur ? `blur(${blur}px)` : "none",
      transition: isDragging
        ? "opacity 0.2s ease, filter 0.2s ease"
        : "transform 0.35s cubic-bezier(.16,1,.3,1), opacity 0.35s cubic-bezier(.16,1,.3,1), filter 0.35s ease",
      cursor: abs !== 0 ? "pointer" : "default",
      willChange: "transform, opacity",
    };
  };

  const initialVisibleCount =
    vw <= MOBILE_GRID_BREAKPOINT
      ? MOBILE_INITIAL_VISIBLE_COUNT
      : DESKTOP_INITIAL_VISIBLE_COUNT;
  const visibleCount = Math.min(
    initialVisibleCount + loadMoreClicks * LOAD_MORE_STEP,
    orderedProjects.length
  );
  const visibleProjects = orderedProjects.slice(0, visibleCount);
  const canLoadMore = visibleCount < orderedProjects.length;

  const handleLoadMore = () => {
    setLoadMoreClicks((prev) => prev + 1);
  };

  return (
    <div className="page workPage">
      <Seo
        title={`Selected Work & UI/UX Projects | ${SITE_NAME}`}
        description="Explore selected UI/UX, product design, brand, and frontend projects by Bodunde Emmanuel, a digital product designer in Lagos, Nigeria."
        keywords={[
          ...BASE_KEYWORDS,
          "UI UX projects",
          "product design case studies",
          "selected work portfolio",
          "digital product designer portfolio",
        ]}
        canonicalPath="/work"
        imageAlt={`Selected work page preview for ${SITE_NAME}`}
      />

      <div className="hero">
        <div className="cardScroll" ref={scrollRootRef}>
          <section className="workHeroSection--clean">
            <div className="workHeroShell--clean">
              <div className="aboutShell workShell">

                <div className="aboutStickyHeader">
                  <Header active="work" />
                </div>

                <div className="workMotionScope" ref={motionScopeRef}>
                  <div className="workHeroHeadingWrapClean workReveal workReveal--soft">
                    <h1 className="srOnly">Selected Work / Projects</h1>
                    <p className="workHeroTitleClean" aria-hidden="true">
                      Take a look at
                      <br />
                      my past work
                    </p>
                  </div>

                  {totalFeatured > 0 && (
                    <div
                      className="workCarouselStage workReveal workReveal--lift"
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                      onMouseEnter={stopAutoplay}
                      onMouseLeave={startAutoplay}
                      style={{ cursor: isDragging ? "grabbing" : "grab" }}
                    >
                      {featuredProjects.map((project, i) => {
                        let offset = i - current;
                        if (offset > totalFeatured / 2) offset -= totalFeatured;
                        if (offset < -totalFeatured / 2) offset += totalFeatured;
                        const isActive = offset === 0;

                        return (
                          <div
                            key={`${project.id || project.slug || "featured"}-${i}`}
                            className="workCarouselCardWrap"
                            style={getCardStyle(i)}
                            onClick={(event) => {
                              if (dragDistanceRef.current >= 5) {
                                event.preventDefault();
                                event.stopPropagation();
                                dragDistanceRef.current = 0;
                                return;
                              }
                              if (event.target instanceof Element && event.target.closest("a")) return;
                              dragDistanceRef.current = 0;

                              if (isActive && project.slug) {
                                stopAutoplay();
                                navigate(`/work/${project.slug}`);
                                return;
                              }

                              goTo(i);
                              stopAutoplay();
                            }}
                          >
                            <WorkCard
                              project={project}
                              priority={isActive}
                              arrowClickable={isActive}
                              onArrowEnter={stopAutoplay}
                              onArrowLeave={startAutoplay}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isMobile && totalFeatured > 1 ? (
                    <div className="workCarouselNavMobile workReveal workReveal--soft">
                      <button
                        className="workCarouselNavBtn"
                        onClick={() => { prev(); stopAutoplay(); }}
                        aria-label="Previous project"
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        className="workCarouselNavBtn"
                        onClick={() => { next(); stopAutoplay(); }}
                        aria-label="Next project"
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  ) : totalFeatured > 1 ? (
                    <div className="workCarouselDotsClean workReveal workReveal--soft">
                      {featuredProjects.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { goTo(i); stopAutoplay(); }}
                          className={`workCarouselDotClean ${i === current ? "is-active" : ""}`}
                          aria-label={`Go to project ${i + 1}`}
                        />
                      ))}
                    </div>
                  ) : null}

                  <section className="workGridSection" aria-label="All projects">
                    <div className="workGridHead workReveal workReveal--soft">
                      <h2 className="workGridTitle">Projects</h2>
                    </div>

                    <div className="workProjectsGrid">
                      {visibleProjects.map((project, idx) => (
                        <div
                          key={`${project.id || project.slug || "grid"}-${idx}`}
                          className="workGridCard workParallax workReveal workReveal--card"
                          style={{ "--reveal-order": idx }}
                        >
                          <WorkCard project={project} priority={idx < 2} fullCardLink />
                        </div>
                      ))}
                    </div>

                    {canLoadMore && (
                      <div className="workLoadMoreWrap workReveal workReveal--soft">
                        <button
                          type="button"
                          className="workLoadMoreBtn"
                          onClick={handleLoadMore}
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </section>

                  <section className="workFinalCtaSection" aria-label="Start a project">
                    <div className="workFinalCtaCard workReveal workReveal--lift">
                      <h2
                        className="workFinalCtaTitle workReveal workReveal--soft"
                        style={{ "--reveal-order": 0 }}
                      >
                        Have something in mind?
                        <br />
                        Let&apos;s connect.
                      </h2>
                      <p
                        className="workFinalCtaText workReveal workReveal--soft"
                        style={{ "--reveal-order": 1 }}
                      >
                        Tell me about your idea, timeline, and goals. Whether you need a UI/UX
                        designer in Lagos, a product designer in Nigeria, or a remote frontend
                        design partner, I&apos;ll help you shape a clear product direction and bring
                        it to life.
                      </p>
                      <a
                        href="/contact"
                        className="workFinalCtaBtn workReveal workReveal--soft"
                        style={{ "--reveal-order": 2 }}
                      >
                        Start a project
                      </a>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </div>
      </div>
    </div>
  );
}
