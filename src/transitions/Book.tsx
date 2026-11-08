// Book.tsx
// A book you can flip like a real one. The turning page is cut into thin vertical strips
// chained in 3D, so it bends: the free edge leads, the spine side lags, each strip is lit by
// its angle, and the page throws shadows on the pages around it. Click a page to turn it, or
// drag its edge and it follows your hand. Live content, no screenshots, no dependencies.
//
//   <Book pages={[<Cover />, <PageOne />, <PageTwo />, ...]} height={420} />
//
// Free to use in anything.

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

export interface BookProps {
  pages: ReactNode[];
  /** page height in px; the width follows the ratio. 420 */
  height?: number;
  /** page width / height. 0.72 */
  ratio?: number;
  /** seconds for a full turn. 0.9 */
  duration?: number;
  /** how much the free edge leads, 0..1.5. 0.9 */
  bend?: number;
  /** strips per page: more is smoother. 28 */
  strips?: number;
  /** paper colour for the back of the page edges */
  paper?: string;
  onTurn?: (spread: number) => void;
  /** a turn starts (a click, a drag or an arrow key): a good moment for a page sound */
  onStart?: (dir: 1 | -1) => void;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function Book({ pages, height = 420, ratio = 0.72, duration = 0.9, bend = 0.9, strips = 28, paper = "#f4f1e8", onTurn, onStart }: BookProps) {
  const box = useRef<HTMLDivElement>(null);
  const [H, setH] = useState(height);
  const W = Math.round(H * ratio);
  const spreads = Math.ceil(pages.length / 2);
  const [k, setK] = useState(0);                       // spread: pages[2k] left, pages[2k+1] right
  const [turn, setTurn] = useState<null | 1 | -1>(null); // turning forward or back
  const strip = useRef<(HTMLDivElement | null)[]>([]);
  const shadeF = useRef<(HTMLDivElement | null)[]>([]);
  const shadeB = useRef<(HTMLDivElement | null)[]>([]);
  const castR = useRef<HTMLDivElement>(null);
  const castL = useRef<HTMLDivElement>(null);
  const prog = useRef(0);
  const anim = useRef(0);
  const drag = useRef<{ x: number; t: number; v: number; moved: boolean } | null>(null);

  // fit the spread to the space it has
  useEffect(() => {
    const el = box.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const fitW = (el.clientWidth - 48) / (2 * ratio);
      setH(Math.max(160, Math.min(height, fitW, el.clientHeight - 48)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [height, ratio]);

  /** lay the strips out for progress p (0 = flat on the right, 1 = flat on the left) */
  const apply = (p: number) => {
    prog.current = p;
    const N = strips;
    const lead = bend * Math.sin(Math.PI * p);
    let prev = 0;
    for (let i = 0; i < N; i++) {
      const s = (i + 0.5) / N;
      // the absolute angle of this strip: the whole page turns with p, the free edge leads
      const A = Math.min(Math.PI, Math.max(0, Math.PI * easeInOut(p) + lead * (Math.pow(s, 1.6) - 0.3) * Math.PI * 0.5));
      const rel = A - prev;
      prev = A;
      const el = strip.current[i];
      if (el) el.style.transform = `rotateY(${(-rel * 180) / Math.PI}deg)`;
      // light: flat is bright, edge-on is dark, and a sheen where the paper bends hardest
      const side = Math.pow(Math.sin(A), 1.25);
      const curl = Math.min(1, Math.abs(rel) * N * 0.06);
      if (shadeF.current[i]) shadeF.current[i]!.style.background = `rgba(0,0,0,${(0.42 * side).toFixed(3)})`;
      if (shadeB.current[i]) shadeB.current[i]!.style.background = `linear-gradient(90deg, rgba(255,255,255,${(0.14 * curl).toFixed(3)}), rgba(0,0,0,${(0.46 * side).toFixed(3)}))`;
    }
    // shadows the turning page throws on the page it uncovers and the page it lands on
    const k2 = Math.sin(Math.PI * p);
    if (castR.current) castR.current.style.background = `linear-gradient(90deg, rgba(0,0,0,${(0.38 * k2).toFixed(3)}), rgba(0,0,0,0) ${Math.max(4, (1 - p) * 100).toFixed(1)}%)`;
    if (castL.current) castL.current.style.background = `linear-gradient(270deg, rgba(0,0,0,${(0.32 * k2).toFixed(3)}), rgba(0,0,0,0) ${Math.max(4, p * 100).toFixed(1)}%)`;
  };

  // when a turn starts, put the leaf where it begins
  useLayoutEffect(() => { if (turn) apply(turn === 1 ? 0.0001 : 0.9999); }, [turn]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = (to: 0 | 1, dir: 1 | -1) => {
    cancelAnimationFrame(anim.current);
    const from = prog.current;
    const ms = Math.max(180, duration * 1000 * Math.abs(to - from));
    const t0 = performance.now();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (now: number) => {
      const t = still ? 1 : Math.min(1, (now - t0) / ms);
      // already moving under the hand: ease out from where it is
      const e = drag.current ? t : 1 - Math.pow(1 - t, 2.2);
      apply(from + (to - from) * e);
      if (t < 1) { anim.current = requestAnimationFrame(tick); return; }
      const landed = (dir === 1 && to === 1) || (dir === -1 && to === 0);
      if (landed) { const nk = k + dir; setK(nk); onTurn?.(nk); }
      if (castR.current) castR.current.style.background = "none";
      if (castL.current) castL.current.style.background = "none";
      setTurn(null);
      drag.current = null;
    };
    anim.current = requestAnimationFrame(tick);
  };

  const start = (dir: 1 | -1) => {
    if (turn) return false;
    if (dir === 1 && k >= spreads - 1) return false;
    if (dir === -1 && k <= 0) return false;
    setTurn(dir);
    onStart?.(dir);
    return true;
  };

  // click: turn; drag: the page follows the pointer
  const down = (e: React.PointerEvent, dir: 1 | -1) => {
    if (!start(dir)) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, t: performance.now(), v: 0, moved: false };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !turn) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    if (!d.moved) return;
    const now = performance.now();
    d.v = (-dx / (2 * W)) / Math.max(1, now - d.t) * 1000;
    const p = turn === 1 ? Math.min(1, Math.max(0, -dx / (2 * W))) : Math.min(1, Math.max(0, 1 - dx / (2 * W)));
    apply(p);
  };
  const up = () => {
    const d = drag.current;
    if (!d || !turn) return;
    if (!d.moved) { drag.current = null; finish(turn === 1 ? 1 : 0, turn); return; }
    const p = prog.current;
    const fling = turn === 1 ? d.v > 0.8 : d.v < -0.8;
    const go = turn === 1 ? p > 0.45 || fling : p < 0.55 || fling;
    finish(go ? (turn === 1 ? 1 : 0) : turn === 1 ? 0 : 1, turn);
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!box.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowRight" && start(1)) requestAnimationFrame(() => finish(1, 1));
      if (e.key === "ArrowLeft" && start(-1)) requestAnimationFrame(() => finish(0, -1));
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });

  const page = (i: number) => (i >= 0 && i < pages.length ? pages[i] : null);
  // what lies flat underneath while a page turns
  const leftUnder = turn === -1 ? page(2 * k - 2) : page(2 * k);
  const rightUnder = turn === 1 ? page(2 * k + 3) : page(2 * k + 1);
  // the leaf: its front faces right, its back faces left
  const front = turn === 1 ? page(2 * k + 1) : page(2 * k - 1);
  const back = turn === 1 ? page(2 * k + 2) : page(2 * k);
  const w = W / strips;

  const leaf = (i: number): ReactNode => (
    <div key={i} ref={(el) => { strip.current[i] = el; }} className="bkStrip" style={{ width: w + 1.5, left: i === 0 ? 0 : w, height: H }}>
      <div className="bkFace">
        <div className="bkSlice" style={{ width: W, height: H, left: -i * w }}>{front}</div>
        <div className="bkShade" ref={(el) => { shadeF.current[i] = el; }} />
      </div>
      <div className="bkFace bkBack">
        <div className="bkSlice" style={{ width: W, height: H, left: -(strips - 1 - i) * w }}>{back}</div>
        <div className="bkShade" ref={(el) => { shadeB.current[i] = el; }} />
      </div>
      {i < strips - 1 && leaf(i + 1)}
    </div>
  );

  return (
    <div ref={box} className="book" tabIndex={0} aria-label={`Book, pages ${2 * k + 1} and ${2 * k + 2} of ${pages.length}. Click or drag a page edge to turn; arrow keys work too.`}
      style={{ width: W * 2, height: H, ["--paper" as string]: paper }} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className="bkPage bkLeft" style={{ width: W, height: H, background: paper }} onPointerDown={(e) => down(e, -1)}>
        {leftUnder}
        <div className="bkGutterL" />
        <div ref={castL} className="bkCast" />
      </div>
      <div className="bkPage bkRight" style={{ width: W, height: H, background: paper }} onPointerDown={(e) => down(e, 1)}>
        {rightUnder}
        <div className="bkGutterR" />
        <div ref={castR} className="bkCast" />
      </div>
      {turn && front !== null && <div className="bkLeaf" style={{ left: W, width: W, height: H }}>{leaf(0)}</div>}
    </div>
  );
}
