// Single source of truth for Projects.
// Decap CMS writes JSON files into src/content/projects/.

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} subtitle
 * @property {string} summary
 * @property {string} description
 * @property {string} category
 * @property {string[]} tasks
 * @property {string} tag1
 * @property {string} tag2
 * @property {string} image
 * @property {string} cover
 * @property {string} thumbnail
 * @property {string} client
 * @property {string} industry
 * @property {string} status
 * @property {string} date - ISO string
 * @property {string} overview
 * @property {string} problem
 * @property {string} solution
 * @property {string} result
 * @property {{label: string, value: string}[]} highlights
 * @property {{title: string, description: string}[]} process
 * @property {{title: string, body: string, image: string}[]} sections
 * @property {{src: string, alt: string}[]} gallery
 * @property {string[]} nextSteps
 * @property {Object} caseStudy
 */

export function safeLowerSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidISODate(value) {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function yearFromDate(value) {
  if (!isValidISODate(value)) return "";
  return String(new Date(value).getFullYear());
}

function firstString(...values) {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }
  return "";
}

function uniqueStrings(values) {
  return values
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index);
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return uniqueStrings(value);
}

function toObjectArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object");
}

function makePlaceholderImage(seed) {
  const safeSeed = encodeURIComponent(safeLowerSlug(seed) || "project");
  return `https://picsum.photos/seed/${safeSeed}/1600/1000`;
}

function firstHighlightValue(items, matcher) {
  const match = items.find((item) => matcher.test(item.label));
  return firstString(match?.value);
}

function normalizeTextCards(value, fallbackItems) {
  const items = toObjectArray(value)
    .map((item, index) => ({
      title: firstString(item?.title, item?.label, fallbackItems[index]?.title, `Item ${index + 1}`),
      text: firstString(
        item?.text,
        item?.description,
        item?.body,
        fallbackItems[index]?.text
      ),
    }))
    .filter((item) => item.title && item.text);

  if (items.length) return items;
  return fallbackItems.filter((item) => item?.title && item?.text);
}

function buildFallbackPainPoints({ title, industry, problem, overview, solution }) {
  return [
    {
      title: "Unclear hierarchy",
      text: firstString(
        problem,
        `The ${industry || "product"} experience needed a clearer hierarchy so users could identify the most important next step without hesitation.`
      ),
    },
    {
      title: "Fragmented flow",
      text: firstString(
        overview,
        `${title} needed a more connected journey so users could move from one task to the next without losing context.`
      ),
    },
    {
      title: "Low confidence",
      text: firstString(
        solution,
        "The product needed more consistent guidance, states, and feedback so decisions felt easier and more trustworthy."
      ),
    },
  ];
}

function buildFallbackFindings({ problem, solution, result }) {
  return [
    {
      title: "Users needed stronger visual guidance",
      text: firstString(
        problem,
        "The most important actions were not always obvious, which slowed down decisions in the core flow."
      ),
    },
    {
      title: "Simpler structure reduced hesitation",
      text: firstString(
        solution,
        "Streamlining the layout and clarifying the interaction pattern improved confidence across the journey."
      ),
    },
    {
      title: "Consistency increased trust",
      text: firstString(
        result,
        "A more coherent system made the product feel easier to use and more ready for scale."
      ),
    },
  ];
}

function createFallbackPersona({ title, industry, region, description, goal, problem }) {
  return {
    image: "",
    name: firstString(`${title} user`, "Primary user"),
    age: "28",
    gender: "N/A",
    occupation: firstString(industry ? `${industry} professional` : "", "Digital product user"),
    location: firstString(region, "Global"),
    education: "Undergraduate",
    quote: `"I need a clearer way to move through ${title}'s core experience without extra friction."`,
    bio: firstString(
      description,
      "This persona represents the primary audience the product was designed around."
    ),
    goals: uniqueStrings([
      goal,
      "Complete the main task quickly.",
      "Understand what happens next at a glance.",
    ]).slice(0, 3),
    frustrations: uniqueStrings([
      problem,
      "Too many competing elements on screen.",
      "Weak feedback and inconsistent interaction states.",
    ]).slice(0, 3),
  };
}

