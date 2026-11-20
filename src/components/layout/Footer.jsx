import {
  BehanceLogo,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  TiktokLogo,
  WhatsappLogo,
  XLogo,
} from "@phosphor-icons/react";
import Wordmark from "../brand/Wordmark";
import SocialLink from "../social/SocialLink";
import { NOTES_LABEL } from "../../content/labels";
import { SOCIAL_LINKS } from "../../lib/site";

const NAV = [
  ["Home", "/"],
  ["About", "/about"],
  [NOTES_LABEL, "/notes"],
  ["Contact", "/contact"],
];

const SOCIAL = [
  ["LinkedIn", SOCIAL_LINKS.linkedin, LinkedinLogo],
  ["GitHub", "https://github.com/godadcore", GithubLogo],
  ["Behance", SOCIAL_LINKS.behance, BehanceLogo],
  ["X", SOCIAL_LINKS.x, XLogo],
  ["Instagram", SOCIAL_LINKS.instagram, InstagramLogo],
  ["TikTok", SOCIAL_LINKS.tiktok, TiktokLogo],
  ["WhatsApp", SOCIAL_LINKS.whatsapp, WhatsappLogo],
].filter(([, href]) => href);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="close">
      <div className="closeInner">
        <div className="closeBrand">
          <a className="closeMark" href="/" aria-label="Bndlabs home">
            <Wordmark />
          </a>
          <p>I design digital products, build software, and work with AI.</p>
        </div>
        <div className="closeAside">
          <nav className="closeLinks" aria-label="Footer">
            <ul>
              {NAV.map(([label, href]) => (
                <li key={href}><a href={href}>{label}</a></li>
              ))}
            </ul>
          </nav>
          <nav className="socialIcons" aria-label="Social">
            {SOCIAL.map(([label, href, Icon]) => (
              <SocialLink key={label} label={label} href={href}>
                <Icon size={18} weight="regular" />
              </SocialLink>
            ))}
          </nav>
        </div>
      </div>
      <div className="closeRail">
        <span>© {year} Bndlabs</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top
        </button>
      </div>
    </footer>
  );
}
