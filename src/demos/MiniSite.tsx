// A small dark site for the transition cards: three short pages in dark tones, turned by
// the transition every few seconds or when you click one of its links.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PageSwap } from "../transitions/PageSwap";
import type { TransitionKind } from "../transitions/transitions";

const W = 320, H = 210;
const NAMES = ["Home", "Library", "About"];

function MiniPage({ n }: { n: number }) {
  return (
    <div className={`mini mini${n}`}>
      <div className="miniNav">
        <span className="miniLogo">Effects<span>.free</span></span>
        <span className="miniLinks">{NAMES.map((x, k) => <span key={x} data-go={k} className={k === n ? "on" : ""}>{x}</span>)}</span>
      </div>
      {n === 0 && <div className="miniBody"><b>Motion for the moments that matter.</b><i>Copy the code or the prompt.</i><span className="miniCta" data-go={1}>See the library</span></div>}
      {n === 1 && <div className="miniBody"><b>Library</b><div className="miniTiles">{["a0", "a1", "a3"].map((a) => <span key={a} className={`miniTile ${a}`} data-go={2} />)}</div></div>}
      {n === 2 && <div className="miniBody"><b>Made for my own work, free for yours.</b><i>18 effects, one file each.</i></div>}
    </div>
  );
}

export function MiniSite({ kind, auto = 3200 }: { kind: TransitionKind; auto?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [page, setPage] = useState(0);
  const [origin, setOrigin] = useState({ x: 0.5, y: 0.5 });
  const [busy, setBusy] = useState(false);

  // fit the window between the card's top and bottom pills
  useLayoutEffect(() => {
    const el = box.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1.6, (el.clientWidth - 40) / W, (el.clientHeight - 128) / H)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || busy) return;
    const id = setTimeout(() => { setOrigin({ x: 0.3 + Math.random() * 0.4, y: 0.4 + Math.random() * 0.3 }); setBusy(true); setPage((p) => (p + 1) % 3); }, auto);
    return () => clearTimeout(id);
  }, [auto, busy, page]);

  const go = (target: number, x: number, y: number) => {
    if (busy || target === page) return;
    setOrigin({ x, y });
    setBusy(true);
    setPage(target);
  };

  return (
    <div ref={box} className="miniRoot">
      <div className="miniWin" data-own-click style={{ width: W, height: H, transform: `scale(${scale})` }}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const g = (e.target as HTMLElement).closest("[data-go]")?.getAttribute("data-go");
          go(g != null ? Number(g) : (page + 1) % 3, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        }}>
        <PageSwap kind={kind} page={page} origin={origin} onDone={() => setBusy(false)} render={(p) => <MiniPage n={p} />} style={{ position: "absolute", inset: 0, borderRadius: 16 }} />
      </div>
    </div>
  );
}
