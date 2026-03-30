import { useEffect, useRef } from "react";

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export default function CaseStudyLightbox({ items, index, onClose, onPrev, onNext }) {
  const pointerStartRef = useRef(null);
  const activeItem = items[index] || null;

  useEffect(() => {
    if (!activeItem) return undefined;

    const handleKeydown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [activeItem, onClose, onNext, onPrev]);

  if (!activeItem) return null;

  const handlePointerDown = (event) => {
    pointerStartRef.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (pointerStartRef.current == null) return;
    const delta = event.clientX - pointerStartRef.current;
    pointerStartRef.current = null;

    if (delta <= -56) onNext();
    if (delta >= 56) onPrev();
  };

  return (
    <div
      className="cs-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button type="button" className="cs-lightboxClose" onClick={onClose} aria-label="Close image preview">
        <CloseIcon />
      </button>

      {items.length > 1 ? (
        <button type="button" className="cs-lightboxNav cs-lightboxNav--prev" onClick={onPrev} aria-label="Previous image">
          <ChevronLeftIcon />
        </button>
      ) : null}

      <figure
        className="cs-lightboxFigure"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <img src={activeItem.src} alt={activeItem.alt || "Expanded case study image"} />
        {activeItem.caption ? <figcaption>{activeItem.caption}</figcaption> : null}
      </figure>

      {items.length > 1 ? (
        <button type="button" className="cs-lightboxNav cs-lightboxNav--next" onClick={onNext} aria-label="Next image">
          <ChevronRightIcon />
        </button>
      ) : null}
    </div>
  );
}
