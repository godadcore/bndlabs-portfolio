import { SAMPLE_REPOSITORY_URL } from "../content/sampleRepository.js";
import ledgerSource from "../demos/finora/ledger.js?raw";
import cartSource from "../demos/markethub/cart.js?raw";
import boardSource from "../demos/connectly/board.js?raw";
import { media } from "./media.js";
import { codeSection } from "./shape.js";

const fictional = "Sample project on this site. Not a client engagement.";

function softwareProject({
  slug,
  title,
  date,
  description,
  tools,
  overview,
  problems,
  research,
  wire,
  done,
  cover,
  shots,
  source,
  results,
}) {
  return {
    _type: "caseStudy",
    sample: true,
    id: slug,
    slug,
    title,
    description: `${description} ${fictional}`,
    category: "Software Engineering",
    discipline: "software-engineering",
    status: "published",
    date,
    publishedDate: date,
    heroImage: cover.src,
    liveUrl: `/demos/${slug}`,
    repositoryUrl: SAMPLE_REPOSITORY_URL,
    role: ["Software engineering"],
    tools,
    overviewText: overview,
    problems,
    researchText: research,
    researchImages: shots,
    wireframeText: wire,
    wireframeImages: shots,
    prototypeText: done,
    finalImages: shots,
    sections: [
      codeSection(
        "Selected code",
        "This block is read from the sample that runs on this site.",
        "JavaScript",
        source.trim(),
      ),
    ],
    results,
  };
}

export const softwareProjects = [
  softwareProject({
    slug: "demo-finora",
    title: "Finora — Financial Management Platform",
    date: "2025-09-12",
    description: "A ledger for adding, editing and deleting entries.",
    tools: ["React"],
    overview: "Finora keeps a short ledger in the browser. Add an entry, edit it, or delete it. The balance is the sum of money in, minus money out. The list stays in localStorage on this computer.",
    problems: [
      { title: "The balance hides the last change", description: "A person can save an entry and still not know whether the number on screen includes it." },
      { title: "A failed save looks idle", description: "An empty label or a bad amount is ignored, so the list does not change." },
      { title: "The list forgets its place", description: "A refresh should open the same entries the person just saved." },
    ],
    research: "The sample is one screen. The ledger module adds, updates and deletes entries, then totals them. Nothing is sent to a server.",
    wire: "The balance sits above the form. Each row has Edit and Delete. Saving an edit replaces that row and updates the balance.",
    done: "Open the live sample to add a row, change the amount, and delete it. The code below is the module the page uses.",
    cover: media.finoraCover,
    shots: [media.finoraCover],
    source: ledgerSource,
    results: [
      { metric: "Add, edit, delete", description: "Each action updates the list and the balance." },
      { metric: "Kept locally", description: "Entries are stored in localStorage under bndlabs-demo-finora." },
      { metric: "Sample", description: "A ledger for this page, not a bank or a client product." },
    ],
  }),
  softwareProject({
    slug: "demo-markethub",
    title: "MarketHub — E-commerce Management System",
    date: "2025-08-04",
    description: "A product list with a cart total.",
    tools: ["React"],
    overview: "MarketHub lists four products. Add one to the cart, change the quantity, and the total updates. The cart stays in memory for the visit.",
    problems: [
      { title: "The total lags the cart", description: "Adding an item should change the total on the same action." },
      { title: "Quantity zero still counts", description: "A quantity of zero should remove the line, not leave a free row." },
      { title: "A hidden product still sells", description: "Only the products in the list can be added." },
    ],
    research: "The cart module finds the product, adds a line or increases the quantity, and sums price times quantity.",
    wire: "Products are a list. The cart sits under them with a quantity field and a total.",
    done: "Open the live sample, add a product, and change the quantity. The code below is the cart module.",
    cover: media.markethubCover,
    shots: [media.markethubCover],
    source: cartSource,
    results: [
      { metric: "Cart total", description: "The total is the sum of each price times its quantity." },
      { metric: "Four products", description: "Cup, bag, poster and notebook, with prices written in the module." },
      { metric: "Sample", description: "No checkout and no payment. The cart is the demonstration." },
    ],
  }),
  softwareProject({
    slug: "demo-connectly",
    title: "Connectly — Real-time Collaboration Platform",
    date: "2025-07-16",
    description: "A message board kept in the page.",
    tools: ["React"],
    overview: "Connectly is a message board. Type a name and a message, post it, and the line stays on the page until you leave. There is no server and no other person on the other end.",
    problems: [
      { title: "A draft can vanish", description: "An empty message is not posted." },
      { title: "The author is missing", description: "A blank name is stored as Guest." },
      { title: "The time is unclear", description: "Each line shows the time it was posted." },
    ],
    research: "The board module appends a message with an id, an author, the text, and the time. The list lives in React state.",
    wire: "Name and message sit above the list. A new post appears at the end.",
    done: "Open the live sample and post a line. The code below is the board module.",
    cover: media.connectlyCover,
    shots: [media.connectlyCover],
    source: boardSource,
    results: [
      { metric: "Local messages", description: "Posts stay in the page state for the visit." },
      { metric: "Guest name", description: "A blank name becomes Guest." },
      { metric: "Sample", description: "Not a live chat service and not a client product." },
    ],
  }),
];
