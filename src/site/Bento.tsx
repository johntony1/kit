// The home page: every effect as a live card in an Apple-style bento. Click a card and it
// grows into the detail sheet (one continuous shape); close it and it shrinks back.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { SuccessCard } from "../demos/ConfettiDemos";
import { TYPE_EFFECTS, type TypeEffectKey } from "../type/effects";
import { TypeCanvas } from "../type/TypeCanvas";
import { TRANS_META } from "./TransitionPage";
import { MiniSite } from "../demos/MiniSite";
import type { TransitionKind } from "../transitions/transitions";
import { COMPS, compOf } from "./components";
import { NATIVE } from "./native";
import { QrRipple } from "../demos/RippleDemos";
import type { RippleHandle } from "../ripple/RippleCanvas";
import { Book } from "../transitions/Book";
import { bookPages } from "../demos/BookPages";
import { SheetReady } from "./sheet";
import { play } from "../sound/sound";
import { ILLS, illOf } from "../empty/ills";
import { DotArt } from "../empty/DotArt";

export type BentoLib = "ripple" | "confetti" | TypeEffectKey | TransitionKind | `cmp-${string}` | `es-${string}`;
type Group = "Libraries" | "Components" | "Type" | "Transitions" | "Empty states";
interface Tile { k: BentoLib; group: Group; c: number; r: number; tag?: string; /** only under its own filter, not in All */ deep?: boolean }

// the arrangement: 6 columns. Big features, halves, thirds, and one full-width row to end
export const TILES: Tile[] = [
  { k: "ripple", group: "Libraries", c: 4, r: 3, tag: "Library" }, { k: "confetti", group: "Libraries", c: 2, r: 3, tag: "Library" },
  ...COMPS.slice(0, 12).map((c) => ({ k: `cmp-${c.k}` as BentoLib, group: "Components" as Group, c: c.c, r: c.r })),
  { k: "bubble", group: "Type", c: 3, r: 2 }, { k: "lens", group: "Type", c: 3, r: 2 },
  { k: "burn", group: "Transitions", c: 2, r: 2, tag: "New" }, { k: "paper", group: "Transitions", c: 2, r: 2, tag: "New" }, { k: "liquid", group: "Type", c: 2, r: 2 },
  { k: "rings", group: "Type", c: 2, r: 2 },
  { k: "slice", group: "Type", c: 2, r: 2 },
  ...ILLS.slice(0, 6).map((i, n) => ({ k: `es-${i.k}` as BentoLib, group: "Empty states" as Group, c: n < 4 && ILLS.length % 3 === 1 ? 3 : 2, r: 2 })),
  { k: "reveal", group: "Transitions", c: 3, r: 2 }, { k: "ink", group: "Transitions", c: 3, r: 2 },
  { k: "curtain", group: "Transitions", c: 2, r: 2 }, { k: "pixels", group: "Transitions", c: 2, r: 2 },
  ...COMPS.slice(12).map((c) => ({ k: `cmp-${c.k}` as BentoLib, group: "Components" as Group, c: c.c, r: c.r })),
  // All shows a dozen empty states; the Empty states filter shows every one
  ...ILLS.slice(6).map((i, n) => ({ k: `es-${i.k}` as BentoLib, group: "Empty states" as Group, c: 2, r: 2, deep: n >= 6 })),
];

/** lay tiles into full rows of 6 columns so the grid never has holes, whatever the filter:
 * tiles go into a row in order; when the next one would overflow, the row is closed and its
 * spare columns go to its narrowest tiles; every tile in a row takes the row's height */
