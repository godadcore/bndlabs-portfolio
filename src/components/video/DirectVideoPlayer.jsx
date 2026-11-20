import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useLatest } from './videoUtils';

/* Native <video> for MP4/WebM. Controls are drawn by VideoInteractionOverlay. */
const DirectVideoPlayer = forwardRef(function DirectVideoPlayer(props, ref) {
  const { src, poster, loop, startSeconds, endSeconds } = props;
  const cb = useLatest(props);
  const el = useRef(null);

  useImperativeHandle(ref, () => ({
    play: () => el.current?.play(),
    pause: () => el.current?.pause(),
    setMuted: (m) => {
      if (el.current) el.current.muted = m;
    },
  }), []);

  useEffect(() => {
    if (el.current) el.current.muted = true; // React does not always reflect the muted attribute
  }, []);

  const range = startSeconds || endSeconds
    ? `#t=${startSeconds || 0}${endSeconds ? ',' + endSeconds : ''}`
    : '';
  const url = src.includes('#') ? src : src + range;

  return (
    <video
      ref={el}
      src={url}
      poster={poster || undefined}
      muted
      playsInline
      preload="metadata"
      loop={Boolean(loop) && !endSeconds}
      onLoadedMetadata={(ev) => {
        const v = ev.currentTarget;
        cb.current.onOrientation?.(v.videoWidth, v.videoHeight);
        cb.current.onReady?.();
      }}
      onPlaying={() => cb.current.onPlayingChange?.(true)}
      onPause={() => cb.current.onPlayingChange?.(false)}
      onEnded={(ev) => {
        const v = ev.currentTarget;
        v.currentTime = startSeconds || 0;
        v.pause();
        cb.current.onPlayingChange?.(false);
      }}
      onTimeUpdate={(ev) => {
        const v = ev.currentTarget;
        const start = startSeconds || 0;
        const end = endSeconds || v.duration;
        if (endSeconds && v.currentTime >= endSeconds) {
          if (loop) {
            v.currentTime = start;
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
        if (end > start) {
          cb.current.onProgress?.(Math.min(1, Math.max(0, (v.currentTime - start) / (end - start))));
        }
      }}
      onError={() => cb.current.onError?.()}
    />
  );
});

export default DirectVideoPlayer;
