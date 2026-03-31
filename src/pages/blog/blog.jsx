import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import BlogCard from "../../components/blog/BlogCard";
import Seo from "../../components/seo/Seo";
import usePullToRefresh from "../../hooks/usePullToRefresh";
import { getInitialPosts, loadAllPosts } from "../../lib/blogData";
import { BASE_KEYWORDS, SITE_NAME } from "../../lib/site";
import "../work/work.css";
import "./blog.css";

const MOBILE_BREAKPOINT = 640;
const MOBILE_POST_BATCH = 3;

export default function Blog() {
  const initialPosts = getInitialPosts();
  const [posts, setPosts] = useState(() => initialPosts);
  const [isLoading, setIsLoading] = useState(() => initialPosts.length === 0);
  const [vw, setVw] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [mobileVisibleCount, setMobileVisibleCount] = useState(MOBILE_POST_BATCH);
  const scrollRootRef = useRef(null);
  const motionScopeRef = useRef(null);
  const isMobile = vw <= MOBILE_BREAKPOINT;
  const visiblePosts = isMobile ? posts.slice(0, mobileVisibleCount) : posts;
  const hasPosts = posts.length > 0;
  const canLoadMore = isMobile && visiblePosts.length < posts.length;

  usePullToRefresh(scrollRootRef);

  useEffect(() => {
    let isMounted = true;

    loadAllPosts({ force: true }).then((loadedPosts) => {
      if (!isMounted || !Array.isArray(loadedPosts)) return;
      setPosts(loadedPosts);
    }).finally(() => {
      if (!isMounted) return;
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

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
  }, [visiblePosts.length, isLoading]);

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
  }, [visiblePosts.length]);

  return (
    <main className="page workPage blogPage">
      <Seo
        title={`Blog | ${SITE_NAME}`}
        description="A minimal blog page for notes, process, and design thinking from Bodunde Emmanuel."
        keywords={[
          ...BASE_KEYWORDS,
          "design blog",
          "product design notes",
          "UI UX writing",
        ]}
        canonicalPath="/blog"
        imageAlt={`Blog page preview for ${SITE_NAME}`}
      />

      <section className="hero" aria-label="Blog">
        <div className="cardScroll" ref={scrollRootRef}>
          <section className="workHeroSection--clean">
            <div className="workHeroShell--clean">
              <div className="aboutShell workShell">
                <Header active="blog" />

                <div className="workMotionScope" ref={motionScopeRef}>
                  <div className="workHeroHeadingWrapClean workReveal workReveal--soft">
                    <h1 className="srOnly">Blog</h1>
                    <p className="workHeroTitleClean" aria-hidden="true">
                      Notes, thoughts,
                      <br />
                      and process
                    </p>
                  </div>

                  <section className="workGridSection" aria-labelledby="blog-grid-title">
                    <div className="workGridHead workReveal workReveal--soft">
                      <h2 className="workGridTitle" id="blog-grid-title">
                        Articles
                      </h2>
                    </div>

                    {visiblePosts.length ? (
                      <>
                        <div className="workProjectsGrid blogProjectsGrid">
                          {visiblePosts.map((post, idx) => (
                            <div
                              key={post.id || post.slug || idx}
                              className="workGridCard workParallax workReveal workReveal--card"
                              style={{ "--reveal-order": idx }}
                            >
                              <BlogCard post={post} priority={idx === 0} />
                            </div>
                          ))}
                        </div>

                        {canLoadMore ? (
                          <div className="workLoadMoreWrap workReveal workReveal--soft">
                            <button
                              type="button"
                              className="workLoadMoreBtn"
                              onClick={() => {
                                setMobileVisibleCount((current) => current + MOBILE_POST_BATCH);
                              }}
                            >
                              Load More
                            </button>
                          </div>
                        ) : null}
                      </>
                    ) : isLoading ? (
                      <div className="workEmptyState workReveal workReveal--soft">
                        <h2>Loading articles.</h2>
                        <p>Fetching the latest posts from Sanity.</p>
                      </div>
                    ) : (
                      <div className="workEmptyState workReveal workReveal--soft">
                        <h2>No articles available yet.</h2>
                        <p>Published blog posts will appear here once they are added.</p>
                      </div>
                    )}
                  </section>

                  {hasPosts ? (
                    <section className="workFinalCtaSection" aria-label="Blog call to action">
                      <div className="workFinalCtaCard workReveal workReveal--lift">
                        <h2
                          className="workFinalCtaTitle workReveal workReveal--soft"
                          style={{ "--reveal-order": 0 }}
                        >
                          More writing is
                          <br />
                          on the way.
                        </h2>
                        <p
                          className="workFinalCtaText workReveal workReveal--soft"
                          style={{ "--reveal-order": 1 }}
                        >
                          Explore recent writing from the same product and interface perspective used across the rest of the portfolio.
                        </p>
                        <Link
                          to="/contact"
                          className="workFinalCtaBtn workReveal workReveal--soft"
                          style={{ "--reveal-order": 2 }}
                        >
                          Get in touch
                        </Link>
                      </div>
                    </section>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </section>
    </main>
  );
}
