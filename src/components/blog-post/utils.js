import { sanitizeUrl } from "../../lib/urlSecurity";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function classifyToken(token) {
  if (/^\/\/.*|^\/\*[\s\S]*\*\/$/.test(token)) return "cmt";
  if (/^"(?:\\.|[^"])*"$|^'(?:\\.|[^'])*'$|^`(?:\\.|[^`])*`$/.test(token)) return "str";
  if (/^@\w+/.test(token)) return "ann";
  if (/^\d+(?:\.\d+)?(?:f)?$/i.test(token)) return "num";
  if (
    /^(const|let|var|function|return|if|else|for|while|switch|case|break|continue|import|from|export|default|new|class|extends|async|await|try|catch|finally|throw|public|private|protected|static|interface|type|enum|null|true|false|undefined|fun|val|object|by|when|data)$/.test(
      token
    )
  ) {
    return "kw";
  }
  if (/^[A-Z][A-Za-z0-9_]*$/.test(token)) return "cls";
  return "";
}

export function highlightCodeHtml(code) {
  const source = String(code ?? "");
  const tokenPattern =
    /\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|@\w+|\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|continue|import|from|export|default|new|class|extends|async|await|try|catch|finally|throw|public|private|protected|static|interface|type|enum|null|true|false|undefined|fun|val|object|by|when|data)\b|\b\d+(?:\.\d+)?(?:f)?\b|\b[A-Z][A-Za-z0-9_]*\b|\b[a-zA-Z_]\w*(?=\s*\()/g;

  let lastIndex = 0;
  let html = "";
  let match = tokenPattern.exec(source);

  while (match) {
    const [token] = match;
    const { index } = match;
    html += escapeHtml(source.slice(lastIndex, index));

    const type = classifyToken(token) || (/^[a-zA-Z_]\w*(?=\s*\()/.test(token) ? "fn" : "");
    const escapedToken = escapeHtml(token);
    html += type ? `<span class="${type}">${escapedToken}</span>` : escapedToken;

    lastIndex = index + token.length;
    match = tokenPattern.exec(source);
  }

  html += escapeHtml(source.slice(lastIndex));
  return html;
}

export function sanitizeBlogHtml(value) {
  const rawHtml = String(value ?? "").trim();
  if (!rawHtml) return "";

  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return rawHtml.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  }

  const allowedTags = new Set([
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "i",
    "li",
    "ol",
    "p",
    "strong",
    "u",
    "ul",
  ]);
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${rawHtml}</body>`, "text/html");

  const sanitizeNode = (node) => {
    if (node.nodeType === window.Node.TEXT_NODE) {
      return doc.createTextNode(node.textContent || "");
    }

    if (node.nodeType !== window.Node.ELEMENT_NODE) {
      return null;
    }

    const tagName = node.nodeName.toLowerCase();
    const childNodes = Array.from(node.childNodes)
      .map(sanitizeNode)
      .filter(Boolean);

    if (!allowedTags.has(tagName)) {
      const fragment = doc.createDocumentFragment();
      childNodes.forEach((childNode) => fragment.appendChild(childNode));
      return fragment;
    }

    const sanitizedElement = doc.createElement(tagName);

    if (tagName === "a") {
      const safeHref = sanitizeUrl(node.getAttribute("href"), {
        allowRelative: true,
        allowedProtocols: ["http:", "https:", "mailto:", "tel:"],
      });

      if (!safeHref) {
        const fragment = doc.createDocumentFragment();
        childNodes.forEach((childNode) => fragment.appendChild(childNode));
        return fragment;
      }

      sanitizedElement.setAttribute("href", safeHref);

      if (/^https?:/i.test(safeHref)) {
        sanitizedElement.setAttribute("target", "_blank");
        sanitizedElement.setAttribute("rel", "noreferrer noopener");
      }
    }

    childNodes.forEach((childNode) => sanitizedElement.appendChild(childNode));
    return sanitizedElement;
  };

  const wrapper = doc.createElement("div");
  Array.from(doc.body.childNodes)
    .map(sanitizeNode)
    .filter(Boolean)
    .forEach((node) => wrapper.appendChild(node));

  return wrapper.innerHTML.trim();
}

export function toggleVideo(videoId, wrapperId) {
  const video = document.getElementById(videoId);
  const wrapper = document.getElementById(wrapperId);
  const path = wrapper?.querySelector(".blogPostPlayBtn path");

  if (!(video instanceof HTMLVideoElement) || !wrapper || !(path instanceof SVGPathElement)) {
    return;
  }

  if (video.paused) {
    video.play().catch(() => {});
    wrapper.classList.add("is-playing");
    path.setAttribute("d", "M6 19h4V5H6v14zm8-14v14h4V5h-4z");
    return;
  }

  video.pause();
  wrapper.classList.remove("is-playing");
  path.setAttribute("d", "M8 5v14l11-7z");
}

function fallbackCopy(text, onDone) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  onDone();
}

export function copyCode(button) {
  const codeRoot = button?.closest(".blogPostCodeBlock");
  const pre = codeRoot?.querySelector("pre");
  const text = pre?.innerText || "";

  const markCopied = () => {
    const original = button.textContent;
    button.textContent = "Copied";
    button.classList.add("is-copied");

    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove("is-copied");
    }, 1800);
  };

  if (window.isSecureContext && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(markCopied).catch(() => fallbackCopy(text, markCopied));
    return;
  }

  fallbackCopy(text, markCopied);
}
