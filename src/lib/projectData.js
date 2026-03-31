import { normalizeProject, safeLowerSlug } from "./projects";

let cachedRemoteProjectsPromise = null;
const PROJECTS_API_PATH = "/api/sanity/projects";
const PROJECT_PLACEHOLDER_PATTERN = /picsum\.photos\/seed\//i;

function isPublishedProject(project) {
  return String(project?.status ?? "published").trim().toLowerCase() === "published";
}

function hasProjectSummary(project) {
  return Boolean(String(project?.summary ?? project?.description ?? "").trim());
}

function hasProjectImage(project) {
  const imageCandidates = [
    project?.cover,
    project?.image,
    project?.thumbnail,
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  return imageCandidates.some((value) => !PROJECT_PLACEHOLDER_PATTERN.test(value));
}

function hasProjectDate(project) {
  return Boolean(String(project?.date ?? project?.createdAt ?? project?.updatedAt ?? "").trim());
}

function isDisplayableProject(project) {
  return Boolean(
    project?.title &&
      project?.slug &&
      project?.id &&
      isPublishedProject(project) &&
      hasProjectSummary(project) &&
      hasProjectImage(project) &&
      hasProjectDate(project)
  );
}

let cachedProjectsSnapshot = [];

function isValidProjectDate(value) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function projectSortTimestamp(project) {
  const candidates = [project?.date, project?.createdAt, project?.updatedAt];
  const firstValidDate = candidates.find((value) => isValidProjectDate(value));
  return firstValidDate ? new Date(firstValidDate).getTime() : null;
}

export function sortProjectsNewestFirst(items) {
  return [...items].sort((a, b) => {
    const aTimestamp = projectSortTimestamp(a);
    const bTimestamp = projectSortTimestamp(b);

    if (aTimestamp && bTimestamp) {
      return bTimestamp - aTimestamp;
    }
    if (aTimestamp && !bTimestamp) return -1;
    if (!aTimestamp && bTimestamp) return 1;

    return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, {
      sensitivity: "base",
    });
  });
}

async function fetchProjectsPayload() {
  const response = await fetch(PROJECTS_API_PATH, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Sanity projects API returned ${response.status}`);
  }

  return response.json();
}

async function fetchProjectsFromSanity() {
  const payload = await fetchProjectsPayload();
  const rawProjects = Array.isArray(payload?.projects) ? payload.projects : [];
  const normalizedProjects = Array.isArray(rawProjects)
    ? rawProjects
        .filter(Boolean)
        .map((project) => normalizeProject(project))
        .filter(isDisplayableProject)
    : [];

  if (!normalizedProjects.length) {
    console.warn("SANITY_PROJECTS_EMPTY", {
      reason: "empty_or_unusable_response",
      source: payload?.source || "unknown",
    });
    cachedProjectsSnapshot = [];
    return cachedProjectsSnapshot;
  }

  cachedProjectsSnapshot = sortProjectsNewestFirst(normalizedProjects);
  return cachedProjectsSnapshot;
}

export function getInitialProjects() {
  return cachedProjectsSnapshot;
}

export async function loadAllProjects(options = {}) {
  const forceRefresh = options?.force === true;

  if (!cachedRemoteProjectsPromise || forceRefresh) {
    cachedRemoteProjectsPromise = fetchProjectsFromSanity().catch((error) => {
      console.error("SANITY_PROJECTS_FETCH_ERROR", {
        message: error instanceof Error ? error.message : String(error),
      });
      cachedProjectsSnapshot = [];
      return cachedProjectsSnapshot;
    });
  }

  return cachedRemoteProjectsPromise;
}

export async function loadProjectBySlug(slug, options = {}) {
  const normalizedSlug = safeLowerSlug(slug);
  const projects = await loadAllProjects(options);

  return (
    projects.find(
      (project) => project.slug === normalizedSlug || project.id === normalizedSlug
    ) || null
  );
}

export function resetProjectDataCache() {
  cachedRemoteProjectsPromise = null;
  cachedProjectsSnapshot = [];
}