function normalizePersonas(value, fallbackPersona) {
  const items = toObjectArray(value)
    .map((item) => ({
      image: firstString(item?.image, item?.avatar),
      name: firstString(item?.name, item?.title),
      age: firstString(item?.age),
      gender: firstString(item?.gender),
      occupation: firstString(item?.occupation, item?.role),
      location: firstString(item?.location, item?.region),
      education: firstString(item?.education),
      quote: firstString(item?.quote),
      bio: firstString(item?.bio, item?.description),
      goals: toStringArray(item?.goals),
      frustrations: toStringArray(item?.frustrations),
    }))
    .filter((item) => item.name || item.quote || item.bio);

  if (!items.length) return [fallbackPersona];

  return items.map((item) => ({
    ...fallbackPersona,
    ...item,
    goals: item.goals.length ? item.goals : fallbackPersona.goals,
    frustrations: item.frustrations.length ? item.frustrations : fallbackPersona.frustrations,
  }));
}

function normalizeMockupScreens(value, fallbackImages) {
  const labels = ["Screen 01", "Screen 02", "Screen 03", "Screen 04", "Screen 05"];
  const items = toObjectArray(value)
    .map((item, index) => ({
      src: firstString(item?.src, item?.image, item?.url, fallbackImages[index]),
      label: firstString(item?.label, item?.title, labels[index] || `Screen ${index + 1}`),
    }))
    .filter((item) => item.src);

  if (items.length) return items;

  return fallbackImages.slice(0, 5).map((src, index) => ({
    src,
    label: labels[index] || `Screen ${index + 1}`,
  }));
}

