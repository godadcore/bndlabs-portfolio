export const portfolioOperations = [
  "create",
  "edit",
  "delete",
  "publish",
  "unpublish",
  "feature",
  "reorder",
];

const commonFields = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "description", label: "Short description", type: "text", required: true },
  { key: "overviewText", label: "Overview", type: "richText", required: true },
  { key: "discipline", label: "Category", type: "category", required: true },
  { key: "status", label: "Status", type: "status", required: true },
  { key: "featured", label: "Featured", type: "boolean" },
  { key: "order", label: "Order", type: "number" },
  { key: "publishedDate", label: "Date", type: "date", required: true },
  { key: "role", label: "Role", type: "list" },
  { key: "tools", label: "Tools", type: "list" },
  { key: "heroImage", label: "Cover", type: "image", required: true },
  { key: "problems", label: "Challenges", type: "items" },
  { key: "results", label: "Outcome", type: "items" },
];

const mediaFields = [
  { key: "researchImages", label: "Supporting images", type: "images" },
  { key: "wireframeImages", label: "Process images", type: "images" },
  { key: "finalImages", label: "Project images", type: "images" },
];

export const portfolioSchemas = {
  common: commonFields,
  operations: portfolioOperations,
  categories: {
    "product-design": {
      label: "Product Design & UI/UX",
      fields: [
        ...mediaFields,
        { key: "prototypeUrl", label: "Prototype", type: "url" },
        { key: "researchText", label: "Research", type: "richText" },
        { key: "wireframeText", label: "Wireframes", type: "richText" },
        { key: "prototypeText", label: "Interface notes", type: "richText" },
      ],
    },
    "software-engineering": {
      label: "Software Engineering",
      fields: [
        ...mediaFields,
        { key: "liveUrl", label: "Live application", type: "url" },
        { key: "repositoryUrl", label: "Repository", type: "url" },
        { key: "researchText", label: "Technical notes", type: "richText" },
        { key: "wireframeText", label: "Interface", type: "richText" },
        { key: "sections", label: "Code samples", type: "code" },
        { key: "prototypeText", label: "Demonstration notes", type: "richText" },
      ],
    },
    "ai-machine-learning": {
      label: "AI & Machine Learning",
      fields: [
        ...mediaFields,
        { key: "researchText", label: "Method", type: "richText" },
        { key: "wireframeText", label: "System", type: "richText" },
        { key: "prototypeText", label: "Evaluation", type: "richText" },
        { key: "liveUrl", label: "Live demo", type: "url" },
        { key: "repositoryUrl", label: "Repository", type: "url" },
      ],
    },
    "graphic-design": {
      label: "Graphic Design & Branding",
      fields: [
        ...mediaFields,
        { key: "researchText", label: "Exploration", type: "richText" },
        { key: "wireframeText", label: "Identity", type: "richText" },
        { key: "prototypeText", label: "Brand guidelines", type: "richText" },
      ],
    },
    "content-language": {
      label: "Content & Language",
      fields: [
        ...mediaFields,
        { key: "researchText", label: "Brief", type: "richText" },
        { key: "wireframeText", label: "Draft", type: "richText" },
        { key: "sections", label: "Sample text", type: "richText" },
        { key: "prototypeText", label: "Revision", type: "richText" },
      ],
    },
    "video-clipping": {
      label: "Video Clipping & Creative Media",
      fields: [
        ...mediaFields,
        { key: "researchText", label: "Approach", type: "richText" },
        { key: "wireframeText", label: "Edit", type: "richText" },
        { key: "videos", label: "Hosted video", type: "externalVideo" },
      ],
    },
  },
  externalVideo: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "provider", label: "Provider", type: "text" },
    { key: "hostedUrl", label: "Hosted URL", type: "url" },
    { key: "embedUrl", label: "Embed URL", type: "url" },
    { key: "providerVideoId", label: "Provider video ID", type: "text" },
    { key: "poster", label: "Poster", type: "image", required: true },
    { key: "duration", label: "Duration", type: "text" },
    { key: "aspectRatio", label: "Aspect ratio", type: "text" },
    { key: "category", label: "Category", type: "text" },
  ],
};
