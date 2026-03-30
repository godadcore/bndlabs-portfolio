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
                <th key={`${block.id}-header-${index}`}>{header}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${block.id}-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${block.id}-cell-${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
