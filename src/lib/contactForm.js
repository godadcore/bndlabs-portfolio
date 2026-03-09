const CONTACT_FUNCTION_PATH = "/.netlify/functions/contact";

function safeString(value) {
  return String(value ?? "").trim();
}

export async function submitContactForm(payload) {
  const response = await fetch(CONTACT_FUNCTION_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Something went wrong. Please try again.");
  }

  return data;
}

export function makeContactPayload(values, source = "contact-page") {
  const firstName = safeString(values.firstName);
  const lastName = safeString(values.lastName);
  const name = safeString(values.name || [firstName, lastName].filter(Boolean).join(" "));

  return {
    source,
    name,
    firstName,
    lastName,
    email: safeString(values.email),
    subject: safeString(values.subject),
    message: safeString(values.message),
    subscribe: Boolean(values.subscribe),
  };
}
