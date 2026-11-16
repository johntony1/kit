/* Letters: postcards sent to a site, stacked and leaning back in perspective. Point at a card
 * and its words come up. Click one and it stands up straight, hinged on its bottom edge, in front
 * of the others: nothing else moves, the standing card simply covers them. Click it again and it
 * lies back down in its place. Write a letter stands a blank card up: type, Send, and it lies down
 * at the front of the stack.
 *
 *  CARD            420 × 250, radius 18; a centre fold line, the message top left, a perforated
 *                  stamp top right, a hand drawn doodle low on the right
 *  STACK           every card hinged on one bottom line, leaning back 52°, perspective 900px;
 *                  each card behind sits 30px higher and 4.5% smaller. The stack's lower part fades
 *                  out (a mask, so it works on any ground)
 *
 *  HOVER     0ms   the card under the pointer: its words come up (200ms). Nothing moves
 *  OPEN      0ms   the card stands up on its hinge: 52° → 0°, onto the front line, scale 1
 *                  (spring .28s, no bounce); it is raised above the others for the whole move
 *            0ms   the fade lifts off the stack (150ms) so the standing card is whole
 *           60ms   the doodle fades in (120ms) and draws itself (300ms)
 *  CLOSE     0ms   like a book: the right half swings over onto the left on the centre fold
 *                  (180°, spring .42s, no bounce), showing a green Kit cover and the page edges
 *         then     the shut card lies back down into its place (spring .28s) and opens flat again
 *                  as it goes (.36s); it stays raised until it lands
 *  DRAG      side  on an open card: take the cover and fold it over; the point you hold stays under
 *                  the pointer. Let go past halfway, or flick, and it shuts and goes back; else it
 *                  springs open again at the speed it was let go
 *            up    tips the whole card on its hinge (52° over 150px); past a third, or a flick, lays
 *                  it down; push a stacked card's top up to stand it
 *  SEND      0ms   the written card lies down at the front; the others step back one place
 *
 * Escape, or a click beside the open card, lays it back down. Each card is a button. */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, MotionConfig, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { KitMark } from "../site/KitMark";
import { play } from "../sound/sound";

/* ── sizes ─────────────────────────────────────────────── */
const CW = 420, CH = 250;
const W = 460, H = 360;
const HINGE = 296;              // the bottom line every card stands on
const LEAN = 52, STEP = 30, SHRINK = 0.045, SHOWN = 3;