function pack(list: Tile[]): Tile[] {
  const out: Tile[] = [];
  let row: Tile[] = [], used = 0;
  const close = () => {
    if (!row.length) return;
    const r = Math.max(...row.map((x) => x.r));
    const w = row.map((x) => Math.min(6, x.c));
    for (let spare = 6 - used; spare > 0; spare--) { const i = w.indexOf(Math.min(...w)); w[i]++; }
    row.forEach((x, i) => out.push({ ...x, c: w[i], r }));
    row = []; used = 0;
  };
  for (const x of list) {
    const c = Math.min(6, x.c);
    if (used + c > 6) close();
    row.push(x); used += c;
  }
  close();
  return out;
}

export function nameOf(k: BentoLib) {
  if (k.startsWith("cmp-")) return compOf(k.slice(4))?.name ?? k;
  if (k.startsWith("es-")) return illOf(k.slice(3))?.name ?? k;
  if (k === "ripple") return "Ripple";
  if (k === "confetti") return "Confetti pop";
  if (k in TYPE_EFFECTS) return TYPE_EFFECTS[k as TypeEffectKey].name;
  return TRANS_META[k as TransitionKind].name;
}

/** true while the element is on screen (with a little margin) */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

// what plays inside a card. Hover is always live; anything with its own clicks is marked
// data-own-click so those clicks stay with the component and don't open the card
function Preview({ t }: { t: Tile }) {
  const [replay, setReplay] = useState(0);
  if (t.k.startsWith("cmp-")) { const C = NATIVE[t.k.slice(4)]; return C ? <C size="card" /> : null; }
  if (t.k.startsWith("es-")) { const ill = illOf(t.k.slice(3)); return ill ? <div className="bnDots"><DotArt ill={ill} fit={0.9} /></div> : null; }
  if (t.k === "ripple") return <QrCard />;
  if (t.k === "paper") return (
    <div className="bnBook" data-own-click><Book pages={[<div key="e" className="bkp bkpEnd" />, ...bookPages()]} height={t.r * 150 + (t.r - 1) * 16 - 128} bend={0.5} strips={24} onStart={() => play("rustle")} /></div>
  );
  if (t.k === "confetti") return (
    <div className="bnConfetti">
      <div className="bnScale" data-own-click onClick={() => { setReplay((n) => n + 1); play("pop"); }}><SuccessCard trigger={replay} /></div>
    </div>
  );
  if (t.k in TYPE_EFFECTS) {
    const e = TYPE_EFFECTS[t.k as TypeEffectKey];
    return <div className="bnFill" style={{ background: e.look.bg }} onPointerDown={() => play("bloop", { pitch: 0.8, gap: 80 })}><TypeCanvas effect={e} fit={(e.look.fit ?? 0.78) * 0.78} /></div>;
  }
  return <MiniSite kind={t.k as TransitionKind} auto={3000 + (t.k.length % 4) * 350} />;
}

/** a card's live preview, for the top of its sheet */
export function CardPreview({ k }: { k: BentoLib }) {
  const t = TILES.find((x) => x.k === k);
  return t ? <Preview t={t} /> : null;
}

/** the QR code it all began with: it ripples by itself, and when you click it */
function QrCard() {
  const ref = useRef<RippleHandle>(null);
  useEffect(() => {
    const id = setInterval(() => ref.current?.fire(), 2800);
    return () => clearInterval(id);
  }, []);
  return <div className="bnQr"><div data-own-click><QrRipple rippleRef={ref} /></div></div>;
}

const SPRING = { type: "spring", duration: 0.46, bounce: 0.08 } as const;

