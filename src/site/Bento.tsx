// The home page: every effect as a live card in an Apple-style bento. Click a card and it
// grows into the detail sheet (one continuous shape); close it and it shrinks back.

import { memo, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { ThemeToggle } from "./VintageSwitch";
import { ILLS, illOf } from "../empty/ills";
import { LazyDot } from "../empty/DotArt";
import { ES_CATS, catOf } from "../empty/cats";

export type BentoLib = "ripple" | "confetti" | TypeEffectKey | TransitionKind | `cmp-${string}` | `es-${string}`;
type Group = "Libraries" | "Components" | "Type" | "Transitions" | "Empty states";
interface Tile { k: BentoLib; group: Group; c: number; r: number; tag?: string; /** only under its own filter, not in All */ deep?: boolean }

/** the tab a tile sits under inside its kind: an empty state's product category, a component's gesture */
const subOf = (t: Tile) => (t.group === "Empty states" ? catOf(t.k.slice(3)) : t.group === "Components" ? (compOf(t.k.slice(4))?.verb ?? "") : "");
const VERBS = ["Hover", "Press", "Drag", "Slide", "Swipe", "Type", "Select", "Scroll"];

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
  if (t.k.startsWith("cmp-")) { const C = NATIVE[t.k.slice(4)]; return C ? <Suspense fallback={null}><C size="card" /></Suspense> : null; }
  if (t.k.startsWith("es-")) return <div className="bnDots"><LazyDot k={t.k.slice(3)} fit={0.9} /></div>;
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

/* ─────────────────────────────────────────────────────────
 * THE DOCK (the filters, once the top row has scrolled away)
 *
 *   at rest   the kinds are in the top bar
 *   scroll    the top bar leaves the window
 *     0ms     the dock rises 12 px from the bottom edge, fades in, sharpens (240ms, ease out)
 *   choose    the raised thumb slides to the new kind (280ms); the list returns to its first row
 *   back up   the top bar is on screen again: the dock sinks and fades, quicker than it came (160ms)
 *
 * The timings live in index.css on .bnDock (--dock-in, --dock-out, --dock-slide).
 * ───────────────────────────────────────────────────────── */
export const KINDS = ["All", "Components", "Empty states", "Libraries", "Type", "Transitions"] as const;
export type Kind = (typeof KINDS)[number];
/** the kinds you can pick: everything mixed together is the home view, reached from the wordmark */
const FILTERS = KINDS.filter((k) => k !== "All");
type Filter = Kind;
/** how many empty states there are, for the top bar */
export const ES_COUNT = ILLS.length;
const FILTER_ICON: Record<Filter, ReactNode> = {
  All: <><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2" /><rect x="9" y="2.5" width="4.5" height="4.5" rx="1.2" /><rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2" /><rect x="9" y="9" width="4.5" height="4.5" rx="1.2" /></>,
  Components: <><path d="M8 1.8 13.5 5 8 8.2 2.5 5Z" /><path d="M2.5 8 8 11.2 13.5 8M2.5 11 8 14.2 13.5 11" /></>,
  "Empty states": <>{[3.5, 8, 12.5].flatMap((x) => [3.5, 8, 12.5].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r=".9" fill="currentColor" stroke="none" opacity={x + y > 20 ? 0.35 : 1} />))}</>,
  Libraries: <><circle cx="8" cy="8" r="1.6" /><circle cx="8" cy="8" r="4" opacity=".7" /><circle cx="8" cy="8" r="6.2" opacity=".4" /></>,
  Type: <path d="M3 4.5V3h10v1.5M8 3v10M6 13h4" />,
  Transitions: <><path d="M6 12.5H3.8A1.8 1.8 0 0 1 2 10.7V5.8A1.8 1.8 0 0 1 3.8 4H6" opacity=".5" /><rect x="6" y="3" width="8" height="8.5" rx="1.8" /></>,
};

/** the clear band kept at the top of the window while the cards scroll: they fade out under it */
const TOP_GAP = 72;

/** words the magic wand works on (wand.ts): each word is its own span, painting its slice of one
 * gradient that runs through the whole phrase */
function Magic({ children }: { children: string }) {
  return <span className="mw-words">{children.trim().split(/\s+/).map((w, i) => <span key={i}>{i > 0 && " "}<span className="mw-word">{w}</span></span>)}</span>;
}

