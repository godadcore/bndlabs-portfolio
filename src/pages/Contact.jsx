import {
  BehanceLogo,
  EnvelopeSimple,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  TiktokLogo,
  WhatsappLogo,
  XLogo,
} from "@phosphor-icons/react";
import { useState } from "react";
import Footer from "../components/layout/Footer";
import Frame from "../components/paper/Frame";
import Seo from "../components/seo/Seo";
import SocialLink from "../components/social/SocialLink";
import { makeContactPayload, submitContactForm } from "../lib/contactForm";
import { displayImage } from "../lib/media";
import { CONTACT_EMAIL, SITE_NAME, SOCIAL_LINKS } from "../lib/site";
import { useSiteSettings } from "../providers/siteSettingsContext";

const SOCIAL = [
  ["Email", `mailto:${CONTACT_EMAIL}`, EnvelopeSimple],
  ["LinkedIn", SOCIAL_LINKS.linkedin, LinkedinLogo],
  ["GitHub", "https://github.com/godadcore", GithubLogo],
  ["Behance", SOCIAL_LINKS.behance, BehanceLogo],
  ["X", SOCIAL_LINKS.x, XLogo],
  ["Instagram", SOCIAL_LINKS.instagram, InstagramLogo],
  ["TikTok", SOCIAL_LINKS.tiktok, TiktokLogo],
  ["WhatsApp", SOCIAL_LINKS.whatsapp, WhatsappLogo],
].filter(([, href]) => href);

const INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  subject: "",
  message: "",
};

const localContactFiles = import.meta.glob("../assets/contact/*", {
  eager: true,
  import: "default",
});
const localContact = Object.values(localContactFiles).find((src) => displayImage(src)) || "";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const settings = useSiteSettings();
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const contactSrc = displayImage(settings?.contactImage) || localContact;

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.firstName || !form.lastName || !form.subject || form.message.trim().length < 8) {
      setStatus("error");
      setError("Add your name, a subject, and a short message.");
      return;
    }
    if (!EMAIL_PATTERN.test(form.email)) {
      setStatus("error");
      setError("Enter a valid email address.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await submitContactForm(makeContactPayload(form, "contact-page"));
      setStatus("success");
      setForm(INITIAL);
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "The message could not be sent.");
    }
  };

  return (
    <main className="bnd">
      <Seo
        title={`Contact | ${SITE_NAME}`}
        description="Contact Bodunde Emmanuel Olatunde at Bndlabs."
        canonicalPath="/contact"
      />
      <div className="pageFrame pageStack">
      <header className="pageIntro">
        <h1>Contact</h1>
        <p>Send a note about a product, a build, or an AI project.</p>
      </header>
      <section className={`contactLayout${contactSrc ? " has-image" : ""}`}>
        <div className="contactCopy">
          <form className="formGrid" onSubmit={onSubmit}>
            <div className="formRow">
              <label>
                First name
                <input name="firstName" value={form.firstName} onChange={onChange} required />
              </label>
              <label>
                Last name
                <input name="lastName" value={form.lastName} onChange={onChange} required />
              </label>
            </div>
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={onChange} required />
            </label>
            <label>
              Subject
              <input name="subject" value={form.subject} onChange={onChange} required />
            </label>
            <label>
              Message
              <textarea name="message" rows="6" value={form.message} onChange={onChange} required />
            </label>
            <button className="liquid is-solid" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending" : "Send"}
            </button>
            {status === "success" ? <p className="formNote">Message sent.</p> : null}
            {status === "error" ? <p className="formNote">{error}</p> : null}
          </form>
        </div>
        <aside className="contactAside">
          {contactSrc ? <Frame src={contactSrc} alt="" variant="cover" /> : null}
          <a className="contactMail" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <nav className="socialIcons" aria-label="Social">
            {SOCIAL.map(([label, href, Icon]) => (
              <SocialLink key={label} label={label} href={href}>
                <Icon size={18} weight="regular" />
              </SocialLink>
            ))}
          </nav>
        </aside>
      </section>
      </div>
      <Footer />
    </main>
  );
}
