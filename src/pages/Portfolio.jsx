import { Link } from "react-router-dom";

export default function Portfolio() {
  return (
    <main className="simplePage">
      <h1>Portfolio</h1>
      <p>This is the Portfolio page.</p>
      <Link to="/">Back Home</Link>
    </main>
  );
}
