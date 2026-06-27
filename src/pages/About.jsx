import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, useInView, useScroll, useTransform } from "motion/react";
import {
  ArrowReloadHorizontalIcon,
  Chat01Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons";
import OptimizedImage from "../components/shared/OptimizedImage";
import Footer from "../components/layout/Footer";
import greeting from "../assets/About Greeting GIF.webm";
import portfolio1 from "../assets/Portfolio Image 1.png";
import portfolio2 from "../assets/Portfolio Image 2.png";
import portfolio3 from "../assets/Portfolio Image 3.png";
import FigmaIcon from "../components/about/FigmaIcon";
import FramerIcon from "../components/about/FramerIcon";
import LinkedinIcon from "../components/about/LinkedinIcon";
import GoogleIcon from "../components/about/GoogleIcon";
import NotionIcon from "../components/about/NotionIcon";
import Seo from "../components/seo/Seo";
import FaqSection from "../components/shared/FaqSection";
import HugeIcon from "../components/shared/HugeIcon";
import usePullToRefresh from "../hooks/usePullToRefresh";
import { BASE_KEYWORDS, NIGERIA_LOCATION_KEYWORDS, SITE_NAME } from "../lib/site";

function CountUp({ to = 0, suffix = "+", duration = 1400, startWhen = false }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startWhen) return;

    let frameId = 0;
    let startTime = 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * to);

      setValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [to, duration, startWhen]);

  return (
    <>
      {value}
      {suffix}
    </>
  );
}

