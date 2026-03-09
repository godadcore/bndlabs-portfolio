import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SITE_NAME, SOCIAL_LINKS } from "../../lib/site";
import BrandMark from "./BrandMark";

export default function Header({ active = "" }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const mobileWrapRef = useRef(null);
  const desktopWrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      const inMobile = mobileWrapRef.current?.contains(e.target);
      const inDesktop = desktopWrapRef.current?.contains(e.target);
      if (!inMobile && !inDesktop) setMenuOpen(false);
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const navigateTo = (path) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="aboutStickyHeader">
      <header className="topbar aboutTopbar">
        <a
          className="logo"
          href="/"
          aria-label="Home"
          onClick={navigateTo("/")}
        >
          <BrandMark className="logo-mark" />
          <span className="logo-text">
            {SITE_NAME}<span className="dot">.</span>
          </span>
        </a>

        <div className="aboutHeaderRight">
          <nav className="social aboutDesktopSocial" aria-label="Social links">
            <a
              className="social-link"
              href={SOCIAL_LINKS.behance}
              aria-label="Behance"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="ico" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.2.247 2.454 1.712 2.454 1.001 0 1.558-.514 1.744-1.425h2.3zm-5.44-4h2.744c-.188-1.163-.906-1.83-1.86-1.83-1.016 0-1.73.693-1.885 1.83zM9.99 12.4c.596-.345 1.54-.87 1.54-2.59C11.53 7.38 9.849 6 7.1 6H1v12h6.1c2.68 0 4.97-1.136 4.97-3.967 0-1.33-.573-2.247-2.08-2.632zM5.79 9.133c1.06 0 1.77.36 1.77 1.286 0 .81-.551 1.267-1.74 1.267H4.2V9.133h1.59zm.17 5.734H4.2v-2.4H5.98c1.37 0 1.98.47 1.98 1.257 0 .857-.693 1.143-2 1.143z" />
                </svg>
              </span>
              Behance
            </a>

            <a
              className="social-link"
              href={SOCIAL_LINKS.instagram}
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="ico" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </span>
              Instagram
            </a>
          </nav>

          <div className="menu-wrapper menu-wrapper--desktop" ref={desktopWrapRef}>
            <button
              className={`hamburger ${menuOpen ? "open" : ""}`}
              aria-label="Toggle menu"
              onClick={toggleMenu}
            >
              <span></span>
              <span></span>
            </button>

            <div className={`dropdown ${menuOpen ? "open" : ""}`}>
              <a
                href="/"
                onClick={navigateTo("/")}
                className={active === "home" ? "is-active-link" : ""}
              >
                Home
              </a>

              <div className="dropdown-divider"></div>

              <a
                href="/about"
                onClick={navigateTo("/about")}
                className={active === "about" ? "is-active-link" : ""}
              >
                About
              </a>

              <a
                href="/work"
                onClick={navigateTo("/work")}
                className={active === "work" ? "is-active-link" : ""}
              >
                Work
              </a>

              <a
                href="/contact"
                onClick={navigateTo("/contact")}
                className={active === "contact" ? "is-active-link" : ""}
              >
                Contact
              </a>
            </div>
          </div>

          <div className="menu-wrapper menu-wrapper--mobile" ref={mobileWrapRef}>
            <button
              className={`hamburger ${menuOpen ? "open" : ""}`}
              aria-label="Toggle menu"
              onClick={toggleMenu}
            >
              <span></span>
              <span></span>
            </button>

            <div className={`dropdown ${menuOpen ? "open" : ""}`}>
              <a
                href="/"
                onClick={navigateTo("/")}
                className={active === "home" ? "is-active-link" : ""}
              >
                Home
              </a>

              <div className="dropdown-divider"></div>

              <a
                href="/about"
                onClick={navigateTo("/about")}
                className={active === "about" ? "is-active-link" : ""}
              >
                About
              </a>

              <a
                href="/work"
                onClick={navigateTo("/work")}
                className={active === "work" ? "is-active-link" : ""}
              >
                Work
              </a>

              <a
                href="/contact"
                onClick={navigateTo("/contact")}
                className={active === "contact" ? "is-active-link" : ""}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
