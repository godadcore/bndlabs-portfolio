import { useEffect, useRef, useState } from 'react';

/* Load a third-party script once, only when a player needs it. */
const scriptCache = new Map();
export function loadScript(src) {
  if (scriptCache.has(src)) return scriptCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptCache.delete(src);
      reject(new Error('Could not load ' + src));
    };
    document.head.appendChild(s);
  });
  scriptCache.set(src, promise);
  return promise;
}

/* Always-fresh ref, so player callbacks never go stale inside effects. */
export function useLatest(value) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function useDocumentVisible() {
  const [visible, setVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden
  );
  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}

export const PORTRAIT = [9, 16];
export const LANDSCAPE = [16, 9];

/* Map a portfolio video record onto the fields this player reads. */
export function viewportRecord(record = {}, index = 0) {
  const link = record.hostedUrl || record.videoUrl || record.embedUrl || record.originalUrl || "";
  return {
    id: `${record.providerVideoId || record.embedId || record.title || "video"}-${index}`,
    title: record.title || "",
    poster: record.poster || "",
    thumbnailAlt: record.posterAlt || record.thumbnailAlt || record.title || "",
    videoUrl: link,
    originalUrl: record.originalUrl || link,
    directSrc: record.directSrc || "",
    videoProvider: record.videoProvider || "",
    embedId: record.embedId || record.providerVideoId || "",
    aspectRatio: record.aspectRatio || "",
    orientation: record.orientation || "",
    duration: record.duration || "",
    startSeconds: record.startSeconds,
    endSeconds: record.endSeconds,
    autoplay: record.autoplay,
    muted: record.muted,
    loop: record.loop,
  };
}

/* "9:16", "9/16", "16x9" or a number (width / height) -> [w, h] */
export function parseRatio(input) {
  if (!input) return null;
  if (typeof input === 'number' && input > 0) return [input, 1];
  const m = String(input).match(/^(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)$/i);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/* Resolve when check() is true, reject after ms. Used to detect blocked autoplay. */
export function waitFor(check, ms = 2500, step = 100) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const id = setInterval(() => {
      if (check()) {
        clearInterval(id);
        resolve();
      } else if (Date.now() - start > ms) {
        clearInterval(id);
        reject(new Error('timeout'));
      }
    }, step);
  });
}
