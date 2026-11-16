/* Quick add: a tab bar with a plus button beside it. Press plus and the bar folds into a grid of
 * things to make; press the cross and the grid folds back into the bar. The selected tab slides
 * between tabs as a bead of glass and turns solid when it lands.
 *
 *  BAR             348 × 64, four 84px tabs, 6px inset; thumb 84 × 52
 *  GRID            348 × 196, 3 × 2 tiles, 8px inset, 4px gaps; grows up from the bar
 *  PLUS            64 round, 12px right of the bar
 *
 * Every move is a spring, so nothing starts or stops on a hard edge and any press mid flight
 * carries on from where things are, at the speed they are going.
 *
 *  OPEN      0ms   plus swells and settles (spring, kicked outward); + turns into × (spring .55s)
 *            0ms   tabs blur out (140ms)
 *            0ms   the surface pulls in at the sides as it rises, then springs out to the grid:
 *                  one spring (.5s, bounce .2) drives it; the sides pinch in 120px at the middle
 *           60ms   the grid comes out of a blur (400ms); tiles rise 6px, scale .92 → 1, 30ms apart
 *  CLOSE     0ms   tiles blur out (120ms)
 *            0ms   one spring (.42s, bounce .12) folds it down; the sides pinch in 80px at the middle
 *           80ms   tabs blur in (ease out, 320ms); × turns back into + (spring .35s)
 *  TAB       0ms   thumb lifts into glass: clear, a bright rim, a touch taller
 *            0ms   its leading edge springs to the new tab (.24s), the trailing edge follows (.4s),
 *                  both without bounce: it stretches like a drop and lands centred on the icon
 *          land    turns solid again (240ms ease out)
 *
 * Escape closes the grid. Picking a tile closes it too. */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig, animate, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { play } from "../sound/sound";

/* ── sizes ─────────────────────────────────────────────── */
const BAR = { w: 348, h: 64, pad: 6 };
const TAB = (BAR.w - BAR.pad * 2) / 4;
const GRID = { w: 348, h: 196, pad: 8, gap: 4 };
const PLUS = 64, GAP = 12;
const W = BAR.w + GAP + PLUS;

/* ── motion ────────────────────────────────────────────── */
const UNFOLD = { type: "spring", visualDuration: 0.5, bounce: 0.2 } as const;
const FOLD = { type: "spring", visualDuration: 0.42, bounce: 0.12 } as const;
const PINCH_OPEN = 120, PINCH_CLOSE = 80;   // px the sides pull in at the middle of a fold
const LEAD = { type: "spring", visualDuration: 0.24, bounce: 0 } as const;   // the thumb edge moving toward the tab
const TRAIL = { type: "spring", visualDuration: 0.4, bounce: 0 } as const;   // the edge that follows
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const OUT = { duration: 0.14, ease: [0.4, 0, 1, 1] } as const;
const STAGGER = 0.03;

