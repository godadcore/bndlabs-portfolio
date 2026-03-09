import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, useInView, useScroll, useTransform } from "motion/react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import greeting from "../assets/About Greeting GIF.webm";
import portfolio1 from "../assets/Portfolio Image 1.png";
import portfolio2 from "../assets/Portfolio Image 2.png";
import portfolio3 from "../assets/Portfolio Image 3.png";
import FigmaIcon from "../components/about/FigmaIcon";
import FramerIcon from "../components/about/FramerIcon";
import LinkedinIcon from "../components/about/LinkedinIcon";
import GoogleIcon from "../components/about/GoogleIcon";
import NotionIcon from "../components/about/NotionIcon";
import ProcessIconOne from "../components/about/ProcessIconOne";
import ProcessIconTwo from "../components/about/ProcessIconTwo";
import ProcessIconThree from "../components/about/ProcessIconThree";
import Seo from "../components/seo/Seo";
import FaqSection from "../components/shared/FaqSection";
import { BASE_KEYWORDS } from "../lib/site";

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
        company: "Spotify",
        role: "Lead Product Designer",
        years: "2022 - Present",
      },
      {
        company: "Airbnb",
        role: "Senior UI/UX Designer",
        years: "2020 - 2022",
      },
      {
        company: "Microsoft",
        role: "Product Designer",
        years: "2018 - 2020",
      },
      {
        company: "Google",
        role: "UI/UX Designer",
        years: "2016 - 2018",
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
        title="About Bodunde Emmanuel | UI/UX Designer in Lagos, Nigeria | BNDLabs"
        description="Learn more about Bodunde Emmanuel, a UI/UX designer, product designer and frontend designer in Lagos, Nigeria creating thoughtful digital experiences and brand systems."
        keywords={[
          ...BASE_KEYWORDS,
          "About Bodunde Emmanuel",
          "product designer Lagos",
          "frontend designer Nigeria",
        ]}
        canonicalPath="/about"
        imageAlt="About BNDLabs portfolio preview for Bodunde Emmanuel"
      />

      <section className="hero aboutCard" aria-label="About card">
        <div className="cardScroll" ref={scrollRef}>
          <section className="aboutHeroShell" id="top">
            <div className="aboutShell">
              <div className="aboutStickyHeader">
                <Header active="about" />
              </div>

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
                    seamless digital experiences for startups and global brands
                    that inspire and connect with users across every platform.
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
                  <h2><CountUp to={10} startWhen={statsInView} /></h2>
                  <p>Projects Completed</p>
                </div>

                <div className="statItem">
                  <h2><CountUp to={4} startWhen={statsInView} /></h2>
                  <p>Global Clients</p>
                </div>

                <div className="statItem">
                  <h2><CountUp to={3} startWhen={statsInView} /></h2>
                  <p>Years of Experience</p>
                </div>

                <div className="statItem">
                  <h2><CountUp to={1} startWhen={statsInView} /></h2>
                  <p>Awards Received</p>
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
                  Worked with Global
                  <br />
                  Industry leaders
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
                    <img
                      src={portfolio3}
                      alt="UI UX dashboard design project by Bodunde Emmanuel"
                      loading="lazy"
                      decoding="async"
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
                    <img
                      src={portfolio1}
                      alt="Product design case study layout by Bodunde Emmanuel"
                      loading="lazy"
                      decoding="async"
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
                    <img
                      src={portfolio2}
                      alt="Brand and interface design work by Bodunde Emmanuel"
                      loading="lazy"
                      decoding="async"
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
                  Our streamlined design process ensures efficiency and quality
                  from request to final delivery.
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
                  <div className="aboutStepIcon"><ProcessIconOne /></div>
                  <div className="aboutStepContent">
                    <h3>Make your request</h3>
                    <p>
                      Simply submit your design needs through our easy-to-use
                      platform whenever inspiration strikes.
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
                  <div className="aboutStepIcon"><ProcessIconTwo /></div>
                  <div className="aboutStepContent">
                    <h3>Review and refine</h3>
                    <p>
                      Review the initial designs quickly and provide feedback
                      for revisions within a day or two.
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
                  <div className="aboutStepIcon"><ProcessIconThree /></div>
                  <div className="aboutStepContent">
                    <h3>Get your design in time</h3>
                    <p>
                      Receive your polished final designs promptly, typically
                      within 48 hours after approval.
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
