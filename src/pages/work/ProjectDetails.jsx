import { useParams } from "react-router-dom";
import CaseStudyDetail from "../../components/work/CaseStudyDetail";

export default function ProjectDetails() {
  const { slug } = useParams();
  return <CaseStudyDetail slug={slug || ""} />;
}
