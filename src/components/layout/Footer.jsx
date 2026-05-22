// src/components/layout/Footer.jsx
import { BehanceLogo, InstagramLogo, TiktokLogo, XLogo } from "@phosphor-icons/react";
import { SITE_NAME } from "../../lib/site";
import { useSiteSettings } from "../../providers/siteSettingsContext.js";

export default function Footer() {
  const year = new Date().getFullYear();
  const { contactEmail, socialLinks } = useSiteSettings();
  const footerEmail = contactEmail || "hello@getbndlabs.com";
  const socialItems = [
    {
      key: "x",
      href: socialLinks?.x,
      label: "X",
      className: "footerSocialLink--x",
      icon: <XLogo size={21} weight="fill" aria-hidden="true" />,
    },
    {
      key: "behance",
      href: socialLinks?.behance,
      label: "Behance",
      className: "footerSocialLink--behance",
      icon: <BehanceLogo size={21} weight="fill" aria-hidden="true" />,
    },
    {
      key: "instagram",
      href: socialLinks?.instagram,
      label: "Instagram",
      className: "footerSocialLink--instagram",
      icon: <InstagramLogo size={21} weight="regular" aria-hidden="true" />,
    },
    {
      key: "tiktok",
      href: socialLinks?.tiktok,
      label: "TikTok",
      className: "footerSocialLink--tiktok",
      icon: <TiktokLogo size={21} weight="fill" aria-hidden="true" />,
    },
  ].filter((item) => item.href);

  return (
    <footer className="homeFooter" aria-label="Footer">
      <div className="homeFooterInner">
        <div className="footerBrand">
          <div className="footerLogoSlot" aria-hidden="true">
            <img
              className="footerLogoMark"
              src="/brand-icon.svg"
              alt=""
              width="100"
              height="100"
              decoding="async"
            />
          </div>
          <span className="footerText">
            {SITE_NAME}
            <span className="dot">.</span>
          </span>
        </div>

        <p className="footerServices">
          UI/UX Designer and Frontend Developer in Lagos, helping startups, brands, and businesses across Nigeria build clean, functional digital products.
        </p>

        <div className="footerActions">
          <a className="footerEmail" href={`mailto:${footerEmail}`}>
            {footerEmail}
          </a>

          <nav className="footerLinks" aria-label="Social links">
            {socialItems.map((item) => (
              <a
                className={`footerSocialLink ${item.className}`}
                href={item.href}
                aria-label={item.label}
                target="_blank"
                rel="noreferrer noopener"
                key={item.key}
              >
                {item.icon}
              </a>
            ))}
          </nav>
        </div>

        <p className="footerLegal">
          {"\u00A9"} {year} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
