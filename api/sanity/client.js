/* global process */
import { createClient } from "@sanity/client";
import {
  ensureSanityNoProxy,
  getSanityConfigFromEnv,
  getSanityReadTokenFromEnv,
  loadLocalEnvFiles,
} from "../../src/lib/sanity/nodeEnvironment.js";

const rootDir = process.cwd();
loadLocalEnvFiles(rootDir);

const {
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
} = getSanityConfigFromEnv();
const SANITY_READ_TOKEN = getSanityReadTokenFromEnv();

ensureSanityNoProxy(SANITY_PROJECT_ID);

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
