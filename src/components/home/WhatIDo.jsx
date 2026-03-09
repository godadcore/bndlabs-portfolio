import React, { useEffect, useRef, useState } from "react";
import WhatIDo3D from "./WhatIDo3D";

export default function WhatIDo() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio > 0.2);
        setRatio(entry.intersectionRatio || 0);
      },
      { threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="whatidoSection" id="whatido" ref={sectionRef}>
      <div className="whatidoGrid">
        <div className="whatidoLeft">
          <div className="whatidoLabel">
            <span className="whatidoLine" />
            <span className="whatidoLabelText">What I Do</span>
          </div>

          <p className="whatidoSubtext">
            I am a UI/UX designer in Lagos, Nigeria creating human-centered digital product, brand, and frontend experiences.
          </p>

          <h2 className="whatidoHeading">
            <span className="w1">Think.</span>
            <br />
            <span className="w2">Make.</span>
            <br />
            <span className="w3">Solve.</span>
          </h2>

          <button className="whatidoBtn">Contact Me</button>
        </div>

        <div className={`whatidoRight ${inView ? "in-view" : ""}`} aria-hidden="true">
          <WhatIDo3D progress={ratio} />
        </div>
      </div>
    </section>
  );
}
