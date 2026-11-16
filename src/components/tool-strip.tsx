/* Tool strip: a toolbar of six buttons with one tooltip above it. The tooltip is a window onto a
 * strip of every label laid side by side: hover a button and the window glides to sit over it and
 * takes the width of its label, while the strip slides through so the words pass by like film.
 *
 *  BAR             44 tall, six 34px round buttons (Move, Pen, Text, Shapes, Image, Ask AI), 5px inset,
 *                  2px apart; a green dot on Ask AI
 *  TIP             30 tall, radius 9, 10px above the bar; each label 11px in from its edges
 *
 *  ENTER     0ms   window jumps to the hovered button and fades in where it is:
 *                  opacity 0 → 1, blur 6 → 0, y 4 → 0, scale .96 → 1 (ease out, 240ms)
 *  MOVE      0ms   window x, window width and strip x spring together (.38s, no bounce),
 *                  so the old label slides out one side as the new one slides in the other;
 *                  the words blur by up to 1px with the strip's speed, so fast moves smear like film
 *  LEAVE    90ms   grace, so crossing the gap between buttons never blinks
 *           90ms   window fades out in place: opacity → 0, blur → 6px, scale → .97 (300ms)
 *
 * Everything is a motion value on a spring, so a move can be turned mid flight and keeps its speed.
 * Keyboard: Tab onto a button shows its tip. On touch, a tap shows it for a moment. */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, MotionConfig, animate, useMotionTemplate, useMotionValue, useReducedMotion, useTransform, useVelocity } from "framer-motion";
import { play } from "../sound/sound";

/* ── sizes ─────────────────────────────────────────────── */
const BTN = 34, PAD = 5, GAP = 2;
const BAR_W = PAD * 2 + BTN * 6 + GAP * 5, BAR_H = BTN + PAD * 2;
const TIP_H = 30, TIP_GAP = 10;
const centre = (i: number) => PAD + i * (BTN + GAP) + BTN / 2;

/* ── motion ────────────────────────────────────────────── */
const GLIDE = { type: "spring", visualDuration: 0.38, bounce: 0 } as const;
const ENTER = { duration: 0.24, ease: [0.16, 1, 0.3, 1] } as const;
const LEAVE = { duration: 0.3, ease: [0.4, 0, 0.2, 1] } as const;
const GRACE = 90, TOUCH_HOLD = 1300;

/* ── this piece's colours: dark, then light ─────────────── */
const CSS = `
.tstrip { --ts-bar: var(--k-surface); --ts-bar-shadow: var(--k-lift), 0 12px 28px -12px rgba(0,0,0,.6);
  --ts-ico: var(--k-muted); --ts-ico-on: var(--k-text); --ts-hover: rgba(255,255,255,.075);
  --ts-tip: #2f312f; --ts-tip-text: var(--k-text); --ts-tip-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 0 0 1px rgba(0,0,0,.6), 0 10px 24px -8px rgba(0,0,0,.6);
  --ts-key: rgba(255,255,255,.16); --ts-key-text: var(--k-muted); }
:root[data-theme="light"] .tstrip { --ts-bar: oklch(1 0 0); --ts-bar-shadow: var(--k-lift), 0 12px 28px -14px oklch(0.22 0.008 264 / .18);
  --ts-hover: oklch(0.22 0.008 264 / .06);
  --ts-tip: oklch(1 0 0); --ts-tip-text: var(--k-text); --ts-tip-shadow: var(--k-lift), 0 10px 24px -10px oklch(0.22 0.008 264 / .2);
  --ts-key: oklch(0.22 0.008 264 / .14); --ts-key-text: var(--k-muted); }
.ts-btn { position: relative; z-index: 1; appearance: none; border: 0; padding: 0; width: ${BTN}px; height: ${BTN}px; border-radius: 50%; display: grid; place-items: center;
  background: transparent; color: var(--ts-ico); cursor: pointer; transition: color 220ms cubic-bezier(0.16, 1, 0.3, 1);
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.ts-btn[data-on="true"] { color: var(--ts-ico-on); }
.ts-btn:focus-visible { outline: 2px solid #3fc06c; outline-offset: 1px; }
.ts-seg { flex: none; height: ${TIP_H}px; display: inline-flex; align-items: center; gap: 7px; padding: 0 7px 0 11px; white-space: nowrap;
  color: var(--ts-tip-text); font-size: 13px; font-weight: 500; letter-spacing: -0.01em; }
.ts-seg[data-keys="false"] { padding-right: 11px; }
.ts-seg kbd { min-width: 18px; height: 18px; padding: 0 4px; border-radius: 5px; display: grid; place-items: center; box-shadow: inset 0 0 0 1px var(--ts-key);
  color: var(--ts-key-text); font: 500 10.5px/1 var(--font, system-ui); }
`;