/* ── motion ────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const STAND = { type: "spring", visualDuration: 0.28, bounce: 0 } as const;  // up and back down
const STEP_BACK = { type: "spring", visualDuration: 0.35, bounce: 0 } as const;  // cards moving a place
const SHUT = { type: "spring", visualDuration: 0.42, bounce: 0 } as const;       // the cover swinging over
const FLAT = { type: "spring", visualDuration: 0.36, bounce: 0 } as const;       // opening flat as it lies down

/* ── this piece's colours: dark, then light ─────────────── */
const CSS = `
.letters { --lt-card: var(--k-surface); --lt-edge: inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(0,0,0,.55), 0 18px 40px -16px rgba(0,0,0,.65);
  --lt-fold: rgba(255,255,255,.06); --lt-text: var(--k-text); --lt-dim: var(--k-faint); --lt-ink: var(--k-text2);
  --lt-paper: #e9efe9; --lt-stamp: #1c3a26; --lt-btn: var(--k-raised); --lt-btn-shadow: var(--k-lift); --lt-btn-text: var(--k-text);
  --lt-cover: linear-gradient(140deg, #23573a, #183d29); --lt-cover-text: #d9f5e3; --lt-cover-stripe: rgba(255,255,255,.14); --lt-page: #3a3d3a; --lt-page-line: #1e201e; }
:root[data-theme="light"] .letters { --lt-card: oklch(1 0 0); --lt-edge: 0 0 0 1px oklch(0.22 0.008 264 / .06), 0 1px 2px oklch(0.22 0.008 264 / .05), 0 18px 40px -18px oklch(0.22 0.008 264 / .22);
  --lt-fold: oklch(0.22 0.008 264 / .07); --lt-text: var(--k-text); --lt-dim: var(--k-faint); --lt-ink: oklch(0.3 0.01 264);
  --lt-paper: oklch(0.975 0.004 150); --lt-stamp: #2b7a4a; --lt-btn: oklch(0.22 0.008 264); --lt-btn-shadow: 0 1px 2px oklch(0.22 0.008 264 / .2), 0 6px 16px -6px oklch(0.22 0.008 264 / .35); --lt-btn-text: oklch(0.98 0 0);
  --lt-cover: linear-gradient(140deg, #49c477, #2f9d5a); --lt-cover-text: #ffffff; --lt-cover-stripe: rgba(255,255,255,.35); --lt-page: #ffffff; --lt-page-line: oklch(0.85 0.004 264); }
.lt-card { position: absolute; left: ${(W - CW) / 2}px; top: ${HINGE - CH}px; width: ${CW}px; height: ${CH}px; border-radius: 18px; padding: 0; border: 0; text-align: left;
  background: none; cursor: pointer; transform-origin: 50% 100%; transform-style: preserve-3d; font: inherit; color: inherit; user-select: none; -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent; }
.lt-solid { background: var(--lt-card); box-shadow: var(--lt-edge); }
.lt-half { position: absolute; top: 0; height: 100%; width: 50%; background: var(--lt-card); box-shadow: var(--lt-edge); }
.lt-left { left: 0; border-radius: 18px 0 0 18px; }
.lt-right { left: 50%; transform-origin: 0 50%; transform-style: preserve-3d; }
.lt-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.lt-front { background: var(--lt-card); box-shadow: var(--lt-edge), inset 1px 0 0 var(--lt-fold); border-radius: 0 18px 18px 0; }
.lt-back { transform: rotateY(180deg); border-radius: 0 18px 18px 0; background: var(--lt-cover); box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(0,0,0,.35);
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; color: var(--lt-cover-text); overflow: hidden; }
.lt-back::before { content: ""; position: absolute; top: 0; bottom: 0; left: 16px; width: 5px; background: var(--lt-cover-stripe); }
.lt-back b { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.lt-back small { font-size: 12px; opacity: .7; }
.lt-pages { position: absolute; top: 4px; bottom: 4px; right: -5px; width: 5px; border-radius: 0 3px 3px 0;
  background: repeating-linear-gradient(90deg, var(--lt-page) 0 1px, var(--lt-page-line) 1px 2px); box-shadow: 1px 0 0 var(--lt-page-line); }
@property --lt-m { syntax: "<percentage>"; inherits: false; initial-value: 84%; }
.lt-stack { position: absolute; inset: 0; perspective: 900px; perspective-origin: 50% 10%; --lt-m: 84%;
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(var(--lt-m) - 30%), #0000 var(--lt-m)); mask-image: linear-gradient(to bottom, #000 calc(var(--lt-m) - 30%), #0000 var(--lt-m));
  transition: --lt-m 150ms cubic-bezier(0.16, 1, 0.3, 1); }
.lt-stack[data-open="true"] { --lt-m: 300%; }
.lt-card:focus-visible { outline: 2px solid #3fc06c; outline-offset: 3px; }
.lt-msg { position: absolute; left: 20px; top: 18px; width: ${CW / 2 - 36}px; font-size: 14px; line-height: 20px; font-weight: 500; letter-spacing: -0.01em;
  color: var(--lt-dim); transition: color 200ms ease; text-wrap: pretty; }
.lt-card[data-on="true"] .lt-msg { color: var(--lt-text); }
.lt-from { position: absolute; left: 20px; bottom: 18px; font-size: 12px; color: var(--lt-dim); }
.lt-fold { position: absolute; left: 50%; top: 18px; bottom: 18px; width: 1px; background: var(--lt-fold); }
.lt-right .lt-stamp { right: 16px; }
.lt-stamp { position: absolute; right: 16px; top: 14px; width: 52px; height: 62px; padding: 5px; background: var(--lt-paper);
  -webkit-mask: linear-gradient(#000 0 0) 50% 50% / calc(100% - 6px) calc(100% - 6px) no-repeat, radial-gradient(circle, #0000 1.7px, #000 2px) -3px -3px / 6px 6px;
  mask: linear-gradient(#000 0 0) 50% 50% / calc(100% - 6px) calc(100% - 6px) no-repeat, radial-gradient(circle, #0000 1.7px, #000 2px) -3px -3px / 6px 6px;
  filter: drop-shadow(0 1px 1.5px rgba(0,0,0,.22)) drop-shadow(0 0 .5px rgba(0,0,0,.25)); rotate: 3deg; }
.lt-stamp > div { width: 100%; height: 100%; background: var(--lt-stamp); display: grid; place-items: center; overflow: hidden; }
.lt-input { position: absolute; left: 20px; top: 18px; width: ${CW / 2 - 36}px; height: ${CH - 70}px; resize: none; border: 0; outline: 0; background: none; padding: 0;
  font: 500 14px/20px var(--font, system-ui); letter-spacing: -0.01em; color: var(--lt-text); }
.lt-input::placeholder { color: var(--lt-dim); }
.lt-btn { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 15px 0 13px; border-radius: 18px; border: 0; cursor: pointer;
  background: var(--lt-btn); box-shadow: var(--lt-btn-shadow); color: var(--lt-btn-text); font: 500 13px/1 var(--font, system-ui); letter-spacing: -0.01em;
  transition: scale 150ms cubic-bezier(0.2, 0, 0, 1); -webkit-tap-highlight-color: transparent; }
.lt-btn:active { scale: 0.96; }
.lt-btn:focus-visible { outline: 2px solid #3fc06c; outline-offset: 2px; }
.lt-send { position: absolute; right: 16px; bottom: 16px; height: 32px; font-size: 12.5px; padding: 0 13px; background: #34b562; color: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.18); }
.lt-send[disabled] { opacity: .45; cursor: default; }
`;

