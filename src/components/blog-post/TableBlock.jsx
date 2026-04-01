import { sanitizeBlogHtml } from "./utils";

function TableCell({ value, as: Tag = "td" }) {
  const html = sanitizeBlogHtml(value?.html || value?.text || value);
  if (!html) return <Tag />;

  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function TableBlock({ block }) {
  const headers = Array.isArray(block?.headers) ? block.headers : [];
  const rows = Array.isArray(block?.rows) ? block.rows : [];

  if (!headers.length && !rows.length) return null;

  return (
    <div className="blogPostTableWrap">
      <table className="blogPostTable">
        {headers.length ? (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <TableCell
                  as="th"
                  key={`${block.id}-header-${index}`}
                  value={header}
                />
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${block.id}-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <TableCell
                  as="td"
                  key={`${block.id}-cell-${rowIndex}-${cellIndex}`}
                  value={cell}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
