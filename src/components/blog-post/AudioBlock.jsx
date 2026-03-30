function AudioIcon() {
  return (
    <svg className="blogPostAudioIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AudioBlock({ block }) {
  if (!block?.url) return null;

  return (
    <div className="blogPostAudioBlock">
      <AudioIcon />
      <audio controls>
        <source src={block.url} type="audio/mpeg" />
      </audio>
    </div>
  );
}
