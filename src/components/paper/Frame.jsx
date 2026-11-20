export default function Frame({ src, alt = "", variant = "hero" }) {
  if (!src) return null;
  return (
    <figure className={`paperFrame is-${variant}`}>
      <span className="paperStage">
        <span className="paperSlab" aria-hidden="true" />
        <span className="paperMat">
          <img src={src} alt={alt} />
          <span className="paperWipe" aria-hidden="true" />
        </span>
      </span>
      <span className="paperMark paperMark-tl" aria-hidden="true" />
      <span className="paperMark paperMark-tr" aria-hidden="true" />
      <span className="paperMark paperMark-bl" aria-hidden="true" />
      <span className="paperMark paperMark-br" aria-hidden="true" />
    </figure>
  );
}
