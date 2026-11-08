// Day toggle. Split out of Scheduler, ported from ~/Documents/SCHEDULER (DayRow, Toggle), same springs.
// Switch a day on and its time range unfolds; switch it off and the range folds away.
// Sounds: on / off as the switch flips.
import { useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup, MotionConfig } from "framer-motion";
import { play } from "../sound/sound";

/* ── tokens ─────────────────────────────────────────────── */
const T = {
  surface: "#242624",
  raised: "linear-gradient(180deg,#2b2d2b,#242624)",
  raisedShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)",
  text: "#e3e8e3",
  text2: "#c2cbc4",
  muted: "#8b968f",
  faint: "#5d6862",
  green: "#34b562",
};

/* ── springs (verbatim from the source) ─────────────────── */
const cardSpring = { type: "spring" as const, stiffness: 380, damping: 28, mass: 0.9 };
const EXPAND_SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;
const ITEM_SPRING = { type: "spring", stiffness: 420, damping: 26 } as const;
const TOGGLE_SPRING = { type: "spring", stiffness: 600, damping: 28, mass: 0.8 } as const;
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.32 + i * 0.075, duration: 0.28, ease: EASE } }),
};

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/* ── fit: scale the widget into the tile, keep it inside when it grows ── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const rest = useRef({ h: 0, W: 0, H: 0 });
  useLayoutEffect(() => {
    const root = rootRef.current, inner = innerRef.current;
    if (!root || !inner) return;
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight, w = inner.offsetWidth, h = inner.offsetHeight;
      if (!W || !H || !w || !h) return;
      const r = rest.current;
      if (r.W !== W || r.H !== H) { r.W = W; r.H = H; r.h = h; setBox({ w: W, h: H }); }
      if (h < r.h) r.h = h;
      const big = size === "big";
      const clear = big ? 120 : H < 260 ? 84 : 116;
      setScale(Math.min(big ? 1.6 : 1, (W - 32) / w, (H - clear) / r.h, (H - 40) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); ro.observe(inner); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, innerRef, box, scale };
}

/* ── Toggle (Figma dims, same spring) ───────────────────── */
const TW = 51.406, TH = 25.703, INSET = 2.57, THUMB_W = 28.273, TRAVEL = TW - THUMB_W - INSET * 2;
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <motion.button type="button" role="switch" aria-checked={checked} aria-label={label} className="day-toggle-focus"
      onClick={() => { play(checked ? "off" : "on"); onChange(!checked); }} whileTap={{ scale: 0.95 }} transition={TOGGLE_SPRING}
      style={{ position: "relative", width: TW, height: TH, borderRadius: TH / 2, border: "none", padding: 0, cursor: "pointer", flexShrink: 0, overflow: "hidden", background: "transparent" }}>
      <motion.div animate={{ backgroundColor: checked ? T.green : "#3a3d3a", opacity: checked ? 1 : 0.9 }} transition={{ duration: 0.18, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: "inherit", boxShadow: "inset 0 1px 2px rgba(0,0,0,.35)" }} />
      <motion.div
        animate={{ x: checked ? TRAVEL : 0, boxShadow: checked ? "0 0 1.3px rgba(0,0,0,.4), 0 2.5px 10px rgba(0,0,0,.25)" : "0 2.5px 5px rgba(0,0,0,.25), 0 1.3px 2.5px rgba(0,0,0,.3)" }}
        transition={TOGGLE_SPRING}
        style={{ position: "absolute", top: INSET, left: INSET, width: THUMB_W, height: TH - INSET * 2, borderRadius: (TH - INSET * 2) / 2, background: "#f4f6f4", pointerEvents: "none" }} />
    </motion.button>
  );
}

/* ── DayRow ─────────────────────────────────────────────── */
const PILL = { background: "rgba(255,255,255,.05)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)", borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 0, border: "none", cursor: "pointer" } as const;
const TXT = { fontSize: 14, fontWeight: 500, letterSpacing: "-0.084px", lineHeight: "20px", color: T.text, fontVariantNumeric: "tabular-nums" } as const;

function DayRow({ label, checked, onChange, index }: { label: string; checked: boolean; onChange: (v: boolean) => void; index: number }) {
  return (
    <motion.div custom={index} variants={rowVariants} initial="hidden" animate="visible" layout transition={{ layout: EXPAND_SPRING }} style={{ borderRadius: 12 }}>
      <motion.div layout
        animate={{ backgroundColor: checked ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.045)", boxShadow: checked ? "inset 0 0 0 1px rgba(255,255,255,0.08)" : "inset 0 0 0 1px rgba(255,255,255,0.03)", paddingTop: 8, paddingBottom: 8, paddingLeft: checked ? 8 : 0, paddingRight: checked ? 8 : 0 }}
        transition={EXPAND_SPRING} style={{ borderRadius: 12 }}>
        <motion.div layout animate={{ paddingLeft: checked ? 4 : 12, paddingRight: checked ? 4 : 12 }} transition={EXPAND_SPRING}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ ...TXT, color: checked ? T.text : T.text2, whiteSpace: "nowrap", userSelect: "none" }}>{label}</span>
          <Toggle checked={checked} onChange={onChange} label={`${label} available`} />
        </motion.div>

        <AnimatePresence initial={false}>
          {checked && (
            <motion.div key="panel" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={EXPAND_SPRING} style={{ overflow: "hidden" }}>
              <div style={{ height: 12 }} />
              <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1, transition: { ...ITEM_SPRING, delay: 0.06 } }}
                style={{ ...PILL, cursor: "default" }}>
                <span style={TXT}>07:00 AM <span style={{ color: T.faint }}>to</span> 09:00 PM</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ── component ──────────────────────────────────────────── */
export default function DayToggle({ size = "card" }: { size?: "card" | "big" }) {
  const big = size === "big";
  const { rootRef, innerRef, box, scale } = useFit(size);
  const count = big ? 5 : box.h && box.h < 260 ? 2 : 3;
  const days = ALL_DAYS.slice(0, count);
  const [on, setOn] = useState<Record<string, boolean>>({});

  return (
    <MotionConfig reducedMotion="user">
      <style>{`.day-toggle-focus:focus-visible{outline:2px solid ${T.green};outline-offset:2px}`}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click style={{ pointerEvents: "auto", width: 350, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={cardSpring}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.2, ease: "easeOut" }}
              style={{ background: T.raised, boxShadow: T.raisedShadow, borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <LayoutGroup>
                {days.map((d, i) => <DayRow key={d} label={d} index={i} checked={!!on[d]} onChange={(v) => setOn((p) => ({ ...p, [d]: v }))} />)}
              </LayoutGroup>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
