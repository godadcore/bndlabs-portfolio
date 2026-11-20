function pickImage(values, allowSample) {
  for (const value of values) {
    const src = String(value ?? "").trim();
    if (!src) continue;
    if (src.includes("/placeholders/")) continue;
    if (src.includes("picsum.photos") && !allowSample) continue;
    return src;
  }
  return "";
}

export function displayImage(...values) {
  return pickImage(values, false);
}

export function projectImage(project) {
  return pickImage(
    [project?.image, project?.cover, project?.thumbnail],
    Boolean(project?.sample),
  );
}
