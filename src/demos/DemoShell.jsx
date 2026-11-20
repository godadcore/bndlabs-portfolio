export default function DemoShell({ title, children }) {
  return (
    <main className="bnd demoPage pageFrame">
      <header className="pageIntro">
        <span className="sampleTag">SAMPLE</span>
        <h1>{title}</h1>
        <p>This is a sample running on this site. It is not a client product.</p>
      </header>
      {children}
    </main>
  );
}
