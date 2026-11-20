import { ArrowLeft } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export default function BackMark({ to, label, title }) {
  return (
    <div className="backMark">
      <Link className="backMarkBox" to={to} aria-label={`Back to ${label}`}>
        <ArrowLeft size={20} weight="bold" aria-hidden="true" />
      </Link>
      {title ? <h1>{title}</h1> : <Link className="backMarkLabel" to={to}>{label}</Link>}
    </div>
  );
}
