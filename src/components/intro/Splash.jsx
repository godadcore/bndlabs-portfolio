import { useEffect, useState } from "react";
import { SPLASH_COPY } from "../../content/profile";
import { useSiteSettings } from "../../providers/siteSettingsContext";
import Wordmark from "../brand/Wordmark";

const SEEN_KEY = "bndlabs-intro-seen";
const DURATION = 4000;

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function remember() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* session storage can be unavailable */
  }
}

export default function Splash() {
  const settings = useSiteSettings();
  const [visible, setVisible] = useState(() => !alreadySeen());
  const [leaving, setLeaving] = useState(false);
  const [percent, setPercent] = useState(0);
  const [reduced, setReduced] = useState(false);

  const message = settings?.splashMessage || SPLASH_COPY.message;
  const image = settings?.splashImage || SPLASH_COPY.image;
  const lines = message.split(/(?<=,)\s+|\s+(?=and\b)/).filter(Boolean);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const replay = () => {
      try {
        sessionStorage.removeItem(SEEN_KEY);
      } catch {
        /* ignore */
      }
      setLeaving(false);
      setPercent(0);
      setVisible(true);
    };
    window.addEventListener("bndlabs:replay-intro", replay);
    return () => window.removeEventListener("bndlabs:replay-intro", replay);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || reduced) return undefined;
    const started = performance.now();
    let frame = 0;
    const tick = (now) => {
      const next = Math.min(100, Math.round(((now - started) / DURATION) * 100));
      setPercent(next);
      if (next < 100) {
        frame = window.requestAnimationFrame(tick);
      } else {
        setLeaving(true);
        window.setTimeout(() => {
          remember();
          setVisible(false);
        }, 420);
      }
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [visible, reduced]);

  const finish = () => {
    remember();
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 220);
  };

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <section className={`splash${leaving ? " is-leaving" : ""}`} role="dialog" aria-label="Introduction" aria-modal="true">
      <svg className="splashPath" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
        <path d="M36 86 H1164 V150 H980 V430 H1164 V740 H36 V620 H180 V470 H36 V86" />
      </svg>
      <div className="splashTop">
        <Wordmark />
        <button type="button" className="splashSkip" onClick={finish}>
          Skip
        </button>
      </div>
      <div className="splashStage">
        <h1>
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <figure>
          <img src={image} alt="" />
        </figure>
      </div>
      {reduced ? (
        <button type="button" className="splashEnter" onClick={finish}>
          Continue
        </button>
      ) : (
        <p className="splashPercent">{String(percent).padStart(3, "0")}%</p>
      )}
    </section>
  );
}
