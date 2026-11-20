import { useState } from "react";
import DemoShell from "../DemoShell";
import { readImageFile } from "./stats.js";

export default function VisionDemo() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  return (
    <DemoShell title="VisionAI">
      <section className="demoPanel">
        <p>This reads the file in the browser. It does not recognise objects and it does not upload the picture.</p>
        <label>
          Image
          <input
            type="file"
            accept="image/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                setError("");
                setStats(await readImageFile(file));
              } catch (reason) {
                setStats(null);
                setError(reason instanceof Error ? reason.message : "The image could not be read.");
              }
            }}
          />
        </label>
        {error ? <p>{error}</p> : null}
        {stats ? (
          <div className="demoRow">
            <img className="demoPreview" src={stats.url} alt="The image you chose" />
            <p>{stats.width} × {stats.height} px</p>
            <p>{stats.bytes.toLocaleString()} bytes</p>
            <p>Average colour rgb({stats.average.red}, {stats.average.green}, {stats.average.blue})</p>
            <span
              className="demoSwatch"
              style={{ background: `rgb(${stats.average.red}, ${stats.average.green}, ${stats.average.blue})` }}
            />
          </div>
        ) : null}
      </section>
    </DemoShell>
  );
}
