import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { getAllProjects } from "../../lib/projects";
import WorkCard from "./WorkCard";
import "./selected-work.css";

export default function SelectedWork({ scrollRootRef }) {
  const projects = getAllProjects();
  const latest = projects.slice(0, 3);
  const sectionRef = useRef(null);

  useEffect(() => {
    const root = scrollRootRef?.current;      // ✅ your .cardScroll
    const section = sectionRef.current;
    if (!root || !section) return;

    // ✅ reveal in-view
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("is-inview");
        io.unobserve(entry.target);
      },
      { root, threshold: 0.35 }
    );
    io.observe(section);

    // ✅ parallax on featured image (safe, no crashes)
    const img = section.querySelector(".featuredCard .workCard__image img");
    const onScroll = () => {
      if (!img) return;
      const minimizeMotion = window.matchMedia("(max-width: 768px)").matches;

      if (minimizeMotion) {
        img.style.transform = "translateY(0) scale(1)";
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const rect = section.getBoundingClientRect();

      // progress: 0 when section just enters, 1 when it's well inside view
      const start = rootRect.top + rootRect.height * 0.90;
      const end = rootRect.top + rootRect.height * 0.20;

      const t = (start - rect.top) / (start - end);
      const p = Math.max(0, Math.min(1, t));

      const scale = 1.08 - p * 0.08;
      const y = 22 - p * 22;

      img.style.transform = `translateY(${y}px) scale(${scale})`;
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      root.removeEventListener("scroll", onScroll);
      if (img) img.style.transform = "";
    };
  }, [scrollRootRef]);

  if (!latest.length) return null;

  const [featured, second, third] = latest;

  return (
    <section className="selectedWorkSection" ref={sectionRef}>
      <div className="selectedWorkLayout">
        {/* LEFT TEXT COLUMN */}
        <div className="selectedWorkLeft">
          <h2 className="selectedWorkTitle">
            Selected<br />work
          </h2>

          <Link to="/work" className="whatidoBtn">
            See all work
          </Link>
        </div>

        {/* RIGHT CARD AREA */}
        <div className="selectedWorkRight">
          <div className="featuredCard">
            <WorkCard project={featured} featured />
          </div>

          <div className="twoCards">
            <WorkCard project={second} />
            <WorkCard project={third} />
          </div>
        </div>
      </div>
    </section>
  );
}
