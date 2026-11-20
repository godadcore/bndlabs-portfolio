export function videoRecord({ title, poster, duration, aspectRatio, category }) {
  return {
    title,
    provider: "",
    hostedUrl: "",
    embedUrl: "",
    providerVideoId: "",
    poster: poster.src,
    posterAlt: poster.alt,
    duration,
    aspectRatio,
    category,
  };
}

export function codeSection(heading, body, language, code) {
  return {
    _type: "embeddedCodeSection",
    heading,
    body,
    language,
    code,
  };
}

export function textSection(heading, body) {
  return {
    heading,
    body,
  };
}
