import { useState } from "react";

export default function SocialLink({ label, href, children }) {
  const external = href.startsWith("http");
  const [pinned, setPinned] = useState(false);

  const onClick = (event) => {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (!coarse) return;
    if (!pinned) {
      event.preventDefault();
      setPinned(true);
      return;
    }
    setPinned(false);
  };

  return (
    <span className={`tipWrap${pinned ? " is-pinned" : ""}`}>
      <a
        href={href}
        aria-label={label}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        onClick={onClick}
        onBlur={() => setPinned(false)}
      >
        {children}
      </a>
      <span className="tip" role="tooltip">{label}</span>
    </span>
  );
}
