export function parseSeries(text) {
  return String(text || "")
    .split(/[,\s]+/)
    .map((part) => Number(part))
    .filter((value) => Number.isFinite(value));
}

export function movingAverage(values, windowSize) {
  const size = Math.max(1, Math.min(Number(windowSize) || 1, values.length || 1));
  return values.map((_, index) => {
    const start = Math.max(0, index - size + 1);
    const slice = values.slice(start, index + 1);
    const total = slice.reduce((sum, value) => sum + value, 0);
    return total / slice.length;
  });
}
