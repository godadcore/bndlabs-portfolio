import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SITE_NAME } from "../../lib/site";
import cvDownloadUrl from "../../Bodunde_Emmanuel_CV.pdf";

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

function NavIcon({ name }) {
  const icons = {
    home: (
      <svg viewBox="0 0 122.88 112.07">
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M61.44,0L0,60.18l14.99,7.87L61.04,19.7l46.85,48.36l14.99-7.87L61.44,0L61.44,0z M18.26,69.63L18.26,69.63 L61.5,26.38l43.11,43.25h0v0v42.43H73.12V82.09H49.49v29.97H18.26V69.63L18.26,69.63L18.26,69.63z"
        />
      </svg>
    ),
    work: (
      <svg viewBox="0 0 122.88 100.54">
        <path
          fill="currentColor"
          d="M65.98,54.6H56.9c-0.15,0-0.27,0.06-0.37,0.15c-0.1,0.1-0.15,0.23-0.15,0.37v19.14c0,0.15,0.06,0.27,0.15,0.37 c0.1,0.1,0.23,0.15,0.37,0.15h9.07c0.15,0,0.27-0.06,0.37-0.15c0.1-0.1,0.15-0.23,0.15-0.37V55.12c0-0.15-0.06-0.27-0.15-0.37 C66.25,54.64,66.12,54.6,65.98,54.6L65.98,54.6L65.98,54.6z M6.98,13.97h31.49V4.94c0-1.37,0.56-2.6,1.45-3.49 C40.82,0.56,42.06,0,43.41,0h36.06c1.37,0,2.59,0.56,3.49,1.45c0.89,0.89,1.45,2.14,1.45,3.49v9.03h31.49 c1.93,0,3.67,0.79,4.92,2.06c1.27,1.27,2.06,3.01,2.06,4.92v16.86c-7.89,5.41-16.03,10.02-24.42,13.78 c-8.44,3.78-17.14,6.71-26.14,8.73v-6.74c0-1.54-0.63-2.96-1.64-3.98c-1.01-1.01-2.43-1.64-3.98-1.64H56.17l0,0 c-1.54,0-2.96,0.63-3.98,1.64c-1.01,1.01-1.64,2.43-1.64,3.98v6.59c-8.76-2.01-17.25-4.89-25.48-8.58 C16.45,47.73,8.1,42.96,0,37.36V20.95c0-1.93,0.79-3.67,2.06-4.92C3.32,14.76,5.07,13.97,6.98,13.97L6.98,13.97L6.98,13.97z M122.88,47.81v45.76c0,1.93-0.79,3.67-2.06,4.92c-1.27,1.27-3.01,2.06-4.92,2.06H6.98c-1.93,0-3.67-0.79-4.92-2.06 C0.79,97.22,0,95.48,0,93.57V47.39c6.89,4.42,13.98,8.28,21.27,11.55c9.41,4.22,19.17,7.45,29.29,9.61v7.25 c0,1.54,0.63,2.96,1.64,3.98c1.01,1.01,2.44,1.64,3.98,1.64h10.53c1.54,0,2.96-0.63,3.98-1.64c1.01-1.01,1.64-2.43,1.64-3.98v-7.6 l0.11,0.46c10.31-2.17,20.25-5.43,29.83-9.73C109.33,55.77,116.2,52.05,122.88,47.81L122.88,47.81z M75.71,6.73H47.19 c-0.17,0-0.31,0.06-0.44,0.19c-0.1,0.1-0.19,0.27-0.19,0.44v6.42h29.75V7.36c0-0.17-0.06-0.31-0.19-0.44 c-0.1-0.1-0.27-0.19-0.44-0.19H75.71L75.71,6.73z"
        />
      </svg>
    ),
    about: (
      <svg viewBox="0 0 122.88 113.76">
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M85.08,48.98v-8.27c0.38-1.6,1.07-2.07,1.86-2.22C89.08,38.16,88.84,48.49,85.08,48.98L85.08,48.98z M44.8,74.76l9.21,27.07l4.63-16.07l-2.27-2.48c-1.02-1.49-1.25-2.8-0.68-3.92c1.23-2.43,3.77-1.98,6.15-1.98 c2.49,0,5.56-0.47,6.34,2.64c0.26,1.04-0.07,2.13-0.8,3.26l-2.27,2.48l4.63,16.07l8.33-27.07c6.01,5.41,27.18,6.5,33.8,10.19 c2.09,1.17,3.99,2.66,5.51,4.66c2.31,3.05,3.72,7.03,4.11,12.09l1.38,6.12c-0.34,3.58-2.37,5.64-6.36,5.94H6.36 c-3.99-0.3-6.02-2.37-6.36-5.94l1.38-6.12c0.39-5.05,1.8-9.04,4.11-12.09c1.52-2.01,3.41-3.5,5.51-4.66 C17.63,81.26,38.79,80.17,44.8,74.76L44.8,74.76L44.8,74.76z M32.9,20.87v-5.29c0.76-6.33,3.71-8.87,8.55-8.14 c4.6-4.81,11.1-7.5,20.05-7.43c9.96-0.2,18.46,2.13,24.63,8.45c3.24,3.23,4.63,8.24,3.79,15.35c0.17,6.98,0.94,10.01-1.32,11.24 c-0.01,0.19-0.02,0.38-0.03,0.58l-1.56,0.98c1.26-0.09,2.14,0.69,2.67,2.02c0.26,0.67,0.43,1.48,0.5,2.37 c0.06,0.83,0.05,1.75-0.06,2.68c-0.37,3.39-1.93,6.92-4.81,7.34c-0.13,0.02-0.25,0.02-0.37,0.01v0.43c0,0.02,0,0.04,0,0.06 c0.19,4.73-2.31,9.98-6.34,14.19c-7.34,7.66-19.39,11.47-29.86,2.8c-1.82-1.51-3.94-3-5.6-5.34c0.02-0.02,0.04-0.04,0.05-0.05 l-0.04-0.03c-2.7-2.51-3.97-3.7-5.05-8.85c-0.02-0.1-0.03-0.21-0.03-0.31h0v-2.9c-0.15,0.03-0.31,0.03-0.47,0 c-2.89-0.42-4.44-3.96-4.81-7.34c-0.1-0.93-0.12-1.85-0.06-2.68c0.07-0.89,0.24-1.71,0.5-2.37c0.57-1.45,1.57-2.25,3-1.98 c0.69,0.13,1.32,0.48,1.84,1.08v-1.18l-1.17-0.66c-0.14-0.95-0.16-1.92-0.1-2.9C34.69,29.48,33.05,23.6,32.9,20.87L32.9,20.87z M82.64,35.12c-1.38-3.86-4.02-6.76-7.34-8.79c-2.79-1.21-5.23-2.23-7.55-2.96c-5.62-1.25-11.8-0.89-16.91,0.82 c-1.36,0.53-2.8,1.18-4.35,1.95c-3.26,1.91-5.59,4.55-6.28,7.81v19.98c1.16,5.57,1.9,5.35,5.47,8.84l6.19,6.06 c1.12,0.92,2.38,1.46,3.72,1.78c4.58,1.08,14.21,0.65,17.82-3.15c5.38-5.23,9.59-7.63,9.21-15.99V35.12L82.64,35.12z M66.36,36.05 c-1.63,0.62-1.98,1.98-1.07,2.49c1.07,0.6,2.43-0.3,3.47-0.63c2.73-0.87,5.98-0.97,8.34,0.51c0.63,0.39,1.27,0.9,1.92,1.52 c-0.24-0.86-0.62-1.65-1.17-2.35C75.5,34.59,69.53,34.42,66.36,36.05L66.36,36.05z M56.05,36.05c1.63,0.62,1.98,1.98,1.07,2.49 c-1.07,0.6-2.43-0.3-3.47-0.63c-2.73-0.87-5.98-0.97-8.34,0.51c-0.63,0.39-1.27,0.9-1.92,1.52c0.24-0.86,0.62-1.65,1.17-2.35 C46.92,34.59,52.88,34.42,56.05,36.05L56.05,36.05z M47.54,41.9c-0.35,0.14-0.73-0.08-0.86-0.47c-0.12-0.4,0.07-0.84,0.42-0.97 c2.7-1.05,5.45-0.98,8.16,0c0.35,0.13,0.55,0.56,0.44,0.96c-0.11,0.4-0.49,0.62-0.84,0.5c-0.45-0.16-0.9-0.3-1.35-0.4 c0.05,0.16,0.07,0.33,0.07,0.51c0,1.04-0.84,1.89-1.89,1.89c-1.04,0-1.89-0.85-1.89-1.89c0-0.26,0.05-0.5,0.14-0.72 C49.14,41.39,48.34,41.59,47.54,41.9L47.54,41.9L47.54,41.9z M69.43,41.34c-0.08,0.21-0.12,0.43-0.12,0.67 c0,1.04,0.85,1.89,1.89,1.89c1.04,0,1.89-0.85,1.89-1.89c0-0.3-0.07-0.58-0.19-0.83c0.82,0.09,1.66,0.27,2.49,0.54 c0.36,0.12,0.73-0.12,0.83-0.53c0.1-0.41-0.11-0.83-0.46-0.95c-1.36-0.45-2.72-0.67-4.08-0.66c-1.35,0-2.7,0.23-4.03,0.67 c-0.36,0.12-0.56,0.54-0.46,0.94c0.1,0.4,0.48,0.64,0.83,0.52C68.49,41.56,68.96,41.43,69.43,41.34L69.43,41.34L69.43,41.34z M59.1,54.21c-0.37-0.31-0.42-0.86-0.11-1.23c0.31-0.37,0.86-0.42,1.23-0.11c0.44,0.37,0.86,0.56,1.26,0.56 c0.4,0.01,0.84-0.18,1.31-0.57c0.37-0.31,0.92-0.25,1.23,0.12c0.31,0.37,0.25,0.92-0.12,1.23c-0.8,0.66-1.62,0.98-2.44,0.96 C60.63,55.16,59.85,54.83,59.1,54.21L59.1,54.21L59.1,54.21z M56.36,59.88c-0.45-0.24-0.62-0.8-0.38-1.24 c0.24-0.45,0.8-0.62,1.24-0.38c1.42,0.75,2.81,1.13,4.18,1.14c1.37,0,2.74-0.37,4.12-1.13c0.45-0.24,1-0.08,1.25,0.36 c0.24,0.44,0.08,1-0.36,1.25c-1.65,0.91-3.31,1.36-5,1.35C59.71,61.22,58.03,60.77,56.36,59.88L56.36,59.88L56.36,59.88z M37.8,48.98v-8.27c-0.38-1.6-1.07-2.07-1.86-2.22C33.81,38.16,34.01,48.48,37.8,48.98L37.8,48.98z"
        />
      </svg>
    ),
    blog: (
      <svg viewBox="0 0 640 640">
        <path
          fill="currentColor"
          d="M598.661 239.979h-35.882c-21.97 0-41.245-18.603-42.757-40.004 0-114.167-92.044-200.01-207.003-200.01H208.124C93.237-.035.07 92.493-.012 206.649v226.774c0 114.167 93.25 206.613 208.136 206.613h224c114.957 0 207.887-92.446 207.887-206.613V286.94c0-22.808-18.401-46.938-41.374-46.938l.023-.024zm-398.674-79.997H320c21.992 0 40.004 18.012 40.004 40.004 0 21.993-18.012 40.005-40.004 40.005l-120.013-.012c-21.992 0-40.004-18.012-40.004-40.004 0-22.005 18.012-40.005 40.004-40.005v.012zm240.027 320H199.987c-21.992 0-40.004-18-40.004-40.004 0-21.993 18.012-40.005 40.004-40.005l240.027.024c21.992 0 40.004 18 40.004 40.004 0 21.993-18.012 40.005-40.004 40.005v-.024z"
        />
      </svg>
    ),
    contact: (
      <svg viewBox="0 0 122.88 85.57">
        <path
          fill="currentColor"
          d="M3.8,0,62.48,47.85,118.65,0ZM0,80.52,41.8,38.61,0,4.53v76ZM46.41,42.37,3.31,85.57h115.9L78,42.37,64.44,53.94h0a3,3,0,0,1-3.78.05L46.41,42.37Zm36.12-3.84,40.35,42.33V4.16L82.53,38.53Z"
        />
      </svg>
    ),
  };

  return (
    <span className="portfolioNavIcon" aria-hidden="true">
      {icons[name]}
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v11m0 0 4.2-4.2M12 14 7.8 9.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 17.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
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
          <img
            className="logo-image"
            src="/brand-logo.svg"
            alt={`${SITE_NAME} logo`}
            width="346"
            height="86"
            decoding="async"
          />
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
              <DownloadIcon />
            </span>
          </a>

          <a
            className="portfolioCta portfolioCta--primary"
            href={contactNavItem.to}
            onClick={navigateTo(contactNavItem)}
          >
            Let's Work
            <span className="portfolioCtaIcon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 10h9m0 0-4-4m4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
            <span></span>
            <span></span>
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
                  <DownloadIcon />
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
                  <svg viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 10h9m0 0-4-4m4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
