/* Scribble list: three things to do. Tick one and a pen scribbles it out in loops, left to right
 * across the words, and where the pen lifts a little burst of confetti in Kit's greens and golds
 * pops off. Tick the last one and the whole card bursts. Untick and the scribble draws back out.
 *
 *  CARD            300 wide, radius 18, Kit's surface and lift; rows 52 tall, hairlines from the text
 *  BOX             20 × 20, radius 6; ticked: green fill, white check 1.75 stroke
 *
 *  TICK      0ms   box fills (spring .3s), check draws (.32s)
 *           60ms   pen scribbles through the words: a loop every 50px, 2.25 stroke,
 *                  .42s + .0016s a px, eased in and out like a hand
 *  LIFT            words fade to muted; 26 pieces burst from the pen's end, up and out
 *  ALL DONE        70 more burst up from the card's top edge
 *  UNTICK    0ms   scribble draws back out, right to left (.38s); words return; box empties
 *
 * Confetti: ribbons and dots on one canvas over the tile, each with its own spin and a flip
 * (its width follows the cosine of its turn, so it tumbles), air drag and gravity, and a fade
 * over its last half second. Nothing runs when nothing is in the air. With reduced motion,
 * no pen and no confetti. */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, MotionConfig, animate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { play } from "../sound/sound";

/* ── sizes ─────────────────────────────────────────────── */
const CARD_W = 300, ROW_H = 52, PAD_X = 16, BOX = 20, TEXT_X = PAD_X + BOX + 12;
const LOOP = 50;

/* ── motion ────────────────────────────────────────────── */
const BOX_SPRING = { type: "spring", visualDuration: 0.3, bounce: 0 } as const;
const HAND = [0.55, 0, 0.3, 1] as const; // a hand: slow off the mark, quick through, eases to a stop
const penTime = (w: number) => 0.42 + w * 0.0016;
const UNDO = { duration: 0.38, ease: [0.4, 0, 0.2, 1] } as const;
/* ── confetti ──────────────────────────────────────────── */
const COLORS = ["#3fc06c", "#5fd487", "#9be6b4", "#d9f5e3", "#f5c84b", "#ffe08a", "#ffffff"];
const LIFE = 1.9, FADE = 0.5, DRAG = 0.985, GRAVITY = 0.15;

/* ── this piece's colours: dark, then light ─────────────── */
const CSS = `
.scr { --scr-card: var(--k-surface); --scr-shadow: var(--k-lift), 0 18px 40px -18px rgba(0,0,0,.65); --scr-line: rgba(255,255,255,.07);
  --scr-box: rgba(255,255,255,.22); --scr-pen: #3fc06c; --scr-tick: oklch(0.2 0.02 150); }
:root[data-theme="light"] .scr { --scr-card: oklch(1 0 0); --scr-shadow: var(--k-lift), 0 18px 40px -20px oklch(0.22 0.008 264 / .22);
  --scr-line: oklch(0.22 0.008 264 / .07); --scr-box: oklch(0.22 0.008 264 / .2); --scr-pen: oklch(0.64 0.16 150); --scr-tick: oklch(1 0 0); }
.scr-card { width: calc(${CARD_W}px * var(--z)); border-radius: calc(18px * var(--z)); padding: calc(4px * var(--z)) 0;
  background: var(--scr-card); box-shadow: var(--scr-shadow); overflow: hidden; isolation: isolate; }
.scr-row { position: relative; height: calc(${ROW_H}px * var(--z)); }
.scr-row + .scr-row::before { content: ""; position: absolute; z-index: 2; top: 0; left: calc(${TEXT_X}px * var(--z)); right: 0; height: 1px; background: var(--scr-line); }
.scr-hit { appearance: none; border: 0; background: transparent; padding: 0; margin: 0; position: absolute; inset: 0; z-index: 3; cursor: pointer;
  border-radius: calc(12px * var(--z)); touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.scr-hit:focus-visible { outline: 2px solid #3fc06c; outline-offset: -4px; }
.scr-box { position: absolute; left: calc(${PAD_X}px * var(--z)); top: 50%; width: calc(${BOX}px * var(--z)); height: calc(${BOX}px * var(--z)); margin-top: calc(${-BOX / 2}px * var(--z));
  border-radius: calc(6px * var(--z)); box-shadow: inset 0 0 0 calc(1.5px * var(--z)) var(--scr-box); }
.scr-text { position: absolute; left: calc(${TEXT_X}px * var(--z)); top: 50%; transform: translateY(-50%); display: inline-flex; align-items: center; gap: calc(7px * var(--z));
  white-space: nowrap; font: 500 calc(14px * var(--z))/1 var(--font, system-ui); letter-spacing: -0.01em; color: var(--k-text);
  transition: color 360ms cubic-bezier(0.16, 1, 0.3, 1); }
.scr-text[data-done="true"] { color: var(--k-muted); }
.scr-text svg { width: calc(16px * var(--z)); height: calc(16px * var(--z)); color: var(--k-muted); }
.scr-pen { position: absolute; left: calc(${TEXT_X}px * var(--z)); top: 50%; overflow: visible; pointer-events: none; }
`;

