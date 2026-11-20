import { useEffect, useRef, useState } from "react";
import { SPLASH_COPY } from "../../content/profile";
import Frame from "../paper/Frame";
import Wordmark from "../brand/Wordmark";

const SEEN_KEY = "bndlabs-intro-seen";
const RUN_MS = 10000;
const HOLD_MS = 400;
const EXIT_MS = 400;
const REDUCED_MS = 1500;

const LINES = [
  "I design digital products,",
  "I build the software,",
  "and I work with AI.",
];

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

function greetingFor(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Splash() {
  const [visible, setVisible] = useState(() => !alreadySeen());
  const [leaving, setLeaving] = useState(false);
  const [percent, setPercent] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [runId, setRunId] = useState(0);
  const [greeting] = useState(() => greetingFor());
  const skipRef = useRef(null);
  const closing = useRef(false);

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
      closing.current = false;
      setLeaving(false);
      setPercent(0);
      setVisible(true);
      setRunId((value) => value + 1);
    };
    window.addEventListener("bndlabs:replay-intro", replay);
    return () => window.removeEventListener("bndlabs:replay-intro", replay);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const previous = document.activeElement;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      skipRef.current?.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      if (previous instanceof HTMLElement && document.contains(previous)) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [visible, runId]);

  useEffect(() => {
    if (!visible) return undefined;
    let raf = 0;
    let hold = 0;
    let exit = 0;
    const runFor = reduced ? REDUCED_MS : RUN_MS;
    const started = performance.now();
    const close = () => {
      if (closing.current) return;
      closing.current = true;
      remember();
      setLeaving(true);
      exit = window.setTimeout(() => setVisible(false), EXIT_MS);
    };
    const tick = (now) => {
      const next = Math.min(100, Math.round(((now - started) / runFor) * 100));
      setPercent(next);
      if (next < 100) {
        raf = window.requestAnimationFrame(tick);
        return;
      }
      if (reduced) close();
      else hold = window.setTimeout(close, HOLD_MS);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(hold);
      window.clearTimeout(exit);
    };
  }, [visible, reduced, runId]);

  const finish = () => {
    if (closing.current) return;
    closing.current = true;
    remember();
    setLeaving(true);
    window.setTimeout(() => setVisible(false), EXIT_MS);
  };

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, runId]);

  if (!visible) return null;

  return (
    <section
      key={runId}
      className={`splash${leaving ? " is-leaving" : ""}${reduced ? " is-reduced" : ""}`}
      role="dialog"
      aria-label="Introduction"
      aria-modal="true"
    >
      <span className="splashFrame" aria-hidden="true" />
      <div className="shell splashInner">
        <div className="splashTop">
          <Wordmark />
          <button ref={skipRef} type="button" className="liquid" onClick={finish}>
            Skip
          </button>
        </div>
        <div className="splashStage">
          <div className="splashCopy">
            <p className="splashGreet">{greeting}</p>
            <p className="splashName">Bodunde Emmanuel Olatunde</p>
            <h1>
              {LINES.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="splashWelcome">Welcome to Bndlabs.</p>
          </div>
          <div className="splashPortrait">
            <Frame src={SPLASH_COPY.image} alt="" variant="cover" />
          </div>
        </div>
        <div className="splashProgress">
          <p className="splashCount">{percent}%</p>
          <div className="splashMeterBlock">
            <div
              className="splashMeter"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label="Loading"
            >
              <span style={{ width: `${percent}%` }} />
            </div>
            <p className="splashCaption">Loading</p>
          </div>
        </div>
      </div>
    </section>
  );
}