/* ── stamps and doodles ────────────────────────────────── */
const G = "#7ee8a5";
const STAMPS: ReactNode[] = [
  // sun over hills
  <svg key="hills" viewBox="0 0 42 52" width="42" height="52" aria-hidden="true"><circle cx="28" cy="17" r="6" fill={G} /><path d="M0 40c8-9 14-11 21-5s13 3 21-6v23H0Z" fill="#3fc06c" /><path d="M0 46c10-6 18-6 26-2s11 1 16-2v10H0Z" fill="#1f8a45" /></svg>,
  // a leaf
  <svg key="leaf" viewBox="0 0 42 52" width="42" height="52" aria-hidden="true"><path d="M10 42C8 22 20 10 34 9c1 16-8 30-24 33Z" fill="#3fc06c" /><path d="M11 41c5-9 11-17 20-27" stroke={G} strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg>,
  // Kit
  <span key="kit" style={{ display: "grid", placeItems: "center" }}><KitMark size={28} flat /></span>,
];
type Doodle = "heart" | "plane" | "smile";
const DOODLES: Record<Doodle, string> = {
  heart: "M31 46c-6-4.5-15-10.5-19-17.5-3.8-6.8-1.6-13.6 4.2-15.6 5.8-1.9 10.6 1.8 13.6 8.1 2.2-7.2 8.3-11.8 15.1-9.6 6.6 2.6 5.8 10.6.9 17.8-3.9 5.9-9.6 11-15.4 17.4",
  plane: "M7 28.5 53 9.5 39.5 47 30.5 32.5Z M30.5 32.5 53 9.5 M30.5 32.5l-1.6 9.8 5.8-6.1",
  smile: "M19.5 16.5l.9 6.4M41.5 15.8l-.8 6.4M12.5 31.5c6.5 12.4 26.2 13.6 34.6.6",
};