/* ── this piece's colours: dark, then light ─────────────── */
const CSS = `
.qadd { --qa-shell: var(--k-surface); --qa-shadow: var(--k-lift), 0 18px 40px -18px rgba(0,0,0,.7);
  --qa-thumb: var(--k-raised); --qa-thumb-shadow: var(--k-lift);
  --qa-glass: rgba(255,255,255,.05); --qa-glass-rim: inset 0 0 0 1px rgba(255,255,255,.14), inset 0 1px 0 rgba(255,255,255,.2), 0 6px 16px -6px rgba(0,0,0,.5);
  --qa-tile-hover: rgba(255,255,255,.05); --qa-ico: var(--k-muted); --qa-ico-on: var(--k-text); --qa-label: var(--k-text2); }
:root[data-theme="light"] .qadd { --qa-shell: oklch(1 0 0); --qa-shadow: var(--k-lift), 0 18px 40px -20px oklch(0.22 0.008 264 / .2);
  --qa-thumb: oklch(0.955 0.003 264); --qa-thumb-shadow: inset 0 0 0 1px oklch(0.22 0.008 264 / .04);
  --qa-glass: oklch(1 0 0 / .4); --qa-glass-rim: inset 0 0 0 1px oklch(1 0 0 / .95), inset 0 0 0 1.5px oklch(0.22 0.008 264 / .06), 0 6px 16px -6px oklch(0.22 0.008 264 / .18);
  --qa-tile-hover: oklch(0.965 0.003 264); --qa-ico: var(--k-muted); --qa-ico-on: var(--k-text); --qa-label: var(--k-text2); }
.qadd button { appearance: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; background: none; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.qadd button:focus-visible { outline: 2px solid #3fc06c; outline-offset: 2px; }
.qa-tab { position: relative; z-index: 1; width: ${TAB}px; height: ${BAR.h - BAR.pad * 2}px; display: grid; place-items: center; color: var(--qa-ico); transition: color 200ms ease; border-radius: 26px; }
.qa-tab[aria-selected="true"] { color: var(--qa-ico-on); }
@media (hover: hover) { .qa-tab:hover { color: var(--qa-ico-on); } }
.qa-thumb { position: absolute; left: ${BAR.pad}px; top: ${BAR.pad}px; width: ${TAB}px; height: ${BAR.h - BAR.pad * 2}px; border-radius: 26px;
  background: var(--qa-thumb); box-shadow: var(--qa-thumb-shadow);
  transition: background-color 240ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 240ms cubic-bezier(0.16, 1, 0.3, 1), scale 300ms cubic-bezier(0.16, 1, 0.3, 1); }
.qa-thumb[data-moving="true"] { background: var(--qa-glass); box-shadow: var(--qa-glass-rim); scale: 1 1.06; }
.qa-tile { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-radius: 16px; color: var(--qa-ico);
  transition: background-color 150ms ease, color 150ms ease, scale 150ms cubic-bezier(0.2, 0, 0, 1); }
@media (hover: hover) { .qa-tile:hover { background: var(--qa-tile-hover); color: var(--qa-ico-on); } }
.qa-tile:active { scale: 0.96; }
.qa-tile span { font-size: 12.5px; font-weight: 500; letter-spacing: -0.005em; color: var(--qa-label); }
.qa-plus { position: absolute; right: 0; bottom: 0; width: ${PLUS}px; height: ${PLUS}px; border-radius: 50%; display: grid; place-items: center;
  background: var(--qa-shell); box-shadow: var(--qa-shadow); color: var(--qa-ico-on); }
`;

/* ── icons: Kit's line style, 20px, 1.5 stroke ─────────── */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const TABS: { k: string; label: string; icon: ReactNode }[] = [
  { k: "calendar", label: "Calendar", icon: <><rect x="3" y="4.5" width="14" height="12.5" rx="3" {...S} /><path d="M3 8.5h14M7 3v3M13 3v3" {...S} /></> },
  { k: "notes", label: "Notes", icon: <><rect x="4.5" y="3" width="11" height="14" rx="2.5" {...S} /><path d="M7.5 7h5M7.5 10h5M7.5 13h3" {...S} /></> },
  { k: "people", label: "People", icon: <><circle cx="8" cy="7.5" r="2.75" {...S} /><path d="M3.5 16.5a4.5 4.5 0 0 1 9 0" {...S} /><path d="M13 5.2a2.4 2.4 0 1 1 0 4.6M14.5 12.4a4 4 0 0 1 2.5 3.6" {...S} /></> },
  { k: "files", label: "Files", icon: <path d="M3 6.5a2 2 0 0 1 2-2h3l1.8 2H15a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" {...S} /> },
];
const ITEMS: { k: string; label: string; icon: ReactNode }[] = [
  { k: "note", label: "Note", icon: <><path d="M10 3.5H6a2.5 2.5 0 0 0-2.5 2.5v8A2.5 2.5 0 0 0 6 16.5h8a2.5 2.5 0 0 0 2.5-2.5v-4" {...S} /><path d="m8 12 .5-2.5 6-6a1.4 1.4 0 0 1 2 2l-6 6Z" {...S} /></> },
  { k: "checklist", label: "Checklist", icon: <path d="m3.5 6 1.5 1.5L8 4.5M10.5 6h6M3.5 13.5l1.5 1.5L8 12M10.5 13.5h6" {...S} /> },
  { k: "photo", label: "Photo", icon: <><path d="M3 7.5a2 2 0 0 1 2-2h1.5l1.2-1.5h4.6l1.2 1.5H15a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" {...S} /><circle cx="10" cy="10.5" r="2.75" {...S} /></> },
  { k: "scan", label: "Scan", icon: <path d="M3.5 7V5.5a2 2 0 0 1 2-2H7M13 3.5h1.5a2 2 0 0 1 2 2V7M16.5 13v1.5a2 2 0 0 1-2 2H13M7 16.5H5.5a2 2 0 0 1-2-2V13M6.5 10h7" {...S} /> },
  { k: "voice", label: "Voice", icon: <><rect x="7.5" y="3" width="5" height="9" rx="2.5" {...S} /><path d="M5 9.5a5 5 0 0 0 10 0M10 14.5V17" {...S} /></> },
  { k: "sketch", label: "Sketch", icon: <path d="M3.5 13.5c1.8-4.6 3.4-6.6 4.4-5.4s.4 4.9 2 4.9 2.6-4 3.6-5.4 1.8 1 3 3" {...S} /> },
];
const Ico = ({ children }: { children: ReactNode }) => <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">{children}</svg>;

