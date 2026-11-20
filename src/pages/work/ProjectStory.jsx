import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShareSection from "../../components/shared/ShareSection";
import Footer from "../../components/layout/Footer";
import Frame from "../../components/paper/Frame";
import Seo from "../../components/seo/Seo";
import { getDepartment, projectDiscipline } from "../../content/departments";
import { displayImage, projectImage } from "../../lib/media";
import { loadAllProjects, loadProjectBySlug } from "../../lib/projectData";

function plain(value) {
  if (!value) return "";
  if (typeof value === "string") return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (Array.isArray(value)) return value.map(plain).filter(Boolean).join(" ");
  if (typeof value === "object") {
    if (typeof value.text === "string") return plain(value.text);
    if (value.children) return plain(value.children);
    if (value.content) return plain(value.content);
  }
  return "";
}

function cleanCopy(value) {
  const text = plain(value);
  if (/^Research focused on/i.test(text)) return "";
  return text;
}

function imageSrc(value, allowSample = false) {
  if (!value) return "";
  if (typeof value === "string") {
    if (allowSample && value.includes("picsum.photos")) return value;
    return displayImage(value);
  }
  if (typeof value.src === "string") {
    if (allowSample && value.src.includes("picsum.photos")) return value.src;
    return displayImage(value.src);
  }
  if (value.asset?.url) return displayImage(value.asset.url);
  if (value.image) return imageSrc(value.image, allowSample);
  return "";
}

function list(value) {
  if (!value) return [];
  const source = Array.isArray(value) ? value : [value];
  return source.map((item) => cleanCopy(item)).filter(Boolean);
}

function yearOf(project) {
  const raw = project?.date || "";
  const parsed = new Date(raw);
  if (!raw || Number.isNaN(parsed.getTime())) return "";
  return String(parsed.getUTCFullYear());
}

function rowSizes(count, perRow) {
  if (count <= perRow) return [count];
  const sizes = [];
  let left = count;
  while (left > 0) {
    if (left === perRow + 1) {
      const first = Math.ceil(left / 2);
      sizes.push(first, left - first);
      break;
    }
    const take = Math.min(perRow, left);
    sizes.push(take);
    left -= take;
  }
  return sizes;
}

function alternateRows(images) {
  const rows = [];
  let index = 0;
  let full = true;
  while (index < images.length) {
    if (full || index === images.length - 1) {
      rows.push([images[index]]);
      index += 1;
    } else {
      rows.push(images.slice(index, index + 2));
      index += 2;
    }
    full = !full;
  }
  return rows;
}

const BOILERPLATE = [
  /^key interface views/i,
  /^a short list of follow-up/i,
  /^create a clearer, more consistent experience/i,
];

const PARTS = {
  "product-design": { research: "Research", wireframes: "Wireframes", prototype: "Prototype", final: "Final interface" },
  "software-engineering": { research: "Notes", wireframes: "Interface", prototype: "Implementation", final: "Screens" },
  "ai-machine-learning": { research: "Method", wireframes: "System", prototype: "Demonstration", final: "Output" },
  "graphic-design": { research: "Exploration", wireframes: "Identity", prototype: "Applications", final: "Final artwork" },
  "content-language": { research: "Research", wireframes: "Draft", prototype: "Revision", final: "Writing sample" },
  "video-clipping": { research: "Approach", wireframes: "Edit", prototype: "Breakdown", final: "Stills" },
};

function realText(value) {
  const text = cleanCopy(value);
  if (!text || BOILERPLATE.some((pattern) => pattern.test(text))) return "";
  return text;
}

function shotList(group, allowSample = false) {
  const source = Array.isArray(group) ? group : group ? [group] : [];
  return source
    .map((item) => ({
      src: imageSrc(item, allowSample),
      alt: (() => {
        const text = realText(item?.alt || item?.caption);
        return text && !/image\s*\d+$/i.test(text) ? text : "";
      })(),
    }))
    .filter((item) => item.src);
}

function videoView(url) {
  const value = String(url || "");
  const youtube = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (youtube) return { kind: "embed", src: `https://www.youtube.com/embed/${youtube[1]}` };
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "embed", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(value)) return { kind: "file", src: value };
  if (/\/embed\//.test(value)) return { kind: "embed", src: value };
  return null;
}

