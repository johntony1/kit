// Scheduler: weekly availability. Switch a day on and its time range unfolds;
// the pencil splits it into start / end pills and a pill opens the drum picker.
// Ported from ~/Documents/SCHEDULER (DayRow, TimePicker, Toggle, ClockIcon), same springs.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup, MotionConfig } from "framer-motion";
import gsap from "gsap";
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
  primary: "linear-gradient(180deg,#3cc06b,#22994c)",
};

/* ── springs (verbatim from the source) ─────────────────── */
const cardSpring = { type: "spring" as const, stiffness: 380, damping: 28, mass: 0.9 };
const EXPAND_SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;
const ITEM_SPRING = { type: "spring", stiffness: 420, damping: 26 } as const;
const FAST_SPRING = { type: "spring", stiffness: 520, damping: 24 } as const;
const BOUNCE_SPRING = { type: "spring", stiffness: 460, damping: 20 } as const;
const CARD_SPRING = { type: "spring", stiffness: 320, damping: 30 } as const;
const DRUM_SPRING = { type: "spring", stiffness: 280, damping: 28 } as const;
const TOGGLE_SPRING = { type: "spring", stiffness: 600, damping: 28, mass: 0.8 } as const;
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.32 + i * 0.075, duration: 0.28, ease: EASE } }),
};

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
type TimeValue = { hour: number; minute: number; period: "AM" | "PM" };
const fmt = (v: TimeValue) => `${HOURS[v.hour]}:${MINUTES[v.minute]}`;

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
      setScale(Math.min(big ? 1.6 : 1, (W - 32) / w, (H - clear) / r.h, (H - 16) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); ro.observe(inner); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, innerRef, box, scale };
}

/* ── icons ──────────────────────────────────────────────── */
const PencilFill = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M16.06 3.94a2.5 2.5 0 0 1 3.54 0l.46.46a2.5 2.5 0 0 1 0 3.54L9.4 18.6a2 2 0 0 1-.95.53l-4.1 1.03a.8.8 0 0 1-.97-.97l1.03-4.1a2 2 0 0 1 .53-.95L16.06 3.94Z" fill={T.faint} />
  </svg>
);
const CheckLine = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Chevron = ({ up }: { up?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: up ? "rotate(180deg)" : undefined }}>
    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── ClockIcon (gsap, real time) ────────────────────────── */
function ClockIcon() {
  const rootRef = useRef<SVGSVGElement>(null);
  const outerRef = useRef<SVGGElement>(null);
  const minuteRef = useRef<SVGGElement>(null);
  const hourRef = useRef<SVGGElement>(null);
  useEffect(() => {
    const root = rootRef.current, outer = outerRef.current, min = minuteRef.current, hr = hourRef.current;
    if (!root || !outer || !min || !hr) return;
    const now = new Date();
    const m = now.getMinutes(), s = now.getSeconds();
    const minuteDeg = m * 6 + s * 0.1, hourDeg = (now.getHours() % 12) * 30 + m * 0.5;
    gsap.set(min, { svgOrigin: "20 20", rotation: minuteDeg });
    gsap.set(hr, { svgOrigin: "20 20", rotation: hourDeg });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(root, { scale: 0.72, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.55)", delay: 0.05 });
    gsap.to(min, { rotation: minuteDeg + 360, duration: 60, ease: "none", repeat: -1, delay: (60 - s) - 60 });
    gsap.to(hr, { rotation: hourDeg + 360, duration: 43200, ease: "none", repeat: -1 });
    gsap.to(outer, { scale: 1.03, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true, svgOrigin: "20 20" });
    return () => { gsap.killTweensOf([root, min, hr, outer]); };
  }, []);
  return (
    <svg ref={rootRef} width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ display: "block", transformOrigin: "20px 20px" }} aria-hidden="true">
      <defs>
        <linearGradient id="scheduler-body" x1="52.19" y1="13.45" x2="13.55" y2="-12.45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3374F6" /><stop offset="1" stopColor="#00D3ED" />
        </linearGradient>
      </defs>
      <g ref={outerRef}>
        <path d="M19.219 3.056C23.478 2.228 27.215 2.933 30.086 4.869C32.956 6.806 35.01 10.007 35.838 14.265L36.801 19.219C37.628 23.478 36.923 27.215 34.987 30.086C33.051 32.956 29.849 35.01 25.591 35.837L20.637 36.801C16.379 37.628 12.641 36.923 9.77 34.987C6.9 33.05 4.847 29.849 4.019 25.591L3.056 20.637C2.228 16.379 2.933 12.641 4.869 9.77C6.806 6.9 10.007 4.846 14.265 4.019Z" fill="url(#scheduler-body)" stroke="rgba(255,255,255,.18)" strokeWidth="0.954" />
      </g>
      <ellipse cx="19.93" cy="19.94" rx="12.6" ry="12.8" transform="rotate(3 19.93 19.94)" fill="#f4f6f4" />
      <g ref={minuteRef}><rect x="19.531" y="8.5" width="0.938" height="11.8" rx="0.469" fill="#222" /></g>
      <g ref={hourRef}><rect x="19.2" y="12" width="1.6" height="8.2" rx="0.804" fill="#222" /></g>
      <circle cx="19.917" cy="20.011" r="1.34" fill="#f4f6f4" stroke="rgba(0,0,0,.12)" strokeWidth=".4" />
    </svg>
  );
}

