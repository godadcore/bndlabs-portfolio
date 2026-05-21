const DEFAULT_ALLOWED_PROTOCOLS = ["http:", "https:"];

function hasExplicitProtocol(value) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function hasControlCharacter(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) return true;
  }

  return false;
}

export function sanitizeUrl(
  value,
  {
    allowRelative = false,
    allowedProtocols = DEFAULT_ALLOWED_PROTOCOLS,
  } = {}
) {
  const normalizedValue = String(value ?? "").trim();
  if (!normalizedValue) return "";
  if (hasControlCharacter(normalizedValue)) return "";
  if (/^\[object\s+[A-Za-z]+\]$/.test(normalizedValue)) return "";

  const protocolSet = new Set(
    (Array.isArray(allowedProtocols) ? allowedProtocols : DEFAULT_ALLOWED_PROTOCOLS).map(
      (protocol) => String(protocol).toLowerCase()
    )
  );

  const isRelative = !hasExplicitProtocol(normalizedValue);
  if (isRelative && !allowRelative) {
    return "";
  }

  try {
    const parsed = new URL(normalizedValue, "https://getbndlabs.com");

    if (!isRelative && !protocolSet.has(parsed.protocol.toLowerCase())) {
      return "";
    }

    if (isRelative) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

export function sanitizeExternalUrl(value, options = {}) {
  return sanitizeUrl(value, {
    allowRelative: false,
    ...options,
  });
}
