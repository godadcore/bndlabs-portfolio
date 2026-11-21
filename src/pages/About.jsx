import { Link } from "react-router-dom";
import ToolIcon from "../components/about/ToolIcon";
import Footer from "../components/layout/Footer";
import Frame from "../components/paper/Frame";
import Seo from "../components/seo/Seo";
import { PROFILE } from "../content/profile";
import { displayImage } from "../lib/media";
import { CONTACT_EMAIL, SOCIAL_LINKS, SITE_NAME } from "../lib/site";
import { useSiteSettings } from "../providers/siteSettingsContext";

function rows(remote, fallback) {
  if (Array.isArray(remote) && remote.length) return remote;
  return fallback;
}

export default function About() {
  const settings = useSiteSettings();
  const intro = settings?.aboutIntro || PROFILE.intro;
  const biography = settings?.aboutBiography || PROFILE.biography;
  const titles = settings?.professionalTitles || PROFILE.titles;
  const photos = (PROFILE.photos.length ? PROFILE.photos : settings?.profilePhotos || [])
    .map((src) => displayImage(src))
    .filter(Boolean);
  const experience = rows(settings?.experience, PROFILE.experience.map(([dates, place, role]) => ({ dates, place, role })));
  const education = rows(settings?.education, PROFILE.education.map(([dates, place]) => ({ dates, place })));
  const portraits = [photos[0] || "", photos[1] || ""];

  return (
    <main className="bnd">
      <Seo
        title={`About | ${SITE_NAME}`}
        description="Bodunde Emmanuel Olatunde is a product designer, full-stack software engineer, and AI practitioner."
        canonicalPath="/about"
      />
      <div className="pageFrame pageStack">
      <header className="pageIntro">
        <h1>{PROFILE.name}</h1>
        <p className="roles">{titles}</p>
        <p className="lead">{intro}</p>
      </header>

      <div className="pageBody">
      <section className="aboutPortraits" aria-label="Photographs">
        {portraits.map((src, index) => (
          <Frame
            key={index}
            src={src}
            allowEmpty
            alt={src ? `Portrait of ${PROFILE.name}` : ""}
            variant="portrait"
          />
        ))}
      </section>

      <section className="band">
        <h2>Background</h2>
        <p className="lead">{biography}</p>
        <div className="practiceGrid">
          <article>
            <h3>Product design</h3>
            <p>Interface design, product flows and case studies. UI/UX work with TrueMinds, Novavoyage, and PawMart.</p>
          </article>
          <article>
            <h3>Software engineering</h3>
            <p>Web applications, APIs and the systems behind a product.</p>
          </article>
          <article>
            <h3>AI</h3>
            <p>Applied AI work, evaluation and training. Handshake AI, AI Trainer and Evaluation Contributor, 2025 to present. AfterQuery, 2025 to present.</p>
          </article>
          <article>
            <h3>Creative and content</h3>
            <p>Identity, editorial graphics and image work. Writing and editing in English, Yoruba and Nigerian Pidgin. Clips, cuts and short highlights.</p>
          </article>
        </div>
      </section>

      <section className="band">
        <h2>Experience</h2>
        <ul className="timeline">
          {experience.map((item) => (
            <li key={`${item.place}-${item.dates}`}>
              <span className="meta">{item.dates || item.when}</span>
              <div>
                <strong>{item.place}</strong>
                {(item.role || item.detail) ? <p>{item.role || item.detail}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="band">
        <h2>Education</h2>
        <ul className="timeline">
          {education.map((item) => (
            <li key={item.place}>
              <span className="meta">{item.dates || item.when}</span>
              <strong>{item.place}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="band">
        <h2>Tools</h2>
        <div className="toolGroups">
          {PROFILE.toolGroups.map((group) => (
            <div className="toolGroup" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((name) => (
                  <li key={name}>
                    <ToolIcon name={name} />
                    <strong>{name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="actions">
          <Link className="liquid" to="/contact">Contact</Link>
          <a className="liquid" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          {SOCIAL_LINKS.linkedin ? <a className="liquid" href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> : null}
        </div>
      </section>
      </div>
      </div>
      <Footer />
    </main>
  );
}