function normalizeCaseStudy(raw, project) {
  const caseStudyRaw = raw?.caseStudy || {};
  const roleFromHighlights = firstHighlightValue(project.highlights, /role/i);
  const outcomeFromHighlights = firstHighlightValue(
    project.highlights,
    /outcome|impact|result|conversion|uplift/i
  );
  const fallbackImages = uniqueStrings([
    caseStudyRaw.heroImage,
    project.cover,
    project.image,
    project.thumbnail,
    ...project.sections.map((item) => item.image),
    ...project.gallery.map((item) => item.src),
  ]);
  const region = firstString(caseStudyRaw.region, raw?.region, raw?.location, "Global");
  const goal = firstString(
    caseStudyRaw.goal,
    raw?.goal,
    project.solution,
    "Create a clearer, more consistent experience that helps users complete their key tasks with less friction."
  );
  const responsibilities = toStringArray(caseStudyRaw.responsibilities);
  const fallbackResponsibilities = responsibilities.length
    ? responsibilities
    : project.tasks.length
      ? project.tasks
      : project.process.map((item) => item.title);
  const fallbackPersona = createFallbackPersona({
    title: project.title,
    industry: project.industry,
    region,
    description: project.description,
    goal,
    problem: project.problem,
  });
  const painPoints = normalizeTextCards(
    caseStudyRaw.painPoints,
    buildFallbackPainPoints({
      title: project.title,
      industry: project.industry,
      problem: project.problem,
      overview: project.overview,
      solution: project.solution,
    })
  );
  const usabilityFindings = normalizeTextCards(
    caseStudyRaw.usabilityFindings,
    buildFallbackFindings({
      problem: project.problem,
      solution: project.solution,
      result: project.result,
    })
  );
  const protoList = toStringArray(caseStudyRaw.protoList);
  const fallbackProtoList = protoList.length
    ? protoList
    : uniqueStrings([
        ...project.process.map((item) => item.description),
        ...project.nextSteps,
      ]).slice(0, 4);
  const nextSteps = toStringArray(caseStudyRaw.nextSteps);
  const learned = firstString(
    caseStudyRaw.learned,
    raw?.learned,
    "The project reinforced how much stronger a product becomes when structure, testing, and visual refinement are treated as one connected system."
  );
  const impact = firstString(
    caseStudyRaw.impact,
    outcomeFromHighlights,
    project.result,
    "The final direction created a clearer and more scalable experience ready for continued iteration."
  );

  return {
    brandName: firstString(caseStudyRaw.brandName, project.client, project.title),
    region,
    year: firstString(caseStudyRaw.year, yearFromDate(project.date), "Recent"),
    heroImage: firstString(caseStudyRaw.heroImage, project.cover, project.image, fallbackImages[0]),
    overviewIntro: firstString(
      caseStudyRaw.overviewIntro,
      raw?.overviewIntro,
      project.overview,
      project.summary,
      project.description
    ),
    goal,
    myRole: firstString(
      caseStudyRaw.myRole,
      raw?.myRole,
      raw?.role,
      roleFromHighlights,
      project.tasks.slice(0, 2).join(" / "),
      "Product Designer"
    ),
    responsibilities: fallbackResponsibilities,
    researchIntro: firstString(
      caseStudyRaw.researchIntro,
      raw?.researchIntro,
      `Research focused on understanding where the ${project.industry || "product"} experience created friction and what needed to change to make ${project.title} feel clearer, faster, and easier to trust.`
    ),
    painPoints,
    personas: normalizePersonas(caseStudyRaw.personas, fallbackPersona),
    journeyGoal: firstString(caseStudyRaw.journeyGoal, goal),
    journeyMapImage: firstString(
      caseStudyRaw.journeyMapImage,
      project.gallery[0]?.src,
      project.sections[0]?.image,
      fallbackImages[0]
    ),
    wireframesIntro: firstString(
      caseStudyRaw.wireframesIntro,
      raw?.wireframesIntro,
      `The early design phase translated research into a clearer structure, making it easier to define content hierarchy, core screens, and the overall product flow.`
    ),
    appmapDesc: firstString(
      caseStudyRaw.appmapDesc,
      project.process[1]?.description,
      project.sections[0]?.body,
      "The app map clarified how users should move through the product and which screens needed to carry the most important information."
    ),
    appmapImage: firstString(
      caseStudyRaw.appmapImage,
      project.sections[0]?.image,
      project.gallery[1]?.src,
      fallbackImages[0]
    ),
    digitalWireDesc: firstString(
      caseStudyRaw.digitalWireDesc,
      project.sections[1]?.body,
      project.process[2]?.description,
      "Digital wireframes translated the structure into a clearer interface and helped validate content priority before visual refinement."
    ),
    digitalWireImage: firstString(
      caseStudyRaw.digitalWireImage,
      project.sections[1]?.image,
      project.gallery[2]?.src,
      fallbackImages[0]
    ),
    usabilityIntro: firstString(
      caseStudyRaw.usabilityIntro,
      raw?.usabilityIntro,
      project.result,
      "Usability review helped surface where the experience needed stronger guidance, clearer feedback, and more consistent states."
    ),
    usabilityFindings,
    designIntro: firstString(
      caseStudyRaw.designIntro,
      raw?.designIntro,
      project.solution,
      "The final design phase focused on refining hierarchy, strengthening consistency, and preparing the product for a polished handoff."
    ),
    mockupsDesc: firstString(
      caseStudyRaw.mockupsDesc,
      project.sections[1]?.body,
      project.solution,
      "The mockups brought the structure to life with a more considered visual system, stronger hierarchy, and implementation-ready states."
    ),
    mockupOverviewImage: firstString(
      caseStudyRaw.mockupOverviewImage,
      project.gallery[2]?.src,
      project.sections[2]?.image,
      fallbackImages[0]
    ),
    mockupScreens: normalizeMockupScreens(caseStudyRaw.mockupScreens, fallbackImages),
    protoDesc: firstString(
      caseStudyRaw.protoDesc,
      raw?.protoDesc,
      project.result,
      "The high-fidelity prototype connected the main screens into a single flow so the final interactions could be reviewed more realistically."
    ),
    protoScreenImage: firstString(
      caseStudyRaw.protoScreenImage,
      project.gallery[3]?.src,
      project.cover,
      fallbackImages[0]
    ),
    protoList: fallbackProtoList.length
      ? fallbackProtoList
      : [
          "Clarified the entry point into the main journey.",
          "Reduced friction across the most important interaction states.",
          "Prepared a more consistent prototype for handoff and iteration.",
        ],
    outcomeIntro: firstString(
      caseStudyRaw.outcomeIntro,
      raw?.outcomeIntro,
      project.result,
      project.summary
    ),
    impact,
    learned,
    nextSteps: nextSteps.length ? nextSteps : project.nextSteps,
  };
}

