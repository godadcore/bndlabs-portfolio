export default function VideoErrorState({ onRetry, openUrl, message, openLabel }) {
  return (
    <div className="vv__error" role="alert">
      <p className="vv__error-text">{message || "This video can’t be played here."}</p>
      <div className="vv__error-actions">
        <button type="button" className="vv__btn" onClick={onRetry}>
          Retry
        </button>
        {openUrl && (
          <a className="vv__btn" href={openUrl} target="_blank" rel="noopener noreferrer">
            {openLabel || "Open original"}
          </a>
        )}
      </div>
    </div>
  );
}
