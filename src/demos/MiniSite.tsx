// A wireframe site for the transition cards: three skeleton pages in greys, turned by the
// transition every few seconds or when you click one of its links.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PageSwap } from "../transitions/PageSwap";
import type { TransitionKind } from "../transitions/transitions";
import { play, type Cue } from "../sound/sound";

/** the sound each page transition makes */
export const TRANS_CUE: Record<TransitionKind, Cue> = { burn: "crackle", paper: "rustle", reveal: "whoosh", ink: "whoosh", curtain: "whoosh", pixels: "whoosh", zoom: "whoosh", tilt: "slide" };

const W = 320, H = 210;
/* three wireframe pages: skeleton bars in greys, like a sketch of a site. Each page has its
 * own layout and its own shade, so every transition between them reads clearly */
const Bar = ({ w, h = 6, o = 1 }: { w: number | string; h?: number; o?: number }) => <span className="wfBar" style={{ width: w, height: h, opacity: o }} />;

function MiniPage({ n }: { n: number }) {
  return (
    <div className={`mini wf wf${n}`}>
      <div className="wfNav">
        <span className="wfLogo" />
        <span className="wfLinks">{[0, 1, 2].map((k) => <span key={k} data-go={k} className={k === n ? "on" : ""}><Bar w={k === 1 ? 26 : 20} h={4} /></span>)}</span>
      </div>
      {n === 0 && (
        <div className="wfBody">
          <Bar w="62%" h={12} /><Bar w="44%" h={12} />
          <div className="wfGap" /><Bar w="70%" o={0.6} /><Bar w="52%" o={0.6} />
          <span className="wfBtn" data-go={1} />
        </div>
      )}
      {n === 1 && (
        <div className="wfBody">
          <Bar w="34%" h={10} />
          <div className="wfTiles">{[0, 1, 2].map((k) => <span key={k} className="wfTile" data-go={2}><Bar w="60%" h={4} o={0.7} /><Bar w="40%" h={4} o={0.5} /></span>)}</div>
        </div>
      )}
      {n === 2 && (
        <div className="wfBody wfRow">
          <span className="wfAvatar" />
          <div className="wfCol"><Bar w="80%" h={10} /><Bar w="94%" o={0.6} /><Bar w="88%" o={0.6} /><Bar w="60%" o={0.6} /></div>
        </div>
      )}
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
    play(TRANS_CUE[kind]);
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
