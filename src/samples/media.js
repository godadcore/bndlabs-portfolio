import product from "../assets/samples/sample-product-market.jpg";
import nuvoraPrint from "../assets/samples/sample-nuvora-print.jpg";
import veloraPack from "../assets/samples/sample-velora-pack.jpg";
import pulsePoster from "../assets/samples/sample-pulse-poster.jpg";
import essay from "../assets/samples/sample-essay-desk.jpg";
import paper from "../assets/samples/sample-copy-paper.jpg";
import marks from "../assets/samples/sample-edit-marks.jpg";
import books from "../assets/samples/sample-language-books.jpg";
import typeCase from "../assets/samples/sample-brand-type.jpg";
import swatches from "../assets/samples/sample-brand-color.jpg";
import finora from "../assets/samples/sample-finora.jpg";
import markethub from "../assets/samples/sample-markethub.jpg";
import connectly from "../assets/samples/sample-connectly.jpg";
import assist from "../assets/samples/sample-assistai.jpg";
import predict from "../assets/samples/sample-predictiq.jpg";
import vision from "../assets/samples/sample-visionai.jpg";
import bunny from "../assets/samples/sample-video-bunny.jpg";
import sintel from "../assets/samples/sample-video-sintel.jpg";
import tears from "../assets/samples/sample-video-tears.jpg";
import spring from "../assets/samples/sample-video-spring.jpg";
import sprite from "../assets/samples/sample-video-sprite.jpg";
import agent from "../assets/samples/sample-video-agent.jpg";

function shot(src, alt) {
  return { src, alt, caption: "" };
}

export const media = {
  product: shot(product, "Fruit at a market stall. A photograph for the sample, not a client product."),
  finoraCover: shot(finora, "The Finora sample ledger running in the browser."),
  markethubCover: shot(markethub, "The MarketHub sample cart running in the browser."),
  connectlyCover: shot(connectly, "The Connectly sample message board running in the browser."),
  assistCover: shot(assist, "The AssistAI sample, a rule-based reply on the page."),
  predictCover: shot(predict, "The PredictIQ sample chart after the visitor changes the numbers."),
  visionCover: shot(vision, "The VisionAI sample showing size and average colour for a chosen image."),
  nuvoraPrint: shot(nuvoraPrint, "A letterpress print. A reference photograph, not a client mark."),
  nuvoraType: shot(typeCase, "Metal type in a case. A reference photograph, not a client wordmark."),
  nuvoraColor: shot(swatches, "Fabric colour swatches. A reference photograph, not a client palette."),
  veloraPack: shot(veloraPack, "A glass jar. A reference photograph of a container, not a client package."),
  pulsePoster: shot(pulsePoster, "Posters on a wall. A reference photograph, not a client campaign."),
  essay: shot(essay, "A person writing in a notebook."),
  paper: shot(paper, "A typewriter on a desk."),
  marks: shot(marks, "A photographed manuscript page."),
  books: shot(books, "A stack of old books."),
  bunny: shot(bunny, "Poster for Big Buck Bunny, Blender Foundation."),
  sintel: shot(sintel, "Poster for Sintel, Blender Foundation."),
  tears: shot(tears, "Poster for Tears of Steel, Blender Foundation."),
  spring: shot(spring, "Poster for Spring, Blender Studio."),
  sprite: shot(sprite, "Poster for Sprite Fright, Blender Studio."),
  agent: shot(agent, "Poster for Agent 327: Operation Barbershop, Blender Studio."),
  nuvoraCover: shot(nuvoraPrint, "A letterpress print. A reference photograph, not a client mark."),
  nuvoraMark: shot(typeCase, "Metal type in a case. A reference photograph, not a client wordmark."),
  nuvoraSystem: shot(swatches, "Fabric colour swatches. A reference photograph, not a client palette."),
  nuvoraApply: shot(nuvoraPrint, "A letterpress print. A reference photograph, not a client application."),
  veloraCover: shot(veloraPack, "A glass jar. A reference photograph of a container, not a client package."),
  veloraMark: shot(typeCase, "Metal type in a case. A reference photograph, not a client wordmark."),
  veloraSystem: shot(swatches, "Fabric colour swatches. A reference photograph, not a client palette."),
  veloraPack: shot(veloraPack, "A glass jar. A reference photograph of a container, not a client package."),
  pulseCover: shot(pulsePoster, "Posters on a wall. A reference photograph, not a client campaign."),
  pulseGrid: shot(pulsePoster, "Posters on a wall. A reference photograph, not a client grid."),
  pulseType: shot(typeCase, "Metal type in a case. A reference photograph, not a client type system."),
  pulsePosts: shot(swatches, "Fabric colour swatches. A reference photograph, not a client post."),
  futureCover: shot(essay, "A person writing in a notebook."),
  futureEssay: shot(essay, "A person writing in a notebook."),
  novapayCover: shot(paper, "A typewriter on a desk."),
  novapayCopy: shot(paper, "A typewriter on a desk."),
  editorialBefore: shot(marks, "A photographed manuscript page."),
  editorialAfter: shot(marks, "A photographed manuscript page."),
  languagesCover: shot(books, "A stack of old books."),
  languagesBoard: shot(books, "A stack of old books."),
};
