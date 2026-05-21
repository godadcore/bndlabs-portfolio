import { createElement, useEffect, useMemo, useRef, useState } from "react";
import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  ThreadsLogo,
  XLogo,
} from "@phosphor-icons/react";
import { CopyLinkIcon, Tick01Icon } from "@hugeicons/core-free-icons";
import { useLocation } from "react-router-dom";
import { absoluteUrl } from "../../lib/site";
import HugeIcon from "./HugeIcon";
import "./share-section.css";

const COPY_RESET_DELAY = 1800;

function normalizeSharePath(path, location) {
  const resolvedPath = String(path || `${location.pathname}${location.search}` || "/").trim();
  return resolvedPath || "/";
}

function fallbackCopyToClipboard(value) {
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "-9999px";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  field.remove();
}

async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  fallbackCopyToClipboard(value);
}

export default function ShareSection({ path = "", shareTitle = "", className = "" }) {
  const location = useLocation();
  const resetTimerRef = useRef(0);
  const [copiedTarget, setCopiedTarget] = useState("");
  const pageUrl = useMemo(
    () => absoluteUrl(normalizeSharePath(path, location)),
    [location, path]
  );
  const shareText = shareTitle ? `${shareTitle} ${pageUrl}` : pageUrl;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(shareTitle || "bndlabs");

  useEffect(() => () => window.clearTimeout(resetTimerRef.current), []);

  const handleCopy = async (target = "copy") => {
    try {
      await copyToClipboard(pageUrl);
      setCopiedTarget(target);
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => setCopiedTarget(""), COPY_RESET_DELAY);
    } catch {
      setCopiedTarget("");
    }
  };

  const shareLinks = [
    {
      key: "facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookLogo,
    },
    {
      key: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: XLogo,
    },
    {
      key: "threads",
      label: "Share on Threads",
      href: `https://www.threads.net/intent/post?text=${encodedText}`,
      Icon: ThreadsLogo,
    },
    {
      key: "linkedin",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedinLogo,
    },
    {
      key: "instagram",
      label: "Open Instagram",
      href: "https://www.instagram.com/",
      Icon: InstagramLogo,
    },
  ];

  return (
    <section className={`shareSection ${className}`.trim()} aria-label="Share this page">
      <p className="shareSection__label">Share</p>

      <div className="shareSection__actions">
        {shareLinks.map(({ Icon, ...item }) => (
          <a
            className={`shareSection__platform shareSection__platform--${item.key}`}
            href={item.href}
            key={item.key}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={item.label}
            title={item.label}
          >
            {createElement(Icon, { size: 17, weight: "fill" })}
          </a>
        ))}
        <button
          type="button"
          className={`shareSection__platform shareSection__copy ${copiedTarget === "copy" ? "is-copied" : ""}`.trim()}
          onClick={() => handleCopy("copy")}
          aria-label={copiedTarget === "copy" ? "Copied link" : "Copy link"}
          title={copiedTarget === "copy" ? "Copied" : "Copy link"}
        >
          {copiedTarget === "copy" ? (
            <HugeIcon icon={Tick01Icon} size={17} strokeWidth={2} />
          ) : (
            <HugeIcon icon={CopyLinkIcon} size={17} strokeWidth={1.9} />
          )}
        </button>
      </div>

      <span className="shareSection__status" aria-live="polite">
        {copiedTarget ? "Copied" : ""}
      </span>
    </section>
  );
}
