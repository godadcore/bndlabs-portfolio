/* global process */
import path from "node:path";
import { createClient } from "@sanity/client";

const rootDir = process.cwd();
const envFiles = [".env.local", ".env"];

for (const envFile of envFiles) {
  const envPath = path.join(rootDir, envFile);
  try {
    process.loadEnvFile?.(envPath);
  } catch {
    // Ignore missing or unreadable local env files.
  }
}

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "u9ziwy8t";
const SANITY_DATASET = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production";
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION || "2026-03-10";
const SANITY_READ_TOKEN =
  process.env.SANITY_API_READ_TOKEN ||
  process.env.SANITY_READ_TOKEN ||
  process.env.SANITY_WRITE_TOKEN ||
  "";

export const hasSanityServerConfig = Boolean(SANITY_PROJECT_ID && SANITY_DATASET);

export const sanityServerClient = hasSanityServerConfig
  ? createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: false,
      perspective: "published",
      stega: false,
      ...(SANITY_READ_TOKEN ? { token: SANITY_READ_TOKEN } : {}),
    })
  : null;
