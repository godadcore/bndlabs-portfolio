import { Suspense, lazy, useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { getDepartment } from "./content/departments.js";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Header from "./components/layout/Header.jsx";
import Splash from "./components/intro/Splash.jsx";
import "./styles/experience.css";
import "./styles/theme.css";

const Home = lazy(() => import("./pages/Home.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Blog = lazy(() => import("./pages/blog/blog.jsx"));
const BlogPost = lazy(() => import("./pages/blog/BlogPost.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const ProjectDetails = lazy(() => import("./pages/work/ProjectDetails.jsx"));
const PortfolioIndex = lazy(() => import("./pages/portfolio/Portfolio.jsx").then((module) => ({ default: module.PortfolioIndex })));
const DepartmentPage = lazy(() => import("./pages/portfolio/Portfolio.jsx"));
const DemoPage = import.meta.env.DEV ? lazy(() => import("./pages/demos/DemoPage.jsx")) : null;
const VideoLab = import.meta.env.DEV ? lazy(() => import("./pages/dev/VideoLab.jsx")) : null;

function scrollToPageTop() {
  const scrollOptions = { top: 0, left: 0, behavior: "instant" };

  try {
    window.scrollTo(scrollOptions);
  } catch {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  document.querySelectorAll(".cardScroll").forEach((scrollRoot) => {
    try {
      scrollRoot.scrollTo(scrollOptions);
    } catch {
      scrollRoot.scrollTop = 0;
      scrollRoot.scrollLeft = 0;
    }
  });
}

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return undefined;

    scrollToPageTop();

    const frameId = window.requestAnimationFrame(scrollToPageTop);
    const timeoutId = window.setTimeout(scrollToPageTop, 0);
    const settledTimeoutId = window.setTimeout(scrollToPageTop, 120);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      window.clearTimeout(settledTimeoutId);
    };
  }, [pathname, search, hash]);

  return null;
}

function transitionFor(pathname) {
  if (pathname === "/") return { y: 16, x: 0 };
  if (pathname.startsWith("/portfolio") || pathname.startsWith("/work")) return { y: 0, x: 18 };
  if (pathname.startsWith("/about")) return { y: 10, x: 0 };
  if (pathname.startsWith("/notes") || pathname.startsWith("/blog") || pathname.startsWith("/insights") || pathname.startsWith("/fieldnotes")) return { y: 0, x: 0 };
  if (pathname.startsWith("/contact")) return { y: 18, x: 0 };
  return { y: 8, x: 0 };
}

function PortfolioSlug() {
  const { slug } = useParams();
  return getDepartment(slug) ? <DepartmentPage /> : <ProjectDetails />;
}

function PortfolioIndexRedirect() {
  return <Navigate to="/work" replace />;
}

function PortfolioSlugRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/work/${slug}`} replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const shift = transitionFor(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="pageSlot"
        initial={reduced ? false : { opacity: 0, x: shift.x, y: shift.y }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={reduced ? undefined : { opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={null}>
          <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<PortfolioIndex />} />
          <Route path="/work/:slug" element={<PortfolioSlug />} />
          <Route path="/portfolio" element={<PortfolioIndexRedirect />} />
          <Route path="/portfolio/:slug" element={<PortfolioSlugRedirect />} />
          <Route path="/about" element={<About />} />
          <Route path="/notes" element={<Blog />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/fieldnotes" element={<Blog />} />
          <Route path="/insights" element={<Blog />} />
          <Route path="/notes/:slug" element={<BlogPost />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/fieldnotes/:slug" element={<BlogPost />} />
          <Route path="/insights/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          {DemoPage ? <Route path="/demos/:slug" element={<DemoPage />} /> : null}
          {VideoLab ? <Route path="/dev/video-lab" element={<VideoLab />} /> : null}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <>
      <div className="siteShell">
        <ScrollToTop />
        <Splash />
        <Header />
        <AnimatedRoutes />
      </div>
    </>
  );
}
