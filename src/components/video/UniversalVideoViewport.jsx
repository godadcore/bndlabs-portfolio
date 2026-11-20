import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { resolveVideo } from './VideoProviderResolver';
import { videoManager } from './videoManager';
import { LANDSCAPE, PORTRAIT, parseRatio, useDocumentVisible, usePrefersReducedMotion } from './videoUtils';
import YouTubePlayer from './YouTubePlayer';
import VimeoPlayer from './VimeoPlayer';
import TikTokEmbed from './TikTokEmbed';
import XVideoEmbed from './XVideoEmbed';
import FacebookEmbed from './FacebookEmbed';
import InstagramEmbed from './InstagramEmbed';
import TwitchClipEmbed from './TwitchClipEmbed';
import StreamableEmbed from './StreamableEmbed';
import DirectVideoPlayer from './DirectVideoPlayer';
import VideoInteractionOverlay from './VideoInteractionOverlay';
import VideoLoadingState from './VideoLoadingState';
import VideoErrorState from './VideoErrorState';
import './video.css';

const ADAPTERS = {
  youtube: YouTubePlayer,
  vimeo: VimeoPlayer,
  tiktok: TikTokEmbed,
  x: XVideoEmbed,
  facebook: FacebookEmbed,
  instagram: InstagramEmbed,
  twitch: TwitchClipEmbed,
  streamable: StreamableEmbed,
  direct: DirectVideoPlayer,
};

export const CONTROLS_HIDE_MS = 2000;

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(hover: none)').matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(hover: none)');
    const on = () => setCoarse(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return coarse;
}

