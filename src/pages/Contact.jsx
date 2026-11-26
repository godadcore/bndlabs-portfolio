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
import { useEffect, useRef, useState } from "react";
import Footer from "../components/layout/Footer";
import Frame from "../components/paper/Frame";
import Seo from "../components/seo/Seo";
import SocialLink from "../components/social/SocialLink";
import { makeContactPayload, submitContactForm } from "../lib/contactForm";
import { displayImage } from "../lib/media";
import { CONTACT_EMAIL, PAGE_COPY, SOCIAL_LINKS } from "../lib/site";
import { useSiteSettings } from "../providers/siteSettingsContext";
import "./contact-page.css";

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
  company: "",
  turnstileToken: "",
};

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

function TurnstileField({ onToken }) {
  const containerRef = useRef(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const container = containerRef.current;
    if (!TURNSTILE_SITE_KEY || !container) return undefined;

    let widgetId = "";
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !container || !window.turnstile) return;
      widgetId = window.turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "auto",
        callback: (token) => onTokenRef.current(token || ""),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existing = document.querySelector("script[data-turnstile]");
      const script = existing || document.createElement("script");
      if (!existing) {
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.dataset.turnstile = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderWidget);
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;

  return <div ref={containerRef} className="formCheck" />;
}

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
    if (!form.firstName.trim() || !form.lastName.trim() || !form.subject.trim() || !form.message.trim()) {
      setStatus("error");
      setError("Add your name, a subject, and a message.");
      return;
    }
    if (!EMAIL_PATTERN.test(form.email)) {
      setStatus("error");
      setError("Enter a valid email address.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !form.turnstileToken) {
      setStatus("error");
      setError("Complete the spam check before sending.");
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
    <main className="bnd contactPage">
      <Seo
        title={PAGE_COPY.contact.title}
        description={PAGE_COPY.contact.description}
        canonicalPath="/contact"
      />
      <div className="pageFrame pageStack">
      <header className="pageIntro">
        <h1>Contact</h1>
        <p>Send a note about a product, a build, or an AI project.</p>
      </header>
      <section className={`contactLayout${contactSrc ? " has-image" : ""}`}>
        <div className="contactCopy">
          <form className="formGrid" onSubmit={onSubmit} noValidate>
            <div className="formTrap" aria-hidden="true">
              <label>
                Company
                <input
                  name="company"
                  value={form.company}
                  onChange={onChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>
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
            <TurnstileField onToken={(token) => setForm((current) => ({ ...current, turnstileToken: token }))} />
            <button className="liquid is-solid contactSubmit" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending" : "Send message"}
            </button>
            {status === "success" ? (
              <p className="formNote is-success" role="status">Message sent. A confirmation is on its way to your inbox.</p>
            ) : null}
            {status === "error" ? (
              <p className="formNote is-error" role="alert">{error}</p>
            ) : null}
          </form>
        </div>
        <aside className="contactAside">
          {contactSrc ? <Frame src={contactSrc} alt="Bodunde Emmanuel Olatunde" variant="cover" /> : null}
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
