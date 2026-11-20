import { media } from "./media.js";

const fictional = "Sample page. The film is an openly licensed Blender open movie, not a client edit.";

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
const agent = film({
  title: "Agent 327: Operation Barbershop",
  id: "mN0zPOpADL4",
  poster: media.agent,
  credit: "Video: Agent 327: Operation Barbershop, © Blender Foundation, CC BY 3.0",
});

function videoProject({
  slug,
  title,
  date,
  description,
  tools,
  overview,
  problems,
  approach,
  edit,
  videos,
  featured = false,
}) {
  const primary = videos[0];
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
    heroImage: primary.poster,
    role: ["Editing"],
    tools,
    overviewText: overview,
    problems,
    researchText: approach,
    researchImages: [{ src: primary.poster, alt: primary.posterAlt }],
    wireframeText: edit,
    wireframeImages: [{ src: primary.poster, alt: primary.posterAlt }],
    prototypeText: "Press Watch to load the film. It stays muted and inline, and only one film plays at a time. The film is not a client job.",
    finalImages: videos.slice(1).map((item) => ({ src: item.poster, alt: item.posterAlt })),
    videos,
    results: [
      { metric: "Open movie", description: "The player uses a Blender Foundation film so the page can play a real video." },
      { metric: "Click to play", description: "The iframe loads after Watch. Nothing from YouTube runs on page load." },
      { metric: "Sample", description: "Not a client cut." },
    ],
  };
}

export const videoProjects = [
  videoProject({
    slug: "demo-creative-media-showreel",
    title: "Creative Media Showreel",
    date: "2025-10-02",
    description: "A featured sample reel.",
    tools: ["Premiere"],
    overview: "This showreel sits first in the category. The films are Blender open movies, used so the page can play real video. They are not a reel of client work.",
    problems: [
      { title: "A reel that is only titles", description: "Four title cards do not show how a cut is built." },
      { title: "Everything plays at once", description: "A page of films talking over each other is the failure this player is meant to avoid." },
      { title: "A missing file looks broken", description: "Each film has a poster. The player appears after Watch." },
    ],
    approach: "One film leads. The others sit in the grid. Playback is muted, inline, and limited to one film at a time.",
    edit: "The lead film is Big Buck Bunny. The grid holds Sintel, Tears of Steel, Spring and Sprite Fright.",
    videos: [bunny, sintel, tears, spring, sprite],
    featured: true,
  }),
  videoProject({
    slug: "demo-social-cuts",
    title: "Social Cuts — Short-form Video Editing",
    date: "2025-05-08",
    description: "A sample short cut: a hook, a proof, and an end card.",
    tools: ["Premiere"],
    overview: "Social Cuts is a plan for a short edit. The first second is the point, not a logo. The film on the page is Spring, a Blender open movie, so the notes can sit next to a real picture.",
    problems: [
      { title: "The hook is late", description: "A logo in the first second spends the moment a person uses to decide to stay." },
      { title: "The caption covers the face", description: "The line sits on the part of the frame a person looks at." },
      { title: "The end card is a second film", description: "A long close makes the cut feel like two pieces." },
    ],
    approach: "The first frame is readable without sound. The proof is one beat. The name arrives at the end, small.",
    edit: "Hook, proof, end card. Captions sit in the lower third, clear of the face.",
    videos: [spring, sprite, agent],
  }),
  videoProject({
    slug: "demo-creative-interview",
    title: "The Creative Interview — Podcast Editing",
    date: "2025-04-18",
    description: "A sample podcast cut that keeps one answer and removes the rest.",
    tools: ["Premiere", "Audition"],
    overview: "The Creative Interview is a demonstration of a short edit: one question, one answer, the breath before the point, and a title. The film on the page is Sintel, so the player is real. No episode was recorded for this page.",
    problems: [
      { title: "The preamble is longer than the point", description: "The guest clears their throat for twenty seconds before the sentence that matters." },
      { title: "Two answers are stacked", description: "A second example weakens the first." },
      { title: "The title talks over the voice", description: "The name arrives while the sentence is still landing." },
    ],
    approach: "Open on the question. Keep the breath. Cut to the sentence. Hold the title until the sentence has finished.",
    edit: "Cold open on the question. One answer. A breath. The name after the line, not during it.",
    videos: [sintel, tears, agent],
  }),
  videoProject({
    slug: "demo-product-motion",
    title: "Product Motion — Commercial Video Editing",
    date: "2025-03-26",
    description: "A sample commercial: the product, one feature, one action, the name.",
    tools: ["Premiere"],
    overview: "Product Motion is a four-beat commercial plan. The product is in the hand before any type appears. The film on the page is Tears of Steel. No product was filmed for a client.",
    problems: [
      { title: "The logo opens the film", description: "The product arrives after the person has already understood this as an advert and left." },
      { title: "Three features are listed", description: "A short commercial can hold one action." },
      { title: "The end card repeats the film", description: "The closing type says what the picture just showed." },
    ],
    approach: "Hands first. One detail. One use. The name last, and only the name.",
    edit: "Product in hand. One feature. One action. The name. No second product and no voice-over in this sample.",
    videos: [tears, spring, sprite],
  }),
  videoProject({
    slug: "demo-visual-stories",
    title: "Visual Stories — Cinematic Editing",
    date: "2025-03-04",
    description: "A sample cinematic open that starts on the subject.",
    tools: ["Premiere"],
    overview: "Visual Stories compares two opens. One starts on a logo. The other starts on the subject. The film on the page is Sprite Fright. There is no client scene behind it.",
    problems: [
      { title: "The open is a logo", description: "The first second is a mark, so the story starts late." },
      { title: "The wide shot explains too much", description: "An establishing shot shows the whole room before the person." },
      { title: "Sound carries the cut", description: "With the sound off, the join does not read." },
    ],
    approach: "Start on the subject. Let the place appear after. The cut should still read with the sound off.",
    edit: "Before: a logo for the first second. After: the subject is already in frame. The rest of the scene can follow.",
    videos: [sprite, agent, bunny],
  }),
];
