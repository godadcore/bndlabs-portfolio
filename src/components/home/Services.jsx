// src/components/home/Services.jsx
import { useEffect, useRef } from "react";
import {
  CodeIcon,
  Layout01Icon,
  PaintBoardIcon,
  PenTool01Icon,
} from "@hugeicons/core-free-icons";
import HugeIcon from "../shared/HugeIcon";

const SERVICES = [
  {
    no: "01",
    title: "UI/UX Design",
    desc:
      "We create intuitive, visually appealing interfaces that enhance user experience and navigation, ensuring your app is both beautiful and functional across all devices.",
    icon: Layout01Icon,
  },
  {
    no: "02",
    title: "Development",
    desc:
      "Our team builds reliable, scalable solutions, delivering clean code that powers websites and mobile apps with top-notch performance and security.",
    icon: CodeIcon,
  },
  {
    no: "03",
    title: "Graphic Design",
    desc:
      "We design responsive, user-friendly visuals that blend aesthetics with functionality, delivering a seamless experience across devices and reflecting your brand identity.",
    icon: PenTool01Icon,
  },
  {
    no: "04",
    title: "Branding",
    desc:
      "We craft memorable brand identities, from logos to complete strategies, ensuring consistency and a strong connection with your audience across all platforms.",
    icon: PaintBoardIcon,
  },
];

export default function Services({ scrollRootRef }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    // ✅ best: use scrollRootRef from Home.jsx
    // fallback: find .cardScroll if you didn't pass it yet
    const root = scrollRootRef?.current || document.querySelector(".cardScroll");
    const section = sectionRef.current;

    if (!root || !section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("is-inview");
        io.unobserve(entry.target);
      },
      { root, threshold: 0.3, rootMargin: "-5% 0px -20% 0px" }
    );

    io.observe(section);
    return () => io.disconnect();
  }, [scrollRootRef]);

  return (
    <section
      className="servicesSection sectionBlock"
      aria-label="Services"
      ref={sectionRef}
    >
      <div className="servicesGrid">
        {/* LEFT */}
        <div className="servicesIntro">
          <h2 className="servicesTitle">How Can I Assist You?</h2>
        </div>

        {/* RIGHT */}
        <div className="servicesCards" role="list">
          {SERVICES.map((s) => (
            <article className="serviceCard" role="listitem" key={s.no}>
              <div className="serviceTop">
                <span className="serviceIcon" aria-hidden="true">
                  <HugeIcon icon={s.icon} size={24} strokeWidth={1.75} />
                </span>
                <p className="serviceDesc">{s.desc}</p>
              </div>

              <div className="serviceBottom">
                <h3 className="serviceName">{s.title}</h3>
                <span className="serviceNo" aria-hidden="true">
                  {s.no}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
