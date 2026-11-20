import { useState } from "react";
import DemoShell from "../DemoShell";
import { replyTo } from "./replies.js";

export default function AssistDemo() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  return (
    <DemoShell title="AssistAI">
      <section className="demoPanel">
        <p>Replies come from a small list of rules in this page. This is not a model.</p>
        <form
          className="demoFields"
          onSubmit={(event) => {
            event.preventDefault();
            const question = text.trim();
            if (!question) return;
            setMessages([...messages, { id: crypto.randomUUID(), role: "You", text: question }, { id: crypto.randomUUID(), role: "Rule", text: replyTo(question) }]);
            setText("");
          }}
        >
          <label>
            Question
            <input value={text} onChange={(event) => setText(event.target.value)} />
          </label>
          <button className="liquid is-solid" type="submit">Send</button>
        </form>
        <ul className="demoList">
          {messages.map((message) => (
            <li className="demoItem" key={message.id}>
              <strong>{message.role}</strong>
              <span>{message.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </DemoShell>
  );
}
