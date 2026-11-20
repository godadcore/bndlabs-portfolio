import { SAMPLE_REPOSITORY_URL } from "../content/sampleRepository.js";
import repliesSource from "../demos/assistai/replies.js?raw";
import forecastSource from "../demos/predictiq/forecast.js?raw";
import statsSource from "../demos/visionai/stats.js?raw";
import { media } from "./media.js";
import { codeSection } from "./shape.js";

const fictional = "Sample project on this site. Not a client engagement and not a trained model.";

function aiProject({
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
    category: "AI & Machine Learning",
    discipline: "ai-machine-learning",
    status: "published",
    date,
    publishedDate: date,
    heroImage: cover.src,
    liveUrl: `/demos/${slug}`,
    repositoryUrl: SAMPLE_REPOSITORY_URL,
    role: ["Interface"],
    tools,
    overviewText: overview,
    problems,
    researchText: research,
    researchImages: [cover],
    wireframeText: wire,
    wireframeImages: [cover],
    prototypeText: done,
    finalImages: [cover],
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

export const aiProjects = [
  aiProject({
    slug: "demo-assistai",
    title: "AssistAI — Intelligent Customer Support Assistant",
    date: "2025-09-02",
    description: "A support chat whose replies come from written rules.",
    tools: ["React"],
    overview: "AssistAI is a small support chat. You type a question and the page answers from a list of rules. It does not call a model. If no rule matches, it says a person would take the question.",
    problems: [
      { title: "A suggestion can sound finished", description: "A drafted reply can read as if it has already been sent." },
      { title: "A rule is not a decision", description: "Refunds and passwords stay with a person. The rule only points there." },
      { title: "An unknown question needs a person", description: "The page should say so instead of inventing an answer." },
    ],
    research: "Four rules cover a greeting, an order, a refund, and a password. The function tests the text and returns one sentence.",
    wire: "The question sits above the thread. Each turn shows You and Rule.",
    done: "Open the live sample and send a short question. The code below is the rule list.",
    cover: media.assistCover,
    source: repliesSource,
    results: [
      { metric: "Rules", description: "Replies are written in the page. No model is called." },
      { metric: "A person for the rest", description: "An unmatched question says a person would take it." },
      { metric: "Sample", description: "Not a support desk and not a client product." },
    ],
  }),
  aiProject({
    slug: "demo-predictiq",
    title: "PredictIQ — Predictive Analytics System",
    date: "2025-08-20",
    description: "A chart that updates from numbers you type.",
    tools: ["React"],
    overview: "PredictIQ draws a moving average from numbers you type. For a window of 3, each point is the mean of that value and the two before it. Change the numbers and the bars change. It does not forecast a future week and it does not fit a model.",
    problems: [
      { title: "A point looks certain", description: "One number hides how the recent values moved." },
      { title: "The window is hidden", description: "The page states which values go into each average." },
      { title: "A chart that ignores the input", description: "The bars have to come from the numbers on the form." },
    ],
    research: "The formula is a simple moving average. parseSeries reads the numbers. movingAverage walks the list and averages the current window.",
    wire: "The values and the window sit above the bars. Each row shows the input and the average.",
    done: "Open the live sample, change a number, and watch the average. The code below is the formula.",
    cover: media.predictCover,
    source: forecastSource,
    results: [
      { metric: "Moving average", description: "Window 3 uses the current value and the two before it." },
      { metric: "Your numbers", description: "The chart updates from the field. The default series is 12, 14, 13, 18, 17, 21." },
      { metric: "Sample", description: "Not a forecast of a real business and not a trained model." },
    ],
  }),
  aiProject({
    slug: "demo-visionai",
    title: "VisionAI — Image Recognition Application",
    date: "2025-07-28",
    description: "An image preview with size and average colour.",
    tools: ["React"],
    overview: "VisionAI lets you choose an image. The page shows a preview, the width and height, the file size, and the average colour. The average is the mean red, green and blue of a 32 by 32 canvas draw. The file stays in the browser. The page does not recognise objects.",
    problems: [
      { title: "A label can overclaim", description: "A colour average is not a recognition result." },
      { title: "The file should stay here", description: "The sample reads the picture locally and does not upload it." },
      { title: "The numbers should be the file's", description: "Width, height and byte size come from the file you choose." },
    ],
    research: "The reader draws the image into a 32 by 32 canvas, reads the pixels, and averages the colour channels.",
    wire: "A file field sits above the preview. The dimensions, byte size and average colour follow the picture.",
    done: "Open the live sample and choose an image. The code below is the reader.",
    cover: media.visionCover,
    source: statsSource,
    results: [
      { metric: "Local read", description: "The picture is not uploaded." },
      { metric: "Average colour", description: "Mean red, green and blue from a 32 by 32 draw." },
      { metric: "Sample", description: "Not an object recogniser and not a client product." },
    ],
  }),
];
