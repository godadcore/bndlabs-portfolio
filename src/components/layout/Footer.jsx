// src/components/layout/Footer.jsx
import { CONTACT_EMAIL, SITE_NAME, SOCIAL_LINKS } from "../../lib/site";
import BrandMark from "./BrandMark";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="homeFooter" aria-label="Footer">
      <div className="homeFooterInner">
        <div className="footerBrand">
          <div className="footerLogoSlot" aria-hidden="true">
            <BrandMark className="footerLogoMark" />
          </div>
          <span className="footerText">
            {SITE_NAME}
            <span className="dot">.</span>
          </span>
        </div>

        <p className="footerCopy">
          <span className="footerLegal">
            {"\u00A9"} {year} {SITE_NAME}. All rights reserved.
          </span>
          <span className="footerContactRow">
            <a className="footerEmail" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </span>
        </p>

        <div className="footerLinks" aria-label="Footer links">
          <a href={SOCIAL_LINKS.x} aria-label="X" target="_blank" rel="noreferrer noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2H21l-6.02 6.88L22 22h-5.482l-4.29-5.608L7.32 22H4.56l6.44-7.36L2 2h5.62l3.877 5.122L18.244 2Zm-.968 18h1.526L6.79 3.894H5.146L17.276 20Z" />
            </svg>
          </a>
          <a href={SOCIAL_LINKS.behance} aria-label="Behance" target="_blank" rel="noreferrer noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.072 10.833H4.865v2.45h3.276c1.068 0 1.67-.43 1.67-1.232 0-.838-.601-1.218-1.739-1.218ZM8.523 6.603H4.865v2.268h3.524c.95 0 1.553-.344 1.553-1.125 0-.782-.552-1.143-1.419-1.143ZM18.088 10.666c-1.116 0-1.859.701-2.024 1.845h3.932c-.124-1.136-.71-1.845-1.908-1.845ZM21.281 13.607h-5.242c.086 1.292.777 2.064 2.085 2.064.893 0 1.476-.37 1.704-1.003h1.399c-.322 1.451-1.529 2.288-3.112 2.288-2.008 0-3.337-1.324-3.337-3.397 0-2.056 1.333-3.41 3.31-3.41 1.992 0 3.204 1.367 3.204 3.29 0 .054-.005.113-.01.168Zm-2.527-5.175h-2.92V7.36h2.92v1.072ZM2 17V5h6.66c2.042 0 3.325 1.06 3.325 2.68 0 1.251-.71 2.06-1.864 2.362 1.395.248 2.313 1.234 2.313 2.696C12.434 15.62 10.915 17 8.54 17H2Z" />
            </svg>
          </a>
          <a href={SOCIAL_LINKS.instagram} aria-label="Instagram" target="_blank" rel="noreferrer noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.95 1.6a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
            </svg>
          </a>
          <a href={SOCIAL_LINKS.tiktok} aria-label="TikTok" target="_blank" rel="noreferrer noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.5 3c.33 1.49 1.2 2.67 2.5 3.39.86.48 1.8.72 2.8.71V9.6c-1.38.02-2.73-.34-3.9-1.05v6.5a5.05 5.05 0 1 1-5.18-5.05v2.51a2.54 2.54 0 1 0 2.28 2.54V3h1.5Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
