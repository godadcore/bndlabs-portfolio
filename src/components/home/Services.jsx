// src/components/home/Services.jsx
import { useEffect, useRef } from "react";

import figmaIcon from "../../assets/icons/figma.svg";
import framerIcon from "../../assets/icons/framer.svg";
import penIcon from "../../assets/icons/pen.svg";
import brandingTextIcon from "../../assets/icons/branding-text.svg";

const SERVICES = [
  {
    no: "01",
    title: "UI/UX Design",
    desc:
      "We create intuitive, visually appealing interfaces that enhance user experience and navigation, ensuring your app is both beautiful and functional across all devices.",
    icon: figmaIcon,
  },
  {
    no: "02",
    title: "Development",
    desc:
      "Our team builds reliable, scalable solutions, delivering clean code that powers websites and mobile apps with top-notch performance and security.",
    icon: framerIcon,
  },
  {
    no: "03",
    title: "Graphic Design",
    desc:
      "We design responsive, user-friendly visuals that blend aesthetics with functionality, delivering a seamless experience across devices and reflecting your brand identity.",
    icon: penIcon,
  },
  {
    no: "04",
    title: "Branding",
    desc:
      "We craft memorable brand identities, from logos to complete strategies, ensuring consistency and a strong connection with your audience across all platforms.",
    icon: brandingTextIcon,
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
        section.classList.toggle("is-inview", entry.isIntersecting);
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
                  <img src={s.icon} alt={`${s.title} service icon`} className="serviceIconImg" />
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
