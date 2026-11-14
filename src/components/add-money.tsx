/* Add money. Split out of Card funding, ported from ~/Documents/Card funding (CardFunding.tsx).
 * The add money sheet: rows stagger in, the amount rolls like an odometer on +/- or while
 * you drag the thumb at the end of the stepper's fill (it shows on hover, the cursor turns
 * into a grabbing hand). Add or close plays the sheet in again.
 * Sounds: tick on +/-, detents while dragging, chime on Add, close on the close button.
 */
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate } from "framer-motion";
import { play } from "../sound/sound";

/* ── timings (verbatim from the source) ── */
const IDLE_ROTATE = [1.99, -4.09, 0];
const SD = { top: 0.12, amount: 0.19, stepper: 0.27, button: 0.42 };
const cv = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6, transition: { duration: 0.07 } },
  transition: { duration: 0.24, ease: [0.165, 0.84, 0.44, 1] as const, delay },
});

const CARDS = [
  { id: "euro", label: "Euro", symbol: "€", amount: "50,000", color: "#f02d55" },
  { id: "dollar", label: "Dollar", symbol: "$", amount: "50,000", color: "#2cac4d" },
  { id: "naira", label: "Naira", symbol: "₦", amount: "50,000", color: "#f5841e" },
];

/* ── tokens: the shared --k-* ones, plus this sheet's own (dark, then light) ── */
const C = {
  text: "var(--k-text)", sec: "var(--k-text2)", muted: "var(--k-muted)", faint: "var(--am-sym)",
  raised: "var(--k-raised)",
  shadow: "var(--k-lift)",
  green: "linear-gradient(180deg,#3cc06b,#22994c)",
};
const CSS = `
.addmoney { --am-sym: #5d6862; --am-chip: rgba(255,255,255,.06); --am-chip-ring: rgba(255,255,255,.06); --am-grip: rgba(255,255,255,.28);
  --am-sheet: var(--k-lift);
  --am-track: inset 0 1px 2px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05);
  --am-go: inset 0 1px 0 rgba(255,255,255,.28), 0 0 0 1px rgba(0,0,0,.45), 0 2px 6px -2px rgba(0,0,0,.5); }
:root[data-theme="light"] .addmoney { --am-sym: oklch(0.53 0.011 264); --am-chip: oklch(0.955 0.003 264); --am-chip-ring: oklch(0.22 0.008 264 / 0.06); --am-grip: oklch(0.22 0.008 264 / 0.22);
  --am-sheet: inset 0 1px 0 oklch(1 0 0), 0 0 0 1px oklch(0.22 0.008 264 / 0.08), 0 1px 2px oklch(0.22 0.008 264 / 0.05), 0 8px 20px -8px oklch(0.22 0.008 264 / 0.12), 0 24px 48px -24px oklch(0.22 0.008 264 / 0.14);
  --am-track: inset 0 1px 2px oklch(0.22 0.008 264 / 0.08), 0 0 0 1px oklch(0.22 0.008 264 / 0.05);
  --am-go: inset 0 1px 0 rgba(255,255,255,.28), 0 0 0 1px oklch(0.5 0.15 150 / 0.7), 0 2px 6px -2px oklch(0.5 0.15 150 / 0.4); }
`;

/* the widget is laid out at the source's size and scaled to fit the card */
const BASE_W = 343;
const BASE_H = 276;

