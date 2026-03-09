import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DEFAULT_FAQS = [
  {
    q: "What services do you offer?",
    a: "I offer end-to-end UI/UX design, frontend development, design systems, and brand identity - from early strategy through to pixel-perfect delivery.",
  },
  {
    q: "Do you offer discounts for non-profits?",
    a: "Yes - I offer reduced rates for non-profit organisations and social impact projects. Reach out and let's talk about what works for your budget.",
  },
  {
    q: "Which industry are you best suited for?",
    a: "I've worked across fintech, SaaS, e-commerce, and creative agencies. If your product lives on a screen and needs to feel exceptional, I'm a good fit.",
  },
  {
    q: "How does your process work with clients?",
    a: "We start with a discovery call, align on scope and goals, then move through research, wireframes, and design in collaborative sprints - with your feedback at every stage.",
  },
  {
    q: "How long does a typical project take?",
    a: "Most projects run 2-8 weeks depending on scope. A landing page might take 1-2 weeks; a full product design system can take 6-10 weeks.",
  },
];

function IconChevron(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

export default function FaqSection({
  items = DEFAULT_FAQS,
  sectionClassName = "",
  leftClassName = "",
  itemClassName = "",
  ctaText = "Start a project",
  onCtaClick,
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleCtaClick = onCtaClick || (() => {
    if (location.pathname === "/contact") {
      document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate("/contact");
  });

  return (
    <section
      className={joinClasses("faqSection", sectionClassName)}
      aria-label="Frequently asked questions"
    >
      <div className="faqInner">
        <div
          className={joinClasses("faqLeft", leftClassName)}
          style={itemClassName ? { "--reveal-order": 0 } : undefined}
        >
          <p className="faqEyebrow">FAQ</p>
          <h2 className="faqTitle">
            We've got <br />
            the <em>answers</em>
          </h2>
          <p className="faqSubtext">
            Bring to the table win-win strategies to ensure proactive results. At the end of the day.
          </p>
          <button className="faqCta" onClick={handleCtaClick}>
            {ctaText}
          </button>
        </div>

        <div className="faqRight">
          {items.map((item, index) => (
            <div
              key={item.q}
              className={joinClasses(
                "faqItem",
                itemClassName,
                openFaq === index ? "is-open" : ""
              )}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              style={itemClassName ? { "--reveal-order": index + 1 } : undefined}
            >
              <div className="faqItemHead">
                <span className="faqQ">{item.q}</span>
                <span className="faqChevron">
                  <IconChevron width="18" height="18" />
                </span>
              </div>
              {openFaq === index ? <p className="faqA">{item.a}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