/* ── Toggle (Figma dims, same spring) ───────────────────── */
const TW = 51.406, TH = 25.703, INSET = 2.57, THUMB_W = 28.273, TRAVEL = TW - THUMB_W - INSET * 2;
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <motion.button type="button" role="switch" aria-checked={checked} aria-label={label} className="scheduler-focus"
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

/* ── TimePicker drum ────────────────────────────────────── */
const ITEM_H = 40, DRUM_H = ITEM_H * 3;
function Drum({ values, index, onChange, delay = 0 }: { values: string[]; index: number; onChange: (i: number) => void; delay?: number }) {
  const arrow = { background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: T.faint, borderRadius: 6 } as const;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...CARD_SPRING, delay }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, userSelect: "none" }}>
      <motion.button type="button" aria-label="Previous" className="scheduler-focus" onClick={() => { play("detent"); onChange((index - 1 + values.length) % values.length); }}
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} style={arrow}><Chevron up /></motion.button>
      <div style={{ position: "relative", width: 52, height: DRUM_H }}>
        <div style={{ position: "absolute", top: ITEM_H, left: 0, right: 0, height: ITEM_H, background: "rgba(255,255,255,.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)", borderRadius: 8 }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", maskImage: "linear-gradient(to bottom, transparent 0%, black 28%, black 72%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 28%, black 72%, transparent 100%)" }}>
          <motion.div animate={{ y: ITEM_H * (1 - index) }} transition={DRUM_SPRING} style={{ position: "absolute", left: 0, right: 0 }}>
            {values.map((v, i) => {
              const sel = Math.min(Math.abs(i - index), values.length - Math.abs(i - index)) === 0;
              return (
                <div key={i} onClick={() => { if (i !== index) play("detent"); onChange(i); }}
                  style={{ height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center", fontSize: sel ? 18 : 14, fontWeight: 500, letterSpacing: "-0.04em", color: sel ? T.text : T.faint, transition: "font-size 0.18s ease, color 0.18s ease", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}>
                  {v}
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
      <motion.button type="button" aria-label="Next" className="scheduler-focus" onClick={() => { play("detent"); onChange((index + 1) % values.length); }}
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} style={arrow}><Chevron /></motion.button>
    </motion.div>
  );
}

function TimePicker({ value, onChange }: { value: TimeValue; onChange: (v: TimeValue) => void }) {
  const set = (p: Partial<TimeValue>) => onChange({ ...value, ...p });
  return (
    <motion.div initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }} transition={CARD_SPRING}
      style={{ transformOrigin: "top center", background: T.surface, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.07)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
      <Drum values={HOURS} index={value.hour} onChange={(h) => set({ hour: h })} delay={0.05} />
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.2 }}
        style={{ fontSize: 18, fontWeight: 600, color: T.faint, paddingBottom: 2, userSelect: "none", lineHeight: 1 }}>:</motion.span>
      <Drum values={MINUTES} index={value.minute} onChange={(m) => set({ minute: m })} delay={0.07} />
      <div style={{ width: 8 }} />
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...BOUNCE_SPRING, delay: 0.1 }} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(["AM", "PM"] as const).map((p) => {
          const on = value.period === p;
          return (
            <motion.button type="button" key={p} className="scheduler-focus" onClick={() => { if (!on) play("tick"); set({ period: p }); }}
              animate={{ backgroundColor: on ? "#2fae5c" : "rgba(255,255,255,0.05)", color: on ? "#ffffff" : T.muted }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ border: "none", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 500, letterSpacing: "-0.03em", minWidth: 44, boxShadow: on ? "inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 1px rgba(0,0,0,.35)" : "inset 0 0 0 1px rgba(255,255,255,.04)" }}>
              {p}
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

/* ── DayRow ─────────────────────────────────────────────── */
const PILL = { background: "rgba(255,255,255,.05)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)", borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 0, border: "none", cursor: "pointer" } as const;
const TXT = { fontSize: 14, fontWeight: 500, letterSpacing: "-0.084px", lineHeight: "20px", color: T.text, fontVariantNumeric: "tabular-nums" } as const;

function DayRow({ label, checked, onChange, index }: { label: string; checked: boolean; onChange: (v: boolean) => void; index: number }) {
  const [editing, setEditing] = useState(false);
  const [activeTime, setActiveTime] = useState<"start" | "end" | null>(null);
  const [start, setStart] = useState<TimeValue>({ hour: 7, minute: 0, period: "AM" });
  const [end, setEnd] = useState<TimeValue>({ hour: 9, minute: 0, period: "PM" });
  const toggle = (v: boolean) => { if (!v) { setEditing(false); setActiveTime(null); } onChange(v); };
  const ring = (on: boolean) => (on ? `inset 0 0 0 1.5px ${T.green}` : "inset 0 0 0 0px rgba(52,181,98,0)");
  const activeValue = activeTime === "start" ? start : end;
  const setActive = activeTime === "start" ? setStart : setEnd;

  return (
    <motion.div custom={index} variants={rowVariants} initial="hidden" animate="visible" layout transition={{ layout: EXPAND_SPRING }} style={{ borderRadius: 12 }}>
      <motion.div layout
        animate={{ backgroundColor: checked ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.045)", boxShadow: checked ? "inset 0 0 0 1px rgba(255,255,255,0.08)" : "inset 0 0 0 1px rgba(255,255,255,0.03)", paddingTop: 8, paddingBottom: 8, paddingLeft: checked ? 8 : 0, paddingRight: checked ? 8 : 0 }}
        transition={EXPAND_SPRING} style={{ borderRadius: 12 }}>
        <motion.div layout animate={{ paddingLeft: checked ? 4 : 12, paddingRight: checked ? 4 : 12 }} transition={EXPAND_SPRING}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ ...TXT, color: checked ? T.text : T.text2, whiteSpace: "nowrap", userSelect: "none" }}>{label}</span>
          <Toggle checked={checked} onChange={toggle} label={`${label} available`} />
        </motion.div>

        <AnimatePresence initial={false}>
          {checked && (
            <motion.div key="panel" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={EXPAND_SPRING} style={{ overflow: "hidden" }}>
              <div style={{ height: 12 }} />
              <div style={{ position: "relative" }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {!editing ? (
                    <motion.div key="display" initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1, transition: { ...ITEM_SPRING, delay: 0.06 } }} exit={{ opacity: 0, scaleX: 0.55, transition: FAST_SPRING }}
                      style={{ ...PILL, cursor: "default" }}>
                      <span style={TXT}>{fmt(start)} {start.period} <span style={{ color: T.faint }}>to</span> {fmt(end)} {end.period}</span>
                      <motion.button type="button" aria-label="Edit time" className="scheduler-focus" onClick={() => { play("open"); setEditing(true); }}
                        initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0, transition: { ...BOUNCE_SPRING, delay: 0.1 } }} exit={{ scale: 0, rotate: 90, transition: FAST_SPRING }}
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.88 }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 6 }}>
                        <PencilFill />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div key="edit" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                        <motion.button type="button" className="scheduler-focus" onClick={() => { play("tap"); setActiveTime((p) => (p === "start" ? null : "start")); }}
                          initial={{ x: 24, opacity: 0, scale: 0.88 }} animate={{ x: 0, opacity: 1, scale: 1, boxShadow: ring(activeTime === "start") }} exit={{ x: 18, opacity: 0, scale: 0.9, transition: FAST_SPRING }} transition={ITEM_SPRING}
                          style={{ ...PILL, flex: 1, gap: 6 }}>
                          <span style={TXT}>{fmt(start)}</span><span style={{ ...TXT, color: T.faint }}>{start.period}</span>
                        </motion.button>
                        <motion.button type="button" className="scheduler-focus" onClick={() => { play("tap"); setActiveTime((p) => (p === "end" ? null : "end")); }}
                          initial={{ x: -24, opacity: 0, scale: 0.88 }} animate={{ x: 0, opacity: 1, scale: 1, boxShadow: ring(activeTime === "end") }} exit={{ x: -18, opacity: 0, scale: 0.9, transition: FAST_SPRING }} transition={{ ...ITEM_SPRING, delay: 0.03 }}
                          style={{ ...PILL, flex: 1, gap: 6 }}>
                          <span style={TXT}>{fmt(end)}</span><span style={{ ...TXT, color: T.faint }}>{end.period}</span>
                        </motion.button>
                        <motion.button type="button" aria-label="Confirm" className="scheduler-focus" onClick={() => { play("check"); setEditing(false); setActiveTime(null); }}
                          initial={{ scale: 0, y: 3 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, transition: FAST_SPRING }} transition={{ ...BOUNCE_SPRING, delay: 0.09 }}
                          whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.09)" }} whileTap={{ scale: 0.92 }}
                          style={{ ...PILL, flexShrink: 0, padding: "8px 12px" }}>
                          <CheckLine />
                        </motion.button>
                      </div>
                      <AnimatePresence initial={false}>
                        {activeTime !== null && (
                          <motion.div key="picker" initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }} transition={EXPAND_SPRING} style={{ transformOrigin: "top center", overflow: "hidden" }}>
                            <TimePicker value={activeValue} onChange={setActive} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ── component ──────────────────────────────────────────── */
export default function Scheduler({ size = "card" }: { size?: "card" | "big" }) {
  const big = size === "big";
  const { rootRef, innerRef, box, scale } = useFit(size);
  const count = big ? 5 : box.h && box.h < 260 ? 2 : 3;
  const days = ALL_DAYS.slice(0, count);
  const [on, setOn] = useState<Record<string, boolean>>({});

  const body = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.2, ease: "easeOut" }}
      style={{ background: T.raised, boxShadow: T.raisedShadow, borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <LayoutGroup>
        {days.map((d, i) => <DayRow key={d} label={d} index={i} checked={!!on[d]} onChange={(v) => setOn((p) => ({ ...p, [d]: v }))} />)}
      </LayoutGroup>
    </motion.div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <style>{`.scheduler-focus:focus-visible{outline:2px solid ${T.green};outline-offset:2px}`}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click style={{ pointerEvents: "auto", width: 350, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={cardSpring}
            style={big ? { background: T.surface, borderRadius: 20, padding: "12px 4px 4px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(0,0,0,.5), 0 12px 32px -12px rgba(0,0,0,.6)" } : undefined}>
            {big && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.22, ease: EASE }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
                <ClockIcon />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", color: T.text }}>15 minutes meeting</span>
                  <span style={{ fontSize: 13, lineHeight: "18px", color: T.muted }}>Event type</span>
                </div>
              </motion.div>
            )}
            {body}
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
