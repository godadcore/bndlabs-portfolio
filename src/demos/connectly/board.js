export function addMessage(messages, draft) {
  const text = String(draft.text || "").trim();
  const author = String(draft.author || "").trim() || "Guest";
  if (!text) return messages;
  return [...messages, { id: crypto.randomUUID(), author, text, at: Date.now() }];
}

export function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
