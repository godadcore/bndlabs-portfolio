export default function TocSidebar({ headings = [], activeHeading = "" }) {
  return (
    <aside className="blogPostToc" aria-label="Table of contents">
      <div className="blogPostTocInner">
        <p className="blogPostTocTitle">On this page</p>
        {headings.length ? (
          <ul className="blogPostTocList">
            {headings.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`blogPostTocLink${activeHeading === item.id ? " is-active" : ""}`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="blogPostTocEmpty">No sections yet.</p>
        )}
      </div>
    </aside>
  );
}
