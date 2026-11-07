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
