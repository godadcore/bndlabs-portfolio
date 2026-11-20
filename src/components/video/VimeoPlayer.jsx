import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { loadScript, useLatest } from './videoUtils';

/* Official Vimeo embed + Vimeo Player SDK (loaded from Vimeo's own host, lazily). */
const VimeoPlayer = forwardRef(function VimeoPlayer(props, ref) {
  const { id, hash, loop, startSeconds, endSeconds } = props;
  const cb = useLatest(props);
  const frame = useRef(null);
  const player = useRef(null);

  const src = useMemo(() => {
    const p = new URLSearchParams({
      muted: '1',
      playsinline: '1',
      autopause: '0',
      dnt: '1',
      title: '0',
      byline: '0',
      portrait: '0',
      controls: '0',
    });
    if (hash) p.set('h', hash);
    if (loop && !endSeconds) p.set('loop', '1');
    return `https://player.vimeo.com/video/${id}?${p.toString()}`;
  }, [id, hash, loop, endSeconds]);

  useImperativeHandle(ref, () => ({
    play: () => player.current.play(), // rejects if the browser blocks it
    pause: () => player.current?.pause(),
    setMuted: (m) => player.current?.setMuted(m),
  }), []);

  useEffect(() => {
    let cancelled = false;
    loadScript('https://player.vimeo.com/api/player.js')
      .then(() => {
        if (cancelled || !frame.current) return;
        const p = new window.Vimeo.Player(frame.current);
        player.current = p;
        p.on('play', () => cb.current.onPlayingChange?.(true));
        p.on('pause', () => cb.current.onPlayingChange?.(false));
        p.on('ended', () => {
          p.setCurrentTime(startSeconds || 0).catch(() => {});
          p.pause().catch(() => {});
          cb.current.onPlayingChange?.(false);
        });
        p.on('error', () => cb.current.onError?.());
        p.on('timeupdate', (d) => {
          const start = startSeconds || 0;
          const end = endSeconds || d.duration;
          if (endSeconds && d.seconds >= endSeconds) {
            if (loop) p.setCurrentTime(start).catch(() => {});
            else p.pause();
          }
          if (end > start) {
            cb.current.onProgress?.(Math.min(1, Math.max(0, (d.seconds - start) / (end - start))));
          }
        });
        return p.ready().then(async () => {
          if (cancelled) return;
          const [w, h] = await Promise.all([p.getVideoWidth(), p.getVideoHeight()]);
          cb.current.onOrientation?.(w, h);
          if (startSeconds) await p.setCurrentTime(startSeconds).catch(() => {});
          cb.current.onReady?.();
        });
      })
      .catch(() => cb.current.onError?.());

    return () => {
      cancelled = true;
      try {
        player.current?.destroy();
      } catch {
        /* player already gone */
      }
      player.current = null;
    };
  }, [id, hash, loop, startSeconds, endSeconds]);

  return (
    <iframe
      ref={frame}
      src={src}
      title="Vimeo video player"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
});

export default VimeoPlayer;
