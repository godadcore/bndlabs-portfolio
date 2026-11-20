import { useState } from "react";
import DemoShell from "../DemoShell";
import { addEntry, deleteEntry, loadEntries, saveEntries, totals, updateEntry } from "./ledger.js";

const empty = { label: "", amount: "", kind: "out" };

export default function FinoraDemo() {
  const [entries, setEntries] = useState(loadEntries);
  const [draft, setDraft] = useState(empty);
  const [editing, setEditing] = useState("");

  const commit = (next) => {
    setEntries(saveEntries(next));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const next = editing ? updateEntry(entries, editing, draft) : addEntry(entries, draft);
    commit(next);
    setDraft(empty);
    setEditing("");
  };

  return (
    <DemoShell title="Finora">
      <section className="demoPanel">
        <p>Balance {totals(entries).toLocaleString()}</p>
        <form className="demoFields" onSubmit={onSubmit}>
          <label>
            Label
            <input value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} />
          </label>
          <label>
            Amount
            <input inputMode="decimal" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} />
          </label>
          <label>
            Kind
            <select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value })}>
              <option value="in">In</option>
              <option value="out">Out</option>
            </select>
          </label>
          <button className="liquid is-solid" type="submit">{editing ? "Save" : "Add"}</button>
        </form>
        <ul className="demoList">
          {entries.map((entry) => (
            <li className="demoItem" key={entry.id}>
              <span>{entry.label}</span>
              <span>{entry.kind === "out" ? "−" : "+"}{entry.amount.toLocaleString()}</span>
              <span className="demoActions">
                <button
                  className="liquid"
                  type="button"
                  onClick={() => {
                    setEditing(entry.id);
                    setDraft({ label: entry.label, amount: String(entry.amount), kind: entry.kind });
                  }}
                >
                  Edit
                </button>
                <button className="liquid" type="button" onClick={() => commit(deleteEntry(entries, entry.id))}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </DemoShell>
  );
}
