// Date ruler: the last thirty days on a ruler under a fixed blue needle. Drag it
// sideways (or use the arrow keys) and it steps day by day, the label above
// rolling to the picked date, then settles on the nearest day with a spring.
// Sound: a detent on every day the needle passes.
// From balance.tsx (port of modal animaation / DateWheel.tsx). Light and dark, from the shared tokens.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";
import { play } from "../sound/sound";

// ── Storyboard constants (exact from source) ───────────────
const TODAY = new Date(2026, 3, 27);
const CELL_WIDTH = 36;
const VIEWPORT_WIDTH = 252;
const TICK_HEIGHT = 14;
const LABEL_Y = TICK_HEIGHT + 14;
const RANGE_DAYS = 30;

// Natural size: the label pill, the gap and the ruler.
const NAT_W = VIEWPORT_WIDTH + 24;
const NAT_H = 32 + 8 + LABEL_Y + 4;

const T = { text: "var(--k-text)", sub: "var(--k-text2)", muted: "var(--k-muted)", bar: "#3d6bff" };

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function formatDateLabel(date: Date): string {
  const diff = Math.round((TODAY.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const Svg = ({ size, children, style }: { size: number; children: ReactNode; style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0, ...style }}>{children}</svg>
);
const CalendarIcon = () => (
  <Svg size={18}><rect x="4" y="5.5" width="16" height="14.5" rx="2.5" style={{ stroke: T.sub }} strokeWidth="1.8" /><path d="M8 3.5v4M16 3.5v4M4 10h16" style={{ stroke: T.sub }} strokeWidth="1.8" strokeLinecap="round" /><circle cx="8.5" cy="13.5" r="1" style={{ fill: T.sub }} /><circle cx="12" cy="13.5" r="1" style={{ fill: T.sub }} /><circle cx="15.5" cy="13.5" r="1" style={{ fill: T.sub }} /><circle cx="8.5" cy="16.8" r="1" style={{ fill: T.sub }} /><circle cx="12" cy="16.8" r="1" style={{ fill: T.sub }} /></Svg>
);

// ── AnimatedLabel: odometer swap per character ─────────────
function AnimatedLabel({ value, style }: { value: string; style: CSSProperties }) {
  // the whole label swaps as one piece: per-letter swaps lose letters when the date changes fast
  const h = typeof style.lineHeight === "string" ? style.lineHeight : "1em";
  return (
    <span style={{ position: "relative", display: "inline-grid", overflow: "hidden", height: h, lineHeight: h, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", ...style }}>
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ y: "60%", opacity: 0, filter: "blur(2px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-60%", opacity: 0, filter: "blur(2px)" }}
          transition={{ type: "spring", visualDuration: 0.28, bounce: 0 }}
          style={{ gridArea: "1 / 1", display: "inline-block" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      if (size === "big") return setS(Math.min(2, (W - 120) / NAT_W, (H - 120) / NAT_H));
      let avail = H - 116;
      if (avail < NAT_H * 0.7) avail = H - 24;
      setS(Math.max(0.3, Math.min(1.3, (W - 40) / NAT_W, avail / NAT_H)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return [ref, s] as const;
}

export default function DateRuler({ size = "card" }: { size?: "card" | "big" }) {
  const reduced = useReducedMotion() ?? false;
  const [rootRef, scale] = useFit(size);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const [selected, setSelected] = useState<Date>(TODAY);
  const label = formatDateLabel(selected);

  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = -(RANGE_DAYS - 1); i <= 0; i++) {
      const d = new Date(TODAY);
      d.setDate(TODAY.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);
  const selectedIdx = useMemo(() => {
    const idx = days.findIndex((d) => sameDay(d, selected));
    return idx === -1 ? days.length - 1 : idx;
  }, [days, selected]);
  const x = useMotionValue(-selectedIdx * CELL_WIDTH);
  const lastIdxRef = useRef(selectedIdx);
  useEffect(() => {
    if (lastIdxRef.current === selectedIdx) return;
    lastIdxRef.current = selectedIdx;
    animate(x, -selectedIdx * CELL_WIDTH, reduced ? { duration: 0 } : { type: "spring", visualDuration: 0.4, bounce: 0 });
  }, [selectedIdx, x, reduced]);
  const indexFromX = (cx: number) => Math.max(0, Math.min(days.length - 1, Math.round(-cx / CELL_WIDTH)));
  const handleDrag = () => {
    const idx = indexFromX(x.get());
    if (idx !== lastIdxRef.current) {
      lastIdxRef.current = idx;
      play("detent", { gap: 40 });
      setSelected(days[idx]);
    }
  };
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const idx = indexFromX(x.get());
    lastIdxRef.current = idx;
    animate(x, -idx * CELL_WIDTH, { type: "spring", visualDuration: 0.32, bounce: 0.1, velocity: info.velocity.x });
    setSelected(days[idx]);
  };
  const step = (to: number) => {
    const idx = Math.max(0, Math.min(days.length - 1, to));
    if (idx !== selectedIdx) play("detent", { gap: 40 });
    setSelected(days[idx]);
  };
  const totalWidth = (days.length - 1) * CELL_WIDTH;
  const mask = "linear-gradient(to right, transparent, black 14%, black 86%, transparent)";

  return (
    <MotionConfig reducedMotion="user" transformPagePoint={(p) => ({ x: p.x / scaleRef.current, y: p.y / scaleRef.current })}>
      <style>{`.ruler-root [tabindex]:focus-visible{outline:2px solid rgba(52,181,98,.55);outline-offset:2px;border-radius:6px}.ruler-root{--dr-chip:rgba(255,255,255,.06);--dr-chip-ring:rgba(255,255,255,.06)}:root[data-theme="light"] .ruler-root{--dr-chip:oklch(0.22 0.008 264 / 0.045);--dr-chip-ring:oklch(0.22 0.008 264 / 0.07)}`}</style>
      <div ref={rootRef} className="ruler-root" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center" }}>
          <div data-own-click="" style={{ pointerEvents: "auto", width: NAT_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 16, background: "var(--dr-chip)", boxShadow: "inset 0 0 0 1px var(--dr-chip-ring)", padding: "6px 12px 6px 8px" }}>
              <CalendarIcon />
              <AnimatedLabel value={label} style={{ color: T.sub, fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px" }} />
            </div>
            <div
              style={{ position: "relative", width: VIEWPORT_WIDTH, height: LABEL_Y + 4, touchAction: "pan-y" }}
              tabIndex={0}
              role="slider"
              aria-label="Pick a day"
              aria-valuemin={1}
              aria-valuemax={days.length}
              aria-valuenow={selectedIdx + 1}
              aria-valuetext={label}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") { e.preventDefault(); step(selectedIdx - 1); }
                if (e.key === "ArrowRight") { e.preventDefault(); step(selectedIdx + 1); }
              }}
            >
              <div style={{ pointerEvents: "none", position: "absolute", left: "50%", top: 0, zIndex: 40, transform: "translateX(-50%)", borderRadius: 999, background: T.bar, width: 2, height: TICK_HEIGHT + 4 }} />
              <div style={{ position: "absolute", inset: 0, cursor: "grab", overflow: "hidden", maskImage: mask, WebkitMaskImage: mask }}>
                <motion.div
                  drag="x"
                  dragConstraints={{ left: -totalWidth, right: 0 }}
                  dragElastic={0.06}
                  dragMomentum
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  style={{ x, left: VIEWPORT_WIDTH / 2, position: "absolute", top: 0, willChange: "transform" }}
                >
                  <svg width={totalWidth + 2} height={LABEL_Y + 4} style={{ display: "block", overflow: "visible" }}>
                    {days.map((d, i) => {
                      const cx = i * CELL_WIDTH;
                      const isSel = i === selectedIdx;
                      return (
                        <g key={i}>
                          <line x1={cx} x2={cx} y1={0} y2={TICK_HEIGHT} style={{ stroke: T.text }} strokeOpacity={isSel ? 0 : 0.5} strokeWidth={1.5} />
                          {[1, 2, 3].map((m) => (
                            <line key={m} x1={cx + (m * CELL_WIDTH) / 4} x2={cx + (m * CELL_WIDTH) / 4} y1={TICK_HEIGHT - 6} y2={TICK_HEIGHT} style={{ stroke: T.text }} strokeOpacity={0.18} strokeWidth={1} />
                          ))}
                          <text x={cx} y={LABEL_Y} textAnchor="middle" fontSize={11} style={{ fill: isSel ? T.text : T.muted }} fontWeight={isSel ? 600 : 400} fontFamily="inherit">{d.getDate()}</text>
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