function normalizeProject(raw) {
  const slug = safeLowerSlug(raw?.slug || raw?.id || raw?.title);
  const id = safeLowerSlug(raw?.id || slug || raw?.title);
  const title = firstString(raw?.title, raw?.projectTitle);

  const tasks = toStringArray(raw?.tasks || raw?.services);
  const category = firstString(raw?.category, tasks[0], raw?.tag1);
  const tag1 = firstString(raw?.tag1, tasks[0], category);
  const tag2 = firstString(raw?.tag2, tasks[1]);
  const summary = firstString(raw?.summary, raw?.description);
  const description = firstString(raw?.description, raw?.summary);
  const subtitle = firstString(raw?.subtitle);
  const placeholderImage = makePlaceholderImage(slug || id || title);
  const image = firstString(raw?.image, raw?.cover, raw?.thumbnail, placeholderImage);
  const cover = firstString(raw?.cover, image, raw?.thumbnail, placeholderImage);
  const thumbnail = firstString(raw?.thumbnail, image, cover, placeholderImage);
  const overview = firstString(raw?.overview, summary, description);
  const problem = firstString(raw?.problem);
  const solution = firstString(raw?.solution);
  const result = firstString(raw?.result);

  const highlights = toObjectArray(raw?.highlights)
    .map((item, index) => ({
      label: firstString(item?.label, item?.title, `Metric ${index + 1}`),
      value: firstString(item?.value, item?.text),
    }))
    .filter((item) => item.label && item.value);

  const process = toObjectArray(raw?.process)
    .map((item) => ({
      title: firstString(item?.title),
      description: firstString(item?.description, item?.text),
    }))
    .filter((item) => item.title && item.description);

  const sections = toObjectArray(raw?.sections || raw?.contentSections)
    .map((item, index) => ({
      title: firstString(item?.title, `Section ${index + 1}`),
      body: firstString(item?.body, item?.description, item?.text),
      image: firstString(item?.image, item?.src),
    }))
    .filter((item) => item.title && item.body);

  const gallery = toObjectArray(raw?.gallery)
    .map((item, index) => ({
      src: firstString(item?.src, item?.image, item?.url),
      alt: firstString(item?.alt, `${title} gallery image ${index + 1}`),
    }))
    .filter((item) => item.src);

  const nextSteps = toStringArray(raw?.nextSteps);

  const project = {
    id,
    slug,
    title,
    subtitle,
    summary,
    description,
    category,
    tasks: tasks.length ? tasks : [tag1, tag2].filter(Boolean),
    tag1,
    tag2,
    image,
    cover,
    thumbnail,
    client: firstString(raw?.client),
    industry: firstString(raw?.industry),
    status: firstString(raw?.status, "published"),
    date: firstString(raw?.date),
    overview,
    problem,
    solution,
    result,
    highlights,
    process,
    sections,
    gallery,
    nextSteps,
  };

  return {
    ...project,
    caseStudy: normalizeCaseStudy(raw, project),
  };
}

/**
 * Load all project JSON files.
 * Vite bundles these at build time while Decap CMS edits the source JSON.
 *
 * @returns {Project[]}
 */
export function getAllProjects() {
  const modules = import.meta.glob("../content/projects/*.json", {
    eager: true,
    import: "default",
  });

  /** @type {Project[]} */
  const items = Object.values(modules)
    .filter(Boolean)
    .map((entry) => normalizeProject(entry))
    .filter((project) => project.title && project.slug && project.id);

  // Newest first when valid dates exist; otherwise fallback to title.
  items.sort((a, b) => {
    const aHasDate = isValidISODate(a.date);
    const bHasDate = isValidISODate(b.date);

    if (aHasDate && bHasDate) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (aHasDate && !bHasDate) return -1;
    if (!aHasDate && bHasDate) return 1;

    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  });

  return items;
}

export function getProjectBySlug(projectSlug) {
  const normalized = safeLowerSlug(projectSlug);
  return getAllProjects().find(
    (project) => project.slug === normalized || project.id === normalized
  );
}

export function formatProjectDate(iso) {
  return yearFromDate(iso);
}