/* ── Kit's line icons, 16px, 1.5 stroke ─────────────────── */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const TASKS: { k: string; text: string; icon: ReactNode }[] = [
  { k: "read", text: "Read 5 pages of a book", icon: <><path d="M8 4.5c-1.4-1-3.2-1.4-5.5-1.25v9.5c2.3-.15 4.1.25 5.5 1.25 1.4-1 3.2-1.4 5.5-1.25v-9.5C11.2 3.1 9.4 3.5 8 4.5Zm0 0v9.5" {...S} /></> },
  { k: "cats", text: "Feed the cats", icon: <><path d="M2.5 8.5h11a5.5 5.5 0 0 1-11 0Z" {...S} /><path d="M6 6.2c0-.8.6-1.2.6-2M9 6.2c0-.8.6-1.2.6-2" {...S} /></> },
  { k: "plants", text: "Water the plants", icon: <><path d="M8 13.5V8" {...S} /><path d="M8 8.5C8 5.8 6.2 4.5 3.5 4.5c0 2.7 1.8 4 4.5 4Zm0-1c0-2.4 1.6-3.6 4.5-3.6 0 2.4-1.6 3.6-4.5 3.6Z" {...S} /></> },
];
const CHECK = "M6.2 10.3 8.7 12.7 13.8 7.4";

/** a pen's loops through the words: a trochoid (a point on a rolling wheel, further out than its
 *  rim) curls back on itself once a turn, so every turn is a loop; it leans forward like a hand,
 *  and a fixed seed per row gives each row's loops their own small wobble */
function scribble(width: number, seed: number) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280 - 0.5);
  const roll = LOOP / (Math.PI * 2), reach = roll * 2.5, lean = 0.22;
  const turns = Math.max(1, Math.round((width + 8) / LOOP));
  const end = turns * Math.PI * 2 + Math.PI * 0.5;
  const pts: [number, number][] = [];
  let wob = 0, next = 0;
  for (let t = -Math.PI * 0.5; t <= end; t += 0.22) {
    if (t >= next) { wob = r(); next += Math.PI * 2; }
    const h = 7.5 + wob * 2;
    const y = Math.cos(t) * h * -1 + Math.sin(t * 0.5) * 0.6;
    const x = roll * t - reach * Math.sin(t) - y * lean;
    pts.push([x, y]);
  }
  // fit the whole scribble to the words, from just before them to just past the end
  const lo = Math.min(...pts.map((p) => p[0])), hi = Math.max(...pts.map((p) => p[0]));
  for (const p of pts) p[0] = -4 + ((p[0] - lo) / (hi - lo)) * (width + 10);
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

type Bit = { x: number; y: number; vx: number; vy: number; a: number; va: number; flip: number; vf: number; w: number; h: number; c: string; dot: boolean; t: number };

/** one canvas over the tile; burst() throws pieces from a point, up and out */
function useConfetti() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const bits = useRef<Bit[]>([]);
  const raf = useRef(0);
  const reduced = useReducedMotion();
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const frame = () => {
    const cv = canvas.current, ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    bits.current = bits.current.filter((b) => b.t < LIFE && b.y < H + 20);
    for (const b of bits.current) {
      b.t += 1 / 60;
      b.vx *= DRAG; b.vy = b.vy * DRAG + GRAVITY;
      b.x += b.vx; b.y += b.vy; b.a += b.va; b.flip += b.vf;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (LIFE - b.t) / FADE);
      ctx.translate(b.x, b.y); ctx.rotate(b.a);
      ctx.fillStyle = b.c;
      if (b.dot) { ctx.beginPath(); ctx.arc(0, 0, b.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else { const w = b.w * Math.abs(Math.cos(b.flip)) + 0.4; ctx.beginPath(); ctx.roundRect(-w / 2, -b.h / 2, w, b.h, Math.min(w, b.h) / 2.5); ctx.fill(); }
      ctx.restore();
    }
    raf.current = bits.current.length ? requestAnimationFrame(frame) : 0;
  };

  /** count pieces from (x, y) in the tile, thrown up within ±spread radians of straight up */
  const burst = (x: number, y: number, count: number, power: number, spread = 1.1, width = 0) => {
    if (reduced) return;
    for (let i = 0; i < count; i++) {
      const dir = -Math.PI / 2 + (Math.random() - 0.5) * 2 * spread, v = power * (0.45 + Math.random() * 0.75);
      const dot = Math.random() < 0.3, size = 4 + Math.random() * 4;
      bits.current.push({ x: x + (Math.random() - 0.5) * width, y, vx: Math.cos(dir) * v, vy: Math.sin(dir) * v, a: Math.random() * 6.3, va: (Math.random() - 0.5) * 0.3,
        flip: Math.random() * 6.3, vf: 0.08 + Math.random() * 0.18, w: dot ? size * 0.75 : size * 0.7, h: dot ? 0 : size * 1.5,
        c: COLORS[(Math.random() * COLORS.length) | 0], dot, t: Math.random() * 0.3 });
    }
    if (!raf.current) raf.current = requestAnimationFrame(frame);
  };
  return { canvas, burst };
}