function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(size === "big" ? 1.5 : 0.6);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const availH = size === "big" ? h * 0.78 : Math.max(h - 116, h * 0.62);
      const availW = w - (size === "big" ? 160 : 48);
      setS(Math.max(0.2, Math.min(availW / BASE_W, availH / BASE_H, size === "big" ? 2.2 : 1)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return { ref, s };
}

/* ── odometer: every place is a reel of 0 to 9 that springs to its digit ──
 * A reel never swaps elements, so fast drags just spin it further: nothing blanks
 * or scatters. Places are keyed from the right, so a new hundreds digit rolls in
 * at the left and the cents stay put. */
const DIGIT: React.CSSProperties = { fontWeight: 500, fontSize: 56, lineHeight: "64px", color: C.text, letterSpacing: "-0.56px", fontVariantNumeric: "tabular-nums" };
const REEL = { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.9 };
function Reel({ digit, still }: { digit: number; still: boolean }) {
  return (
    <span style={{ display: "inline-block", overflow: "hidden", height: 64, verticalAlign: "bottom",
      WebkitMaskImage: "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)", maskImage: "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)" }}>
      <motion.span initial={false} animate={{ y: -digit * 64 }} transition={still ? { duration: 0 } : REEL} style={{ display: "flex", flexDirection: "column" }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n} style={{ ...DIGIT, display: "block", height: 64 }}>{n}</span>)}
      </motion.span>
    </span>
  );
}
function Amount({ value, still }: { value: number; still: boolean }) {
  const chars = value.toFixed(2).split("");
  return (
    <div style={{ display: "flex", alignItems: "flex-end" }} aria-label={`$${value.toFixed(2)}`} aria-live="polite">
      <AnimatePresence initial={false} mode="popLayout">
        {chars.map((ch, i) => {
          const place = chars.length - i; // from the right
          return ch === "."
            ? <motion.span layout key="dot" transition={REEL} style={{ ...DIGIT, display: "inline-block", verticalAlign: "bottom" }}>.</motion.span>
            : <motion.span layout key={place} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={REEL} style={{ display: "inline-block" }}>
                <Reel digit={+ch} still={still} />
              </motion.span>;
        })}
      </AnimatePresence>
    </div>
  );
}

/* ── add money sheet (distilled: amount, fill stepper, proceed) ── */
const MIN = 1, MAX = 200, INSET = 4, FILL_H = 52, THUMB_W = 8, THUMB_H = 44;
/* the fill travels between the grip's start and one INSET from the track's right edge,
 * so it keeps the same 4px padding all the way round at MIN and at MAX */
