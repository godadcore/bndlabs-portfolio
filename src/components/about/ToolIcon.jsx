import afterquery from "../../assets/tools/afterquery.svg";
import canva from "../../assets/tools/canva.svg";
import capcut from "../../assets/tools/capcut.png";
import claude from "../../assets/tools/claude.svg";
import cloudinary from "../../assets/tools/cloudinary.svg";
import discourse from "../../assets/tools/discourse.svg";
import colab from "../../assets/tools/colab.svg";
import css3 from "../../assets/tools/css3.svg";
import express from "../../assets/tools/express.svg";
import figma from "../../assets/tools/figma.svg";
import firebase from "../../assets/tools/firebase.svg";
import git from "../../assets/tools/git.svg";
import github from "../../assets/tools/github.svg";
import googledocs from "../../assets/tools/googledocs.svg";
import grammarly from "../../assets/tools/grammarly.svg";
import handshake from "../../assets/tools/handshake.svg";
import html5 from "../../assets/tools/html5.svg";
import huggingface from "../../assets/tools/huggingface.svg";
import illustrator from "../../assets/tools/illustrator.svg";
import javascript from "../../assets/tools/javascript.svg";
import jupyter from "../../assets/tools/jupyter.svg";
import kaggle from "../../assets/tools/kaggle.svg";
import langchain from "../../assets/tools/langchain.svg";
import maze from "../../assets/tools/maze.svg";
import mlflow from "../../assets/tools/mlflow.svg";
import mongodb from "../../assets/tools/mongodb.svg";
import netlify from "../../assets/tools/netlify.svg";
import nextjs from "../../assets/tools/nextjs.svg";
import nodejs from "../../assets/tools/nodejs.svg";
import openapi from "../../assets/tools/openapi.svg";
import notion from "../../assets/tools/notion.svg";
import plotly from "../../assets/tools/plotly.svg";
import postgresql from "../../assets/tools/postgresql.svg";
import pytorch from "../../assets/tools/pytorch.svg";
import postman from "../../assets/tools/postman.svg";
import python from "../../assets/tools/python.svg";
import react from "../../assets/tools/react.svg";
import roboflow from "../../assets/tools/roboflow.svg";
import supabase from "../../assets/tools/supabase.svg";
import tailwind from "../../assets/tools/tailwind.svg";
import trustpilot from "../../assets/tools/trustpilot.svg";
import typescript from "../../assets/tools/typescript.svg";
import vercel from "../../assets/tools/vercel.svg";
import wandb from "../../assets/tools/wandb.svg";

const MARKS = {
  Figma: figma,
  "Adobe Illustrator": illustrator,
  Maze: maze,
  Notion: notion,
  HTML5: html5,
  CSS3: css3,
  JavaScript: javascript,
  TypeScript: typescript,
  "React.js": react,
  "Next.js": nextjs,
  "Tailwind CSS": tailwind,
  "Node.js": nodejs,
  "Express.js": express,
  Supabase: supabase,
  PostgreSQL: postgresql,
  MongoDB: mongodb,
  Firebase: firebase,
  Cloudinary: cloudinary,
  Git: git,
  GitHub: github,
  Postman: postman,
  Netlify: netlify,
  Vercel: vercel,
  Python: python,
  "Jupyter Notebook": jupyter,
  "Google Colab": colab,
  "Hugging Face": huggingface,
  Canva: canva,
  "Google Docs": googledocs,
  Grammarly: grammarly,
  "REST APIs": openapi,
  "Handshake AI": handshake,
  AfterQuery: afterquery,
  "AI Training": pytorch,
  "AI Evaluation": wandb,
  "Data Annotation": roboflow,
  "Model Evaluation": mlflow,
  "Prompt Engineering": langchain,
  "LLM Evaluation": claude,
  "Response Quality Assessment": trustpilot,
  "AI Output Analysis": plotly,
  "Dataset Review": kaggle,
  "Human Feedback": discourse,
};

export default function ToolIcon({ name }) {
  if (name === "CapCut") return <img className="toolMarkImg" src={capcut} alt="" />;
  const src = MARKS[name];
  if (!src) return null;
  return <span className="toolMark" style={{ "--mark": `url("${src}")` }} aria-hidden="true" />;
}
