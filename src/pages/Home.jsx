import { Suspense, lazy, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import WhatIDo from "../components/home/WhatIDo";
import SelectedBlog from "../components/blog/SelectedBlog";
import SelectedWork from "../components/work/SelectedWork";
import Services from "../components/home/Services";
import ContactSection from "../components/home/ContactSection";
import Footer from "../components/layout/Footer";
import Seo from "../components/seo/Seo";
import usePullToRefresh from "../hooks/usePullToRefresh";
import { BASE_KEYWORDS, SITE_NAME } from "../lib/site";

const Hero3D = lazy(() => import("../components/home/Hero3D"));

export default function Home() {
  const location = useLocation();
  const scrollRef = useRef(null);

  usePullToRefresh(scrollRef);

  const scrollToId = useCallback((id, behavior = "smooth") => {
    const root = scrollRef.current;
    if (!root) return false;
    const el = root.querySelector(`#${id}`);
    if (!el) return false;

    const start = root.scrollTop;
    const headerHeight =
      document.querySelector(".portfolioHeader")?.getBoundingClientRect().height || 0;
    const rootTop = root.getBoundingClientRect().top;
    const end = Math.max(
      0,
      start + el.getBoundingClientRect().top - rootTop - headerHeight - 18
    );
    const delta = end - start;

    if (Math.abs(delta) < 2) return true;

    if (behavior !== "smooth") {
      root.scrollTop = end;
      return true;
    }

    const duration = 380;
    const startTime = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      root.scrollTop = start + delta * easeOutCubic(t);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return true;
  }, []);

  useEffect(() => {
    if (!location.hash) return;

    const sectionId = location.hash.replace("#", "");
    if (!sectionId) return;

    let frameId = 0;
    let timeoutId = 0;
    let attempts = 0;

    const tryScroll = () => {
      if (scrollToId(sectionId)) return;
      if (attempts >= 8) return;
      attempts += 1;
      frameId = requestAnimationFrame(tryScroll);
    };

    frameId = requestAnimationFrame(tryScroll);
    timeoutId = window.setTimeout(tryScroll, 120);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [location.hash, scrollToId]);

  return (
    <main className="page">
      <Seo
        title={`Bodunde Emmanuel - UI/UX Designer & Product Designer | ${SITE_NAME}`}
        description="Portfolio of Bodunde Emmanuel, a UI/UX designer, product designer and frontend designer creating modern digital experiences, interfaces and brand systems."
        keywords={[
          ...BASE_KEYWORDS,
          "UI UX designer portfolio",
          "frontend designer portfolio",
          "brand systems designer",
        ]}
        canonicalPath="/"
        imageAlt={`${SITE_NAME} home page preview for Bodunde Emmanuel`}
      />

      <section className="hero" aria-label="Fixed card">
        <div className="cardScroll" ref={scrollRef}>
          <section className="heroSection is-ready homeHeroWithHeader" id="home">
            <div className="left">
              <div className="ringBg" aria-hidden="true"></div>

              <div className="copy">
                <h1 className="srOnly">UI/UX Designer &amp; Product Designer</h1>

                <div className="byline">
                  <span className="byline-rule"></span>
                  <span className="byline-name">Bodunde Emmanuel</span>
                </div>

                <p className="h1" aria-hidden="true">
                  Hello, my <br />
                  name&apos;s Emmanuel. <br />
                  I&apos;m a Product <br />
                  Designer (UI/UX Designer).
                </p>
              </div>
            </div>

            <div className="right">
              <div className="hero3d" aria-hidden="false">
                <Suspense fallback={null}>
                  <Hero3D />
                </Suspense>
              </div>
            </div>
          </section>

          <section id="whatido">
            <WhatIDo onContactClick={() => scrollToId("contact")} />
          </section>

          <section id="selectedwork">
            <SelectedWork scrollRootRef={scrollRef} />
          </section>

          <section id="blog">
            <SelectedBlog scrollRootRef={scrollRef} />
          </section>

          <section id="services">
            <Services scrollRootRef={scrollRef} />
          </section>

          <section id="contact">
            <ContactSection scrollRootRef={scrollRef} />
          </section>

          <Footer />
        </div>
      </section>
    </main>
  );
}
