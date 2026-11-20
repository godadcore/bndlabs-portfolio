const STORAGE_KEY = "bndlabs-demo-finora";

export function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((entry) => entry && typeof entry.amount === "number" && entry.label) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

export function addEntry(entries, draft) {
  const amount = Number(draft.amount);
  const label = String(draft.label || "").trim();
  if (!label || !Number.isFinite(amount)) return entries;
  return [
    ...entries,
    {
      id: crypto.randomUUID(),
      label,
      amount: Math.abs(amount),
      kind: draft.kind === "out" ? "out" : "in",
    },
  ];
}

export function updateEntry(entries, id, draft) {
  const amount = Number(draft.amount);
  const label = String(draft.label || "").trim();
  if (!label || !Number.isFinite(amount)) return entries;
  return entries.map((entry) => (
    entry.id === id
      ? { ...entry, label, amount: Math.abs(amount), kind: draft.kind === "out" ? "out" : "in" }
      : entry
  ));
}

export function deleteEntry(entries, id) {
  return entries.filter((entry) => entry.id !== id);
}

export function totals(entries) {
  return entries.reduce((sum, entry) => sum + (entry.kind === "out" ? -entry.amount : entry.amount), 0);
}
