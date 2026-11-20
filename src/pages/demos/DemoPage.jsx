import { useParams } from "react-router-dom";
import AssistDemo from "../../demos/assistai/AssistDemo";
import ConnectlyDemo from "../../demos/connectly/ConnectlyDemo";
import FinoraDemo from "../../demos/finora/FinoraDemo";
import MarketHubDemo from "../../demos/markethub/MarketHubDemo";
import PredictDemo from "../../demos/predictiq/PredictDemo";
import VisionDemo from "../../demos/visionai/VisionDemo";
import "../../demos/demo.css";

const DEMOS = {
  "demo-finora": FinoraDemo,
  "demo-markethub": MarketHubDemo,
  "demo-connectly": ConnectlyDemo,
  "demo-assistai": AssistDemo,
  "demo-predictiq": PredictDemo,
  "demo-visionai": VisionDemo,
};

export default function DemoPage() {
  const { slug } = useParams();
  const Demo = DEMOS[slug];
  if (!Demo) {
    return (
      <main className="bnd pageFrame pageIntro">
        <h1>This sample is not on the site.</h1>
      </main>
    );
  }
  return <Demo />;
}
