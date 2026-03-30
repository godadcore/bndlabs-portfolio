import { copyCode, highlightCodeHtml } from "./utils";

export default function CodeBlock({ block }) {
  if (!block?.code) return null;

  const highlightedCode = highlightCodeHtml(block.code);

  return (
    <div className="blogPostCodeBlock">
      <div className="blogPostCodeHeader">
        <span className="blogPostCodeLang">
          {block.language || "Code"} - {block.filename || "snippet.txt"}
        </span>
        <button type="button" className="blogPostCopyBtn" onClick={(event) => copyCode(event.currentTarget)}>
          Copy
        </button>
      </div>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  );
}