function Dock({ show, filter, onPick }: { show: boolean; filter: Filter; onPick: (f: Filter) => void }) {
  const bar = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  // the raised thumb sits under the chosen kind; measured, so it follows any label width
  useLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;
    const place = () => { const b = el.querySelector<HTMLElement>('[aria-current="true"]'); if (b) setThumb({ x: b.offsetLeft, w: b.offsetWidth }); };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [filter]);
  return (
    <nav className="bnDock" data-show={show} inert={!show} aria-label="Filter the library">
      <div className="bnDockBar" ref={bar}>
        {thumb && <span className="bnDockThumb" aria-hidden="true" style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }} />}
        {FILTERS.map((f) => (
          <button key={f} type="button" className="bnDockBtn" aria-current={f === filter ? "true" : undefined} aria-label={f} title={f} onClick={() => onPick(f)}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{FILTER_ICON[f]}</svg>
            <span>{f}</span>
          </button>
        ))}
        <span className="bnDockRule" aria-hidden="true" />
        <span className="bnDockSound"><ThemeToggle /></span>
      </div>
    </nav>
  );
}

// Memoised: opening or closing a sheet re-renders only the one card it concerns. Without it all
// the cards (500 on the empty states list) re-rendered, and framer measured every one of them, in
// the very frame the sheet started to move.
const Card = memo(function Card({ t, open, onPick }: { t: Tile; open: boolean; onPick: (k: BentoLib) => void }) {
  const onOpen = () => onPick(t.k);
  const [ref, seen] = useInView<HTMLDivElement>();
  // Previews stay mounted while a sheet is open: tearing every canvas down as the sheet starts to
  // grow, and building them all again as it starts to shrink, was what made the motion hitch.
  // Only the card that was open comes back: its preview fades in as the card lands, so it is never
  // seen stretched by the shrinking sheet.
  const [back, setBack] = useState(false);
  const was = useRef(open);
  useLayoutEffect(() => {
    if (was.current && !open) setBack(true);
    was.current = open;
  }, [open]);
  return (
    <div ref={ref} className="bnSlot" style={{ gridColumn: `span ${t.c}`, gridRow: `span ${t.r}` }}>
      {!open && (
        <motion.div role="button" tabIndex={0} layoutId={`bn-${t.k}`} transition={SPRING} className="bnCard" style={{ borderRadius: 28 }}
          onClick={(e) => { if (!(e.target as HTMLElement).closest("[data-own-click]")) onOpen(); }}
          onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(); } }} aria-label={`${nameOf(t.k)}. Press Enter to open.`}>
          <div className={`bnPreview ${back ? "bnBack" : ""}`} onAnimationEnd={() => setBack(false)}>{seen ? <Preview t={t} /> : null}</div>
          <span className="bnTag">{t.tag ?? (t.group === "Type" ? "Type" : t.group === "Transitions" ? "Transition" : t.group === "Components" ? (compOf(t.k.slice(4))?.verb ?? "Component") : t.group === "Empty states" ? (illOf(t.k.slice(3))?.kind === "hover" ? "Hover" : "Loop") : "Library")}</span>
          <span className="bnName">{nameOf(t.k)}</span>
          <span className="bnGo" aria-hidden="true" onClick={(e) => { e.stopPropagation(); onOpen(); }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 11 11 5M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        </motion.div>
      )}
    </div>
  );
});

