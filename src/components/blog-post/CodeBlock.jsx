import { copyCode, highlightCodeHtml, sanitizeBlogHtml } from "./utils";

function InlineCodeMeta({ html, fallback = "" }) {
  const sanitizedHtml = sanitizeBlogHtml(html || fallback);
  if (!sanitizedHtml) return null;

  return <span dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

export default function CodeBlock({ block }) {
  if (!block?.code) return null;

  const highlightedCode = highlightCodeHtml(block.code);

  return (
    <div className="blogPostCodeBlock">
      <div className="blogPostCodeHeader">
        <span className="blogPostCodeLang">
          <InlineCodeMeta html={block.languageHtml} fallback={block.language || "Code"} /> -{" "}
          <InlineCodeMeta html={block.filenameHtml} fallback={block.filename || "snippet.txt"} />
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
