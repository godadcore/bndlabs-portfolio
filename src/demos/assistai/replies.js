const RULES = [
  { test: /refund|money back/i, reply: "A refund needs a person to confirm it. I can only note the request." },
  { test: /order|tracking|where is/i, reply: "I cannot see a live order. Check the receipt email for the reference." },
  { test: /password|login|sign in/i, reply: "Reset the password from the sign-in page. I will not ask for the password." },
  { test: /hello|hi|hey/i, reply: "Hello. Ask about an order, a refund, or a password reset." },
];

export function replyTo(message) {
  const text = String(message || "").trim();
  if (!text) return "Write a question first.";
  const match = RULES.find((rule) => rule.test.test(text));
  return match ? match.reply : "I do not have a rule for that. A person would take this one.";
}
