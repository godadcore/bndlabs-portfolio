import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BehanceLogo,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  TiktokLogo,
  WhatsappLogo,
  X,
  XLogo,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import Wordmark from "../brand/Wordmark";
import { departmentsWithWork } from "../../content/departments";
import { NOTES_LABEL } from "../../content/labels";
import { loadAllProjects } from "../../lib/projectData";
import { SOCIAL_LINKS } from "../../lib/site";
import { useTheme } from "../../providers/ThemeProvider";
import "../../styles/bnd.css";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Work", to: "/portfolio" },
  { label: "About", to: "/about" },
  { label: NOTES_LABEL, to: "/notes" },
  { label: "Contact", to: "/contact" },
];

const SOCIAL = [
  ["LinkedIn", SOCIAL_LINKS.linkedin, LinkedinLogo],
  ["GitHub", "https://github.com/godadcore", GithubLogo],
  ["Behance", SOCIAL_LINKS.behance, BehanceLogo],
  ["X", SOCIAL_LINKS.x, XLogo],
  ["Instagram", SOCIAL_LINKS.instagram, InstagramLogo],
  ["TikTok", SOCIAL_LINKS.tiktok, TiktokLogo],
  ["WhatsApp", SOCIAL_LINKS.whatsapp, WhatsappLogo],
].filter(([, href]) => href);

