import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useLatest, waitFor } from './videoUtils';

/*
  TikTok's official embed player (iframe, no script on the page).
  The parameter names and the postMessage commands/events below follow TikTok's
  Embed Player documentation. VERIFY them against the current docs before you rely
  on this adapter: https://developers.tiktok.com/doc/embed-player

  If TikTok never answers with "onPlayerReady", this adapter reports
  { audioControl: false, events: false } so the page shows TikTok's native controls
  and hides the custom mute button instead of showing a button that does nothing.
*/
const ORIGIN = 'https://www.tiktok.com';

const TikTokEmbed = forwardRef(function TikTokEmbed(props, ref) {
  const { id, loop } = props;
  const cb = useLatest(props);
  const frame = useRef(null);
  const state = useRef(-1);
  const answered = useRef(false);

  const send = (type, value) =>
    frame.current?.contentWindow?.postMessage({ 'x-tiktok-player': true, type, value }, ORIGIN);

  const src = useMemo(() => {
    const p = new URLSearchParams({
      controls: '1',
      progress_bar: '1',
      play_button: '1',
      volume_control: '1',
      fullscreen_button: '1',
      timestamp: '0',
      music_info: '0',
      description: '0',
      rel: '0',
      native_context_menu: '0',
      closed_caption: '0',
      autoplay: '0',
      loop: loop ? '1' : '0',
    });
    return `${ORIGIN}/player/v1/${id}?${p.toString()}`;
  }, [id, loop]);

  useImperativeHandle(ref, () => ({
    play: () => {
      send('play');
      return waitFor(() => state.current === 1);
    },
    pause: () => send('pause'),
    setMuted: (m) => send(m ? 'mute' : 'unMute'),
  }), []);

  useEffect(() => {
    answered.current = false;
    const onMessage = (ev) => {
      if (ev.origin !== ORIGIN || ev.source !== frame.current?.contentWindow) return;
      const d = ev.data;
      if (!d || !d['x-tiktok-player']) return;
      if (d.type === 'onPlayerReady') {
        answered.current = true;
        cb.current.onReady?.({ audioControl: false, events: false });
      } else if (d.type === 'onStateChange') {
        state.current = d.value;
        cb.current.onPlayingChange?.(d.value === 1);
      } else if (d.type === 'onCurrentTime') {
        const { currentTime, duration } = d.value || {};
        if (duration) cb.current.onProgress?.(currentTime / duration);
      } else if (d.type === 'onError') {
        cb.current.onError?.();
      }
    };
    window.addEventListener('message', onMessage);
    const timer = setTimeout(() => {
      if (!answered.current) cb.current.onReady?.({ audioControl: false, events: false });
    }, 8000);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
    };
  }, [id]);

  return (
    <iframe
      ref={frame}
      src={src}
      title="TikTok video player"
      allow="autoplay; fullscreen; encrypted-media"
      allowFullScreen
    />
  );
});

export default TikTokEmbed;
