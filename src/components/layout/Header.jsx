import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight01Icon,
  Briefcase01Icon,
  Download01Icon,
  Home01Icon,
  Mail01Icon,
  NewsIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { SITE_NAME } from "../../lib/site";
import cvDownloadUrl from "../../Bodunde_Emmanuel_CV.pdf";
import HugeIcon from "../shared/HugeIcon";
import OptimizedImage from "../shared/OptimizedImage";

const NAV_ITEMS = [
  { key: "home", label: "Home", to: "/#home", section: "home", icon: "home" },
  { key: "work", label: "Work", to: "/work", icon: "work" },
  { key: "about", label: "About", to: "/about", icon: "about" },
  { key: "blog", label: "Blog", to: "/blog", icon: "blog" },
  { key: "contact", label: "Contact", to: "/contact", icon: "contact" },
];

const CV_DOWNLOAD_URL = cvDownloadUrl;

function activeFromPath(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/work")) return "work";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/blog")) return "blog";
  if (pathname.startsWith("/contact")) return "contact";
  return "";
}

const NAV_ICON_MAP = {
  home: Home01Icon,
  work: Briefcase01Icon,
  about: UserIcon,
  blog: NewsIcon,
  contact: Mail01Icon,
};

function NavIcon({ name }) {
  const icon = NAV_ICON_MAP[name] || Home01Icon;
  return (
    <span className="portfolioNavIcon" aria-hidden="true">
      <HugeIcon icon={icon} size={18} strokeWidth={1.8} />
    </span>
  );
}

export default function Header({ active = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const menuId = useId().replace(/:/g, "");
  const currentActive = active || activeFromPath(location.pathname);
  const contactNavItem =
    NAV_ITEMS.find((item) => item.key === "contact") ||
    { key: "contact", label: "Contact", to: "/contact", icon: "contact" };

  const scrollToHomeSection = (sectionId, behavior = "smooth") => {
    const scrollRoot = document.querySelector(".cardScroll");
    const target = scrollRoot?.querySelector(`#${sectionId}`) || document.getElementById(sectionId);

    if (!target) return false;

    if (scrollRoot?.contains(target)) {
      const headerHeight =
        headerRef.current?.querySelector(".portfolioHeader")?.getBoundingClientRect().height || 0;
      const rootTop = scrollRoot.getBoundingClientRect().top;
      const top = Math.max(
        0,
        scrollRoot.scrollTop + target.getBoundingClientRect().top - rootTop - headerHeight - 18
      );

      scrollRoot.scrollTo({
        top,
        left: 0,
        behavior,
      });
      return true;
    }

    target.scrollIntoView({ block: "start", behavior });
    return true;
  };

  useEffect(() => {
    const onDocPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };

    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);

  const navigateTo = (item) => (event) => {
    event.preventDefault();
    setMenuOpen(false);

    if (item.section) {
      const hash = `#${item.section}`;

      if (location.pathname === "/") {
        navigate(
          { pathname: "/", hash },
          { replace: location.hash === hash || item.section === "home" }
        );

        window.requestAnimationFrame(() => {
          scrollToHomeSection(item.section, item.section === "home" ? "auto" : "smooth");
        });
        return;
      }

      navigate({ pathname: "/", hash });
      return;
    }

    navigate(item.to);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="aboutStickyHeader portfolioHeaderShell" ref={headerRef}>
      <header className="portfolioHeader">
        <a
          className="logo portfolioLogo"
          href="/"
          aria-label="Home"
          onClick={navigateTo(NAV_ITEMS[0])}
        >
          <picture>
            <source srcSet="/brand-logo.svg" media="(prefers-color-scheme: dark)" />
            <OptimizedImage
              className="logo-image"
              src="/brand-logo-dark-text.svg"
              alt={`${SITE_NAME} logo`}
              width="346"
              height="86"
              decoding="async"
              sizes="260px"
            />
          </picture>
        </a>

        <nav className="portfolioNav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = currentActive === item.key;

            return (
              <a
                key={item.key}
                href={item.to}
                onClick={navigateTo(item)}
                className={`portfolioNavLink ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="portfolioHeaderActions">
          <a
            className="portfolioCta portfolioCta--download"
            href={CV_DOWNLOAD_URL}
            download="Bodunde_Emmanuel_CV.pdf"
            onClick={closeMenu}
          >
            Download CV
            <span className="portfolioCtaIcon" aria-hidden="true">
              <HugeIcon icon={Download01Icon} size={16} strokeWidth={1.9} />
            </span>
          </a>

          <a
            className="portfolioCta portfolioCta--primary"
            href={contactNavItem.to}
            onClick={navigateTo(contactNavItem)}
          >
            Let's Work
            <span className="portfolioCtaIcon" aria-hidden="true">
              <HugeIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.9} />
            </span>
          </a>

          <button
            type="button"
            className={`portfolioMenuButton ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="portfolioMenuIcon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>

        <nav
          className={`portfolioMobilePanel ${menuOpen ? "is-open" : ""}`}
          id={menuId}
          aria-label="Mobile navigation"
          aria-hidden={menuOpen ? "false" : "true"}
        >
          <div className="portfolioMobilePanelInner">
            {NAV_ITEMS.map((item) => {
              const isActive = currentActive === item.key;

              return (
                <a
                  key={item.key}
                  href={item.to}
                  onClick={navigateTo(item)}
                  className={`portfolioMobileLink ${isActive ? "is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </a>
              );
            })}

            <div className="portfolioMobileActions">
              <a
                className="portfolioMobileCta portfolioCta--download"
                href={CV_DOWNLOAD_URL}
                download="Bodunde_Emmanuel_CV.pdf"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
              >
                Download CV
                <span className="portfolioCtaIcon" aria-hidden="true">
                  <HugeIcon icon={Download01Icon} size={16} strokeWidth={1.9} />
                </span>
              </a>

              <a
                className="portfolioMobileCta portfolioCta--primary"
                href={contactNavItem.to}
                onClick={navigateTo(contactNavItem)}
                tabIndex={menuOpen ? 0 : -1}
              >
                Let's Work
                <span className="portfolioCtaIcon" aria-hidden="true">
                  <HugeIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.9} />
                </span>
              </a>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