export function Home({ kind: filter, onKind: setFilter, open, onOpen, onClose, detail }: { kind: Kind; onKind: (k: Kind) => void; open: BentoLib | null; onOpen: (k: BentoLib) => void; onClose: () => void; detail: (k: BentoLib) => ReactNode }) {
  // inside a kind: its own tabs (product categories for empty states, gestures for components)
  const [sub, setSub] = useState("All");
  useEffect(() => setSub("All"), [filter]);
  const chips = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  // the dock takes over once the top row has left the window, and bows out again near the footer
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const g = grid.current?.getBoundingClientRect();
      if (g) setDocked(g.top < 80 && g.bottom > window.innerHeight * 0.6);
    };
    const on = () => { raf ||= requestAnimationFrame(check); };
    check();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [filter]);
  // chosen from the dock: the new list starts at its first row, with the top row still just out of sight
  const pickFromDock = (f: Filter) => {
    setFilter(f);
    requestAnimationFrame(() => toTop());
  };
  /** bring the list back to its first row, under the tabs if they are stuck to the top */
  const toTop = () => { const g = grid.current; if (g && g.getBoundingClientRect().top < 0) window.scrollTo({ top: window.scrollY + g.getBoundingClientRect().top - (stuckRow() ? (chips.current?.offsetHeight ?? 0) + 16 : TOP_GAP) }); };
  /** true when the tabs are a row stuck to the top of the window (not the list down the side) */
  const stuckRow = () => !!chips.current && getComputedStyle(chips.current).flexDirection === "row";
  const pickSub = (s: string) => { setSub(s); requestAnimationFrame(() => toTop()); };
  // the detail page is heavy (canvases, playgrounds): mount it once the card has finished growing
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    if (!open) return;
    const id = setTimeout(() => setReady(true), 560);
    return () => clearTimeout(id);
  }, [open]);
  // one stable handler for every card, so the cards can be memoised
  const openRef = useRef(onOpen);
  openRef.current = onOpen;
  const pick = useCallback((k: BentoLib) => openRef.current(k), []);
  const inKind = useMemo(() => TILES.filter((t) => (filter === "All" ? !t.deep : t.group === filter)), [filter]);
  const subs = useMemo(() => (filter === "Empty states" ? [...ES_CATS] : filter === "Components" ? VERBS.filter((v) => inKind.some((t) => subOf(t) === v)) : []), [filter, inKind]);
  // every kind has the same list down its side. Kinds with tabs list them; the small kinds (libraries,
  // type, transitions) list their pieces, and choosing one opens it
  const side = filter !== "All";
  const pieces = side && !subs.length ? inKind : [];
  // the same tile objects from one render to the next, so memoised cards stay put
  const tiles = useMemo(() => pack(inKind.filter((t) => sub === "All" || !subs.length || subOf(t) === sub)), [inKind, subs, sub]);

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
        <h1 className="bnH"><Magic>A library you can copy</Magic></h1>
        <p className="bnSub">Components, illustrations, effects, type and transitions. Every one is a file and a prompt for <Magic>your own project</Magic>.</p>
      </section>
      {/* small windows have no room for the kinds in the top bar: they sit here instead */}
      <div className="bnChips bnKinds" role="radiogroup" aria-label="Kinds">
        {FILTERS.map((f) => (
          <button key={f} type="button" role="radio" aria-checked={f === filter} className={`bnChip ${f === filter ? "on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      {/* a kind's own tabs: a short set sits in a row above the cards, a long one (the empty state
          categories) runs down the side and stays beside the cards as they scroll */}
      <div className={side ? "bnShell" : undefined}>
        {side && (
          <div className="bnSide" ref={chips} role={subs.length ? "radiogroup" : "navigation"} aria-label={subs.length ? `Filter ${filter.toLowerCase()}` : filter}>
            <button type="button" {...(subs.length ? { role: "radio", "aria-checked": sub === "All" } : {})} className={`bnSideItem ${sub === "All" ? "on" : ""}`} onClick={() => pickSub("All")}>
              <span>All</span><span className="bnCount">{inKind.length}</span>
            </button>
            {subs.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={s === sub} className={`bnSideItem ${s === sub ? "on" : ""}`} onClick={() => pickSub(s)}>
                <span>{s}</span><span className="bnCount">{inKind.filter((t) => subOf(t) === s).length}</span>
              </button>
            ))}
            {pieces.map((t) => (
              <button key={t.k} type="button" className="bnSideItem" onClick={() => onOpen(t.k)}><span>{nameOf(t.k)}</span></button>
            ))}
          </div>
        )}
        <div className="bnGrid" ref={grid}>
          {tiles.map((t) => <Card key={t.k} t={t} open={open === t.k} onPick={pick} />)}
        </div>
      </div>
      {/* the top of the window stays clear: cards fade out before they reach its edge */}
      <div className="bnFade" aria-hidden="true" />
      <Dock show={docked && open === null} filter={filter} onPick={pickFromDock} />

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