interface Letter { id: number; msg: string; from: string; stamp: number; doodle: Doodle }
const START: Letter[] = [
  { id: 3, msg: "Copied the printer in a minute. Thank you!", from: "Ada, Lagos", stamp: 0, doodle: "heart" },
  { id: 2, msg: "Keep shipping these, they make my day.", from: "Tomás, Lisbon", stamp: 1, doodle: "smile" },
  { id: 1, msg: "Hi from Seoul!", from: "Min, Seoul", stamp: 2, doodle: "plane" },
];

const DEG_PER_PX = LEAN / 150;   // how far the card tips for each pixel the pointer moves
const SHUT_AT = 0.35;            // let go past this much of the lean (or flick) and it lies down
const FLICK = 260;               // deg/s

/** past the ends of its travel the card gives a little, then resists */
const band = (a: number) => (a < 0 ? a * 0.25 : a > LEAN ? LEAN + (a - LEAN) * 0.25 : a);

function Card({ l, i, open, raised, hot, born, scale, onSet, onRaise, onHover, onLanded, reduced }: {
  l: Letter; i: number; open: boolean; raised: boolean; hot: boolean; born: boolean; scale: number;
  onSet: (open: boolean) => void; onRaise: () => void; onHover: (on: boolean) => void; onLanded: () => void; reduced: boolean | null;
}) {
  // two angles drive everything. The hinge: standing (0°) on the front line at full size, or
  // leaning (52°) in its own place. The fold: the right half, flat (0°) or swung shut over the left
  // half like a book cover (180°). Clicks, drags and flicks all just move these two.
  const angle = useMotionValue(born || open ? 0 : LEAN);
  const fold = useMotionValue(0);
  const place = useMotionValue(i);                       // its place in the stack, eased when cards step back
  const lean = useTransform(angle, (a) => Math.min(1, Math.max(0, a / LEAN)));
  const y = useTransform(() => -place.get() * STEP * lean.get());
  const sc = useTransform(() => 1 - place.get() * SHRINK * lean.get());
  const opacity = useTransform(() => Math.min(1, Math.max(0, SHOWN - place.get())));
  const turn = useTransform(fold, (f) => -f);
  const pages = useTransform(fold, [150, 178], [0, 1]);
  const drag = useRef<{ x0: number; y0: number; a0: number; f0: number; reach: number; axis: "x" | "y" | null } | null>(null);
  const dragged = useRef(false);
  const runs = useRef<{ stop: () => void }[]>([]);
  const seq = useRef(0);

  const stopAll = () => { runs.current.forEach((r) => r.stop()); runs.current = []; seq.current++; };
  const speed = (t: object) => (reduced ? { duration: 0 } : t);

  // shut like a book, then lie back down into its place, opening flat again as it goes
  const putBack = async () => {
    const me = seq.current;
    if (fold.get() < 172 && angle.get() < LEAN / 2) {
      const s1 = animate(fold, 180, speed(SHUT));
      runs.current = [s1];
      // lie down the moment it is as good as shut, not after the spring's last fraction of a degree
      await new Promise<void>((done) => {
        if (reduced) return done();
        const off = fold.on("change", (f) => { if (f >= 172) { off(); done(); } });
        s1.then(() => { off(); done(); });
      });
      if (me !== seq.current) return;
    }
    const a = animate(angle, LEAN, speed(STAND)), f = animate(fold, 0, speed({ ...FLAT, delay: 0.1 }));
    runs.current = [a, f];
    await Promise.all([a, f]);
    if (me === seq.current) onLanded();
  };
  useEffect(() => {
    if (drag.current?.axis) return; // the pointer has it
    stopAll();
    if (open) runs.current = [animate(angle, 0, speed(STAND)), animate(fold, 0, speed(SHUT))];
    else void putBack();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const a = animate(place, i, speed(STEP_BACK)); return () => a.stop(); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopAll(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault(); // no text selection, so a drag never scrolls the page under it
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // how far from the spine the pointer took hold of the cover; from the left half, the cover's edge
    const reach = e.clientX - (r.left + r.width / 2);
    drag.current = { x0: e.clientX, y0: e.clientY, a0: angle.get(), f0: fold.get(), reach: reach > 24 * scale ? reach : (CW / 2) * scale, axis: null };
    dragged.current = false;
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ }
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.axis) {
      if (Math.hypot(dx, dy) < 5) return;
      // sideways on an open card folds the cover; up and down tips the whole card on its hinge
      d.axis = open && Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      dragged.current = true;
      stopAll();
      onRaise();
    }
    if (d.axis === "x") {
      // the point under the pointer stays under it: the cover's angle is where its edge must be
      const startX = d.reach * Math.cos((d.f0 * Math.PI) / 180);
      const c = Math.max(-1, Math.min(1, (startX + dx) / d.reach));
      fold.set((Math.acos(c) * 180) / Math.PI);
    } else {
      angle.set(band(d.a0 + (dy / scale) * DEG_PER_PX));
    }
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.axis) return;
    if (d.axis === "x") {
      const v = fold.getVelocity(), f = fold.get();
      const shut = v > 300 ? true : v < -300 ? false : f > 90;
      play(shut ? "tap" : "rustle", { vol: 0.45 });
      if (shut) { onSet(false); return; }                      // the effect finishes the fold and lays it down
      runs.current = [animate(fold, 0, speed(SHUT))];          // springs back open with the speed it was let go at
      return;
    }
    const v = angle.getVelocity(), a = angle.get();
    const shut = v > FLICK ? true : v < -FLICK ? false : a > LEAN * (open ? SHUT_AT : 1 - SHUT_AT);
    play(shut ? "tap" : "rustle", { vol: 0.45 });
    if (shut === open) { onSet(!shut); return; }
    runs.current = [animate(angle, shut ? LEAN : 0, speed(STAND))];
  };

  return (
    <motion.button type="button" className="lt-card" data-on={open || hot} aria-expanded={open}
      aria-label={open ? `Letter from ${l.from}. Press to close it.` : `Letter from ${l.from}: ${l.msg}`}
      style={{ rotateX: angle, y, scale: sc, opacity, zIndex: raised ? 50 : 20 - i, cursor: open ? "grab" : "pointer", touchAction: "none" }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onClick={(e) => { e.stopPropagation(); if (dragged.current) { dragged.current = false; return; } onRaise(); onSet(!open); play(open ? "tap" : "rustle", { vol: 0.5 }); }}
      onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)}>
      {/* the left half stays put: the message and who sent it, and the page edges once it is shut */}
      <span className="lt-half lt-left">
        <span className="lt-msg">{l.msg}</span>
        <span className="lt-from">{l.from}</span>
        <motion.span className="lt-pages" style={{ opacity: pages }} />
      </span>
      {/* the right half is the cover: the stamp and doodle inside, Kit's green outside */}
      <motion.span className="lt-half lt-right" style={{ rotateY: turn, background: "none", boxShadow: "none" }}>
        <span className="lt-face lt-front">
          <span className="lt-stamp"><div>{STAMPS[l.stamp % STAMPS.length]}</div></span>
          <AnimatePresence>
            {open && (
              <motion.svg key="doodle" viewBox="0 0 60 56" width="72" height="67" aria-hidden="true" style={{ position: "absolute", left: CW / 4 - 36, bottom: 26, overflow: "visible" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.12, delay: 0.06 } }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
                <motion.path d={DOODLES[l.doodle]} fill="none" stroke="var(--lt-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.06 }} />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>
        <span className="lt-face lt-back" aria-hidden="true">
          <KitMark size={30} flat />
          <b>A letter for Kit</b>
          <small>from {l.from.split(",")[0]}</small>
        </span>
      </motion.span>
    </motion.button>
  );
}

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
      setScale(Math.min(big ? 1.5 : 1, (w - 24) / W, (h - (big ? 60 : 40)) / H));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, scale };
}

