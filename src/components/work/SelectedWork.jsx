import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getInitialProjects, loadAllProjects } from "../../lib/projectData";
import WorkCard from "./WorkCard";
import "./selected-work.css";

export default function SelectedWork({ scrollRootRef }) {
  const [projects, setProjects] = useState(() => getInitialProjects());
  const latest = projects.slice(0, 3);
  const sectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    loadAllProjects().then((loadedProjects) => {
      if (!isMounted || !Array.isArray(loadedProjects)) return;
      setProjects(loadedProjects);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const root = scrollRootRef?.current;
    const section = sectionRef.current;
    if (!section) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !root || typeof IntersectionObserver !== "function") {
      section.classList.add("is-inview");
      section.classList.remove("is-observing");
      return undefined;
    }

    section.classList.add("is-observing");

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("is-inview");
        io.unobserve(entry.target);
      },
      { root, threshold: 0.35 }
    );
    io.observe(section);

    return () => {
      section.classList.remove("is-observing");
      io.disconnect();
    };
  }, [scrollRootRef]);

  if (!latest.length) return null;

  const [featured, second, third] = latest;

  return (
    <section className="selectedWorkSection" ref={sectionRef}>
      <div className="selectedWorkLayout">
        <div className="selectedWorkLeft">
          <h2 className="selectedWorkTitle">
            Selected
            <br />
            work
          </h2>

          <Link to="/work" className="whatidoBtn">
            See all work
          </Link>
        </div>

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
