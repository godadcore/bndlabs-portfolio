import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Seo from "../components/seo/Seo";
import FaqSection from "../components/shared/FaqSection";
import usePullToRefresh from "../hooks/usePullToRefresh";
import { makeContactPayload, submitContactForm } from "../lib/contactForm";
import { BASE_KEYWORDS, CONTACT_EMAIL, SITE_NAME, SOCIAL_LINKS } from "../lib/site";
import "./contact.css";

const SERVICES = [
  "UI/UX Design",
  "Frontend Development",
  "Design Systems",
  "Brand Identity",
];

const PROCESS = [
  {
    step: "01",
    title: "Research",
    desc: "Deep-dive into your goals, users, and competitors to uncover insights that drive smart design decisions.",
    icon: "research",
  },
  {
    step: "02",
    title: "Wireframe",
    desc: "Translate strategy into structure - precise, efficient wireframes that map every screen and interaction.",
    icon: "wireframe",
  },
  {
    step: "03",
    title: "Design",
    desc: "High-fidelity, pixel-perfect UI crafted to elevate your brand and delight every type of user.",
    icon: "design",
  },
  {
    step: "04",
    title: "Deliver",
    desc: "Clean handoff with dev-ready files, design tokens, and frontend implementation if needed.",
    icon: "deliver",
  },
];

function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M3 7l7.8 5.2a2.2 2.2 0 0 0 2.4 0L21 7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhone(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M22 16.92v2.2a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.2 18a19.5 19.5 0 0 1-5.2-5.2A19.8 19.8 0 0 1 2.88 4.18 2 2 0 0 1 4.86 2h2.2a2 2 0 0 1 1.96 1.62c.12.82.31 1.62.58 2.38a2 2 0 0 1-.45 2.08L8.1 9.14a16 16 0 0 0 6.76 6.76l1.06-1.06a2 2 0 0 1 2.08-.45c.76.27 1.56.46 2.38.58A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMap(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="10" r="2.7" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function IconMessage(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20 15a3 3 0 0 1-3 3H9l-5 4V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSend(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M22 2 11 13" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path
        d="m22 2-7 20-4-9-9-4 20-7Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSpark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBehance(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.16 11.54c1.12-.43 1.66-1.27 1.66-2.5 0-2.16-1.89-3.04-3.86-3.04H1v11h6.18c2.53 0 4.3-.98 4.3-3.48 0-1.46-.77-2.45-2.32-1.98ZM3.18 8.76h3.05c.78 0 1.4.29 1.4 1.16 0 .93-.66 1.19-1.47 1.19H3.18V8.76Zm3.24 5.48H3.18v-2.54H6.4c.95 0 1.83.22 1.83 1.24 0 1.06-.77 1.3-1.8 1.3ZM18.73 8.16c-3 0-4.8 2.2-4.8 4.9 0 2.86 1.7 4.87 4.74 4.87 2.12 0 3.74-.93 4.47-2.98h-2.47c-.26.54-1.02.95-1.88.95-1.33 0-2.08-.7-2.15-2.06H23c.2-3.15-1.5-5.68-4.27-5.68Zm-2.03 3.95c.18-1.08.82-1.94 1.97-1.94 1.24 0 1.8.92 1.88 1.94H16.7ZM16.48 6.54h4.27V5.1h-4.27v1.44Z" />
    </svg>
  );
}

function IconInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="m5 12 4.2 4.2L19 6.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconLinkedIn(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A2 2 0 1 0 5.3 7 2 2 0 0 0 5.25 3ZM20.44 12.58c0-3.46-1.85-5.07-4.33-5.07-1.99 0-2.88 1.1-3.38 1.87V8.5H9.35c.04.58 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.13-.92.27-.68.88-1.39 1.9-1.39 1.34 0 1.88 1.03 1.88 2.54V20H20v-6.98Z" />
    </svg>
  );
}

function IconWhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.52 3.48A11.8 11.8 0 0 0 12.06 0C5.53 0 .2 5.33.2 11.86c0 2.1.55 4.14 1.6 5.94L0 24l6.39-1.68a11.8 11.8 0 0 0 5.67 1.45h.01c6.53 0 11.86-5.33 11.86-11.86 0-3.17-1.23-6.15-3.41-8.43ZM12.07 21.74a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.79 1 1.01-3.69-.23-.38a9.77 9.77 0 0 1-1.5-5.23c0-5.42 4.41-9.83 9.84-9.83 2.63 0 5.09 1.02 6.94 2.88a9.76 9.76 0 0 1 2.88 6.94c0 5.42-4.41 9.83-9.8 9.89Zm5.39-7.35c-.29-.14-1.7-.84-1.97-.93-.26-.1-.45-.14-.64.14-.19.29-.74.93-.9 1.12-.17.19-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.12-.6.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-.1 2.43.9 1.43 1.28 2.72 2.84 4 1.56 1.28 3.07 1.68 4.17 1.87 1.1.19 2.1.17 2.89.1.88-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.33Z" />
    </svg>
  );
}

function IconResearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function IconWireframe(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.9" />
      <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function IconDesign(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDeliver(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PROCESS_ICONS = {
  research: IconResearch,
  wireframe: IconWireframe,
  design: IconDesign,
  deliver: IconDeliver,
};

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    subscribe: false,
  });

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const scrollRootRef = useRef(null);
  const motionScopeRef = useRef(null);

  usePullToRefresh(scrollRootRef);

  const publicEmail = CONTACT_EMAIL;
  const publicPhone = "+234 905 232 1666";
  const publicLocation = "Lagos, Nigeria";

  const canSubmit = useMemo(() => {
    return Boolean(form.firstName.trim() && form.email.trim() && form.message.trim());
  }, [form]);

  useEffect(() => {
    const root = scrollRootRef.current;
    const scope = motionScopeRef.current;
    if (!root || !scope) return;

    const targets = Array.from(scope.querySelectorAll(".contactReveal"));
    if (!targets.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add("is-inview"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        });
      },
      {
        root,
        threshold: 0.22,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    targets.forEach((el) => {
      if (!el.classList.contains("is-inview")) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = scrollRootRef.current;
    const scope = motionScopeRef.current;
    if (!root || !scope) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
    const mobileMotionQuery = window.matchMedia("(max-width: 768px)");

    const parallaxTargets = Array.from(scope.querySelectorAll(".contactParallax"));
    if (!parallaxTargets.length) return;

    let rafId = 0;

    const update = () => {
      const minimizeMotion = mobileMotionQuery.matches;
      const rootRect = root.getBoundingClientRect();
      const viewportCenter = rootRect.top + rootRect.height / 2;

      parallaxTargets.forEach((item) => {
        if (minimizeMotion) {
          item.style.setProperty("--contact-parallax-y", "0px");
          return;
        }

        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const normalizedDistance = (itemCenter - viewportCenter) / rootRect.height;
        const offsetY = Math.max(-12, Math.min(12, normalizedDistance * -22));
        item.style.setProperty("--contact-parallax-y", `${offsetY.toFixed(2)}px`);
      });

      rafId = 0;
    };

    const queueUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    root.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    queueUpdate();

    return () => {
      root.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      if (rafId) window.cancelAnimationFrame(rafId);
      parallaxTargets.forEach((item) => item.style.removeProperty("--contact-parallax-y"));
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || status === "sending") return;

    setErrorMessage("");
    setStatus("sending");

    try {
      await submitContactForm(
        makeContactPayload(form, "contact-page")
      );

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
        subscribe: false,
      });
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <main className="page contactPage">
      <Seo
        title={`Contact Bodunde Emmanuel | UI/UX Designer in Lagos, Nigeria | ${SITE_NAME}`}
        description="Contact Bodunde Emmanuel for UI/UX design, product design, frontend design, and brand systems. Based in Lagos, Nigeria and available for selected projects."
        keywords={[
          ...BASE_KEYWORDS,
          "contact UI UX designer",
          "hire product designer in Nigeria",
          "contact frontend designer Lagos",
        ]}
        canonicalPath="/contact"
        imageAlt={`Contact page preview for ${SITE_NAME}`}
      />

      <section className="hero aboutCard" aria-label="Contact hero">
        <div className="cardScroll" ref={scrollRootRef}>
          <section className="aboutHeroShell" id="top">
            <div className="aboutShell">
              <div className="aboutStickyHeader">
                <Header active="contact" />
              </div>
            </div>
          </section>

          <div className="contactMotionScope" ref={motionScopeRef}>
          <section className="contactSection" aria-label="Contact form">
            <div className="contactInner">
              <div className="contactHeading contactReveal contactReveal--soft">
                <h1 className="srOnly">Contact UI/UX Designer</h1>
                <p className="contactTitle" aria-hidden="true">
                  Let's build something
                  <br />
                  <span>beautiful together.</span>
                </p>
                <p className="contactSubtitle">
                  Tell me about your product, website, or idea. If you need a UI/UX designer in Lagos, Nigeria, I&apos;ll review it and get back to you with the right next step.
                </p>
               <p className="contactMeta">
  <span className="contactMetaPill">Average response time: within 6 hours</span>
</p>
              </div>

              <div className="contactCard contactReveal contactReveal--lift contactParallax">
                <div className="contactGlassGlow" aria-hidden="true" />
                <div className="contactGlassShine" aria-hidden="true" />

                <div className="contactLeft">
                  <div className="availableBadge">
                    <span className="availableDot" />
                    Available for selected projects
                  </div>

                  <div className="contactLeftTop">
                    <h2 className="contactLeftTitle">
                      Tell me about your
                      <br />
                      next digital product.
                    </h2>

                    <p className="contactLeftText">
                      I help brands and founders create polished digital experiences through strategy, UI/UX, and frontend execution as a digital product designer based in Lagos, Nigeria.
                    </p>
                  </div>

                  <div className="contactServicePills">
                    {SERVICES.map((service) => (
                      <span key={service} className="contactServicePill">
                        <IconSpark className="pillIcon" width="14" height="14" />
                        {service}
                      </span>
                    ))}
                  </div>

                  <ul className="contactInfoList">
                    <li className="contactInfoItem">
                      <span className="contactInfoIcon contactInfoIconAnimated">
                        <IconMail width="16" height="16" />
                      </span>
                      <a href={`mailto:${publicEmail}`} className="contactInfoLink">
                        {publicEmail}
                      </a>
                    </li>

                    <li className="contactInfoItem">
                      <span className="contactInfoIcon contactInfoIconAnimated delay-2">
                        <IconMap width="16" height="16" />
                      </span>
                      <span className="contactInfoText">{publicLocation}</span>
                    </li>

                    <li className="contactInfoItem">
                      <span className="contactInfoIcon contactInfoIconAnimated delay-3">
                        <IconPhone width="16" height="16" />
                      </span>
                      <a href={`tel:${publicPhone.replace(/\s+/g, "")}`} className="contactInfoLink">
                        {publicPhone}
                      </a>
                    </li>
                  </ul>

                  <div className="contactSocials">
                    <a
                      href={SOCIAL_LINKS.linkedin}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="contactSocialBtn social-linkedin"
                    >
                      <IconLinkedIn width="15" height="15" />
                      LinkedIn
                    </a>

                    <a
                      href={SOCIAL_LINKS.whatsapp}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="contactSocialBtn social-whatsapp"
                    >
                      <IconWhatsApp width="15" height="15" />
                      WhatsApp
                    </a>
                  </div>

                  <div className="contactFloatingIcons" aria-hidden="true">
                    <span className="floatIcon floatIconA">
                      <IconSpark width="16" height="16" />
                    </span>
                    <span className="floatIcon floatIconB">
                      <IconMail width="15" height="15" />
                    </span>
                    <span className="floatIcon floatIconC">
                      <IconMessage width="15" height="15" />
                    </span>
                  </div>
                </div>

                <div className="contactRight">
                  <h3 className="contactFormTitle">Get in touch</h3>

                  {status === "success" && (
                    <div className="contactSuccess">
                      <span className="contactSuccessIcon">
                        <IconCheck width="22" height="22" />
                      </span>
                      <p>Message sent successfully. Check your email for the auto-reply while I review your message.</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="contactForm">
                      <div className="contactRow">
                        <div className="contactField">
                          <span className="fieldIcon">
                            <IconUser width="14" height="14" />
                          </span>
                          <input
                            name="firstName"
                            type="text"
                            placeholder="First name"
                            value={form.firstName}
                            onChange={handleChange}
                            className="contactInput"
                            required
                          />
                        </div>

                        <div className="contactField">
                          <span className="fieldIcon">
                            <IconUser width="14" height="14" />
                          </span>
                          <input
                            name="lastName"
                            type="text"
                            placeholder="Last name"
                            value={form.lastName}
                            onChange={handleChange}
                            className="contactInput"
                          />
                        </div>
                      </div>

                      <div className="contactRow">
                        <div className="contactField">
                          <span className="fieldIcon">
                            <IconMail width="14" height="14" />
                          </span>
                          <input
                            name="email"
                            type="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={handleChange}
                            className="contactInput"
                            required
                          />
                        </div>

                        <div className="contactField">
                          <span className="fieldIcon">
                            <IconMessage width="14" height="14" />
                          </span>
                          <input
                            name="subject"
                            type="text"
                            placeholder="Subject"
                            value={form.subject}
                            onChange={handleChange}
                            className="contactInput"
                          />
                        </div>
                      </div>

                      <div className="contactField contactFieldFull">
                        <span className="fieldIcon fieldIconTop">
                          <IconMessage width="14" height="14" />
                        </span>
                        <textarea
                          name="message"
                          placeholder="Tell me about your project, goals, and what you need help with."
                          value={form.message}
                          onChange={handleChange}
                          className="contactTextarea"
                          rows={6}
                          required
                        />
                      </div>

                   <div className="contactSubscribeRow">
  <label className="contactCheckLabel">
    <input
      type="checkbox"
      name="subscribe"
      checked={form.subscribe}
      onChange={handleChange}
      className="contactCheckbox"
    />
    <span className="contactCheckCustom">
      {form.subscribe && <IconCheck width="11" height="11" className="checkIcon" />}
    </span>
    Subscribe to occasional {SITE_NAME} updates.
  </label>

  <span className={`contactSubscribeState ${form.subscribe ? "is-active" : ""}`}>
  </span>
</div>

                      <button type="submit" disabled={status === "sending" || !canSubmit} className="contactSendBtn">
                        <IconSend width="16" height="16" />
                        {status === "sending" ? "Sending..." : "Send Message"}
                      </button>

                      {status === "error" && (
                        <p className="contactError">{errorMessage || "Something went wrong. Please try again."}</p>
                      )}
                  </form>
                </div>
              </div>
            </div>
          </section>

          <section className="processSection contactReveal contactReveal--soft" aria-label="My process">
            <div className="processInner">
              <div className="processSectionHead">
                <p className="processSectionEyebrow">How I work</p>
                <h2 className="processSectionTitle">
                  Design that puts your <em>growth on priority</em>
                </h2>
              </div>

              <div className="processGrid">
                {PROCESS.map((item, i) => {
                  const Icon = PROCESS_ICONS[item.icon];
                  return (
                    <div
                      className="processCard contactReveal contactReveal--card contactParallax"
                      key={item.step}
                      style={{ "--reveal-order": i }}
                    >
                      <div className="processCardTop">
                        <span className="processIconWrap">
                          <Icon width="22" height="22" />
                        </span>
                        <span className="processStep">{item.step}</span>
                      </div>
                      <h3 className="processTitle">{item.title}</h3>
                      <p className="processDesc">{item.desc}</p>
                      {i < PROCESS.length - 1 && <span className="processConnector" aria-hidden="true" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <FaqSection
            sectionClassName="contactReveal contactReveal--soft"
            leftClassName="contactReveal contactReveal--soft"
            itemClassName="contactReveal contactReveal--card"
          />
          </div>

          <Footer />
        </div>
      </section>
    </main>
  );
}

