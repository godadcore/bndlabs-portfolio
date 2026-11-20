import { media } from "./media.js";

const fictional = "Sample page. The film is an openly licensed Blender open movie, not client work.";

function film({ title, id, poster, credit }) {
  return {
    title,
    provider: "YouTube",
    hostedUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    providerVideoId: id,
    poster: poster.src,
    posterAlt: poster.alt,
    credit,
    aspectRatio: "16:9",
    category: "Video Clipping & Creative Media",
  };
}

const bunny = film({
  title: "Big Buck Bunny",
  id: "aqz-KE-bpKQ",
  poster: media.bunny,
  credit: "Video: Big Buck Bunny, © Blender Foundation, CC BY 3.0",
});
const sintel = film({
  title: "Sintel",
  id: "eRsGyueVLvQ",
  poster: media.sintel,
  credit: "Video: Sintel, © Blender Foundation, CC BY 3.0",
});
const tears = film({
  title: "Tears of Steel",
  id: "OHOpb2fS-cM",
  poster: media.tears,
  credit: "Video: Tears of Steel, © Blender Foundation, CC BY 3.0",
});
const spring = film({
  title: "Spring",
  id: "WhWc3b3KhnY",
  poster: media.spring,
  credit: "Video: Spring, © Blender Foundation, CC BY 4.0",
});
const sprite = film({
  title: "Sprite Fright",
  id: "_cMxraX_5RE",
  poster: media.sprite,
  credit: "Video: Sprite Fright, © Blender Foundation, CC BY 4.0",
});
function videoProject({
  slug,
  title,
  date,
  description,
  overview,
  film,
  featured = false,
  result = null,
}) {
  return {
    _type: "caseStudy",
    sample: true,
    featured,
    id: slug,
    slug,
    title,
    description: `${description} ${fictional}`,
    category: "Video Clipping & Creative Media",
    discipline: "video-clipping",
    status: "published",
    date,
    publishedDate: date,
    heroImage: film.poster,
    overviewText: overview,
    problems: [],
    researchText: "",
    researchImages: [],
    wireframeText: "",
    wireframeImages: [],
    prototypeText: "",
    finalImages: [],
    videos: [film],
    results: result ? [result] : [],
  };
}

const sampleResult = { metric: "Sample", description: "Not a client cut." };

export const videoProjects = [
  videoProject({
    slug: "demo-big-buck-bunny",
    title: "Big Buck Bunny",
    date: "2025-10-02",
    description: "A featured sample clip.",
    overview: "This clip uses Big Buck Bunny, a Blender open movie, so the page can play a real video. It is not client work.",
    film: bunny,
    featured: true,
    result: sampleResult,
  }),
  videoProject({
    slug: "demo-sintel",
    title: "Sintel",
    date: "2025-09-20",
    description: "A sample highlight.",
    overview: "This highlight uses Sintel, a Blender open movie, so the page can play a real video. It is not client work.",
    film: sintel,
    result: sampleResult,
  }),
  videoProject({
    slug: "demo-tears-of-steel",
    title: "Tears of Steel",
    date: "2025-09-02",
    description: "A sample highlight.",
    overview: "This highlight uses Tears of Steel, a Blender open movie, so the page can play a real video. It is not client work.",
    film: tears,
    result: sampleResult,
  }),
  videoProject({
    slug: "demo-spring",
    title: "Spring",
    date: "2025-08-18",
    description: "A sample highlight.",
    overview: "This highlight uses Spring, a Blender open movie, so the page can play a real video. It is not client work.",
    film: spring,
    result: sampleResult,
  }),
  videoProject({
    slug: "demo-sprite-fright",
    title: "Sprite Fright",
    date: "2025-08-01",
    description: "A sample highlight.",
    overview: "This highlight uses Sprite Fright, a Blender open movie, so the page can play a real video. It is not client work.",
    film: sprite,
    result: sampleResult,
  }),
  videoProject({
    slug: "demo-social-cuts",
    title: "Social Cuts — Short-form Video",
    date: "2025-05-08",
    description: "A sample short cut: a hook, a proof, and an end card.",
    overview: "Social Cuts is a plan for a short clip. The first second is the point, not a logo. The film on the page is Spring, a Blender open movie, so the notes can sit next to a real picture.",
    film: spring,
  }),
  videoProject({
    slug: "demo-creative-interview",
    title: "The Creative Interview — Podcast",
    date: "2025-04-18",
    description: "A sample podcast cut that keeps one answer and removes the rest.",
    overview: "The Creative Interview is a demonstration of a short clip: one question, one answer, the breath before the point, and a title. The film on the page is Sintel, so the player is real. No episode was recorded for this page.",
    film: sintel,
  }),
  videoProject({
    slug: "demo-product-motion",
    title: "Product Motion — Commercial Video",
    date: "2025-03-26",
    description: "A sample commercial: the product, one feature, one action, the name.",
    overview: "Product Motion is a four-beat commercial plan. The product is in the hand before any type appears. The film on the page is Tears of Steel. No product was filmed for a client.",
    film: tears,
  }),
  videoProject({
    slug: "demo-visual-stories",
    title: "Visual Stories",
    date: "2025-03-04",
    description: "A sample open that starts on the subject.",
    overview: "Visual Stories compares two opens. One starts on a logo. The other starts on the subject. The film on the page is Sprite Fright. There is no client scene behind it.",
    film: sprite,
  }),
];
