import { useState } from "react";
import DemoShell from "../DemoShell";
import { addMessage, formatTime } from "./board.js";

export default function ConnectlyDemo() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState({ author: "", text: "" });

  return (
    <DemoShell title="Connectly">
      <section className="demoPanel">
        <form
          className="demoFields"
          onSubmit={(event) => {
            event.preventDefault();
            setMessages(addMessage(messages, draft));
            setDraft({ ...draft, text: "" });
          }}
        >
          <label>
            Name
            <input value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} />
          </label>
          <label>
            Message
            <input value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} />
          </label>
          <button className="liquid is-solid" type="submit">Post</button>
        </form>
        <ul className="demoList">
          {messages.map((message) => (
            <li className="demoItem" key={message.id}>
              <strong>{message.author}</strong>
              <span>{message.text}</span>
              <span>{formatTime(message.at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </DemoShell>
  );
}