/* ── the six buttons: Kit's line icons, 20px, 1.5 stroke ── */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const DOT = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="2.2" fill="#3fc06c" stroke="var(--ts-bar)" strokeWidth="1.3" />;
const TOOLS: { k: string; label: string; keys: string[]; icon: ReactNode }[] = [
  { k: "move", label: "Move", keys: ["V"], icon: <path d="M5 3.5 15.5 9l-4.7 1.3L8.6 15Z" {...S} /> },
  { k: "pen", label: "Pen", keys: ["P"], icon: <><path d="M10 3.5 15 9l-2.5 6h-5L5 9Z" {...S} /><path d="M10 3.5V9" {...S} /><circle cx="10" cy="10" r="1.2" {...S} /><path d="M7.5 17h5" {...S} /></> },
  { k: "text", label: "Text", keys: ["T"], icon: <path d="M4.5 5.5V4h11v1.5M10 4v12.5M7.5 16.5h5" {...S} /> },
  { k: "shapes", label: "Shapes", keys: ["R"], icon: <><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" {...S} /><circle cx="13" cy="13" r="3.75" {...S} /></> },
  { k: "image", label: "Image", keys: ["I"], icon: <><rect x="3" y="4" width="14" height="12" rx="3" {...S} /><circle cx="7.5" cy="8.3" r="1.3" {...S} /><path d="m3.5 14 4-3.5 3 2.5 2-1.5L17 15" {...S} /></> },
  { k: "ai", label: "Ask AI", keys: ["⌘", "J"], icon: <><path d="M9 3.5c.5 3 1.9 4.5 5 5-3.1.5-4.5 2-5 5-.5-3-1.9-4.5-5-5 3.1-.5 4.5-2 5-5Z" {...S} /><path d="M15 12.5c.2 1.2.8 1.8 2 2-1.2.2-1.8.8-2 2-.2-1.2-.8-1.8-2-2 1.2-.2 1.8-.8 2-2Z" {...S} />{DOT(16, 4)}</> },
];

/* ── fit: scale into the tile ── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const w = BAR_W + 120, h = BAR_H + TIP_H + TIP_GAP; // room for a long label past the bar's ends
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight;
      if (!W || !H) return;
      const big = size === "big";
      setScale(Math.min(big ? 2 : 1.4, (W - 24) / w, (H - (big ? 120 : 96)) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, scale };
}

/** one label on the strip */
function Seg({ t }: { t: (typeof TOOLS)[number] }) {
  return (
    <span className="ts-seg" data-keys={t.keys.length > 0}>
      {t.label}
      {t.keys.length > 0 && <span style={{ display: "flex", gap: 3 }}>{t.keys.map((k) => <kbd key={k}>{k}</kbd>)}</span>}
    </span>
  );
}

/* ── component ──────────────────────────────────────────── */
export default function ToolStrip({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, scale } = useFit(size);
  const reduced = useReducedMotion();
  const [on, setOn] = useState<number | null>(null);
  const hideT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visible = useRef(false);

  // where each label sits on the strip, measured once the font is in
  const strip = useRef<HTMLDivElement>(null);
  const segs = useRef<{ x: number; w: number }[]>([]);
  useLayoutEffect(() => {
    const measure = () => {
      const el = strip.current;
      if (!el) return;
      segs.current = [...el.children].map((c) => ({ x: (c as HTMLElement).offsetLeft, w: (c as HTMLElement).offsetWidth }));
    };
    measure();
    document.fonts?.ready.then(measure);
  }, []);

  // the window's left edge and width, and how far the strip has slid
  const wx = useMotionValue(0), ww = useMotionValue(80), sx = useMotionValue(0);
  const op = useMotionValue(0), blur = useMotionValue(6), sc = useMotionValue(0.96), ty = useMotionValue(4);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const stripX = useTransform(sx, (v) => -v);
  // a touch of motion blur on the words while the strip is moving fast, none at rest
  const speed = useVelocity(sx);
  const smear = useTransform(speed, (v) => `blur(${Math.min(1, Math.abs(v) / 1400).toFixed(2)}px)`);
  const hiX = useTransform(() => wx.get() + ww.get() / 2 - BTN / 2); // the highlight rides under the window's centre

  const show = (i: number) => {
    if (hideT.current) { clearTimeout(hideT.current); hideT.current = null; }
    const s = segs.current[i];
    if (!s) return;
    const target = { x: centre(i) - s.w / 2, w: s.w, s: s.x };
    const fresh = !visible.current && op.get() < 0.2; // appearing from nothing: in place, no glide
    if (fresh || reduced) { wx.jump(target.x); ww.jump(target.w); sx.jump(target.s); }
    else { animate(wx, target.x, GLIDE); animate(ww, target.w, GLIDE); animate(sx, target.s, GLIDE); }
    if (!visible.current) {
      visible.current = true;
      animate(op, 1, ENTER); animate(blur, 0, ENTER); animate(sc, 1, ENTER); animate(ty, 0, ENTER);
    }
    setOn(i);
  };
  const hide = (after = GRACE) => {
    if (hideT.current) clearTimeout(hideT.current);
    hideT.current = setTimeout(() => {
      visible.current = false; setOn(null);
      animate(op, 0, LEAVE); animate(blur, 6, LEAVE); animate(sc, 0.97, LEAVE); animate(ty, 2, LEAVE);
    }, after);
  };
  useEffect(() => () => { if (hideT.current) clearTimeout(hideT.current); }, []);

  return (
    <MotionConfig reducedMotion="user">
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div data-own-click className="tstrip" style={{ pointerEvents: "auto", position: "absolute", left: "50%", top: "50%", width: BAR_W, height: BAR_H,
          transform: `translate(-50%, calc(-50% + ${(TIP_H + TIP_GAP) / 2}px)) scale(${scale})` }}>
          {/* the window onto the strip of labels */}
          <motion.div aria-hidden="true"
            style={{ position: "absolute", left: 0, bottom: BAR_H + TIP_GAP, x: wx, y: ty, width: ww, height: TIP_H, borderRadius: 9, overflow: "hidden",
              opacity: op, filter, scale: sc, background: "var(--ts-tip)", boxShadow: "var(--ts-tip-shadow)", pointerEvents: "none", willChange: "transform, opacity, filter" }}>
            <motion.div ref={strip} style={{ position: "absolute", left: 0, top: 0, display: "flex", x: stripX, filter: reduced ? undefined : smear }}>
              {TOOLS.map((t) => <Seg key={t.k} t={t} />)}
            </motion.div>
          </motion.div>

          {/* the toolbar */}
          <div role="toolbar" aria-label="Tools"
            style={{ position: "absolute", inset: 0, borderRadius: BAR_H / 2, padding: PAD, display: "flex", gap: GAP, background: "var(--ts-bar)", boxShadow: "var(--ts-bar-shadow)" }}
            onPointerLeave={(e) => { if (e.pointerType !== "touch") hide(); }}>
            {/* the hover highlight glides with the window */}
            <motion.div aria-hidden="true" style={{ position: "absolute", top: PAD, left: 0, width: BTN, height: BTN, borderRadius: "50%", background: "var(--ts-hover)", pointerEvents: "none",
              x: hiX, opacity: op }} />
            {TOOLS.map((t, i) => (
              <motion.button key={t.k} type="button" className="ts-btn" data-on={on === i}
                aria-label={t.keys.length ? `${t.label} (${t.keys.join(" ")})` : t.label}
                whileTap={{ scale: 0.9 }} transition={{ type: "spring", visualDuration: 0.25, bounce: 0.3 }}
                onPointerEnter={(e) => { if (e.pointerType !== "touch") show(i); }}
                onPointerDown={(e) => { if (e.pointerType === "touch") { show(i); hide(TOUCH_HOLD); } }}
                onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) show(i); }}
                onBlur={() => hide()}
                onClick={() => play("tap", { vol: 0.6 })}>
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">{t.icon}</svg>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
