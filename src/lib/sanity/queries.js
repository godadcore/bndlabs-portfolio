import groq from "groq";

export const publishedProjectsQuery = groq`*[_type == "project" && coalesce(status, "published") == "published"] | order(coalesce(date, _createdAt) desc, _createdAt desc, title asc) {
  ...,
  "_createdAt": _createdAt,
  "_updatedAt": _updatedAt,
  "slug": coalesce(slug.current, slug)
}`;
// Find your existing query and add liveProjectUrl to the projection
export const publishedProjectsQuery = `*[_type == "project" && status == "published"] | order(date desc) {
  // ... your existing fields ...
  liveProjectUrl,   // ← ADD THIS LINE
}`;
export const siteSettingsQuery = groq`*[_type == "siteSettings"] | order(_updatedAt desc)[0] {
  ...
}`;
