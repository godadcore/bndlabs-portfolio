import { useParams } from "react-router-dom";
import ProjectStory from "./ProjectStory";

export default function ProjectDetails() {
  const { slug } = useParams();
  return <ProjectStory slug={slug || ""} />;
}
