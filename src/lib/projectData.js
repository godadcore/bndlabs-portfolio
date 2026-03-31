import { getAllProjects, normalizeProject, safeLowerSlug } from "./projects";

let cachedRemoteProjectsPromise = null;
const PROJECTS_API_PATH = "/api/sanity/projects";

function isPublishedProject(project) {
  return String(project?.status ?? "published").trim().toLowerCase() === "published";
}

function getFallbackProjects() {
  try {
    return sortProjectsNewestFirst(getAllProjects().filter(isPublishedProject));
  } catch (error) {
    console.error("LOCAL_PROJECTS_FALLBACK_ERROR", {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

let cachedProjectsSnapshot = getFallbackProjects();

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
        .filter((project) => project?.title && project?.slug && project?.id && isPublishedProject(project))
    : [];

  if (!normalizedProjects.length) {
    console.warn("SANITY_PROJECTS_EMPTY", {
      reason: "empty_or_unusable_response",
      source: payload?.source || "unknown",
    });
    return cachedProjectsSnapshot.length ? cachedProjectsSnapshot : getFallbackProjects();
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
      cachedProjectsSnapshot = getFallbackProjects();
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
  cachedProjectsSnapshot = getFallbackProjects();
}