function Card({ t, open, paused, onOpen }: { t: Tile; open: boolean; paused: boolean; onOpen: () => void }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  // after the sheet closes, the card flies home first and only then starts its live preview
  const [landed, setLanded] = useState(true);
  const was = useRef(open);
  useEffect(() => {
    if (was.current && !open) {
      setLanded(false);
      const id = setTimeout(() => setLanded(true), 650);
      was.current = open;
      return () => clearTimeout(id);
    }
    was.current = open;
  }, [open]);
  const live = seen && !paused && landed;
  return (
    <div ref={ref} className="bnSlot" style={{ gridColumn: `span ${t.c}`, gridRow: `span ${t.r}` }}>
      {!open && (
        <motion.div role="button" tabIndex={0} layoutId={`bn-${t.k}`} transition={SPRING} className="bnCard" style={{ borderRadius: 28 }}
          onLayoutAnimationComplete={() => setLanded(true)}
          onClick={(e) => { if (!(e.target as HTMLElement).closest("[data-own-click]")) onOpen(); }}
          onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(); } }} aria-label={`${nameOf(t.k)}. Press Enter to open.`}>
          <div className="bnPreview">{live ? <Preview t={t} /> : null}</div>
          <span className="bnTag">{t.tag ?? (t.group === "Type" ? "Type" : t.group === "Transitions" ? "Transition" : t.group === "Components" ? (compOf(t.k.slice(4))?.verb ?? "Component") : t.group === "Empty states" ? (illOf(t.k.slice(3))?.kind === "hover" ? "Hover" : "Loop") : "Library")}</span>
          <span className="bnName">{nameOf(t.k)}</span>
          <span className="bnGo" aria-hidden="true" onClick={(e) => { e.stopPropagation(); onOpen(); }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 11 11 5M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        </motion.div>
      )}
    </div>
  );
}

export function Home({ open, onOpen, onClose, detail }: { open: BentoLib | null; onOpen: (k: BentoLib) => void; onClose: () => void; detail: (k: BentoLib) => ReactNode }) {
  const [filter, setFilter] = useState<"All" | Group>("All");
  // the detail page is heavy (canvases, playgrounds): mount it once the card has finished growing
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    if (!open) return;
    const id = setTimeout(() => setReady(true), 560);
    return () => clearTimeout(id);
  }, [open]);
  const tiles = pack(TILES.filter((t) => (filter === "All" ? !t.deep : t.group === filter)));

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    addEventListener("keydown", esc);
    const sb = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${sb}px`;
    return () => { removeEventListener("keydown", esc); document.body.style.overflow = ""; document.body.style.paddingRight = ""; };
  }, [open, onClose]);

  return (
    <MotionConfig reducedMotion="user">
      <section className="bnHero">
        <span className="bnPill">Free and open source</span>
        <h1 className="bnH">Effects you can copy</h1>
        <p className="bnSub">Ripples, confetti, type that bends and pages that turn. Every one is a file and a prompt for <span>your own project</span>.</p>
      </section>
      <div className="bnChips" role="radiogroup" aria-label="Filter effects">
        {(["All", "Components", "Empty states", "Libraries", "Type", "Transitions"] as const).map((f) => (
          <button key={f} type="button" role="radio" aria-checked={f === filter} className={`bnChip ${f === filter ? "on" : ""}`} onClick={() => setFilter(f)}>{f}{f === "Empty states" && <span className="bnCount">{ILLS.length}</span>}</button>
        ))}
      </div>
      <div className="bnGrid">
        {tiles.map((t) => <Card key={t.k} t={t} open={open === t.k} paused={open !== null} onOpen={() => onOpen(t.k)} />)}
      </div>

      <AnimatePresence>
        {open && (
          <div className="bnLayer" key="layer">
            <motion.div className="bnScrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} />
            <motion.div layoutId={`bn-${open}`} transition={SPRING} className="bnSheet" style={{ borderRadius: 28 }} role="dialog" aria-modal="true" aria-label={nameOf(open)}
              onLayoutAnimationComplete={() => setReady(true)}>
              {/* the page itself grows in (title, buttons and the card's own preview at the top);
                  layout keeps it at full size while the sheet scales, the panels below wait */}
              <motion.div layout className="bnSheetInner" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.14 } }} exit={{ opacity: 0, transition: { duration: 0.08 } }}>
                <SheetReady.Provider value={ready}>{detail(open)}</SheetReady.Provider>
              </motion.div>
              <button type="button" className="bnClose" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" /></svg>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
