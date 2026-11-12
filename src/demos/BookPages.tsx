// The field guide shown in the Paper flip card, as a small book.
import type { ReactNode } from "react";

/* ── a short book: the field guide to this library ── */
const CHAPTERS: { kicker: string; title: string; body: string }[] = [
  { kicker: "Chapter one", title: "Ripple", body: "A ring of light bursts from a point and bends what it passes. It began on a QR code: the moment the code was ready, it rippled." },
  { kicker: "Chapter two", title: "Confetti pop", body: "Seventy two ribbons and dots, a badge that pops with a blur, a glow that springs in and stays. A transaction, completed." },
  { kicker: "Chapter three", title: "Type that bends", body: "Glass that drifts over words, rings that cut through letters, outlines that pour out of a word forever." },
  { kicker: "Chapter four", title: "Pages that turn", body: "A page that burns from where you touch it. A page that lifts at the corner and turns like this one." },
];

function BookPage({ n, total, children, side }: { n: number; total: number; children: ReactNode; side: "l" | "r" }) {
  return (
    <div className={`bkp bkp-${side}`}>
      <div className="bkpHead"><span>Kit</span><span>A field guide</span></div>
      <div className="bkpBody">{children}</div>
      <div className="bkpFoot">{n} <span>/ {total}</span></div>
    </div>
  );
}

export function bookPages(): ReactNode[] {
  const total = 2 + CHAPTERS.length * 2;
  const out: ReactNode[] = [];
  out.push(<div className="bkp bkpCover" key="c"><span className="bkpCoverKick">A field guide</span><h3>Kit</h3><span className="bkpCoverFoot">Drag the edge, or click</span></div>);
  out.push(<BookPage key="i" n={2} total={total} side="r"><p className="bkpKick">Contents</p>{CHAPTERS.map((c, i) => <p key={c.title} className="bkpToc"><span>{c.title}</span><span>{3 + i * 2}</span></p>)}</BookPage>);
  CHAPTERS.forEach((c, i) => {
    out.push(<BookPage key={`a${i}`} n={3 + i * 2} total={total} side="l"><p className="bkpKick">{c.kicker}</p><h4 className="bkpTitle">{c.title}</h4><p className="bkpText">{c.body}</p></BookPage>);
    out.push(<BookPage key={`b${i}`} n={4 + i * 2} total={total} side="r"><div className={`bkpArt art${i}`} aria-hidden="true" /><p className="bkpCaption">Plate {i + 1}. {c.title}.</p></BookPage>);
  });
  return out;
}
