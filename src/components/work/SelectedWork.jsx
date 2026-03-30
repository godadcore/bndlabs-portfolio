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

    loadAllProjects({ force: true }).then((loadedProjects) => {
      if (!isMounted || !Array.isArray(loadedProjects)) return;
      setProjects(loadedProjects);
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

    return () => {
      io.disconnect();
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
