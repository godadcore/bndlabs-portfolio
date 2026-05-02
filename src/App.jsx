import { Suspense, lazy, useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/layout/Header.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Blog = lazy(() => import("./pages/blog/blog.jsx"));
const BlogPost = lazy(() => import("./pages/blog/BlogPost.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const ProjectDetails = lazy(() => import("./pages/work/ProjectDetails.jsx"));
const Work = lazy(() => import("./pages/work/Work.jsx"));

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

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<ProjectDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
