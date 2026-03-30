import { useRef } from "react";

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

export default function CaseStudyMediaCarousel({ title, images, onOpen }) {
  const trackRef = useRef(null);

  if (!Array.isArray(images) || !images.length) return null;

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector(".cs-mediaCard");
    const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth : 320;
    const gap = 16;
    track.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <div className="cs-carousel">
      <div className="cs-carouselTrack" ref={trackRef}>
        {images.map((item) => (
          <button
            key={item.key}
            type="button"
            className="cs-mediaCard"
            onClick={() => onOpen(item.key)}
          >
            <div className="cs-mediaFrame">
              <img
                src={item.src}
                alt={item.alt || `${title} image`}
                loading="lazy"
                decoding="async"
              />
            </div>
            {item.caption ? <span className="cs-mediaCaption">{item.caption}</span> : null}
          </button>
        ))}
      </div>

      {images.length > 1 ? (
        <div className="cs-carouselBtns">
          <button type="button" className="cs-carouselBtn" onClick={() => scrollByCard(-1)} aria-label={`Previous ${title} image`}>
            <ChevronLeftIcon />
          </button>
          <button type="button" className="cs-carouselBtn" onClick={() => scrollByCard(1)} aria-label={`Next ${title} image`}>
            <ChevronRightIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}
