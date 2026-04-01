import { sanitizeUrl } from "./urlSecurity.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasPortableTextShape(item) {
  return Boolean(item && typeof item === "object");
}

function firstLinkValue(...values) {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }

  return "";
}

function normalizeLineBreaks(value) {
  return String(value ?? "").replace(/\r\n/g, "\n");
}

function textWithBreaksToHtml(value) {
  return escapeHtml(normalizeLineBreaks(value)).replace(/\n/g, "<br />");
}

function normalizePortableTextBlockValue(value) {
  if (!Array.isArray(value)) return "";

  const blocks = value.filter(hasPortableTextShape);
  return blocks.length ? blocks : "";
}

export function normalizeRichTextValue(value) {
  if (typeof value === "string") {
    return String(value).trim();
  }

  return normalizePortableTextBlockValue(value);
}

function portableTextChildToPlainText(child) {
  if (!child || typeof child !== "object") return "";
  return String(child.text ?? "").trim();
}

function portableTextBlockToPlainText(block) {
  if (!block || typeof block !== "object") return "";

  if (block._type === "block" && Array.isArray(block.children)) {
    return block.children
      .map(portableTextChildToPlainText)
      .filter(Boolean)
      .join("");
  }

  return String(block.text ?? "").trim();
}

export function richTextToPlainText(value) {
  const normalizedValue = normalizeRichTextValue(value);

  if (!normalizedValue) return "";
  if (typeof normalizedValue === "string") return normalizedValue;

  return normalizedValue
    .map(portableTextBlockToPlainText)
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function resolveMarkHref(markDef) {
  if (!markDef || typeof markDef !== "object") return "";

  const slugValue =
    typeof markDef.slug === "object"
      ? markDef.slug?.current || markDef.slug?.slug
      : markDef.slug;

  return sanitizeUrl(
    firstLinkValue(
      markDef.href,
      markDef.url,
      markDef.path,
      slugValue ? `/${String(slugValue).replace(/^\/+/, "")}` : "",
      markDef.route
    ),
    {
      allowRelative: true,
      allowedProtocols: ["http:", "https:", "mailto:", "tel:"],
    }
  );
}

function wrapMarkedHtml(html, mark, markDefs) {
  if (!mark) return html;

  if (mark === "strong") return `<strong>${html}</strong>`;
  if (mark === "em") return `<em>${html}</em>`;
  if (mark === "underline") return `<u>${html}</u>`;
  if (mark === "code") return `<code>${html}</code>`;

  const annotation = Array.isArray(markDefs)
    ? markDefs.find((item) => item?._key === mark)
    : null;

  if (!annotation) return html;

  const href = resolveMarkHref(annotation);
  if (!href) return html;

  const externalAttributes = /^https?:/i.test(href)
    ? ' target="_blank" rel="noreferrer noopener"'
    : "";

  return `<a href="${escapeHtml(href)}"${externalAttributes}>${html}</a>`;
}

function renderPortableTextChildren(children, markDefs) {
  if (!Array.isArray(children)) return "";

  return children
    .map((child) => {
      if (!child || typeof child !== "object") {
        return textWithBreaksToHtml(child);
      }

      const baseHtml = textWithBreaksToHtml(child.text ?? "");
      const marks = Array.isArray(child.marks) ? child.marks : [];

      return marks.reduce(
        (currentHtml, mark) => wrapMarkedHtml(currentHtml, mark, markDefs),
        baseHtml
      );
    })
    .join("");
}

function renderPortableTextBlock(block) {
  if (!block || typeof block !== "object" || block._type !== "block") return "";

  const innerHtml = renderPortableTextChildren(block.children, block.markDefs);
  if (!innerHtml.trim()) return "";

  if (block.listItem) return innerHtml;

  switch (block.style) {
    case "h1":
      return `<h1>${innerHtml}</h1>`;
    case "h2":
      return `<h2>${innerHtml}</h2>`;
    case "h3":
      return `<h3>${innerHtml}</h3>`;
    case "h4":
      return `<h4>${innerHtml}</h4>`;
    case "blockquote":
      return `<blockquote><p>${innerHtml}</p></blockquote>`;
    default:
      return `<p>${innerHtml}</p>`;
  }
}

function renderPortableTextList(blocks, startIndex) {
  const firstBlock = blocks[startIndex];
  const listTag = firstBlock?.listItem === "number" ? "ol" : "ul";
  const listLevel = Number(firstBlock?.level || 1);
  const listItems = [];
  let currentIndex = startIndex;

  while (currentIndex < blocks.length) {
    const block = blocks[currentIndex];

    if (
      !block ||
      typeof block !== "object" ||
      block._type !== "block" ||
      !block.listItem ||
      block.listItem !== firstBlock.listItem ||
      Number(block.level || 1) !== listLevel
    ) {
      break;
    }

    const itemHtml = renderPortableTextChildren(block.children, block.markDefs);
    if (itemHtml.trim()) {
      listItems.push(`<li>${itemHtml}</li>`);
    }

    currentIndex += 1;
  }

  return {
    html: listItems.length ? `<${listTag}>${listItems.join("")}</${listTag}>` : "",
    nextIndex: currentIndex,
  };
}

function renderPortableTextHtml(blocks) {
  const htmlParts = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];

    if (block?._type === "block" && block.listItem) {
      const renderedList = renderPortableTextList(blocks, index);
      if (renderedList.html) {
        htmlParts.push(renderedList.html);
      }
      index = renderedList.nextIndex;
      continue;
    }

    const blockHtml = renderPortableTextBlock(block);
    if (blockHtml) {
      htmlParts.push(blockHtml);
    }

    index += 1;
  }

  return htmlParts.join("");
}

function renderPortableTextInlineHtml(blocks) {
  return blocks
    .map((block) => {
      if (!block || typeof block !== "object") {
        return textWithBreaksToHtml(block);
      }

      if (block._type === "block" && Array.isArray(block.children)) {
        return renderPortableTextChildren(block.children, block.markDefs);
      }

      return textWithBreaksToHtml(block.text ?? "");
    })
    .filter(Boolean)
    .join("<br />");
}

function renderPlainTextHtml(value) {
  const normalizedValue = normalizeLineBreaks(value).trim();
  if (!normalizedValue) return "";

  return normalizedValue
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${textWithBreaksToHtml(paragraph)}</p>`)
    .join("");
}

export function richTextToHtml(value) {
  const normalizedValue = normalizeRichTextValue(value);

  if (!normalizedValue) return "";
  if (typeof normalizedValue === "string") return renderPlainTextHtml(normalizedValue);

  return renderPortableTextHtml(normalizedValue);
}

export function richTextToInlineHtml(value) {
  const normalizedValue = normalizeRichTextValue(value);

  if (!normalizedValue) return "";
  if (typeof normalizedValue === "string") return textWithBreaksToHtml(normalizedValue);

  return renderPortableTextInlineHtml(normalizedValue);
}
