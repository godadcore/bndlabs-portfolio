import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackMark from "../../components/shared/BackMark";
import Footer from "../../components/layout/Footer";
import Seo from "../../components/seo/Seo";
import OptimizedImage from "../../components/shared/OptimizedImage";
import { departmentsWithWork, getDepartment, projectDiscipline } from "../../content/departments";
import { projectImage } from "../../lib/media";
import { loadAllProjects } from "../../lib/projectData";

function plain(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function ProjectGrid({ projects, clips = false }) {
  return (
    <div className={`projectGrid${clips ? " is-clips" : ""}`}>
      {projects.map((project) => {
        const image = projectImage(project);
        return (
          <article key={project.id || project.slug}>
            <Link to={`/work/${project.slug}`}>
              {image ? (
                <figure className="shot">
                  <span>
                    <OptimizedImage src={image} alt="" width="1200" height="800" />
                  </span>
                </figure>
              ) : null}
              <span className="cardTags">
                <span className="meta categoryTag">{plain(project.category) || "Product design"}</span>
                {project.sample ? <span className="sampleTag">SAMPLE</span> : null}
              </span>
              <span className="cardCopy">
                <h3>{plain(project.title)}</h3>
                {plain(project.summary || project.description) ? <p className="clamp">{plain(project.summary || project.description)}</p> : null}
              </span>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export function PortfolioIndex() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let active = true;
    loadAllProjects().then((items) => {
      if (active) setProjects(Array.isArray(items) ? items : []);
    }).catch(() => {
      if (active) setProjects([]);
    });
    return () => {
      active = false;
    };
  }, []);

  const visible = departmentsWithWork(projects);

  return (
    <main className="bnd">
      <Seo
        title="Work | bndlabs"
        description="Product design, software, AI, branding, content and video."
        canonicalPath="/work"
      />
      <div className="pageFrame pageStack">
      <header className="pageIntro">
        <h1>Work</h1>
        <p>Product design, software, AI, branding, content and video.</p>
      </header>
      <section className="deptIndex">
        {visible.map((department) => {
          const match = projects.find((project) => projectDiscipline(project) === department.slug);
          const image = projectImage(match);
          return (
            <Link key={department.slug} className={`deptRow${image ? "" : " is-text"}`} to={`/work/${department.slug}`}>
              <span className="meta">{department.index}</span>
              <strong>{department.title}</strong>
              <p className="clamp">{department.summary}</p>
              {image ? (
                <span className="deptMark">
                  <OptimizedImage src={image} alt="" width="320" height="200" />
                </span>
              ) : null}
            </Link>
          );
        })}
      </section>
      </div>
      <Footer />
    </main>
  );
}

export default function DepartmentPage() {
  const { slug } = useParams();
  const department = getDepartment(slug);
  const [projects, setProjects] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (!department) return undefined;
    let active = true;
    loadAllProjects()
      .then((items) => {
        if (!active) return;
        const list = (Array.isArray(items) ? items : [])
          .filter((project) => projectDiscipline(project) === department.slug)
          .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        setProjects(list);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [department]);

  if (!department) {
    return (
      <main className="bnd">
        <Seo title="Work | bndlabs" description="This page is not part of the work." canonicalPath="/work" />
        <section className="pageFrame pageIntro">
          <h1>This page is not part of the work.</h1>
          <Link className="liquid is-solid" to="/work">Work</Link>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bnd">
      <Seo title={`${department.title} | bndlabs`} description={department.summary} canonicalPath={`/work/${department.slug}`} />
      <div className="pageFrame pageStack">
      <header className="pageIntro" data-practice={department.slug}>
        <BackMark to="/work" label="Work" title={department.title} />
        <p>{department.summary}</p>
      </header>

      {state === "loading" ? <p>Loading work.</p> : null}
      {state === "error" ? <p>Work could not be loaded.</p> : null}
      {state === "ready" && projects.length ? (
        <section>
          <ProjectGrid projects={projects} clips={department.slug === "video-clipping"} />
        </section>
      ) : null}
      {state === "ready" && !projects.length ? (
        <section className="pageIntro">
          <p>New work is on the way.</p>
          <Link className="liquid is-solid" to="/contact">Contact</Link>
        </section>
      ) : null}
      </div>
      <Footer />
    </main>
  );
}
