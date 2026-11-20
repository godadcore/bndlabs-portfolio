export const DEPARTMENTS = [
  {
    slug: "product-design",
    index: "01",
    title: "Product Design & UI/UX",
    summary: "Interface design, product flows and case studies.",
  },
  {
    slug: "software-engineering",
    index: "02",
    title: "Software Engineering",
    summary: "Web applications, APIs and the systems behind a product.",
  },
  {
    slug: "ai-machine-learning",
    index: "03",
    title: "AI & Machine Learning",
    summary: "Applied AI work, evaluation and training.",
  },
  {
    slug: "graphic-design",
    index: "04",
    title: "Graphic Design & Branding",
    summary: "Identity, editorial graphics and image work.",
  },
  {
    slug: "content-language",
    index: "05",
    title: "Content & Language",
    summary: "Writing and editing in English, Yoruba and Nigerian Pidgin.",
  },
  {
    slug: "video-clipping",
    index: "06",
    title: "Video Clipping & Creative Media",
    summary: "Clips, cuts and short highlights.",
  },
];

export function getDepartment(slug) {
  return DEPARTMENTS.find((department) => department.slug === slug) || null;
}

export function projectDiscipline(project) {
  const explicit = String(project?.discipline || "").trim();
  if (DEPARTMENTS.some((item) => item.slug === explicit)) return explicit;
  const text = `${project?.category || ""} ${project?.tag1 || ""} ${project?.title || ""}`.toLowerCase();
  if (/video clip|clipping|podcast cut|short highlight/.test(text)) return "video-clipping";
  if (/machine learning|\bai\b|artificial intelligence/.test(text)) return "ai-machine-learning";
  if (/branding|graphic design|identity/.test(text)) return "graphic-design";
  if (/yoruba|pidgin|copywriting|content & language/.test(text)) return "content-language";
  if (/software engineering|full-stack|web application/.test(text)) return "software-engineering";
  return "product-design";
}

export function departmentsWithWork(projects) {
  const list = Array.isArray(projects) ? projects : [];
  return DEPARTMENTS.filter((department) =>
    list.some((project) => projectDiscipline(project) === department.slug)
  );
}
