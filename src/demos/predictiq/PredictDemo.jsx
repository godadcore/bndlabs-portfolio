import { useMemo, useState } from "react";
import DemoShell from "../DemoShell";
import { movingAverage, parseSeries } from "./forecast.js";

export default function PredictDemo() {
  const [text, setText] = useState("12, 14, 13, 18, 17, 21");
  const [windowSize, setWindowSize] = useState("3");
  const values = useMemo(() => parseSeries(text), [text]);
  const average = useMemo(() => movingAverage(values, windowSize), [values, windowSize]);
  const peak = Math.max(1, ...values, ...average);

  return (
    <DemoShell title="PredictIQ">
      <section className="demoPanel">
        <p>Each point is the mean of that value and the previous ones inside the window. Window 3 uses the current value and the two before it.</p>
        <form className="demoFields" onSubmit={(event) => event.preventDefault()}>
          <label>
            Values
            <input value={text} onChange={(event) => setText(event.target.value)} />
          </label>
          <label>
            Window
            <input inputMode="numeric" value={windowSize} onChange={(event) => setWindowSize(event.target.value)} />
          </label>
        </form>
        <div className="demoChart" aria-hidden="true">
          {average.map((value, index) => (
            <span key={`${values[index]}-${index}`} style={{ height: `${Math.max(8, (value / peak) * 140)}px` }} />
          ))}
        </div>
        <ul className="demoList">
          {values.map((value, index) => (
            <li className="demoItem" key={`${value}-${index}`}>
              <span>Input {value}</span>
              <span>Average {average[index].toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </section>
    </DemoShell>
  );
}
