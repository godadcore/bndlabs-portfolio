import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { loadScript, useLatest, waitFor } from './videoUtils';

/* Official YouTube IFrame API. Loaded once, lazily, from youtube.com. */
let apiPromise;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };
      loadScript('https://www.youtube.com/iframe_api').catch((err) => {
        apiPromise = undefined;
        reject(err);
      });
    });
  }
  return apiPromise;
}

const YouTubePlayer = forwardRef(function YouTubePlayer(props, ref) {
  const { id, loop, startSeconds, endSeconds } = props;
  const cb = useLatest(props);
  const host = useRef(null);
  const player = useRef(null);
  const state = useRef(-1);
  const ending = useRef(false);

  useImperativeHandle(ref, () => ({
    play: () => {
      player.current?.playVideo();
      return waitFor(() => state.current === 1 || state.current === 3);
    },
    pause: () => player.current?.pauseVideo?.(),
    setMuted: (m) => (m ? player.current?.mute?.() : player.current?.unMute?.()),
    seekTo: (seconds) => player.current?.seekTo?.(seconds, true),
  }), []);

  useEffect(() => {
    let cancelled = false;
    let timer;

    function tick() {
      const p = player.current;
      if (!p?.getCurrentTime) return;
      const start = startSeconds || 0;
      const end = endSeconds || p.getDuration();
      if (end > start) {
        cb.current.onProgress?.(Math.min(1, Math.max(0, (p.getCurrentTime() - start) / (end - start))));
      }
    }

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !host.current) return;
        const playerVars = {
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          rel: 0,
          cc_load_policy: 0,
          playsinline: 1,
          mute: 1,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        };
        if (startSeconds) playerVars.start = Math.floor(startSeconds);
        if (endSeconds) playerVars.end = Math.ceil(endSeconds);
        if (loop && !endSeconds) {
          playerVars.loop = 1;
          playerVars.playlist = id;
        }
        const params = new URLSearchParams();
        Object.entries(playerVars).forEach(([key, value]) => params.set(key, String(value)));
        const frame = document.createElement('iframe');
        frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
        frame.title = 'Video';
        frame.src = `https://www.youtube.com/embed/${id}?${params.toString()}`;
        host.current.appendChild(frame);

        player.current = new YT.Player(frame, {
          playerVars,
          events: {
            onReady: () => {
              if (!cancelled) cb.current.onReady?.();
            },
            onStateChange: (e) => {
              state.current = e.data;
              if (ending.current) {
                if (e.data === 2 || e.data === 5 || e.data === -1) ending.current = false;
                cb.current.onPlayingChange?.(false);
                return;
              }
              if (e.data === 0) {
                ending.current = true;
                const start = startSeconds || 0;
                player.current?.seekTo?.(start, true);
                player.current?.pauseVideo?.();
                cb.current.onPlayingChange?.(false);
                return;
              }
              if (e.data === 3) return;
              const playing = e.data === 1;
              cb.current.onPlayingChange?.(playing);
              clearInterval(timer);
              if (playing) timer = setInterval(tick, 250);
              if (e.data === 0 && loop && endSeconds) {
                player.current.seekTo(startSeconds || 0, true);
                player.current.playVideo();
              }
            },
            onError: (event) => {
              if (cancelled) return;
              cb.current.onError?.(event?.data);
            },
          },
        });
      })
      .catch(() => cb.current.onError?.());

    return () => {
      cancelled = true;
      clearInterval(timer);
      try {
        player.current?.destroy();
      } catch {
        /* player already gone */
      }
      player.current = null;
      if (host.current) host.current.innerHTML = '';
    };
  }, [id, loop, startSeconds, endSeconds]);

  return <div ref={host} className="vv__host" />;
});

export default YouTubePlayer;
