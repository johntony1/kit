/* Tool rail: a slim vertical bar of three buttons (Comment, Share, Menu) with one shared tooltip.
 * The tooltip is a single pill that follows the pointer from button to button: it glides to the
 * hovered row, its label rolls like a ticker, and a soft shine passes over each new word.
 *
 *  RAIL            46 wide, three 34px round buttons, 6px inset; Menu carries a green dot
 *  TIP             108 × 32, radius 10, 10px left of the rail; label left, key caps right
 *
 *  ENTER     0ms   tip and highlight appear on the hovered row, in place:
 *                  opacity 0 → 1, blur 6 → 0, scale .94 → 1 (ease out, 260ms)
 *            0ms   the word shines: a green white band sweeps across it (900ms)
 *  MOVE      0ms   tip and highlight glide to the new row together (spring .42s, no bounce)
 *            0ms   label rolls: moving down, the new word rises from below as the old one leaves up,
 *                  each fading through a 3px blur (same spring), then shines
 *           40ms   key caps settle in after the word
 *  LEAVE    90ms   grace, so crossing the gap between buttons never blinks
 *           90ms   tip fades out where it is: opacity → 0, blur → 6px, scale → .97 (320ms)
 *  PRESS           the button dips to .9 and springs back
 *
 * Everything runs on motion values, so any move can be interrupted mid flight and carries its
 * speed into the next one. Keyboard: Tab onto a button shows its tip. On touch, a tap shows it
 * for a moment. Reduced motion: no slide, no roll, no shine, just a fade. */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig, animate, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { play } from "../sound/sound";

/* ── sizes ─────────────────────────────────────────────── */
const RAIL = { w: 46, pad: 6, btn: 34 };
const TIP = { w: 108, h: 32, gap: 10 };
const rowY = (i: number) => RAIL.pad + i * RAIL.btn + RAIL.btn / 2; // centre of row i
const RAIL_H = RAIL.pad * 2 + RAIL.btn * 3;

/* ── motion ────────────────────────────────────────────── */
const GLIDE = { type: "spring", visualDuration: 0.42, bounce: 0 } as const;   // tip + highlight between rows
const ROLL = { type: "spring", visualDuration: 0.42, bounce: 0 } as const;    // the label ticker
const ENTER = { duration: 0.26, ease: [0.16, 1, 0.3, 1] } as const;          // ease out (expo)
const LEAVE = { duration: 0.32, ease: [0.4, 0, 0.2, 1] } as const;
const SHINE = { duration: 0.9, ease: [0.45, 0, 0.2, 1], delay: 0.04 } as const;
const GRACE = 90;        // ms before the tip hides once the pointer leaves a button
const TOUCH_HOLD = 1300; // ms a tip stays after a tap on touch

/* ── this rail's colours: dark, then light ─────────────── */
const CSS = `
.trail { --tr-rail: var(--k-surface); --tr-rail-shadow: var(--k-lift), 0 12px 28px -12px rgba(0,0,0,.6);
  --tr-ico: var(--k-muted); --tr-ico-on: var(--k-text); --tr-hover: rgba(255,255,255,.075);
  --tr-tip: #2f312f; --tr-tip-text: var(--k-text); --tr-tip-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 0 0 1px rgba(0,0,0,.6), 0 10px 24px -8px rgba(0,0,0,.6);
  --tr-shine: #ffffff; --tr-glint: #7ee8a5;
  --tr-key: rgba(255,255,255,.16); --tr-key-text: var(--k-muted); }
:root[data-theme="light"] .trail { --tr-rail: oklch(1 0 0); --tr-rail-shadow: var(--k-lift), 0 12px 28px -14px oklch(0.22 0.008 264 / .18);
  --tr-ico: var(--k-muted); --tr-ico-on: var(--k-text); --tr-hover: oklch(0.22 0.008 264 / .06);
  --tr-tip: oklch(1 0 0); --tr-tip-text: var(--k-text); --tr-tip-shadow: var(--k-lift), 0 10px 24px -10px oklch(0.22 0.008 264 / .2);
  --tr-shine: oklch(0.74 0.17 150); --tr-glint: oklch(0.56 0.15 150);
  --tr-key: oklch(0.22 0.008 264 / .14); --tr-key-text: var(--k-muted); }
.trail-btn { position: relative; z-index: 1; appearance: none; border: 0; padding: 0; width: ${RAIL.btn}px; height: ${RAIL.btn}px; border-radius: 50%;
  display: grid; place-items: center; background: transparent; color: var(--tr-ico); cursor: pointer;
  transition: color 220ms cubic-bezier(0.16, 1, 0.3, 1); touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.trail-btn[data-on="true"] { color: var(--tr-ico-on); }
.trail-btn:focus-visible { outline: 2px solid #3fc06c; outline-offset: 1px; }
.trail-word { background-image: linear-gradient(100deg, var(--tr-tip-text) 0%, var(--tr-tip-text) 38%, var(--tr-glint) 45%, var(--tr-shine) 50%, var(--tr-glint) 55%, var(--tr-tip-text) 62%, var(--tr-tip-text) 100%);
  background-size: 320% 100%; background-repeat: no-repeat; -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }
@media (prefers-reduced-motion: reduce) { .trail-word { background: none; color: var(--tr-tip-text); -webkit-text-fill-color: currentColor; } }
`;

