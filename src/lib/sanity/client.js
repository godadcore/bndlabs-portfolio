import { createClient } from "@sanity/client";

const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID || "u9ziwy8t";
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET || "production";
const SANITY_API_VERSION = import.meta.env.VITE_SANITY_API_VERSION || "2026-03-10";
const SANITY_USE_CDN = String(import.meta.env.VITE_SANITY_USE_CDN || "true") !== "false";

export const sanityClient =
  SANITY_PROJECT_ID && SANITY_DATASET
    ? createClient({
        projectId: SANITY_PROJECT_ID,
        dataset: SANITY_DATASET,
        apiVersion: SANITY_API_VERSION,
        useCdn: SANITY_USE_CDN,
        perspective: "published",
        stega: false,
      })
    : null;

export const isSanityConfigured = Boolean(sanityClient);
