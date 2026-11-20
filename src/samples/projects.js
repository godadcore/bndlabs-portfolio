import { softwareProjects } from "./software.js";
import { aiProjects } from "./ai.js";
import { brandProjects } from "./brand.js";
import { contentProjects } from "./content.js";
import { videoProjects } from "./video.js";
import { media } from "./media.js";

if (import.meta.env.PROD) {
  console.error("Sample content was included in the production bundle.");
  throw new Error("Sample content was included in the production bundle.");
}

function study({ slug, title, discipline, category, date, summary, overview, research, wire, done, role, tools, problems, results }) {
  const cover = media.product;
  return {
    _type: "caseStudy",
    sample: true,
    id: slug,
    slug,
    title: `Sample: ${title}`,
    description: summary,
    category,
    discipline,
    status: "published",
    date,
    publishedDate: date,
    heroImage: cover.src,
    cover: cover.src,
    image: cover.src,
    thumbnail: cover.src,
    role,
    tools,
    overviewText: overview,
    problems,
    researchText: research,
    researchImages: [cover],
    wireframeText: wire,
    wireframeImages: [cover],
    prototypeText: done,
    finalImages: [cover],
    results,
  };
}

const problems = (items) => items.map(([title, description]) => ({ title, description }));
const results = (items) => items.map(([metric, description]) => ({ metric, description }));

export const sampleProjects = [
  study({
    slug: "sample-product-flow",
    title: "Product flow",
    discipline: "product-design",
    category: "Product Design & UI/UX",
    date: "2026-03-01",
    summary: "A sample case study for checking the product design layout. Not a client project.",
    overview: "This sample walks a small marketplace from the first sketch to a set of screens. It exists so the case study page can be reviewed before real work is added.",
    research: "The sample research note is about where people hesitate. They want to see the product, talk to the seller, and know the next step before they commit.",
    wire: "The sample wireframes set a simple path: browse, open a product, ask a question, and check out.",
    done: "The sample ends as a set of screens that show the same path at a higher fidelity. There is no live prototype link on this demo.",
    role: ["Product design"],
    tools: ["Figma"],
    problems: problems([
      ["The path is unclear", "People can see products, but the next step is easy to miss."],
      ["Trust is thin", "A photo alone does not answer whether the seller is real."],
      ["The details are late", "Size, price, and delivery show up after the decision has started."],
      ["The return is clumsy", "Getting back to the list loses the place the person had reached."],
    ]),
    results: results([
      ["6 screens", "A sample set covering browse, detail, message, and checkout."],
      ["1 path", "The same journey is used from the first wireframe to the final screens."],
      ["Sample only", "This record is demo data for the layout, not a shipped product."],
    ]),
  }),
  ...softwareProjects,
  ...aiProjects,
  ...brandProjects,
  ...contentProjects,
  ...videoProjects,
];