/* ── fit: scale into the tile ── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => {
      const w = root.clientWidth, h = root.clientHeight;
      if (!w || !h) return;
      const big = size === "big";
      setScale(Math.min(big ? 1.5 : 1.1, (w - 32) / W, (h - (big ? 120 : 92)) / GRID.h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, scale };
}

/* ── component ──────────────────────────────────────────── */
export default function QuickAdd({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, scale } = useFit(size);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [moving, setMoving] = useState(false);

  // one surface that is the bar, then the grid, driven by one spring from 0 (where it was) to 1
  // (where it is going). Width and height follow it, and the sides pinch in on the way by a
  // sine of the progress, so the fold is one unbroken movement that can be turned back at any time.
  const BAR_S = { w: BAR.w, h: BAR.h, r: BAR.h / 2 }, GRID_S = { w: GRID.w, h: GRID.h, r: 26 };
  const from = useRef(BAR_S), to = useRef(BAR_S), pinch = useRef(0);
  const p = useMotionValue(1);
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  const w = useTransform(p, (t) => mix(from.current.w, to.current.w, t) - pinch.current * Math.sin(Math.PI * Math.min(1, Math.max(0, t))));
  const h = useTransform(p, (t) => mix(from.current.h, to.current.h, t));
  const r = useTransform(p, (t) => Math.max(18, mix(from.current.r, to.current.r, t)));
  const left = useTransform(w, (v) => (BAR.w - v) / 2);
  const runs = useRef<AnimationPlaybackControls[]>([]);
  const pop = useMotionValue(1);

  const toggle = (next = !open) => {
    if (next === open) return;
    setOpen(next);
    play(next ? "pop" : "tap", { vol: 0.5 });
    runs.current.forEach((a) => a.stop());
    // start from exactly where the surface is now, so a turn back mid fold never jumps
    from.current = { w: w.get(), h: h.get(), r: r.get() };
    to.current = next ? GRID_S : BAR_S;
    pinch.current = reduced ? 0 : next ? PINCH_OPEN : PINCH_CLOSE;
    p.jump(0);
    if (reduced) { p.jump(1); return; }
    runs.current = [
      animate(p, 1, next ? UNFOLD : FOLD),
      animate(pop, 1, { type: "spring", visualDuration: 0.4, bounce: 0.45, velocity: 2.4 }),
    ];
  };

  // the thumb: its two edges are separate springs. The edge it moves toward is quick and reaches
  // the new tab almost at once; the other follows, so the thumb stretches like a drop and settles
  // centred on the icon. No bounce, so it never runs past. Glass while it travels, solid when it lands.
  const lx = useMotionValue(0), rx = useMotionValue(TAB);
  const tw = useTransform(() => rx.get() - lx.get());
  const slide = useRef<AnimationPlaybackControls[]>([]);
  const pick = (i: number) => {
    if (i === tab) return;
    const right = i > tab;
    setTab(i);
    play("tick", { vol: 0.5 });
    slide.current.forEach((a) => a.stop());
    if (reduced) { lx.jump(i * TAB); rx.jump(i * TAB + TAB); return; }
    setMoving(true);
    const lead = LEAD, trail = TRAIL;
    const a = animate(lx, i * TAB, right ? trail : lead), b = animate(rx, i * TAB + TAB, right ? lead : trail);
    slide.current = [a, b];
    Promise.all([a, b]).then(() => { if (slide.current[0] === a) setMoving(false); });
  };

  useEffect(() => {
    if (!open) return;
    // caught first and stopped, so Escape closes only this and not the sheet around it
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); toggle(false); } };
    addEventListener("keydown", esc, true);
    return () => removeEventListener("keydown", esc, true);
  });
  useEffect(() => () => { runs.current.forEach((a) => a.stop()); slide.current.forEach((a) => a.stop()); }, []);

  const blurIn = (delay: number) => ({ opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 0.36, ease: EASE_OUT, delay } });
  return (
    <MotionConfig reducedMotion="user">
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div data-own-click className="qadd" style={{ pointerEvents: "auto", position: "absolute", left: "50%", top: "50%", width: W, height: GRID.h,
          transform: `translate(-50%, -50%) scale(${scale})` }}>
          {/* the one surface: bar, then grid */}
          <motion.div style={{ position: "absolute", bottom: 0, left, width: w, height: h, borderRadius: r, overflow: "hidden", background: "var(--qa-shell)", boxShadow: "var(--qa-shadow)" }}>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div key="grid" role="group" aria-label="Create"
                  initial={{ filter: "blur(8px)" }} animate={{ filter: "blur(0px)", transition: { duration: 0.4, ease: EASE_OUT, delay: 0.06 } }}
                  exit={{ opacity: 0, filter: "blur(6px)", scale: 0.97, transition: OUT }}
                  style={{ position: "absolute", left: "50%", bottom: 0, marginLeft: -GRID.w / 2, width: GRID.w, height: GRID.h, padding: GRID.pad,
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)", gap: GRID.gap, transformOrigin: "50% 100%" }}>
                  {ITEMS.map((it, i) => (
                    <motion.button key={it.k} type="button" className="qa-tile"
                      initial={{ opacity: 0, scale: 0.92, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.36, ease: EASE_OUT, delay: 0.08 + i * STAGGER } }}
                      onClick={() => { play("tap", { vol: 0.6 }); setTimeout(() => toggle(false), 110); }}>
                      <Ico>{it.icon}</Ico><span>{it.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="bar" role="tablist" aria-label="Sections"
                  initial={{ opacity: 0, filter: "blur(6px)", scale: 0.97 }} animate={blurIn(0.08)} exit={{ opacity: 0, filter: "blur(6px)", transition: OUT }}
                  style={{ position: "absolute", left: "50%", bottom: 0, marginLeft: -BAR.w / 2, width: BAR.w, height: BAR.h, padding: BAR.pad, display: "flex" }}>
                  <motion.div className="qa-thumb" data-moving={moving} style={{ x: lx, width: tw }} aria-hidden="true" />
                  {TABS.map((t, i) => (
                    <button key={t.k} type="button" role="tab" className="qa-tab" aria-selected={tab === i} aria-label={t.label} onClick={() => pick(i)}>
                      <Ico>{t.icon}</Ico>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* plus, which turns into a cross */}
          <motion.button type="button" className="qa-plus" aria-label={open ? "Close" : "Create"} aria-expanded={open} style={{ scale: pop }} onClick={() => toggle()}>
            <motion.svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" initial={false} animate={{ rotate: open ? 45 : 0 }}
              transition={open ? { type: "spring", visualDuration: 0.55, bounce: 0.3 } : { type: "spring", visualDuration: 0.35, bounce: 0 }}>
              <path d="M10 3.5v13M3.5 10h13" {...S} strokeWidth={1.8} />
            </motion.svg>
          </motion.button>
        </div>
      </div>
    </MotionConfig>
  );
}