/* ── one row ───────────────────────────────────────────── */
function Row({ task, seed, z, start, onTick }: { task: (typeof TASKS)[number]; seed: number; z: number; start: boolean; onTick: (on: boolean, pen?: DOMRect) => void }) {
  const reduced = useReducedMotion();
  const text = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  const [ticked, setTicked] = useState(start);
  const [done, setDone] = useState(start);
  const ink = useMotionValue(start ? 1 : 0);
  const turn = useRef(0);
  const shown = useTransform(ink, (v) => (v > 0.002 ? 1 : 0)); // a round cap at length 0 is still a dot

  useLayoutEffect(() => { if (text.current) setWidth(text.current.offsetWidth / z); }, [z]);

  const toggle = () => {
    const my = ++turn.current;
    const now = !ticked;
    setTicked(now);
    if (!now) {
      play("remove", { vol: 0.45 });
      setDone(false);
      onTick(false);
      if (reduced) ink.set(0); else animate(ink, 0, UNDO);
      return;
    }
    play("tap", { vol: 0.6 });
    const lift = () => {
      if (turn.current !== my) return;
      setDone(true);
      play("pop", { vol: 0.5 });
      onTick(true, text.current?.getBoundingClientRect());
    };
    if (reduced) { ink.set(1); lift(); return; }
    animate(ink, 1, { duration: penTime(width), ease: HAND, delay: 0.06 }).then(lift);
  };

  return (
    <div className="scr-row">
          <motion.span className="scr-box" initial={false} animate={{ backgroundColor: ticked ? "#3fc06c" : "rgba(63,192,108,0)", boxShadow: ticked ? "inset 0 0 0 0px var(--scr-box)" : `inset 0 0 0 ${1.5 * z}px var(--scr-box)` }} transition={BOX_SPRING}>
            <svg viewBox="0 0 20 20" width="100%" height="100%" aria-hidden="true">
              <motion.path d={CHECK} fill="none" stroke="var(--scr-tick)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
                initial={false} animate={{ pathLength: ticked ? 1 : 0, opacity: ticked ? 1 : 0 }}
                transition={ticked ? { pathLength: { duration: 0.32, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.08 } } : { duration: 0.16 }} />
            </svg>
          </motion.span>
          <span ref={text} className="scr-text" data-done={done}>{task.text}<svg viewBox="0 0 16 16" aria-hidden="true">{task.icon}</svg></span>
          {width > 0 && (
            <svg className="scr-pen" width={(width + 12) * z} height={24 * z} viewBox={`-6 -12 ${width + 12} 24`} style={{ marginTop: -12 * z, marginLeft: -6 * z }} aria-hidden="true">
              <motion.path d={scribble(width, seed)} fill="none" stroke="var(--scr-pen)" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: ink, opacity: shown }} />
            </svg>
          )}
      <button type="button" className="scr-hit" role="checkbox" aria-checked={ticked} aria-label={task.text} onClick={toggle} />
    </div>
  );
}

/* ── fit: size into the tile ── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const w = CARD_W, h = ROW_H * TASKS.length + 8;
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight;
      if (!W || !H) return;
      setScale(Math.min(size === "big" ? 1.7 : 1.25, (W - 40) / w, (H - 40) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, scale };
}

/* ── component ──────────────────────────────────────────── */
export default function ScribbleList({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, scale } = useFit(size);
  const { canvas, burst } = useConfetti();
  const done = useRef(new Set<string>(["read"]));
  const card = useRef<HTMLDivElement>(null);
  const onTick = (k: string) => (on: boolean, pen?: DOMRect) => {
    if (!on) { done.current.delete(k); return; }
    done.current.add(k);
    const root = rootRef.current?.getBoundingClientRect();
    if (!root || !pen) return;
    burst(pen.right - root.left + 4 * scale, pen.top - root.top + pen.height / 2, 26, 4.2 * Math.sqrt(scale), 0.95);
    const c = card.current?.getBoundingClientRect();
    if (c && done.current.size === TASKS.length) {
      window.setTimeout(() => { burst(c.left - root.left + c.width / 2, c.top - root.top + 8, 70, 6.2 * Math.sqrt(scale), 0.75, c.width * 0.7); play("chime", { vol: 0.45 }); }, 140);
    }
  };
  return (
    <MotionConfig reducedMotion="user">
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div data-own-click className="scr" role="group" aria-label="To do" style={{ pointerEvents: "auto", position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)", ["--z" as string]: scale }}>
          <div ref={card} className="scr-card">
            {TASKS.map((t, i) => <Row key={t.k} task={t} seed={i * 131 + 7} z={scale} start={i === 0} onTick={onTick(t.k)} />)}
          </div>
        </div>
        <canvas ref={canvas} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      </div>
    </MotionConfig>
  );
}
