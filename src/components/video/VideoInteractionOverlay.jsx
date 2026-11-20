/* Straight-edged icons only: no curves anywhere. */
const SpeakerOn = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" />
    <path d="M15 8l3 4-3 4M18 5l4 7-4 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
  </svg>
);
const SpeakerOff = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" />
    <path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M6 4l14 8-14 8z" fill="currentColor" />
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" />
  </svg>
);
const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
  </svg>
);

const SEGMENTS = 12;

export default function VideoInteractionOverlay({
  showProgress,
  progress,
  showPlay,
  onPlay,
  showMute,
  muted,
  onToggleMute,
  showTransport,
  playing,
  onTogglePlay,
  showFullscreen,
  onFullscreen,
}) {
  const cluster = showProgress || showMute || showTransport;
  return (
    <>
      {showPlay && (
        <button type="button" className="vv__btn vv__play" onClick={onPlay}>
          <PlayIcon />
          <span>Play</span>
        </button>
      )}

      {cluster && (
        <div className="vv__controls">
          {showProgress && (
            <div className="vv__progress" aria-hidden="true">
              {Array.from({ length: SEGMENTS }, (_, i) => {
                const fill = Math.min(1, Math.max(0, progress * SEGMENTS - i));
                return (
                  <span key={i} className="vv__seg">
                    <span style={{ transform: `scaleX(${fill})` }} />
                  </span>
                );
              })}
            </div>
          )}

          {showMute && (
            <button type="button" className="vv__btn vv__mute" onClick={onToggleMute}>
              {muted ? <SpeakerOff /> : <SpeakerOn />}
              <span>{muted ? 'Click to unmute' : 'Click to mute'}</span>
            </button>
          )}

          {showTransport && (
            <div className="vv__transport">
              <button
                type="button"
                className="vv__btn vv__icon-btn"
                onClick={onTogglePlay}
                aria-label={playing ? 'Pause video' : 'Play video'}
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </button>
              {showFullscreen && (
                <button type="button" className="vv__btn vv__icon-btn" onClick={onFullscreen} aria-label="Fullscreen">
                  <FullscreenIcon />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showMute && (
        <span className="vv__sr" role="status">
          {muted ? 'Sound off' : 'Sound on'}
        </span>
      )}
    </>
  );
}
