import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import Seo from "../components/seo/Seo";
import usePullToRefresh from "../hooks/usePullToRefresh";
import { SITE_NAME } from "../lib/site";
import "./not-found.css";

export default function NotFound() {
  const location = useLocation();
  const scrollRef = useRef(null);

  usePullToRefresh(scrollRef);

  return (
    <main className="page notFoundPage">
      <Seo
        title={`Page Not Found | ${SITE_NAME}`}
        description={`The page you are looking for could not be found on the ${SITE_NAME} portfolio.`}
        robots="noindex, nofollow"
        url={location.pathname}
        imageAlt={`Page not found preview for ${SITE_NAME}`}
      />

      <section className="hero aboutCard" aria-label="Page not found">
        <div className="cardScroll" ref={scrollRef}>
          <section className="aboutHeroShell" id="top">
            <div className="aboutShell">
              <div className="aboutStickyHeader">
                <Header />
              </div>
            </div>
          </section>

          <section className="notFoundSection" aria-labelledby="not-found-title">
            <div className="notFoundInner">
              <article className="notFoundCard">
                <p className="notFoundEyebrow">404 Error</p>
                <h1 className="notFoundTitle" id="not-found-title">
                  This page doesn&apos;t exist.
                </h1>
                <p className="notFoundText">
                  The link may be outdated, the page may have moved, or the address may have been typed incorrectly.
                  You can return home, browse recent work, or head to the contact page.
                </p>

                <div className="notFoundActions">
                  <Link className="notFoundBtn notFoundBtn--primary" to="/">
                    Back Home
                  </Link>
                  <Link className="notFoundBtn" to="/work">
                    View Work
                  </Link>
                  <Link className="notFoundBtn" to="/contact">
                    Contact Me
                  </Link>
                </div>

                <div className="notFoundMeta">
                  <p className="notFoundMetaLabel">Requested path</p>
                  <p className="notFoundMetaValue">{location.pathname}</p>
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
