import { Link } from "react-router-dom";

export default function Blog() {
  return (
    <main className="simplePage">
      <h1>Blog</h1>
      <p>This is the Blog page.</p>
      <Link to="/">Back Home</Link>
    </main>
  );
}
