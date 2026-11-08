// Time picker. Split out of Scheduler, ported from ~/Documents/SCHEDULER (TimePicker), same springs.
// Hour and minute drums that turn by drag, mouse wheel, the arrows or a tap on a number,
// settling on the 280/28 drum spring; AM / PM beside them. The lists wrap around.
// Sounds: a detent for every step a drum turns (gapped, so a fast wheel stays light),
// tick when AM / PM changes.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, MotionConfig, animate, useMotionValue } from "framer-motion";
import { play } from "../sound/sound";

/* ── tokens ─────────────────────────────────────────────── */
const T = {
  surface: "#242624",
  text: "#e3e8e3",
  muted: "#8b968f",
  faint: "#5d6862",
  green: "#34b562",
};

/* ── springs (verbatim from the source) ─────────────────── */
const BOUNCE_SPRING = { type: "spring", stiffness: 460, damping: 20 } as const;
const CARD_SPRING = { type: "spring", stiffness: 320, damping: 30 } as const;
const DRUM_SPRING = { type: "spring", stiffness: 280, damping: 28 } as const;

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
type Period = "AM" | "PM";

/* ── fit: scale the picker into the tile ── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const root = rootRef.current, inner = innerRef.current;
    if (!root || !inner) return;
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight, w = inner.offsetWidth, h = inner.offsetHeight;
      if (!W || !H || !w || !h) return;
      const big = size === "big";
      const clear = big ? 120 : H < 260 ? 84 : 116;
      setScale(Math.max(0.3, Math.min(big ? 2 : 1.2, (W - 32) / w, (H - clear) / h)));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); ro.observe(inner); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, innerRef, scale };
}

const Chevron = ({ up }: { up?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: up ? "rotate(180deg)" : undefined }}>
    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── drum: the list is drawn three times so it can turn past either end;
 *    pos stays inside the middle copy, jumping by one copy where nothing shows ── */
const ITEM_H = 40, DRUM_H = ITEM_H * 3;
function Drum({ values, label, initial, delay = 0 }: { values: string[]; label: string; initial: number; delay?: number }) {
  const n = values.length;
  const pos = useRef(n + initial);
  const [index, setIndex] = useState(initial);
  const y = useMotionValue(ITEM_H * (1 - pos.current));
  const viewRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; last: number } | null>(null);
  const wheelAcc = useRef(0);
  const moved = useRef(false); // a drag that turned the drum should not also count as a tap

  const step = (d: number) => {
    if (!d) return;
    let k = pos.current;
    for (let i = 0; i < Math.abs(d); i++) {
      k += Math.sign(d);
      if (k < n) { k += n; y.jump(y.get() - n * ITEM_H); }
      if (k >= 2 * n) { k -= n; y.jump(y.get() + n * ITEM_H); }
    }
    pos.current = k;
    setIndex(k % n);
    play("detent", { gap: 40 });
    animate(y, ITEM_H * (1 - k), DRUM_SPRING);
  };
  const stepRef = useRef(step);
  stepRef.current = step;

  // wheel needs a non-passive listener so the page does not scroll under the drum
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaMode !== 0) { stepRef.current(Math.sign(e.deltaY)); return; }
      wheelAcc.current += e.deltaY;
      const steps = Math.trunc(wheelAcc.current / 36);
      if (steps) { wheelAcc.current -= steps * 36; stepRef.current(Math.max(-3, Math.min(3, steps))); }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // drag: one step per row height dragged (in screen px, so the card's scale does not matter)
  const rowPx = () => (viewRef.current ? viewRef.current.getBoundingClientRect().height / 3 : ITEM_H) * 0.7;
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { id: e.pointerId, last: e.clientY };
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const px = rowPx();
    const steps = Math.trunc((d.last - e.clientY) / px);
    if (steps) { d.last -= steps * px; moved.current = true; step(steps); }
  };
  const onUp = () => { drag.current = null; };

  const arrow = { background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: T.faint, borderRadius: 6 } as const;
  const all = [...values, ...values, ...values];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...CARD_SPRING, delay }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, userSelect: "none" }}>
      <motion.button type="button" aria-label={`Previous ${label}`} className="time-picker-focus" onClick={() => step(-1)}
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} style={arrow}><Chevron up /></motion.button>
      <div ref={viewRef} role="spinbutton" aria-label={label} aria-valuetext={values[index]} tabIndex={0} className="time-picker-focus"
        onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); step(-1); } if (e.key === "ArrowDown") { e.preventDefault(); step(1); } }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ position: "relative", width: 52, height: DRUM_H, cursor: "ns-resize", touchAction: "none", borderRadius: 8 }}>
        <div style={{ position: "absolute", top: ITEM_H, left: 0, right: 0, height: ITEM_H, background: "rgba(255,255,255,.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)", borderRadius: 8 }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", maskImage: "linear-gradient(to bottom, transparent 0%, black 28%, black 72%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 28%, black 72%, transparent 100%)" }}>
          <motion.div style={{ position: "absolute", left: 0, right: 0, y }}>
            {all.map((v, i) => {
              const sel = i % n === index;
              return (
                <div key={i} onClick={() => { if (moved.current) return; const off = (i % n) - index; const d = Math.abs(off) <= n / 2 ? off : off - Math.sign(off) * n; step(d); }}
                  style={{ height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center", fontSize: sel ? 18 : 14, fontWeight: 500, letterSpacing: "-0.04em", color: sel ? T.text : T.faint, transition: "font-size 0.18s ease, color 0.18s ease", fontVariantNumeric: "tabular-nums" }}>
                  {v}
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
      <motion.button type="button" aria-label={`Next ${label}`} className="time-picker-focus" onClick={() => step(1)}
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} style={arrow}><Chevron /></motion.button>
    </motion.div>
  );
}

export default function TimePicker({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, innerRef, scale } = useFit(size);
  const [period, setPeriod] = useState<Period>("AM");

  return (
    <MotionConfig reducedMotion="user">
      <style>{`.time-picker-focus:focus-visible{outline:2px solid ${T.green};outline-offset:2px}`}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click style={{ pointerEvents: "auto", position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <motion.div initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={CARD_SPRING}
            style={{ transformOrigin: "top center", background: T.surface, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.07)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Drum values={HOURS} label="Hour" initial={6} delay={0.05} />
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.2 }}
              style={{ fontSize: 18, fontWeight: 600, color: T.faint, paddingBottom: 2, userSelect: "none", lineHeight: 1 }}>:</motion.span>
            <Drum values={MINUTES} label="Minute" initial={0} delay={0.07} />
            <div style={{ width: 8 }} />
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...BOUNCE_SPRING, delay: 0.1 }} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(["AM", "PM"] as const).map((p) => {
                const on = period === p;
                return (
                  <motion.button type="button" key={p} className="time-picker-focus" aria-pressed={on} onClick={() => { if (!on) play("tick"); setPeriod(p); }}
                    animate={{ backgroundColor: on ? "#2fae5c" : "rgba(255,255,255,0.05)", color: on ? "#ffffff" : T.muted }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    style={{ border: "none", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 500, letterSpacing: "-0.03em", minWidth: 44, boxShadow: on ? "inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 1px rgba(0,0,0,.35)" : "inset 0 0 0 1px rgba(255,255,255,.04)" }}>
                    {p}
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