function useElementFullscreen() {
  const [enabled, setEnabled] = useState(() =>
    typeof document !== 'undefined' && document.fullscreenEnabled === true
  );
  useEffect(() => {
    const on = () => setEnabled(document.fullscreenEnabled === true);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  return enabled;
}

const UniversalVideoViewport = forwardRef(function UniversalVideoViewport({ video }, ref) {
  const resolved = useMemo(() => resolveVideo(video), [video]);
  const { provider, caps } = resolved;
  const Adapter = ADAPTERS[provider];

  const vid = video.id || resolved.id || 'video';
  const rootRef = useRef(null);
  const playerRef = useRef(null);
  const hideTimer = useRef(null);
  const reduced = usePrefersReducedMotion();
  const docVisible = useDocumentVisible();
  const coarse = useCoarsePointer();
  const fullscreenEnabled = useElementFullscreen();

  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [userStarted, setUserStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [error, setError] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [muted, setMuted] = useState(video.muted !== false);
  const [audioControl, setAudioControl] = useState(caps.audio);
  const [customPlay, setCustomPlay] = useState(caps.play);
  const [customAutoplay, setCustomAutoplay] = useState(caps.autoplay);
  const [progress, setProgress] = useState(0);
  const [detected, setDetected] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [controlsOn, setControlsOn] = useState(false);

  const autoplay = customAutoplay && video.autoplay !== false && !reduced;
  const mounted = Boolean(Adapter) && (near || userStarted);
  const ownControls = Boolean(Adapter) && caps.events && (caps.audio || caps.play || caps.transport);

  const ratio = useMemo(
    () =>
      parseRatio(video.aspectRatio) ||
      (video.orientation === 'portrait' ? PORTRAIT : video.orientation === 'landscape' ? LANDSCAPE : null) ||
      detected ||
      resolved.ratio ||
      LANDSCAPE,
    [video.aspectRatio, video.orientation, detected, resolved.ratio]
  );
  const orientation = ratio[0] < ratio[1] ? 'portrait' : 'landscape';

  const clearHide = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  const armHide = useCallback(() => {
    clearHide();
    hideTimer.current = window.setTimeout(() => {
      const root = rootRef.current;
      const active = document.activeElement;
      if (root && active && active !== document.body && root.contains(active)) return;
      setControlsOn(false);
    }, CONTROLS_HIDE_MS);
  }, [clearHide]);

  useEffect(() => clearHide, [clearHide]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setNear(true);
      setVisible(true);
      return undefined;
    }
    const nearObs = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '100% 0px' });
    const visObs = new IntersectionObserver(([e]) => setVisible(e.intersectionRatio >= 0.6), {
      threshold: [0, 0.6, 1],
    });
    nearObs.observe(el);
    visObs.observe(el);
    return () => {
      nearObs.disconnect();
      visObs.disconnect();
    };
  }, []);

  useEffect(() => videoManager.register(vid, () => playerRef.current?.pause()), [vid]);

  useEffect(() => {
    if (ready) playerRef.current?.setMuted(muted);
  }, [muted, ready]);

  useEffect(() => {
    const p = playerRef.current;
    if (!ready || !p || error) return;
    if (!(visible && docVisible && (autoplay || userStarted))) {
      p.pause();
      return;
    }
    videoManager.claim(vid);
    p.setMuted(muted);
    Promise.resolve(p.play())
      .then(() => setNeedsTap(false))
      .catch(() => setNeedsTap(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, visible, docVisible, autoplay, userStarted, error]);

  const playWithSound = useCallback(() => {
    setUserStarted(true);
    setMuted(false);
    const p = playerRef.current;
    if (p && ready) {
      p.setMuted(false);
      videoManager.claim(vid);
      Promise.resolve(p.play()).catch(() => setNeedsTap(true));
    }
  }, [ready, vid]);

  useImperativeHandle(ref, () => ({
    playWithSound,
    openUrl: () => resolved.openUrl,
    failed: () => error,
  }), [playWithSound, resolved.openUrl, error]);

  const handleReady = useCallback(
    (info = {}) => {
      setReady(true);
      if (info.audioControl === false) setAudioControl(false);
      if (info.events === false || !caps.events) {
        setHasPlayed(true);
        setCustomPlay(false);
        setCustomAutoplay(false);
      }
    },
    [caps.events]
  );
  const handlePlaying = useCallback((isPlaying) => {
    setPlaying(isPlaying);
    if (isPlaying) {
      setHasPlayed(true);
      setNeedsTap(false);
    }
  }, []);
  const handleOrientation = useCallback((w, h) => {
    if (w && h) setDetected([w, h]);
  }, []);
  const handleError = useCallback((code) => {
    rootRef.current?.setAttribute('data-error', String(code ?? 'failed'));
    setError(true);
  }, []);

  const retry = () => {
    setError(false);
    setReady(false);
    setPlaying(false);
    setHasPlayed(false);
    setAttempt((n) => n + 1);
  };

  const toggleMute = (event) => {
    event?.stopPropagation?.();
    const next = !muted;
    setMuted(next);
    playerRef.current?.setMuted(next);
    setControlsOn(true);
    armHide();
  };
  const togglePlay = (event) => {
    event?.stopPropagation?.();
    setUserStarted(true);
    if (playing) playerRef.current?.pause();
    else {
      videoManager.claim(vid);
      Promise.resolve(playerRef.current?.play()).catch(() => setNeedsTap(true));
    }
    setControlsOn(true);
    armHide();
  };

  const revealControls = () => {
    setControlsOn(true);
    armHide();
  };

  const onSurface = () => {
    if (coarse) {
      revealControls();
      return;
    }
    togglePlay();
  };

  const onEnter = () => {
    if (coarse) return;
    setControlsOn(true);
    armHide();
  };
  const onMove = () => {
    if (coarse) return;
    setControlsOn(true);
    armHide();
  };
  const onLeave = () => {
    if (coarse) return;
    const root = rootRef.current;
    const active = document.activeElement;
    if (root && active && root.contains(active)) return;
    clearHide();
    setControlsOn(false);
  };
  const onFocusIn = () => {
    clearHide();
    setControlsOn(true);
  };
  const onFocusOut = (event) => {
    const root = rootRef.current;
    if (root && event.relatedTarget && root.contains(event.relatedTarget)) return;
    armHide();
  };

  const toggleFullscreen = (event) => {
    event?.stopPropagation?.();
    const el = rootRef.current;
    if (!el || !document.fullscreenEnabled) return;
    if (document.fullscreenElement === el) document.exitFullscreen();
    else el.requestFullscreen?.();
    setControlsOn(true);
    armHide();
  };

  const poster = video.poster;
  const showPlay = Boolean(Adapter) && customPlay && !error && !playing && ready && (needsTap || !autoplay || hasPlayed);
  const showCover = !error && !playing && Boolean(poster || hasPlayed);
  const loading = mounted && !ready && !error;

  return (
    <div
      ref={rootRef}
      className={`vv vv--${orientation} vv--${provider}${ownControls ? ' vv--own' : ''}${controlsOn ? ' is-controls' : ''}`}
      style={{ '--vv-w': ratio[0], '--vv-h': ratio[1] }}
      data-provider={provider}
      data-orientation={orientation}
      data-playing={playing ? 'true' : 'false'}
      data-muted={muted ? 'true' : 'false'}
      data-ready={ready ? 'true' : 'false'}
      data-controls={controlsOn ? 'true' : 'false'}
      onMouseEnter={ownControls ? onEnter : undefined}
      onMouseMove={ownControls ? onMove : undefined}
      onMouseLeave={ownControls ? onLeave : undefined}
      onFocus={ownControls ? onFocusIn : undefined}
      onBlur={ownControls ? onFocusOut : undefined}
    >
      {showCover && (
        <div className="vv__cover">
          {poster ? (
            <img className="vv__poster" src={poster} alt={video.thumbnailAlt || video.title || ''} />
          ) : null}
        </div>
      )}

      {mounted && !error && (
        <div className="vv__player">
          <Adapter
            key={attempt}
            ref={playerRef}
            id={resolved.id}
            hash={resolved.hash}
            reel={resolved.reel}
            src={resolved.src}
            poster={poster}
            loop={video.loop}
            startSeconds={video.startSeconds}
            endSeconds={video.endSeconds}
            onReady={handleReady}
            onPlayingChange={handlePlaying}
            onProgress={setProgress}
            onOrientation={handleOrientation}
            onError={handleError}
          />
        </div>
      )}

      {ownControls && playing && !error && (
        <button
          type="button"
          className="vv__shield"
          tabIndex={-1}
          aria-label={coarse ? 'Show controls' : 'Pause video'}
          onClick={(event) => {
            onSurface();
            event.currentTarget.blur();
          }}
        />
      )}

      {loading && <VideoLoadingState />}
      {error && (
        <VideoErrorState
          onRetry={retry}
          openUrl={resolved.openUrl}
          message="This video can’t be played here."
          openLabel={provider === 'youtube' ? 'Watch on YouTube' : 'Open original'}
        />
      )}

      {provider === 'unknown' && resolved.openUrl && (
        <a className="vv__btn vv__open" href={resolved.openUrl} target="_blank" rel="noopener noreferrer">
          Open original
        </a>
      )}

      {Adapter && !error && ownControls && (
        <VideoInteractionOverlay
          showProgress={caps.progress && hasPlayed && ready}
          progress={progress}
          showPlay={showPlay}
          onPlay={togglePlay}
          showMute={audioControl && ready}
          muted={muted}
          onToggleMute={toggleMute}
          showTransport={caps.transport && ready}
          playing={playing}
          onTogglePlay={togglePlay}
          showFullscreen={fullscreenEnabled}
          onFullscreen={toggleFullscreen}
        />
      )}
    </div>
  );
});

export default UniversalVideoViewport;
