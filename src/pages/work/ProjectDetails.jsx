import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import WorkCard from "../../components/work/WorkCard";
import Seo from "../../components/seo/Seo";
import usePullToRefresh from "../../hooks/usePullToRefresh";
import {
  getInitialProjectBySlug,
  getInitialProjects,
  loadAllProjects,
  loadProjectBySlug,
} from "../../lib/projectData";
import {
  BASE_KEYWORDS,
  SITE_NAME,
  buildProjectSeoDescription,
  buildProjectSeoKeywords,
} from "../../lib/site";
import "./ProjectDetails.css";

function OIcon({ children }) {
  return <div className="pd-oi">{children}</div>;
}

function Cnum({ n }) {
  return <div className="pd-cn">{n}</div>;
}

function OneImg({ src, alt }) {
  if (!src) return null;
  return (
    <div className="pd-img pd-reveal pd-reveal--panel pd-parallax" data-pd-depth="0.9">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}

function PersonaAvatar({ persona }) {
  if (persona?.image) {
    return <img src={persona.image} alt={persona.name} loading="lazy" decoding="async" />;
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="44" height="44" aria-hidden="true">
      <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" />
    </svg>
  );
}

export default function ProjectDetails() {
  const { slug } = useParams();
  return <ProjectDetailsContent key={slug || "project"} slug={slug || ""} />;
}

function ProjectDetailsContent({ slug }) {
  const fallbackProject = getInitialProjectBySlug(slug);
  const [project, setProject] = useState(fallbackProject || null);
  const [projects, setProjects] = useState(() => getInitialProjects());
  const [isProjectLoading, setIsProjectLoading] = useState(() => !fallbackProject);
  const [personaIndex, setPersonaIndex] = useState(0);
  const scrollRootRef = useRef(null);
  const motionScopeRef = useRef(null);

  usePullToRefresh(scrollRootRef);

  useEffect(() => {
    let isMounted = true;

    Promise.all([loadAllProjects(), loadProjectBySlug(slug)]).then(
      ([loadedProjects, loadedProject]) => {
        if (!isMounted) return;
        if (Array.isArray(loadedProjects) && loadedProjects.length) {
          setProjects(loadedProjects);
        }
        setProject(loadedProject || fallbackProject || null);
        setIsProjectLoading(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [fallbackProject, slug]);

  useEffect(() => {
    if (!project) return undefined;

    const root = scrollRootRef.current;
    const scope = motionScopeRef.current;
    if (!root || !scope) return undefined;

    const targets = Array.from(scope.querySelectorAll(".pd-reveal"));
    if (!targets.length) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      {
        root,
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      }
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

    const targets = Array.from(scope.querySelectorAll(".pd-parallax"));
    if (!targets.length) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;
    const mobileMotionQuery = window.matchMedia("(max-width: 768px)");

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
        const offsetY = clampedDistance * -28 * depth;
        const rotate = clampedDistance * -1.2 * Math.min(depth, 1.2);
        const scale = 1 + (1 - Math.min(Math.abs(clampedDistance), 1)) * 0.016 * Math.min(depth, 1.2);

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

      targets.forEach((target) => {
        target.style.removeProperty("--pd-parallax-y");
        target.style.removeProperty("--pd-parallax-rotate");
        target.style.removeProperty("--pd-parallax-scale");
      });
    };
  }, [project]);

  if (!project && isProjectLoading) {
    return (
      <main className="page projectDetailsPage">
        <section className="hero aboutCard" aria-label="Project details page">
          <div className="cardScroll" ref={scrollRootRef}>
            <section className="aboutHeroShell" id="top">
              <div className="aboutShell">
                <div className="aboutStickyHeader">
                  <Header active="work" />
                </div>
              </div>
            </section>

            <section className="projectDetailsSection" aria-label="Project details body">
              <div className="projectDetailsInner" />
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
          title={`Project Not Found | ${SITE_NAME}`}
          description={`The requested project case study could not be found on the ${SITE_NAME} portfolio.`}
          keywords={[...BASE_KEYWORDS, "project case study"]}
          canonicalPath={`/work/${slug || ""}`}
          robots="noindex, nofollow"
          imageAlt={`Project not found page preview for ${SITE_NAME}`}
        />

        <section className="hero aboutCard" aria-label="Project details page">
          <div className="cardScroll" ref={scrollRootRef}>
            <section className="aboutHeroShell" id="top">
              <div className="aboutShell">
                <div className="aboutStickyHeader">
                  <Header active="work" />
                </div>
              </div>
            </section>

            <section className="projectDetailsSection" aria-label="Project details body">
              <div className="projectDetailsInner">
                <article className="projectEmptyState">
                  <h1>Project not found</h1>
                  <p>
                    This project slug does not exist yet. Add it in Sanity or in
                    {" "}
                    <code>src/content/projects</code>
                    {" "}
                    and it will render automatically.
                  </p>
                  <Link className="projectBackBtn" to="/work">
                    Back to Work
                  </Link>
                </article>
              </div>
            </section>

            <Footer />
          </div>
        </section>
      </main>
    );
  }

  const d = project.caseStudy;
  const activePersona = d.personas[personaIndex] || d.personas[0];
  const moreWorks = projects
    .filter((item) => item.slug !== project.slug && item.id !== project.id)
    .slice(0, 3);
  const seoDescription = buildProjectSeoDescription(project);
  const seoKeywords = buildProjectSeoKeywords(project);

  return (
    <main className="page projectDetailsPage">
      <Seo
        title={`${project.title} Case Study | UI/UX Project by Bodunde Emmanuel | ${SITE_NAME}`}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalPath={`/work/${project.slug}`}
        type="article"
      />

      <section className="hero aboutCard" aria-label="Project details page">
        <div className="cardScroll" ref={scrollRootRef}>
          <section className="aboutHeroShell" id="top">
            <div className="aboutShell">
              <div className="aboutStickyHeader">
                <Header active="work" />
              </div>
            </div>
          </section>

          <section className="projectDetailsSection" aria-label="Project details body">
            <div className="projectDetailsInner">
              <div className="projectDetailsToolbar">
                <Link className="projectBackBtn" to="/work">
                  Back to Work
                </Link>
              </div>

              <div className="pd-motion-scope" ref={motionScopeRef}>
                <article className="projectCase">
                  <div className="pd-root">
                  <section className="pd-hero pd-reveal pd-reveal--hero">
                    <div className="pd-hero-dots" />
                    <div className="pd-hero-left pd-parallax" data-pd-depth="0.55">
                      <div className="pd-brand">
                        <div className="pd-brand-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                            <path d="M12 2C8.5 5.5 7 9 9 12c.8 1.3 2.5 1.8 2.5 3.5S9.5 18 9.5 18S14 17 14 13c0-1.8-1.8-2.8-1.8-4.5C13.5 10 15 12 14 15c1.8-1.8 2.8-4.5.8-7.5 0 1.8-.8 2.8-2.5 2.8C13 8.3 13 5.5 12 2z" />
                          </svg>
                        </div>
                        <span className="pd-brand-name">{d.brandName}</span>
                      </div>

                      <h1 className="pd-h1">{project.title}</h1>

                     <div className="pd-hero-meta">
  <div>
    <p className="pd-meta-lbl">Region</p>
    <p className="pd-meta-val">{d.region}</p>
  </div>
  <div>
    <p className="pd-meta-lbl">Year</p>
    <p className="pd-meta-val">{d.year}</p>
  </div>
</div>

{/* ── View Live Project button — only renders if liveProjectUrl exists ── */}
{project.liveProjectUrl && (
  
    href={project.liveProjectUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="pd-live-btn"
  >
    View Live Project
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  </a>
)}
                    </div>

                    <div className="pd-hero-right pd-parallax" data-pd-depth="1.1">
                      {d.heroImage ? (
                        <img
                          src={d.heroImage}
                          alt={`${project.title} UI UX case study hero by Bodunde Emmanuel`}
                          className="pd-hero-img"
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                        />
                      ) : (
                        <div className="projectImageFallback" aria-hidden="true" />
                      )}
                    </div>
                  </section>

                  <section className="pd-cs" id="overview">
                    <div className="pd-cg pd-reveal pd-reveal--soft">
                      <div className="pd-lc">
                        <span className="pd-ey">The project itself :</span>
                        <h2 className="pd-sh2">Project Overview</h2>
                      </div>

                      <div>
                        <p className="pd-intro">{d.overviewIntro}</p>
                        <hr className="pd-div" />

                        <div className="pd-detail-grid">
                          <div>
                            <OIcon>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <circle cx="12" cy="16" r=".5" fill="currentColor" />
                              </svg>
                            </OIcon>
                            <p className="pd-dt">Problem:</p>
                            <p className="pd-dd">{project.problem}</p>
                          </div>

                          <div>
                            <OIcon>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="5" />
                                <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                              </svg>
                            </OIcon>
                            <p className="pd-dt">Goal:</p>
                            <p className="pd-dd">{d.goal}</p>
                          </div>

                          <div>
                            <OIcon>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </OIcon>
                            <p className="pd-dt">My role:</p>
                            <p className="pd-dd">{d.myRole}</p>
                          </div>

                          <div>
                            <OIcon>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                              </svg>
                            </OIcon>
                            <p className="pd-dt">Responsibilities:</p>
                            <ul className="pd-resp">
                              {d.responsibilities.map((item, index) => (
                                <li key={`${project.id}-responsibility-${index}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="pd-cs pd-gray" id="research">
                    <div className="pd-cg pd-reveal pd-reveal--soft">
                      <div className="pd-lc">
                        <span className="pd-ey">All about the user :</span>
                        <h2 className="pd-sh2">User Research</h2>
                      </div>
                      <p className="pd-intro">{d.researchIntro}</p>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">Pain Points</p>
                      </div>

                      <div className="pd-pain-row">
                        {d.painPoints.map((item, index) => (
                          <div
                            className="pd-pain-col pd-reveal pd-reveal--card pd-parallax"
                            data-pd-depth="0.5"
                            style={{ "--pd-motion-order": index }}
                            key={`${project.id}-pain-${index}`}
                          >
                            <Cnum n={index + 1} />
                            <h5 className="pd-ptitle">{item.title}</h5>
                            <p className="pd-ptext">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">User Personas</p>
                        <p className="pd-sdesc">
                          Personas were selected by conducting user research and identifying common pain points that block the user from getting what they need from the product.
                        </p>
                      </div>

                      <div>
                        {activePersona ? (
                          <div className="pd-persona pd-reveal pd-reveal--panel pd-parallax" data-pd-depth="0.8">
                            <div className="pd-p-left">
                              <div className="pd-p-av">
                                <PersonaAvatar persona={activePersona} />
                              </div>
                              <div className="pd-p-bar" />
                              <p className="pd-p-name">{activePersona.name}</p>

                              {[
                                ["Age", "age"],
                                ["Gender", "gender"],
                                ["Occupation", "occupation"],
                                ["Location", "location"],
                                ["Education", "education"],
                              ].map(([label, key]) => (
                                <div className="pd-p-row" key={key}>
                                  <span className="pd-p-lbl">{label}:</span>
                                  <span className="pd-p-val">{activePersona[key]}</span>
                                </div>
                              ))}
                            </div>

                            <div className="pd-p-right">
                              <p className="pd-p-quote">{activePersona.quote}</p>
                              <p className="pd-p-bio">{activePersona.bio}</p>

                              <div className="pd-p-gf">
                                {["goals", "frustrations"].map((field) => (
                                  <div key={field}>
                                    <p className="pd-p-gft">
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        width="13"
                                        height="13"
                                      >
                                        <polyline points="6 9 12 15 18 9" />
                                      </svg>
                                      {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </p>
                                    <ul>
                                      {activePersona[field].map((item, index) => (
                                        <li key={`${project.id}-${field}-${index}`}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div className="pd-tabs pd-reveal pd-reveal--soft" aria-label="Persona tabs">
                          {d.personas.map((persona, index) => (
                            <button
                              key={`${project.id}-persona-${index}`}
                              type="button"
                              className={`pd-tab${index === personaIndex ? " on" : ""}`}
                              onClick={() => setPersonaIndex(index)}
                              aria-label={`Show persona ${persona.name}`}
                              aria-pressed={index === personaIndex}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3 12h4l3-9 4 18 3-9h4" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">User Journey Map</p>
                        <p className="pd-sdesc">
                          It is the series of experiences the user has as they achieve a specific goal.
                        </p>
                      </div>

                      <div>
                        <p className="pd-goal-lbl">Goal</p>
                        <p className="pd-goal-txt">{d.journeyGoal}</p>
                        <OneImg src={d.journeyMapImage} alt={`${project.title} journey map`} />
                      </div>
                    </div>
                  </section>

                  <section className="pd-cs" id="wireframes">
                    <div className="pd-cg pd-reveal pd-reveal--soft">
                      <div className="pd-lc">
                        <span className="pd-ey">The project schematically :</span>
                        <h2 className="pd-sh2">Starting the Design</h2>
                      </div>
                      <p className="pd-intro">{d.wireframesIntro}</p>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                            <rect x="1" y="17" width="6" height="4" rx="1" />
                            <rect x="9" y="17" width="6" height="4" rx="1" />
                            <rect x="17" y="17" width="6" height="4" rx="1" />
                            <path d="M12 7v4M4 17v-4h16v4" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">Appmap</p>
                        <p className="pd-sdesc">
                          It&apos;s a structured scheme that outlines the pages and content hierarchy of the app.
                        </p>
                      </div>

                      <div>
                        <p className="pd-sub-intro">{d.appmapDesc}</p>
                        <OneImg src={d.appmapImage} alt={`${project.title} app map`} />
                      </div>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18M9 21V9" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">Digital Wireframes</p>
                        <p className="pd-sdesc">More clear wireframes translated into a digital form.</p>
                      </div>

                      <div>
                        <p className="pd-sub-intro">{d.digitalWireDesc}</p>
                        <OneImg src={d.digitalWireImage} alt={`${project.title} digital wireframes`} />
                      </div>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">Usability Studies</p>
                        <p className="pd-sdesc">
                          This is an examination of users and their needs, which adds realistic context to the design process.
                        </p>
                      </div>

                      <div>
                        <p className="pd-sub-intro">{d.usabilityIntro}</p>
                        <div className="pd-find-row">
                          {d.usabilityFindings.map((item, index) => (
                            <div
                              className="pd-find-col pd-reveal pd-reveal--card pd-parallax"
                              data-pd-depth="0.45"
                              style={{ "--pd-motion-order": index }}
                              key={`${project.id}-finding-${index}`}
                            >
                              <Cnum n={index + 1} />
                              <h5 className="pd-ftitle">{item.title}</h5>
                              <p className="pd-ftext">{item.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="pd-cs pd-gray" id="design">
                    <div className="pd-cg pd-reveal pd-reveal--soft">
                      <div className="pd-lc">
                        <span className="pd-ey">The clear version :</span>
                        <h2 className="pd-sh2">Refining Design</h2>
                      </div>
                      <p className="pd-intro">{d.designIntro}</p>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <path d="M8 21h8M12 17v4" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">Mockups</p>
                        <p className="pd-sdesc">
                          These are high-fidelity visuals that represent the final product direction.
                        </p>
                      </div>

                      <div>
                        <p className="pd-sub-intro">{d.mockupsDesc}</p>
                        <OneImg src={d.mockupOverviewImage} alt={`${project.title} mockups overview`} />

                        <div className="pd-strip" aria-label="Mockup screens">
                          {d.mockupScreens.map((item, index) => (
                            <div
                              className="pd-strip-item pd-reveal pd-reveal--panel pd-parallax"
                              data-pd-depth="0.85"
                              style={{ "--pd-motion-order": index }}
                              key={`${project.id}-mockup-${index}`}
                            >
                              <div className="pd-strip-thumb">
                                {item.src ? (
                                  <img
                                    src={item.src}
                                    alt={`${item.label} for ${project.title} by Bodunde Emmanuel`}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : null}
                              </div>
                              <p className="pd-strip-lbl">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="5" y="2" width="14" height="20" rx="2" />
                            <line x1="12" y1="18" x2="12.01" y2="18" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">High-fidelity prototype</p>
                        <p className="pd-sdesc">
                          It&apos;s the detailed, interactive version of the designs that closely matches the final product.
                        </p>
                      </div>

                      <div>
                        <p className="pd-sub-intro">{d.protoDesc}</p>
                        <div className="pd-proto-grid">
                          <div className="pd-phone pd-reveal pd-reveal--panel pd-parallax" data-pd-depth="0.95">
                            <div className="pd-phone-notch" />
                            <div className="pd-phone-screen">
                              {d.protoScreenImage ? (
                                <img
                                  src={d.protoScreenImage}
                                  alt={`${project.title} high fidelity prototype by Bodunde Emmanuel`}
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : null}
                            </div>
                          </div>

                          <ol className="pd-proto-list pd-reveal pd-reveal--soft">
                            {d.protoList.map((item, index) => (
                              <li key={`${project.id}-proto-${index}`}>{item}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="pd-cs" id="outcome">
                    <div className="pd-cg pd-reveal pd-reveal--soft">
                      <div className="pd-lc">
                        <span className="pd-ey">The project schematically :</span>
                        <h2 className="pd-sh2">Outcome</h2>
                      </div>
                      <p className="pd-intro">{d.outcomeIntro}</p>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                            <line x1="6" y1="1" x2="6" y2="4" />
                            <line x1="10" y1="1" x2="10" y2="4" />
                            <line x1="14" y1="1" x2="14" y2="4" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">Takeways</p>
                      </div>

                      <div className="pd-out-grid pd-reveal pd-reveal--soft">
                        <div>
                          <p className="pd-out-h5">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                              <polyline points="16 6 12 2 8 6" />
                              <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                            Impact:
                          </p>
                          <p className="pd-out-p">{d.impact}</p>
                        </div>

                        <div>
                          <p className="pd-out-h5">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
                              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                              <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                            What I learned:
                          </p>
                          <p className="pd-out-p">{d.learned}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pd-cg pd-sg pd-reveal pd-reveal--soft">
                      <div className="pd-lc pd-sublc">
                        <OIcon>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="10 8 16 12 10 16 10 8" />
                          </svg>
                        </OIcon>
                        <p className="pd-stitle">Next Steps</p>
                      </div>

                      <div className="pd-next-grid">
                        {d.nextSteps.map((item, index) => (
                          <div
                            className="pd-next-item pd-reveal pd-reveal--card pd-parallax"
                            data-pd-depth="0.45"
                            style={{ "--pd-motion-order": index }}
                            key={`${project.id}-next-${index}`}
                          >
                            <Cnum n={index + 1} />
                            <p className="pd-next-txt">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                  </div>
                </article>

                {moreWorks.length ? (
                  <section className="projectMoreWorks pd-reveal pd-reveal--panel" aria-labelledby="project-more-works-title">
                    <div className="projectMoreWorksCard pd-parallax" data-pd-depth="0.65">
                      <div className="projectMoreWorksHead">
                        <p className="projectMoreWorksEyebrow">Continue Exploring</p>
                        <h2 className="projectMoreWorksTitle" id="project-more-works-title">
                          More Works
                        </h2>
                      </div>

                      <div className="projectMoreWorksGrid">
                        {moreWorks.map((item, index) => (
                          <div className="projectMoreWorksItem" key={item.id}>
                            <WorkCard project={item} priority={index === 0} fullCardLink />
                          </div>
                        ))}
                      </div>

                      <div className="projectMoreWorksAction">
                        <Link className="projectMoreWorksBtn" to="/work">
                          View More Works
                        </Link>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </section>
    </main>
  );
}