const FW_MIN = INSET + THUMB_W;
const fwMax = (tw: number) => tw - 2 * INSET;
function Sheet({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const reduced = !!useReducedMotion();
  const [value, setValue] = useState(69);
  const prev = useRef(69);
  const track = useRef<HTMLDivElement>(null);
  const fillW = useMotionValue(0);
  const thumbX = useTransform(fillW, (fw) => Math.max(INSET, fw - THUMB_W - 4));
  const dragging = useRef(false);
  const [hover, setHover] = useState(false);
  const [grab, setGrab] = useState(false);

  const toFW = useCallback((v: number, tw: number) => FW_MIN + ((v - MIN) / (MAX - MIN)) * (fwMax(tw) - FW_MIN), []);
  useLayoutEffect(() => { if (track.current) fillW.set(toFW(69, track.current.offsetWidth)); }, [fillW, toFW]);

  const change = useCallback((next: number, anim = true) => {
    prev.current = next;
    setValue(next);
    if (anim && track.current) animate(fillW, toFW(next, track.current.offsetWidth), { type: "spring", visualDuration: 0.3, bounce: 0 });
  }, [fillW, toFW]);

  // drag anywhere on the track; work in fractions so the card's CSS scale does not matter
  const fromPointer = (e: React.PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    const tw = track.current!.offsetWidth;
    const x = ((e.clientX - r.left) / r.width) * tw;
    const fw = Math.max(FW_MIN, Math.min(fwMax(tw), x + THUMB_W / 2));
    fillW.set(fw);
    const raw = MIN + ((fw - FW_MIN) / (fwMax(tw) - FW_MIN)) * (MAX - MIN);
    const next = Math.max(MIN, Math.min(MAX, Math.round(raw)));
    if (next !== prev.current) { change(next, false); play("detent", { gap: 40 }); }
  };

  const btn: React.CSSProperties = {
    position: "relative", zIndex: 3, width: 40, height: 40, border: "none", background: "transparent", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", color: C.text, flexShrink: 0, padding: 0,
  };

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 20, background: C.raised, boxShadow: "var(--am-sheet)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <motion.div {...cv(SD.top)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", width: 28, height: 20 }}>
            {CARDS.map((c, i) => (
              <div key={c.id} style={{ position: "absolute", left: i * 3, top: i * 3 - 2, width: 22, height: 14, borderRadius: 3, background: c.color, transform: `rotate(${IDLE_ROTATE[i]}deg)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" }} />
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.sec, letterSpacing: "-0.08px" }}>Add money</span>
        </div>
        <motion.button type="button" onClick={() => { play("close"); onClose(); }} whileTap={{ scale: 0.88 }} transition={{ type: "spring", visualDuration: 0.2, bounce: 0 }} aria-label="Close"
          style={{ width: 28, height: 28, borderRadius: 999, border: "none", background: "var(--am-chip)", boxShadow: "0 0 0 1px var(--am-chip-ring)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, padding: 0 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M10 2L2 10M2 2l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </motion.button>
      </motion.div>

      <motion.div {...cv(SD.amount)} style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, padding: "18px 16px 18px" }}>
        <span style={{ fontWeight: 500, fontSize: 20, lineHeight: "28px", color: C.faint, paddingBottom: 10 }}>$</span>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <Amount value={value} still={reduced} />
        </div>
      </motion.div>

      <motion.div {...cv(SD.stepper)} style={{ padding: "0 16px" }}>
        <div
          ref={track}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => { if (!dragging.current) setHover(false); }}
          onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button")) return; dragging.current = true; setGrab(true); e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
          onPointerMove={(e) => { if (dragging.current) fromPointer(e); }}
          onPointerUp={(e) => { dragging.current = false; setGrab(false); const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) setHover(false); }}
          onPointerCancel={() => { dragging.current = false; setGrab(false); setHover(false); }}
          style={{
            background: "var(--k-well-solid)", borderRadius: 16, height: FILL_H + 2 * INSET, position: "relative", userSelect: "none", touchAction: "none",
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", cursor: grab ? "grabbing" : "grab",
            boxShadow: "var(--am-track)",
          }}
        >
          <motion.div style={{ position: "absolute", left: INSET, top: INSET, height: FILL_H, borderRadius: 12, background: C.raised, boxShadow: C.shadow, width: fillW, pointerEvents: "none" }} />
          {/* the thumb: a narrow grip at the fill's right edge, shown while the pointer is on the track */}
          <motion.div aria-hidden animate={{ opacity: hover || grab ? 1 : 0, scaleY: grab ? 1.06 : 1 }} transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ position: "absolute", top: (FILL_H + 2 * INSET - THUMB_H) / 2 + 6, height: THUMB_H - 12, left: thumbX, width: 4, borderRadius: 4, background: "var(--am-grip)", zIndex: 2, pointerEvents: "none" }} />
          <motion.button type="button" onClick={() => { if (value > MIN) { play("tick"); change(value - 1); } }} whileTap={{ scale: 0.82 }} transition={{ type: "spring", visualDuration: 0.18, bounce: 0 }} aria-label="Decrease amount" style={btn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </motion.button>
          <span style={{ position: "relative", zIndex: 3, width: 84, textAlign: "center", fontWeight: 500, fontSize: 18, lineHeight: "28px", color: C.sec, fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>${value.toFixed(2)}</span>
          <motion.button type="button" onClick={() => { if (value < MAX) { play("tick"); change(value + 1); } }} whileTap={{ scale: 0.82 }} transition={{ type: "spring", visualDuration: 0.18, bounce: 0 }} aria-label="Increase amount" style={btn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </motion.button>
        </div>
      </motion.div>

      <motion.div {...cv(SD.button)} style={{ padding: "14px 16px 16px" }}>
        <motion.button type="button" onClick={() => { play("chime"); onAdd(); }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", visualDuration: 0.2, bounce: 0 }}
          style={{
            width: "100%", height: 40, borderRadius: 999, border: "none", background: C.green, cursor: "pointer", color: "#fff",
            fontSize: 14, fontWeight: 500, letterSpacing: "-0.084px", fontFamily: "inherit",
            boxShadow: "var(--am-go)",
          }}>
          Add ${value.toFixed(2)}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function AddMoney({ size = "card" }: { size?: "card" | "big" }) {
  const { ref, s } = useFit(size);
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0); // Add or close plays the sheet in again
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <div style={{ width: BASE_W * s, height: BASE_H * s, position: "relative" }}>
        <div data-own-click className="addmoney" style={{ pointerEvents: "auto", position: "absolute", left: 0, top: 0, width: BASE_W, height: BASE_H, transform: `scale(${s})`, transformOrigin: "0 0", color: C.text }}>
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={run}
              style={{ position: "absolute", inset: 0 }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            >
              <Sheet onClose={() => setRun((r) => r + 1)} onAdd={() => setRun((r) => r + 1)} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
