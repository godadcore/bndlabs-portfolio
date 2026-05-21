import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight01Icon,
  CallIcon,
  Chat01Icon,
  CheckmarkSquare01Icon,
  Layout01Icon,
  Layers01Icon,
  Location01Icon,
  MagicWand01Icon,
  Mail01Icon,
  MailSend01Icon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { LinkedinLogo, WhatsappLogo } from "@phosphor-icons/react";
import Footer from "../components/layout/Footer";
import Seo from "../components/seo/Seo";
import FaqSection from "../components/shared/FaqSection";
import HugeIcon from "../components/shared/HugeIcon";
import usePullToRefresh from "../hooks/usePullToRefresh";
import { makeContactPayload, submitContactForm } from "../lib/contactForm";
import { BASE_KEYWORDS, NIGERIA_LOCATION_KEYWORDS, SITE_NAME } from "../lib/site";
import { useSiteSettings } from "../providers/siteSettingsContext.js";
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
    desc: "Clarify your goals, users, category, and product constraints so the design starts from useful evidence.",
    icon: "research",
  },
  {
    step: "02",
    title: "Wireframe",
    desc: "Translate strategy into structure with focused flows, screen hierarchy, and early interaction decisions.",
    icon: "wireframe",
  },
  {
    step: "03",
    title: "Design",
    desc: "Build a polished interface system that feels consistent, branded, and practical for real users.",
    icon: "design",
  },
  {
    step: "04",
    title: "Deliver",
    desc: "Prepare dev-ready files, design tokens, and frontend implementation support where the project needs it.",
    icon: "deliver",
  },
];

function IconMail(props) {
  return <HugeIcon icon={Mail01Icon} {...props} />;
}

function IconPhone(props) {
  return <HugeIcon icon={CallIcon} {...props} />;
}

function IconMap(props) {
  return <HugeIcon icon={Location01Icon} {...props} />;
}

function IconUser(props) {
  return <HugeIcon icon={UserIcon} {...props} />;
}

function IconMessage(props) {
  return <HugeIcon icon={Chat01Icon} {...props} />;
}

function IconSend(props) {
  return <HugeIcon icon={MailSend01Icon} {...props} />;
}

function IconSpark(props) {
  return <HugeIcon icon={MagicWand01Icon} {...props} />;
}

function IconCheck(props) {
  return <HugeIcon icon={CheckmarkSquare01Icon} strokeWidth={2} {...props} />;
}
function IconLinkedIn(props) {
  return <LinkedinLogo weight="fill" {...props} />;
}

function IconWhatsApp(props) {
  return <WhatsappLogo weight="fill" {...props} />;
}

function IconResearch(props) {
  return <HugeIcon icon={Search01Icon} {...props} />;
}

function IconWireframe(props) {
  return <HugeIcon icon={Layout01Icon} {...props} />;
}

function IconDesign(props) {
  return <HugeIcon icon={Layers01Icon} {...props} />;
}

function IconDeliver(props) {
  return <HugeIcon icon={ArrowRight01Icon} {...props} />;
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
  const { contactEmail, socialLinks } = useSiteSettings();

  usePullToRefresh(scrollRootRef);

  const publicEmail = contactEmail;
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
        title={`Hire Bodunde Emmanuel | UI/UX Designer & Frontend Developer in Nigeria | ${SITE_NAME}`}
        description="Contact Bodunde Emmanuel of Bndlabs for UI/UX design, product design, website design, app design, design systems, and frontend development from Lagos for clients across Nigeria."
        keywords={[
          ...BASE_KEYWORDS,
          ...NIGERIA_LOCATION_KEYWORDS,
          "contact UI UX designer",
          "hire product designer in Nigeria",
          "contact frontend developer Lagos",
        ]}
        canonicalPath="/contact"
        imageAlt={`Contact page preview for ${SITE_NAME}`}
      />

      <section className="hero aboutCard" aria-label="Contact hero">
        <div className="cardScroll" ref={scrollRootRef}>
          <div className="contactMotionScope" ref={motionScopeRef}>
          <section className="contactSection" id="contact" aria-label="Contact form">
            <div className="contactInner">
              <div className="contactHeading contactReveal contactReveal--soft">
                <h1 className="srOnly">Contact UI/UX Designer</h1>
                <p className="contactTitle" aria-hidden="true">
                  Let's build a product
                  <br />
                  <span>people can trust.</span>
                </p>
                <p className="contactSubtitle">
                  Tell me about your product, website, or idea. If you need a UI/UX designer, product designer, or frontend developer in Lagos, Nigeria, I&apos;ll review it and reply with the right next step.
                </p>
               <p className="contactMeta">
  <span className="contactMetaPill">Typical response time: within 24 hours</span>
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
                      I help brands and founders create polished digital experiences through strategy, UI/UX, product design, and frontend execution from Lagos, Nigeria.
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
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="contactSocialBtn social-linkedin"
                    >
                      <IconLinkedIn width="15" height="15" />
                      LinkedIn
                    </a>

                    <a
                      href={socialLinks.whatsapp}
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

                  <form onSubmit={handleSubmit} className="contactPageForm">
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
          />
          </div>

          <Footer />
        </div>
      </section>
    </main>
  );
}

