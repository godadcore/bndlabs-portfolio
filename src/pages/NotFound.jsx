import { Link, useLocation } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Seo from "../components/seo/Seo";
import { SITE_NAME } from "../lib/site";

export default function NotFound() {
  const location = useLocation();

  return (
    <main className="bnd">
      <Seo
        title={`Page not found | ${SITE_NAME}`}
        description="This page is not part of the Bndlabs site."
        robots="noindex, nofollow"
        url={location.pathname}
      />
      <header className="pageFrame pageIntro">
        <h1>This page is not in the studio.</h1>
        <p className="kicker">404</p>
        <div className="pageEnd">
          <p>The address may be old, or the page may have moved. Work, notes, and contact are still here.</p>
          <div className="actions">
            <Link className="liquid" to="/">Home</Link>
            <Link className="liquid" to="/work">Work</Link>
            <Link className="liquid" to="/contact">Contact</Link>
          </div>
        </div>
      </header>
      <Footer />
    </main>
  );
}