export default function About() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const statsRef = useRef(null);
  const galleryRef = useRef(null);

  usePullToRefresh(scrollRef);

  const statsInView = useInView(statsRef, {
    once: true,
    amount: 0.45,
  });

  const galleryInView = useInView(galleryRef, {
    once: true,
    amount: 0.2,
  });

  const { scrollYProgress } = useScroll({
    container: scrollRef,
    target: galleryRef,
    offset: ["start end", "end start"],
  });

  const galleryY1 = useTransform(scrollYProgress, [0, 1], [36, -30]);
  const galleryY2 = useTransform(scrollYProgress, [0, 1], [20, -18]);
  const galleryY3 = useTransform(scrollYProgress, [0, 1], [44, -36]);

  const navigateTo = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  const experienceList = useMemo(
    () => [
      {
        company: "Trueminds Innovation Ltd",
        role: "Intern (UI/UX Designer)",
        years: "2026 - Present",
      },
      {
        company: "Novavoyage",
        role: "Remote UI/UX Designer",
        years: "2025",
      },
      {
        company: "PawMart",
        role: "Remote UI/UX Designer",
        years: "2025",
      },
    ],
    []
  );

  const fadeUp = {
    hidden: { opacity: 0, y: 34 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const premiumFade = {
    hidden: { opacity: 0, y: 26, scale: 0.965, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.95,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const staggerWrap = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.06,
      },
    },
  };

  return (
    <main className="page aboutPage">
      <Seo
        title={`About Bodunde Emmanuel | UI/UX Designer & Product Designer in Lagos, Nigeria | ${SITE_NAME}`}
        description="Learn about Bodunde Emmanuel, founder of Bndlabs and a Lagos-based UI/UX designer, product designer, and frontend developer creating thoughtful websites, apps, and design systems for clients across Nigeria."
        keywords={[
          ...BASE_KEYWORDS,
          ...NIGERIA_LOCATION_KEYWORDS,
          "About Bodunde Emmanuel",
          "product designer Lagos",
          "frontend developer Nigeria",
        ]}
        canonicalPath="/about"
        imageAlt={`About ${SITE_NAME} portfolio preview for Bodunde Emmanuel`}
      />

      <section className="hero aboutCard" aria-label="About card">
        <div className="cardScroll" ref={scrollRef}>
          <section className="aboutHeroShell" id="top">
            <div className="aboutShell">
              <div className="aboutBodyGrid">
                <Motion.div
                  className="aboutTextBlock"
                  variants={staggerWrap}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.35 }}
                >
                  <h1 className="srOnly">About Bodunde Emmanuel</h1>

                  <Motion.div className="whoAmI" variants={fadeUp}>
                    Who Am I
                  </Motion.div>

                  <Motion.p className="aboutTitle" variants={fadeUp} aria-hidden="true">
                    Hey I am Bodunde
                    <br />
                    Emmanuel
                  </Motion.p>

                  <Motion.p className="aboutDesc" variants={fadeUp}>
                    Bodunde Emmanuel is a UI/UX designer in Lagos, Nigeria creating
                    clear digital experiences for startups, founders, and growing
                    brands that need polished websites, apps, and product interfaces.
                  </Motion.p>

                  <Motion.p className="aboutDesc" variants={fadeUp}>
                    I transform complex ideas into user-centered digital
                    solutions as a product designer in Nigeria, designing
                    websites, apps, brands, and frontend-ready systems with
                    clarity and purpose.
                  </Motion.p>
                </Motion.div>

                <div className="aboutMediaBlock">
                  <Motion.div
                    className="aboutVideoWrap"
                    variants={premiumFade}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.35 }}
                  >
                    <video autoPlay muted loop playsInline preload="metadata" className="aboutVideo" aria-label="Greeting reel from Bodunde Emmanuel">
                      <source src={greeting} type="video/webm" />
                    </video>
                  </Motion.div>

                  <Motion.div
                    className="aboutIconsRail"
                    aria-label="Tools"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="aboutIconsTrack">
                      <div className="toolFrame outline"><FigmaIcon /></div>
                      <div className="toolFrame dark"><FramerIcon /></div>
                      <div className="toolFrame blue"><LinkedinIcon /></div>
                      <div className="toolFrame dark"><NotionIcon /></div>
                      <div className="toolFrame outline"><GoogleIcon /></div>

                      <div className="toolFrame outline"><FigmaIcon /></div>
                      <div className="toolFrame dark"><FramerIcon /></div>
                      <div className="toolFrame blue"><LinkedinIcon /></div>
                      <div className="toolFrame dark"><NotionIcon /></div>
                      <div className="toolFrame outline"><GoogleIcon /></div>
                    </div>
                  </Motion.div>
                </div>
              </div>

              <Motion.div
                className="aboutStatsRow"
                ref={statsRef}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="statItem">
                  <h2><CountUp to={7} startWhen={statsInView} /></h2>
                  <p>Projects Completed</p>
                </div>

                <div className="statItem">
                  <h2><CountUp to={3} startWhen={statsInView} /></h2>
                  <p>Core Disciplines</p>
                </div>

                <div className="statItem">
                  <h2><CountUp to={3} startWhen={statsInView} /></h2>
                  <p>Years Building</p>
                </div>

                <div className="statItem">
                  <h2><CountUp to={1} startWhen={statsInView} /></h2>
                  <p>Independent Studio</p>
                </div>
              </Motion.div>
            </div>
          </section>

          <section className="aboutExperienceSection">
            <div className="aboutSectionInner">
              <Motion.div
                className="aboutExperienceHead"
                variants={staggerWrap}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Motion.span className="aboutExperiencePill" variants={fadeUp}>
                  My Experience
                </Motion.span>

                <Motion.h2 className="aboutExperienceTitle" variants={fadeUp}>
                  Practical product
                  <br />
                  and interface work
                </Motion.h2>
              </Motion.div>

              <Motion.div
                className="aboutExperienceList"
                variants={staggerWrap}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
              >
                {experienceList.map((item) => (
                  <Motion.div
                    className="aboutExperienceRow"
                    key={item.company}
                    variants={{
                      hidden: { opacity: 0, y: 28 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 180,
                          damping: 18,
                        },
                      },
                    }}
                  >
                    <div className="aboutExperienceLeft">
                      <span className="aboutCompany">{item.company}</span>
                      <span className="aboutRole">({item.role})</span>
                    </div>

                    <div className="aboutExperienceYears">{item.years}</div>
                  </Motion.div>
                ))}
              </Motion.div>

              <div className="aboutExperienceGallery" ref={galleryRef}>
                <div className="aboutGalleryCol">
                  <Motion.div
                    className="aboutGalleryCard aboutGalleryCard--landscape"
                    style={{ y: galleryY1 }}
                    initial={{
                      opacity: 0,
                      x: -60,
                      y: 40,
                      rotate: -5,
                      scale: 0.94,
                      filter: "blur(12px)",
                    }}
                    animate={
                      galleryInView
                        ? {
                            opacity: 1,
                            x: 0,
                            y: 0,
                            rotate: 0,
                            scale: 1,
                            filter: "blur(0px)",
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.95,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <OptimizedImage
                      src={portfolio3}
                      alt="UI UX dashboard design project by Bodunde Emmanuel"
                      width="1024"
                      height="1536"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 88vw, (max-width: 1200px) 28vw, 22vw"
                    />
                  </Motion.div>

                  <Motion.div
                    className="aboutGalleryCard aboutGalleryCard--portrait"
                    style={{ y: galleryY2 }}
                    initial={{
                      opacity: 0,
                      x: 70,
                      y: 30,
                      rotate: 4,
                      scale: 0.95,
                      filter: "blur(12px)",
                    }}
                    animate={
                      galleryInView
                        ? {
                            opacity: 1,
                            x: 0,
                            y: 0,
                            rotate: 0,
                            scale: 1,
                            filter: "blur(0px)",
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.95,
                      delay: 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <OptimizedImage
                      src={portfolio1}
                      alt="Product design case study layout by Bodunde Emmanuel"
                      width="1024"
                      height="1536"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 88vw, (max-width: 1200px) 28vw, 22vw"
                    />
                  </Motion.div>
                </div>

                <div className="aboutGalleryCol">
                  <Motion.div
                    className="aboutGalleryCard aboutGalleryCard--tall"
                    style={{ y: galleryY3 }}
                    initial={{
                      opacity: 0,
                      x: 0,
                      y: 70,
                      rotate: 3,
                      scale: 0.94,
                      filter: "blur(12px)",
                    }}
                    animate={
                      galleryInView
                        ? {
                            opacity: 1,
                            x: 0,
                            y: 0,
                            rotate: 0,
                            scale: 1,
                            filter: "blur(0px)",
                          }
                        : {}
                    }
                    transition={{
                      duration: 1,
                      delay: 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <OptimizedImage
                      src={portfolio2}
                      alt="Brand and interface design work by Bodunde Emmanuel"
                      width="1024"
                      height="1536"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 88vw, (max-width: 1200px) 30vw, 24vw"
                    />
                  </Motion.div>
                </div>
              </div>
            </div>
          </section>

          <section className="aboutProcessSection">
            <div className="aboutSectionInner aboutProcessGrid">
              <Motion.div
                className="aboutProcessIntro"
                variants={staggerWrap}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Motion.span className="aboutProcessKicker" variants={fadeUp}>
                  My Process
                </Motion.span>

                <Motion.h2 className="aboutProcessTitle" variants={fadeUp}>
                  Take a look at
                  <br />
                  our <span className="aboutProcessHighlight">process</span>
                </Motion.h2>

                <Motion.p className="aboutProcessText" variants={fadeUp}>
                  My process keeps strategy, interface design, and frontend
                  handoff connected from the first brief to final delivery.
                </Motion.p>

                <Motion.a
                  href="/contact"
                  onClick={navigateTo("/contact")}
                  className="aboutProcessBtn"
                  variants={fadeUp}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                >
                  Get in touch
                </Motion.a>
              </Motion.div>

              <div className="aboutProcessSteps">
                <Motion.article
                  className="aboutStepCard aboutStepCard--one"
                  initial={{ opacity: 0, y: -120, scale: 0.92 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    type: "spring",
                    stiffness: 170,
                    damping: 16,
                    mass: 0.8,
                  }}
                >
                  <span className="aboutStepBadge">01</span>
                  <div className="aboutStepIcon"><HugeIcon icon={Chat01Icon} size={32} strokeWidth={1.75} /></div>
                  <div className="aboutStepContent">
                    <h3>Make your request</h3>
                    <p>
                      Share your goals, audience, timeline, and the product
                      problems you want the work to solve.
                    </p>
                  </div>
                </Motion.article>

                <Motion.article
                  className="aboutStepCard aboutStepCard--two"
                  initial={{ opacity: 0, x: 130, scale: 0.94 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    type: "spring",
                    stiffness: 165,
                    damping: 16,
                    mass: 0.82,
                    delay: 0.08,
                  }}
                >
                  <span className="aboutStepBadge">02</span>
                  <div className="aboutStepIcon"><HugeIcon icon={ArrowReloadHorizontalIcon} size={32} strokeWidth={1.75} /></div>
                  <div className="aboutStepContent">
                    <h3>Review and refine</h3>
                    <p>
                      We shape the structure, test the hierarchy, and refine
                      the visual system until the experience feels clear.
                    </p>
                  </div>
                </Motion.article>

                <Motion.article
                  className="aboutStepCard aboutStepCard--three"
                  initial={{ opacity: 0, y: 120, scale: 0.92 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    type: "spring",
                    stiffness: 170,
                    damping: 16,
                    mass: 0.84,
                    delay: 0.16,
                  }}
                >
                  <span className="aboutStepBadge">03</span>
                  <div className="aboutStepIcon"><HugeIcon icon={Package01Icon} size={32} strokeWidth={1.75} /></div>
                  <div className="aboutStepContent">
                    <h3>Deliver with clarity</h3>
                    <p>
                      Receive polished screens, reusable UI decisions, and
                      frontend-ready guidance for a cleaner handoff.
                    </p>
                  </div>
                </Motion.article>
              </div>
            </div>
          </section>

          <FaqSection />

          <Footer />
        </div>
      </section>
    </main>
  );
}