function isCurrent(pathname, to) {
  if (to === "/") return pathname === "/";
  if (to === "/notes") {
    return ["/notes", "/insights", "/fieldnotes", "/blog"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
  }
  if (to === "/portfolio") return pathname.startsWith("/portfolio") || pathname.startsWith("/work");
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef(null);
  const shellRef = useRef(null);
  const reduced = useReducedMotion();
  const { theme, setTheme } = useTheme();
  const [bar, setBar] = useState({ width: 1320, resting: 1320, top: 0, height: 72, condensed: false });
  const [menuDepartments, setMenuDepartments] = useState(() => departmentsWithWork([]));

  useEffect(() => {
    const measure = () => {
      const condensed = (window.scrollY || 0) >= 24;
      const mobile = window.innerWidth < 768;
      const view = document.documentElement.clientWidth;
      const shell = document.querySelector(".pageFrame, .shell, .homeShell, .wrap, .closeInner, .blogPostInner");
      const shellWidth = shell ? shell.getBoundingClientRect().width : 0;
      const gutter = mobile ? 16 : Math.min(56, Math.max(20, view * 0.05));
      const resting = shellWidth || Math.min(1320, view - gutter * 2);
      const width = condensed && !mobile
        ? Math.min(680, view * 0.92)
        : resting;
      const height = mobile ? 52 : condensed ? 56 : 72;
      const top = mobile ? 25 : condensed ? 23 : 20;
      setBar((current) => (
        current.width === width
        && current.resting === resting
        && current.top === top
        && current.height === height
        && current.condensed === condensed
          ? current
          : { width, resting, top, height, condensed }
      ));
    };
    measure();
    const root = document.getElementById("root");
    const resize = new ResizeObserver(measure);
    resize.observe(document.documentElement);
    if (root) resize.observe(root);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      resize.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadAllProjects().then((items) => {
      if (active) setMenuDepartments(departmentsWithWork(items));
    }).catch(() => {
      if (active) setMenuDepartments([]);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const locked = [document.documentElement, document.body, document.getElementById("root")].filter(Boolean);
    const previous = locked.map((node) => node.style.overflow);
    locked.forEach((node) => {
      node.style.overflow = "hidden";
    });
    const allowPanelScroll = (event) => {
      if (panelRef.current?.contains(event.target)) return;
      event.preventDefault();
    };
    window.addEventListener("wheel", allowPanelScroll, { passive: false });
    window.addEventListener("touchmove", allowPanelScroll, { passive: false });
    const onPointer = (event) => {
      if (!shellRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => {
      locked.forEach((node, index) => {
        node.style.overflow = previous[index];
      });
      window.removeEventListener("wheel", allowPanelScroll);
      window.removeEventListener("touchmove", allowPanelScroll);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    const items = panel
      ? [...panel.querySelectorAll("a, button")].filter((el) => el.getClientRects().length > 0)
      : [];
    items[0]?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (to) => (event) => {
    event.preventDefault();
    setOpen(false);
    navigate(to);
  };

  const spring = reduced
    ? { duration: 0 }
    : { type: "spring", stiffness: 260, damping: 30 };

  return (
    <div
      ref={shellRef}
      className={`navDock${bar.condensed ? " is-condensed" : ""}`}
      style={{ "--nav-top": `${bar.top + bar.height}px`, "--bar-width": `${bar.width}px` }}
    >
      {createPortal(
        <div className="navScrim" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>,
        document.body,
      )}
      <button
        type="button"
        className={`navBackdrop${open ? " is-open" : ""}`}
        aria-label="Close menu"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
      <motion.header
        className={`siteNav${bar.condensed ? " is-condensed" : ""}`}
        initial={false}
        animate={{ width: bar.width, top: bar.top, height: bar.height }}
        transition={spring}
        style={{ left: "50%", x: "-50%", borderRadius: 0 }}
      >
        <a className="brandHome" href="/" aria-label="Bndlabs home" onClick={go("/")}>
          <Wordmark />
        </a>
        <button
          className={`menuToggle${open ? " is-open" : ""}`}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="menuWord">{open ? "Close" : "Menu"}</span>
          <span className="menuIcon" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </motion.header>
      <nav
        id={panelId}
        ref={panelRef}
        className={`navPanel${open ? " is-open" : ""}`}
        aria-label="Primary"
        aria-hidden={!open}
        inert={!open}
        onClick={() => setOpen(false)}
      >
        <div className="mobileSheet">
          <div className="mobileSheetBar">
            <a className="brandHome" href="/" aria-label="Bndlabs home" onClick={go("/")}>
              <Wordmark />
            </a>
            <button type="button" className="mobileSheetClose" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X size={22} weight="regular" />
            </button>
          </div>
          <div className="mobileSheetLinks">
            {LINKS.map((link) => (
              <a
                key={link.to}
                href={link.to}
                aria-current={isCurrent(location.pathname, link.to) ? "page" : undefined}
                onClick={go(link.to)}
              >
                <strong>{link.label}</strong>
              </a>
            ))}
          </div>
          <nav className="mobileSheetSocial" aria-label="Social">
            {SOCIAL.map(([label, href, Icon]) => (
              <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer">
                <Icon size={18} weight="regular" />
              </a>
            ))}
          </nav>
          <div className="mobileSheetTheme">
            <div className="themeSwitch" role="group" aria-label="Theme">
              <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</button>
              <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</button>
            </div>
          </div>
        </div>
        <div className="navGrid">
          <div>
            {LINKS.map((link) => (
              <a
                key={link.to}
                href={link.to}
                aria-current={isCurrent(location.pathname, link.to) ? "page" : undefined}
                onClick={go(link.to)}
              >
                <strong>{link.label}</strong>
              </a>
            ))}
          </div>
          <div>
            {menuDepartments.map((department) => (
              <a
                key={department.slug}
                href={`/portfolio/${department.slug}`}
                aria-current={location.pathname === `/portfolio/${department.slug}` ? "page" : undefined}
                onClick={go(`/portfolio/${department.slug}`)}
              >
                <span>{department.index}</span>
                <strong>{department.title}</strong>
              </a>
            ))}
          </div>
        </div>
        <div className="menuTools">
          <div className="themeSwitch" role="group" aria-label="Theme">
            <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</button>
            <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</button>
          </div>
          <button
            type="button"
            className="replayIntro"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new Event("bndlabs:replay-intro"));
            }}
          >
            Replay introduction
          </button>
        </div>
      </nav>
    </div>
  );
}
