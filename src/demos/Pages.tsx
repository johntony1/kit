// Three small pages to transition between. They are about this library, in the
// Operate look: warm paper, sage ink, a green pill.

export const PAGE_COUNT = 3;

export function DemoPage({ n, compact = false }: { n: number; compact?: boolean }) {
  const i = ((n % PAGE_COUNT) + PAGE_COUNT) % PAGE_COUNT;
  const tag = <span className="pgTag">{String(i + 1).padStart(2, "0")} / {String(PAGE_COUNT).padStart(2, "0")}</span>;
  if (i === 0) return (
    <div className={`pg pgPaper ${compact ? "compact" : ""}`}>
      <div className="pgTop"><span className="pgLogo">Effects<span>.free</span></span>{tag}</div>
      <h3 className="pgH">Motion for the moments that matter.</h3>
      <p className="pgP">Ripples, confetti, type that bends and pages that burn. Copy the code or the prompt, and make it yours.</p>
      <div className="pgBtns"><span className="pgBtn green">I see you</span><span className="pgBtn">Don't blink</span></div>
    </div>
  );
  if (i === 1) return (
    <div className={`pg pgInk ${compact ? "compact" : ""}`}>
      <div className="pgTop"><span className="pgLogo">Ripple</span>{tag}</div>
      <h3 className="pgH">A ring of light that bends what it passes.</h3>
      <div className="pgRows">
        <span>Intensity</span><b>0.045</b>
        <span>Frequency</span><b>26</b>
        <span>Burst</span><b>3.2</b>
      </div>
    </div>
  );
  return (
    <div className={`pg pgSage ${compact ? "compact" : ""}`}>
      <div className="pgTop"><span className="pgLogo">Transitions</span>{tag}</div>
      <h3 className="pgH">From one page to the next, with a little ceremony.</h3>
      <p className="pgP">Burn, paper, reveal, ink, curtain, pixels, zoom and tilt. Real DOM, no screenshots.</p>
    </div>
  );
}

/* ── a short book: the field guide to this library ── */
const CHAPTERS: { kicker: string; title: string; body: string }[] = [
  { kicker: "Chapter one", title: "Ripple", body: "A ring of light bursts from a point and bends what it passes. It began on a QR code: the moment the code was ready, it rippled." },
  { kicker: "Chapter two", title: "Confetti pop", body: "Seventy two ribbons and dots, a badge that pops with a blur, a glow that springs in and stays. A transaction, completed." },
  { kicker: "Chapter three", title: "Type that bends", body: "Glass that drifts over words, rings that cut through letters, outlines that pour out of a word forever." },
  { kicker: "Chapter four", title: "Pages that turn", body: "A page that burns from where you touch it. A page that lifts at the corner and turns like this one." },
];

function BookPage({ n, total, children, side }: { n: number; total: number; children: React.ReactNode; side: "l" | "r" }) {
  return (
    <div className={`bkp bkp-${side}`}>
      <div className="bkpHead"><span>Effects.free</span><span>A field guide</span></div>
      <div className="bkpBody">{children}</div>
      <div className="bkpFoot">{n} <span>/ {total}</span></div>
    </div>
  );
}

export function bookPages(): React.ReactNode[] {
  const total = 2 + CHAPTERS.length * 2;
  const out: React.ReactNode[] = [];
  out.push(<div className="bkp bkpCover" key="c"><span className="bkpCoverKick">A field guide</span><h3>Effects<br />.free</h3><span className="bkpCoverFoot">Drag the edge, or click</span></div>);
  out.push(<BookPage key="i" n={2} total={total} side="r"><p className="bkpKick">Contents</p>{CHAPTERS.map((c, i) => <p key={c.title} className="bkpToc"><span>{c.title}</span><span>{3 + i * 2}</span></p>)}</BookPage>);
  CHAPTERS.forEach((c, i) => {
    out.push(<BookPage key={`a${i}`} n={3 + i * 2} total={total} side="l"><p className="bkpKick">{c.kicker}</p><h4 className="bkpTitle">{c.title}</h4><p className="bkpText">{c.body}</p></BookPage>);
    out.push(<BookPage key={`b${i}`} n={4 + i * 2} total={total} side="r"><div className={`bkpArt art${i}`} aria-hidden="true" /><p className="bkpCaption">Plate {i + 1}. {c.title}.</p></BookPage>);
  });
  return out;
}
