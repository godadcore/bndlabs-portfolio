/* global process */
import path from "node:path";

const DEFAULT_SANITY_PROJECT_ID = "u9ziwy8t";
const DEFAULT_SANITY_DATASET = "production";
const DEFAULT_SANITY_API_VERSION = "2026-03-10";

function uniqueStrings(values) {
  return values.filter((value, index, items) => items.indexOf(value) === index);
}

export function loadLocalEnvFiles(rootDir = process.cwd()) {
  for (const envFile of [".env.local", ".env"]) {
    try {
      process.loadEnvFile?.(path.join(rootDir, envFile));
    } catch {
      // Ignore missing or unreadable local env files.
    }
  }
}

export function getSanityConfigFromEnv() {
  return {
    projectId:
      process.env.SANITY_PROJECT_ID ||
      process.env.VITE_SANITY_PROJECT_ID ||
      DEFAULT_SANITY_PROJECT_ID,
    dataset:
      process.env.SANITY_DATASET ||
      process.env.VITE_SANITY_DATASET ||
      DEFAULT_SANITY_DATASET,
    apiVersion:
      process.env.SANITY_API_VERSION ||
      process.env.VITE_SANITY_API_VERSION ||
      DEFAULT_SANITY_API_VERSION,
  };
}

export function getSanityReadTokenFromEnv() {
  return (
    process.env.SANITY_API_READ_TOKEN ||
    process.env.SANITY_READ_TOKEN ||
    process.env.SANITY_WRITE_TOKEN ||
    ""
  );
}

export function getSanityWriteTokenFromEnv() {
  return (
    process.env.SANITY_WRITE_TOKEN ||
    process.env.SANITY_API_WRITE_TOKEN ||
    process.env.SANITY_AUTH_TOKEN ||
    ""
  );
}

export function ensureSanityNoProxy(projectId = DEFAULT_SANITY_PROJECT_ID) {
  const noProxyEntries = uniqueStrings(
    [
      process.env.NO_PROXY,
      process.env.no_proxy,
      "sanity.io",
      ".sanity.io",
      projectId ? `${projectId}.api.sanity.io` : "",
      projectId ? `${projectId}.apicdn.sanity.io` : "",
    ]
      .flatMap((value) => String(value ?? "").split(","))
      .map((value) => value.trim())
      .filter(Boolean)
  );

  const nextNoProxy = noProxyEntries.join(",");
  process.env.NO_PROXY = nextNoProxy;
  process.env.no_proxy = nextNoProxy;

  return nextNoProxy;
}
