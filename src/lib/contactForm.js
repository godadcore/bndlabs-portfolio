const CONTACT_FUNCTION_PATH = "/api/contact";
const CONTACT_REQUEST_TIMEOUT_MS = 15000;

function safeString(value) {
  return String(value ?? "").trim();
}

export async function submitContactForm(payload) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), CONTACT_REQUEST_TIMEOUT_MS);

  let response;
  let data = null;

  try {
    response = await fetch(CONTACT_FUNCTION_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    data = await response.json().catch(() => null);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    throw new Error("Network error. Please try again.");
  } finally {
    window.clearTimeout(timeoutId);
  }

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
