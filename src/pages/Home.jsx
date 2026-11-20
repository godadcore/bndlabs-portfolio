import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Seo from "../components/seo/Seo";
import OptimizedImage from "../components/shared/OptimizedImage";
import { departmentsWithWork, getDepartment, projectDiscipline } from "../content/departments";
import Frame from "../components/paper/Frame";
import homePortrait from "../assets/home/portrait.png";

import { displayImage, projectImage } from "../lib/media";
import { sortProjectsNewestFirst } from "../lib/projectData";
import { useSiteSettings } from "../providers/siteSettingsContext";
import { NOTES_LABEL } from "../content/labels";
import { formatBlogDate, loadAllPosts } from "../lib/blogData";
import { loadAllProjects } from "../lib/projectData";
import { SITE_NAME } from "../lib/site";
import "./home/home-layout.css";

const RECENT_PRACTICES = ["product-design", "software-engineering", "ai-machine-learning"];

function latestFromEachPractice(projects) {
  const list = Array.isArray(projects) ? projects : [];
  const picks = RECENT_PRACTICES.map((slug) => {
    const inPractice = list.filter((project) => projectDiscipline(project) === slug);
    const real = inPractice.filter((project) => !project.sample);
    return sortProjectsNewestFirst(real.length ? real : inPractice)[0];
  }).filter(Boolean);
  return sortProjectsNewestFirst(picks);
}

const localHeroFiles = import.meta.glob("../assets/hero/portrait.*", {
  eager: true,
  import: "default",
});
const localHero = Object.values(localHeroFiles).find((src) => src && !String(src).includes("/placeholders/")) || "";
const localAboutFiles = import.meta.glob("../assets/about/portrait.*", {
  eager: true,
  import: "default",
});
const localAbout = Object.values(localAboutFiles).find((src) => src && !String(src).includes("/placeholders/")) || "";

function plain(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export default function Home() {
  const navigate = useNavigate();
  const settings = useSiteSettings();
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const heroImages = (settings?.heroImages || [])
    .filter((src) => src && !String(src).includes("/placeholders/"))
    .slice(0, 2);
  const heroSrc = heroImages[0] || localHero;
  const aboutSrc = displayImage(settings?.aboutPortrait, settings?.portrait) || localAbout;
  const visibleDepartments = departmentsWithWork(projects);

  useEffect(() => {
    let active = true;
    loadAllProjects().then((items) => {
      if (active) setProjects(Array.isArray(items) ? items : []);
    }).catch(() => {
      if (active) setProjects([]);
    });
    loadAllPosts().then((items) => {
      if (active) setPosts(Array.isArray(items) ? items.slice(0, 3) : []);
    }).catch(() => {
      if (active) setPosts([]);
    });
    return () => {
      active = false;
    };
  }, []);

  const selected = latestFromEachPractice(projects);
  const openWork = () => navigate("/work");

  return (
    <main className="bnd homePage">
      <Seo
        title={`Bodunde Emmanuel Olatunde | Product Design, Software and AI | ${SITE_NAME}`}
        description="Bodunde Emmanuel Olatunde is a product designer, full-stack software engineer, and AI practitioner at Bndlabs."
        canonicalPath="/"
      />

      <section className={`shell homeHero has-figure${heroSrc ? "" : " is-type"}`}>
        <div className="homeIntro">
          <h1>
            Bodunde
            <br />
            <em>Emmanuel</em>
            <br />
            Olatunde
          </h1>
          <ul className="homeRoles">
            <li>Product Designer &amp; UI/UX Specialist</li>
            <li>Full-Stack Software Engineer</li>
            <li>AI &amp; Machine Learning</li>
          </ul>
          <p className="homeLead">
            I design digital products, build software, and work with AI to create useful solutions.
          </p>
          <div className="actions">
            <button className="liquid is-solid" type="button" onClick={openWork}>Work</button>
            <Link className="liquid is-line" to="/contact">Contact</Link>
          </div>
        </div>
        {heroSrc ? (
          <div className="homeMark">
            <Frame src={heroSrc} alt="Bodunde Emmanuel Olatunde" />
          </div>
        ) : null}
        <figure className="homeFigure" aria-hidden="true">
          <img src={homePortrait} alt="" />
        </figure>
      </section>

      <section className="homeShell homeWork" aria-labelledby="selected-title">
        <div className="bandHead">
          <h2 id="selected-title">Recent Work</h2>
          <Link to="/work">Work</Link>
        </div>
        <div className="studyRows">
          {selected.map((project, index) => {
            const department = getDepartment(projectDiscipline(project));
            return (
            <article key={project.slug} className={index % 2 ? "is-flip" : undefined}>
              <Link to={`/work/${project.slug}`}>
                <figure className="shot">
                  <span>
                    <OptimizedImage src={projectImage(project)} alt="" />
                  </span>
                </figure>
                <div>
                  <span className="meta categoryTag">{department?.index || `0${index + 1}`} · {plain(project.category) || department?.title}</span>
                  {project.sample ? <span className="sampleTag">SAMPLE</span> : null}
                  <h3>{plain(project.title)}</h3>
                  <p className="clamp">{plain(project.summary || project.description)}</p>
                </div>
              </Link>
            </article>
            );
          })}
        </div>
      </section>

      <section className="homeShell band" aria-labelledby="practices-title">
        <div className="bandHead">
          <h2 id="practices-title">Work</h2>
          <button type="button" onClick={openWork}>See all</button>
        </div>
        <div className="deptGrid">
          {visibleDepartments.map((department) => {
            const match = projects.find((project) => projectDiscipline(project) === department.slug);
            const shown = projectImage(match);
            return (
            <Link key={department.slug} className={`deptCard${shown ? "" : " is-text"}`} data-practice={department.slug} to={`/work/${department.slug}`}>
              {shown ? (
                <div className="deptVisual">
                  <OptimizedImage src={shown} alt="" />
                </div>
              ) : null}
              <div>
                <span className="meta">{department.index}</span>
                <strong>{department.title}</strong>
                <p className="clamp">{department.summary}</p>
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      <section className={`homeShell band homeAbout${aboutSrc ? "" : " is-type"}`} aria-labelledby="about-title">
        {aboutSrc ? <Frame src={aboutSrc} alt="Bodunde Emmanuel Olatunde" variant="portrait" /> : null}
        <div>
          <h2 id="about-title">About</h2>
          <p>
            I design digital products, build software, and work with AI to create useful solutions. Product design comes first, then software engineering, then AI.
          </p>
          <div className="actions">
            <Link className="liquid is-solid" to="/about">About me</Link>
          </div>
        </div>
      </section>

      <section className="homeShell band" aria-labelledby="notes-title">
        <div className="bandHead">
          <div>
            <h2 id="notes-title">{NOTES_LABEL}</h2>
          </div>
          <Link to="/notes">All notes</Link>
        </div>
        <ul className="noteList">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={post.href || `/notes/${post.slug}`}>
                <span className="noteTag">{post.tag || "Note"}</span>
                <strong>{plain(post.title)}</strong>
                <em>{formatBlogDate(post.date)}{post.readTime ? ` · ${plain(post.readTime)}` : ""}</em>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="homeShell homeClose" aria-labelledby="invite-title">
        <h2 id="invite-title">Start a <em>project</em></h2>
        <p>Send a note about a product, a build, or an AI project.</p>
        <div className="actions">
          <Link className="liquid is-solid" to="/contact">Contact</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