function blockFromSection(section, index) {
  if (!section || section.type === "table") return null;
  const label = realText(section.heading || section.title);
  const text = realText(section.body || section.text || section.description);
  const code = typeof section.code === "string" ? section.code.trim() : "";
  const language = realText(section.language);
  const video = videoView(section.video?.src || section.videoUrl || section.embedUrl || section.audio?.src);
  const images = shotList(section.frames || section.images || section.image);
  if (!label && !text && !code && !video && !images.length) return null;
  return {
    id: section.id || `part-${index + 1}`,
    label: label || "Notes",
    text: text && text !== label ? text : "",
    code,
    language,
    video,
    images,
    reading: !images.length && !video && !code,
  };
}

function WatchVideo({ record, activeId, onWatch }) {
  const id = record.providerVideoId;
  const playing = Boolean(id) && activeId === id;
  return (
    <figure className="storyClip">
      {playing ? (
        <div className="storyPlayer">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1`}
            title={record.title}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      ) : record.poster ? (
        <div className="storyPoster">
          <Frame src={record.poster} alt={record.posterAlt || record.title} variant="cover" />
          {id ? (
            <button type="button" className="liquid is-solid" onClick={() => onWatch(id)}>Watch</button>
          ) : null}
        </div>
      ) : null}
      {record.credit ? <p className="storyCredit">{record.credit}</p> : null}
    </figure>
  );
}

export default function ProjectStory({ slug }) {
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [state, setState] = useState("loading");
  const [activeVideo, setActiveVideo] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([loadProjectBySlug(slug), loadAllProjects()])
      .then(([item, items]) => {
        if (!active) return;
        setProject(item);
        setProjects(Array.isArray(items) ? items : []);
        setState(item ? "ready" : "missing");
      })
      .catch(() => {
        if (active) setState("missing");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (state === "loading") {
    return (
      <main className="bnd">
        <p className="wrap pageIntro">Loading work.</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="bnd">
        <Seo title="Work | bndlabs" description="This project is not on the site." canonicalPath="/work" />
        <section className="wrap pageIntro">
          <h1>This project is not on the site.</h1>
          <Link className="liquid is-solid" to="/work">Work</Link>
        </section>
        <Footer />
      </main>
    );
  }

  const study = project.caseStudy || {};
  const summary = cleanCopy(project.summary || project.description);
  const overview = cleanCopy(study.overviewText || study.overviewDescription);
  const role = list(study.roleItems);
  const tools = list(study.toolsItems);
  const year = yearOf(project);
  const allowSample = Boolean(project.sample);
  const hero = imageSrc(study.heroImage, allowSample) || projectImage(project);
  const discipline = getDepartment(projectDiscipline(project));
  const names = PARTS[discipline.slug] || PARTS["product-design"];
  const seen = new Set(hero ? [hero] : []);
  const takeShots = (group) => shotList(group, allowSample).filter((item) => {
    if (!item.src || seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
  const blocks = [];
  const addBlock = (block) => {
    if (!block) return;
    if (!block.text && !block.code && !block.video && !block.images?.length && !block.items?.length && !block.videoRecords?.length) return;
    blocks.push(block);
  };
  if (overview && overview !== summary) {
    addBlock({ id: "overview", label: "Overview", text: overview, reading: true });
  }
  const problems = (Array.isArray(study.problems) ? study.problems : [])
    .map((item) => ({ title: realText(item.title), text: realText(item.description) }))
    .filter((item) => item.title || item.text);
  if (problems.length) addBlock({ id: "problem", label: "Problem", items: problems });
  addBlock({ id: "research", label: names.research, text: realText(study.researchText), images: takeShots(study.researchImages), reading: true });
  addBlock({ id: "wireframes", label: names.wireframes, text: realText(study.wireframeText), images: takeShots(study.wireframeImages) });
  const screenShots = takeShots(study.prototypeImages);
  (Array.isArray(study.sections) ? study.sections : []).forEach((section, index) => {
    const block = blockFromSection(section, index);
    if (!block) return;
    if (block.text === summary) block.text = "";
    block.images = (block.images || []).filter((item) => {
      if (seen.has(item.src)) return false;
      seen.add(item.src);
      return true;
    });
    addBlock(block);
  });
  addBlock({
    id: "final",
    label: names.final,
    images: takeShots(study.finalImages).concat(takeShots(project.gallery), screenShots),
  });
  const done = realText(study.prototypeText);
  const results = (Array.isArray(study.results) ? study.results : [])
    .map((item) => ({ title: realText(item.metric), text: realText(item.description) }))
    .filter((item) => item.title || item.text);
  if (results.length || done) addBlock({ id: "results", label: "Results", text: done, items: results, summary: true });
  const videos = Array.isArray(study.videos) ? study.videos.filter((item) => item?.title) : [];
  if (videos.length) addBlock({ id: "playback", label: "Playback", videoRecords: videos });
  const usableLink = (href) => {
    const value = String(href || "");
    return value.startsWith("/demos/") || /^https?:\/\//i.test(value);
  };
  const liveHref = [study.liveUrl, study.liveProjectUrl, project.liveUrl, project.liveProjectUrl].find(usableLink) || "";
  const repositoryHref = [study.repositoryUrl, project.repositoryUrl].find((href) => /^https?:\/\//i.test(String(href || ""))) || "";
  const prototypeHref = /^https?:\/\//i.test(String(study.prototypeUrl || project.prototypeUrl || ""))
    ? (study.prototypeUrl || project.prototypeUrl)
    : "";
  const softwareOrAi = discipline.slug === "software-engineering" || discipline.slug === "ai-machine-learning";
  const productDesign = discipline.slug === "product-design";
  const buttons = [];
  if (softwareOrAi) {
    if (repositoryHref) buttons.push({ href: repositoryHref, label: "View on GitHub", external: true });
    if (liveHref) buttons.push({ href: liveHref, label: "View live site", external: !liveHref.startsWith("/") });
  } else if (productDesign) {
    if (prototypeHref) buttons.push({ href: prototypeHref, label: "View prototype", external: true });
    if (liveHref) buttons.push({ href: liveHref, label: "View live site", external: !liveHref.startsWith("/") });
  } else if (prototypeHref) {
    buttons.push({ href: prototypeHref, label: "View prototype", external: true });
  } else if (liveHref && !liveHref.startsWith("/")) {
    buttons.push({ href: liveHref, label: "View live site", external: true });
  }
  const inDiscipline = projects.filter((item) => projectDiscipline(item) === discipline.slug);
  const disciplineIndex = inDiscipline.findIndex((item) => item.slug === project.slug);
  const next = disciplineIndex >= 0 && disciplineIndex < inDiscipline.length - 1
    ? inDiscipline[disciplineIndex + 1]
    : null;
  const category = plain(project.category);
  const facts = [
    year ? ["Year", year] : null,
    category ? ["Category", category] : null,
    role.length ? ["Role", role.join(", ")] : null,
    tools.length ? ["Tools", tools.join(", ")] : null,
  ].filter(Boolean);

  return (
    <main className="bnd story">
      <Seo title={`${plain(project.title)} | bndlabs`} description={summary} canonicalPath={`/work/${project.slug}`} />
      <header className="wrap storyIntro">
        <Link className="storyCrumb" to={`/work/${discipline.slug}`}>{`← ${discipline.title}`}</Link>
        {project.sample ? <span className="sampleTag">SAMPLE</span> : null}
        <h1>{plain(project.title)}</h1>
        {blocks.length > 1 ? (
          <nav className="storyIndex" aria-label="On this project">
            {blocks.map((block) => (
              <a key={block.id} href={`#${block.id}`}>{block.label}</a>
            ))}
          </nav>
        ) : null}
        {summary ? <p className="lead">{summary}</p> : null}
        {facts.length ? (
          <dl className="facts">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {buttons.length ? (
          <div className="storyActions">
            {buttons.map((button) => (
              <a
                key={button.label}
                className="liquid is-solid"
                href={button.href}
                {...(button.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {button.label}
              </a>
            ))}
          </div>
        ) : null}
        {project.sample && repositoryHref ? (
          <p className="storyCredit">Repository link points to a public reference project, not my own code.</p>
        ) : null}
      </header>

      {hero ? (
        <div className="wrap storyCover">
          <Frame src={hero} alt="" variant="cover" />
        </div>
      ) : null}

      {blocks.map((block) => (
        <section key={block.id} id={block.id} className={`wrap storyBlock${block.reading ? " is-reading" : ""}`}>
          <h2>{block.label}</h2>
          {block.text ? (
            block.id === "research" ? (
              <div className="storyNote">
                <span>Findings</span>
                {(() => {
                  const split = block.text.match(/^(.+?[.!?])\s+([\s\S]+)$/);
                  return split ? <><strong>{split[1]}</strong><p>{split[2]}</p></> : <p>{block.text}</p>;
                })()}
              </div>
            ) : <p>{block.text}</p>
          ) : null}
          {block.id === "problem" && block.items?.length ? (
            <div className={`storyProblems is-${Math.max(...rowSizes(block.items.length, 3))}`}>
              {(() => {
                let start = 0;
                return rowSizes(block.items.length, 3).map((size) => {
                  const items = block.items.slice(start, start + size);
                  const rowStart = start;
                  start += size;
                  return (
                    <ol key={items.map((item) => item.title).join("-")}>
                      {items.map((item, index) => (
                        <li key={`${item.title}-${item.text}`}>
                          <span>{String(rowStart + index + 1).padStart(2, "0")}</span>
                          {item.title ? <strong>{item.title}</strong> : null}
                          {item.text ? <p>{item.text}</p> : null}
                        </li>
                      ))}
                    </ol>
                  );
                });
              })()}
            </div>
          ) : block.items?.length ? (
            <ul className={block.summary ? "storySummary" : "storyList"}>
              {block.items.map((item) => (
                <li key={`${item.title}-${item.text}`}>
                  {item.title ? <strong>{item.title}</strong> : null}
                  {item.text ? <p>{item.text}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {block.code ? (
            <div className="storyCode">
              {block.language ? <span className="storyCodeLang">{block.language}</span> : null}
              <button
                type="button"
                onClick={(event) => {
                  navigator.clipboard?.writeText(block.code);
                  event.currentTarget.textContent = "Copied";
                }}
              >
                Copy
              </button>
              <pre><code>{block.code}</code></pre>
            </div>
          ) : null}
          {block.video?.kind === "embed" ? (
            <div className="storyPlayer">
              <iframe src={block.video.src} title={block.label} allow="fullscreen" allowFullScreen />
            </div>
          ) : null}
          {block.video?.kind === "file" ? (
            <div className="storyPlayer">
              <video src={block.video.src} controls playsInline preload="metadata" />
            </div>
          ) : null}
          {block.videoRecords?.length ? (
            <>
              <WatchVideo record={block.videoRecords[0]} activeId={activeVideo} onWatch={setActiveVideo} />
              {block.videoRecords.length > 1 ? (
                <div className="storyClips">
                  {block.videoRecords.slice(1).map((record) => (
                    <WatchVideo
                      key={record.providerVideoId || record.title}
                      record={record}
                      activeId={activeVideo}
                      onWatch={setActiveVideo}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
          {block.images?.length ? alternateRows(block.images).map((row) => (
            <div key={row.map((item) => item.src).join("-")} className={`storyImages is-${row.length}`}>
              {row.map((item) => (
                <Frame key={item.src} src={item.src} alt={item.alt} variant="cover" />
              ))}
            </div>
          )) : null}
        </section>
      ))}

      <ShareSection
        className="wrap storyShare"
        path={`/work/${project.slug}`}
        shareTitle={plain(project.title)}
        iconWeight="regular"
      />

      {next ? (
        <section className="wrap storyNext">
          <h2>Next project</h2>
          <Link to={`/work/${next.slug}`}>
            {projectImage(next) ? (
              <Frame src={projectImage(next)} alt="" variant="next" />
            ) : null}
            <strong>{plain(next.title)}</strong>
          </Link>
          <Link className="liquid is-solid" to="/contact">Contact</Link>
        </section>
      ) : null}
      <Footer />
    </main>
  );
}
