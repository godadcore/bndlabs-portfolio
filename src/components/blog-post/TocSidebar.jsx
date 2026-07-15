import { useState } from "react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import HugeIcon from "../shared/HugeIcon";

export default function TocSidebar({ headings = [], activeHeading = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!headings || headings.length === 0) {
    return null;
  }

  // Smooth scroll handler inside the .cardScroll container
  const handleScrollTo = (e, headingId) => {
    e.preventDefault();
    const scrollRoot = document.querySelector(".cardScroll");
    const target = scrollRoot?.querySelector(`#${headingId}`) || document.getElementById(headingId);

    if (scrollRoot && target) {
      const rootTop = scrollRoot.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      
      // Floating header height is ~70px. Offset by ~100px to position beautifully just below it.
      const top = scrollRoot.scrollTop + targetTop - rootTop - 100;

      scrollRoot.scrollTo({
        top,
        behavior: "smooth",
      });

      // Update URL hash without causing a page jump
      window.history.pushState(null, "", `#${headingId}`);
      setIsOpen(false);
    }
  };

  // Find text of currently active heading for mobile accordion display
  const activeHeadingObj = headings.find((h) => h.id === activeHeading);
  const activeHeadingText = activeHeadingObj ? activeHeadingObj.text : headings[0].text;

  return (
    <aside className="blogPostToc" aria-label="Table of contents">
      <button
        className="blogPostTocMobileToggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="blogPostTocMobileLabel">On this page</span>
        <span className="blogPostTocMobileActive">{activeHeadingText}</span>
        <span className={`blogPostTocMobileIcon${isOpen ? " is-open" : ""}`}>
          <HugeIcon icon={ArrowDown01Icon} size={16} strokeWidth={2} />
        </span>
      </button>

      <div className={`blogPostTocInner${isOpen ? " is-open" : ""}`}>
        <p className="blogPostTocTitle">On this page</p>
        <ul className="blogPostTocList">
          {headings.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`blogPostTocLink${activeHeading === item.id ? " is-active" : ""}`}
                onClick={(e) => handleScrollTo(e, item.id)}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