/* ── the three buttons ─────────────────────────────────── */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const TOOLS: { k: string; label: string; keys: string[]; icon: ReactNode }[] = [
  { k: "comment", label: "Comment", keys: ["C"], icon: <path d="M10 3.5a6.5 6.5 0 1 1-3.1 12.2L3.5 16.5l.9-3.2A6.5 6.5 0 0 1 10 3.5Z" {...S} /> },
  { k: "share", label: "Share", keys: [], icon: <><path d="M10 12.5V3.5m0 0L7 6.5m3-3 3 3" {...S} /><path d="M4.5 11v3.5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V11" {...S} /></> },
  { k: "menu", label: "Menu", keys: ["⌘", "K"], icon: <><path d="M4.5 6h8M4.5 10h11M4.5 14h11" {...S} /><circle cx="15.6" cy="5.6" r="2.1" fill="#3fc06c" stroke="var(--tr-rail)" strokeWidth="1.2" /></> },
];

/* ── fit: scale into the tile ── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const w = (RAIL.w + TIP.gap + TIP.w) * 2, h = RAIL_H; // the rail sits in the middle, so room for the tip on both sides
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight;
      if (!W || !H) return;
      const big = size === "big";
      setScale(Math.min(big ? 1.9 : 1.3, (W - 24) / w, (H - (big ? 120 : 96)) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, scale };
}

/** one word of the tooltip: it rolls in, then a shine passes over it */
function Word({ text, reduced }: { text: string; reduced: boolean | null }) {
  const pos = useMotionValue(reduced ? 0 : 100);
  useEffect(() => {
    if (reduced) return;
    const a = animate(pos, 0, SHINE);
    return () => a.stop();
  }, [pos, reduced]);
  const bg = useMotionTemplate`${pos}% 0`;
  return <motion.span className="trail-word" style={{ backgroundPosition: bg }}>{text}</motion.span>;
}

