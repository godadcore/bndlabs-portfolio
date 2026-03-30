export function dedupeStrings(items) {
  return [
    ...new Set(
      (Array.isArray(items) ? items : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    ),
  ];
}

export function formatPublishedDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function flattenPortableText(blocks) {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      if (block?._type !== "block" || !Array.isArray(block?.children)) return "";
      return block.children.map((child) => String(child?.text || "")).join("").trim();
    })
    .filter(Boolean)
    .join(" ");
}

export function renderPortableText(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return null;

  const elements = [];
  let listBuffer = [];
  let listType = null;

  const flushList = () => {
    if (!listBuffer.length || !listType) return;
    const ListTag = listType === "number" ? "ol" : "ul";
    elements.push(
      <ListTag className="cs-richList" key={`list-${elements.length}`}>
        {listBuffer.map((item) => (
          <li key={item.key}>{item.text}</li>
        ))}
      </ListTag>
    );
    listBuffer = [];
    listType = null;
  };

  blocks.forEach((block, index) => {
    if (block?._type !== "block") return;

    const text = Array.isArray(block?.children)
      ? block.children.map((child) => String(child?.text || "")).join("").trim()
      : "";

    if (!text) return;

    if (block?.listItem) {
      const nextType = block.listItem === "number" ? "number" : "bullet";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listBuffer.push({
        key: block._key || `list-${index}`,
        text,
      });
      return;
    }

    flushList();

    if (block?.style === "h2") {
      elements.push(
        <h3 className="cs-richHeading" key={block._key || `heading-${index}`}>
          {text}
        </h3>
      );
      return;
    }

    if (block?.style === "h3") {
      elements.push(
        <h4 className="cs-richSubheading" key={block._key || `subheading-${index}`}>
          {text}
        </h4>
      );
      return;
    }

    elements.push(
      <p className="cs-richParagraph" key={block._key || `paragraph-${index}`}>
        {text}
      </p>
    );
  });

  flushList();
  return elements;
}

export function parseAnimatedMetric(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^([^0-9+-]*)([+-]?\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return {
      prefix: "",
      value: null,
      suffix: raw,
      decimals: 0,
    };
  }

  const numericValue = Number.parseFloat(match[2]);

  return {
    prefix: match[1] || "",
    value: Number.isFinite(numericValue) ? numericValue : null,
    suffix: match[3] || "",
    decimals: match[2].includes(".") ? 1 : 0,
  };
}