/* ── component ──────────────────────────────────────────── */
export default function Letters({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, scale } = useFit(size);
  const reduced = useReducedMotion();
  const [letters, setLetters] = useState(START);
  const [open, setOpen] = useState<number | null>(null);   // id of the open card, or -1 for a draft
  const [raised, setRaised] = useState<number | null>(null); // stays up while it lies back down
  const [hot, setHot] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [born, setBorn] = useState<number | null>(null);   // a sent card starts standing
  const [sent, setSent] = useState(false);
  const nextId = useRef(10);

  const set = (id: number, on: boolean) => setOpen((o) => (on ? id : o === id ? null : o));
  const write = () => { setDraft(""); setSent(false); setOpen(-1); play("rustle", { vol: 0.5 }); };
  const send = () => {
    const msg = draft.trim();
    if (!msg) return;
    const id = nextId.current++;
    setSent(true);
    setBorn(id); setRaised(id);
    setLetters((ls) => [{ id, msg, from: "You", stamp: id % STAMPS.length, doodle: "plane" }, ...ls]);
    setOpen(null);
    play("pop", { vol: 0.5 });
  };
  useEffect(() => {
    if (open === null) return;
    // caught first and stopped, so Escape closes only this and not the sheet around it
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(null); } };
    addEventListener("keydown", esc, true);
    return () => removeEventListener("keydown", esc, true);
  }, [open]);

  const anyOpen = open !== null;
  return (
    <MotionConfig reducedMotion="user">
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div data-own-click className="letters" style={{ pointerEvents: "auto", position: "absolute", left: "50%", top: "50%", width: W, height: H,
          transform: `translate(-50%, -50%) scale(${scale})`, perspective: 900, perspectiveOrigin: "50% 10%" }}
          onPointerLeave={() => setHot(null)} onClick={() => { if (open !== null && open !== -1) setOpen(null); }}>
          <div className="lt-stack" data-open={anyOpen}>
          {letters.map((l, i) => (
            <Card key={l.id} l={l} i={i} reduced={reduced} scale={scale} open={open === l.id} raised={raised === l.id} born={born === l.id} hot={!anyOpen && hot === l.id}
              onSet={(on) => set(l.id, on)} onRaise={() => setRaised(l.id)} onHover={(on) => setHot((h) => (on ? l.id : h === l.id ? null : h))}
              onLanded={() => { setRaised((r) => (r === l.id ? null : r)); setBorn((b) => (b === l.id ? null : b)); }} />
          ))}
          </div>

          {/* a blank card to write on */}
          <AnimatePresence>
            {open === -1 && (
              <motion.div key="draft" className="lt-card lt-solid" style={{ zIndex: 60, cursor: "default" }} onClick={(e) => e.stopPropagation()}
                initial={{ rotateX: LEAN, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }}
                exit={sent ? { opacity: 0, transition: { duration: 0 } } : { rotateX: LEAN, opacity: 0, transition: STAND }} transition={reduced ? { duration: 0 } : STAND}>
                <span className="lt-fold" />
                <textarea className="lt-input" placeholder="Write something nice…" value={draft} maxLength={90} autoFocus aria-label="Your letter"
                  onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }} />
                <span className="lt-from">From you</span>
                <span className="lt-stamp"><div>{STAMPS[nextId.current % STAMPS.length]}</div></span>
                <button type="button" className="lt-btn lt-send" disabled={!draft.trim()} onClick={send}>Send</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", zIndex: 10 }}>
            <button type="button" className="lt-btn" onClick={(e) => { e.stopPropagation(); write(); }}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              Write a letter
            </button>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