/* ── component ──────────────────────────────────────────── */
export default function ToolRail({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, scale } = useFit(size);
  const reduced = useReducedMotion();
  const [on, setOn] = useState<number | null>(null);   // the hovered row (null when nothing is)
  const [shown, setShown] = useState(0);               // the row whose label the tip carries (kept while it fades out)
  const [dir, setDir] = useState(0);                   // 1 = moved down, -1 = moved up, 0 = appeared
  const hideT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visible = useRef(false);

  // the tip and the highlight share these, so they move as one
  const y = useMotionValue(rowY(0));
  const op = useMotionValue(0), blur = useMotionValue(6), sc = useMotionValue(0.94);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const tipY = useTransform(y, (v) => v - TIP.h / 2);
  const hiY = useTransform(y, (v) => v - RAIL.btn / 2);
  const hiOp = useTransform(op, [0, 1], [0, 1]);

  const show = (i: number) => {
    if (hideT.current) { clearTimeout(hideT.current); hideT.current = null; }
    const fresh = !visible.current && op.get() < 0.2;    // appearing from nothing: no slide, fade in place
    if (fresh || reduced) y.jump(rowY(i));
    else animate(y, rowY(i), GLIDE);
    setDir(fresh || reduced ? 0 : i > shown ? 1 : i < shown ? -1 : dir);
    setShown(i); setOn(i);
    if (!visible.current) {
      visible.current = true;
      animate(op, 1, ENTER); animate(blur, 0, ENTER); animate(sc, 1, ENTER);
    }
  };
  const hide = (after = GRACE) => {
    if (hideT.current) clearTimeout(hideT.current);
    hideT.current = setTimeout(() => {
      visible.current = false; setOn(null);
      animate(op, 0, LEAVE); animate(blur, 6, LEAVE); animate(sc, 0.97, LEAVE);
    }, after);
  };
  useEffect(() => () => { if (hideT.current) clearTimeout(hideT.current); }, []);

  const t = TOOLS[shown];
  const rollY = TIP.h * 0.9;
  return (
    <MotionConfig reducedMotion="user">
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div data-own-click className="trail" style={{ pointerEvents: "auto", position: "absolute", left: "50%", top: "50%", width: RAIL.w, height: RAIL_H, transform: `translate(-50%, -50%) scale(${scale})` }}>
          {/* the one tooltip: always mounted, so a return mid fade picks up where it is */}
          <motion.div aria-hidden="true"
            style={{ position: "absolute", right: RAIL.w + TIP.gap, top: 0, y: tipY, opacity: op, filter, scale: sc, width: TIP.w, height: TIP.h, borderRadius: 10, overflow: "hidden",
              background: "var(--tr-tip)", boxShadow: "var(--tr-tip-shadow)", transformOrigin: "right center", pointerEvents: "none", willChange: "transform, opacity, filter" }}>
            <AnimatePresence initial={false} custom={dir}>
              <motion.div key={t.k} custom={dir}
                variants={{
                  from: (d: number) => ({ y: d * rollY, opacity: d ? 0 : 1, filter: d ? "blur(3px)" : "blur(0px)" }),
                  at: { y: 0, opacity: 1, filter: "blur(0px)" },
                  to: (d: number) => ({ y: d * -rollY, opacity: 0, filter: "blur(3px)" }),
                }}
                initial="from" animate="at" exit="to" transition={reduced ? { duration: 0 } : ROLL}
                style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: t.keys.length ? "space-between" : "center", padding: "0 6px 0 11px",
                  fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                <span style={t.keys.length ? undefined : { marginLeft: -5 }}><Word text={t.label} reduced={reduced} /></span>
                {t.keys.length > 0 && (
                  <motion.span style={{ display: "flex", gap: 3 }} initial={reduced ? false : { opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} transition={{ ...ROLL, delay: 0.04 }}>
                    {t.keys.map((key) => (
                      <kbd key={key} style={{ minWidth: 18, height: 18, padding: "0 4px", borderRadius: 5, display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 1px var(--tr-key)",
                        color: "var(--tr-key-text)", font: "500 10.5px/1 var(--font, system-ui)" }}>{key}</kbd>
                    ))}
                  </motion.span>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* the rail */}
          <div role="toolbar" aria-orientation="vertical" aria-label="Tools"
            style={{ position: "absolute", inset: 0, borderRadius: RAIL.w / 2, padding: RAIL.pad, display: "flex", flexDirection: "column", alignItems: "center",
              background: "var(--tr-rail)", boxShadow: "var(--tr-rail-shadow)" }}
            onPointerLeave={(e) => { if (e.pointerType !== "touch") hide(); }}>
            {/* the hover highlight glides with the tip */}
            <motion.div aria-hidden="true" style={{ position: "absolute", left: RAIL.pad, top: 0, width: RAIL.btn, height: RAIL.btn, borderRadius: "50%",
              background: "var(--tr-hover)", y: hiY, opacity: hiOp, pointerEvents: "none" }} />
            {TOOLS.map((tool, i) => (
              <motion.button key={tool.k} type="button" className="trail-btn" data-on={on === i}
                aria-label={tool.keys.length ? `${tool.label} (${tool.keys.join(" ")})` : tool.label}
                whileTap={{ scale: 0.9 }} transition={{ type: "spring", visualDuration: 0.25, bounce: 0.3 }}
                onPointerEnter={(e) => { if (e.pointerType !== "touch") show(i); }}
                onPointerDown={(e) => { if (e.pointerType === "touch") { show(i); hide(TOUCH_HOLD); } }}
                onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) show(i); }}
                onBlur={() => hide()}
                onClick={() => play("tap", { vol: 0.6 })}>
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">{tool.icon}</svg>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
