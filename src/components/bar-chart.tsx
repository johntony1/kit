// Bar chart: fourteen days of balance as bars. Hover (or drag a finger) across
// them and each bar lifts a tooltip with its day and amount while the others dim.
// Sound: a tick as the pointer moves onto each new bar.
// From balance.tsx (port of modal animaation / BarChart.tsx), dark.
import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { play } from "../sound/sound";

// ── Storyboard constants (exact from source) ───────────────
const TOOLTIP_SPRING = { type: "spring", duration: 0.3, bounce: 0 } as const;
const EASE_OUT = [0.2, 0, 0, 1] as const;
const BAR_HEIGHTS = [39, 61, 28, 16, 56, 28, 23, 16, 39, 28, 28, 47, 69, 102] as const;
const BAR_DATA = BAR_HEIGHTS.map((h, i) => ({
  label: `Apr ${i + 14}`,
  amount: `$${(h * 18.5 + 50).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
}));
const MAX_HEIGHT = 102;

// Natural size: the chart plus room above the tallest bar for its tooltip.
const NAT_W = 322;
const NAT_H = MAX_HEIGHT + 12 + 52;

const T = { text: "#e3e8e3", bar: "#3d6bff" };

type Align = "start" | "center" | "end";

function Tooltip({ label, amount, reduced, align }: { label: string; amount: string; reduced: boolean; align: Align }) {
  const initial = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, filter: "blur(4px)" };
  const show = reduced ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" };
  const positionX = align === "start" ? { left: -7, right: "auto", x: 0 } : align === "end" ? { left: "auto", right: -7, x: 0 } : { left: "50%", right: "auto", x: "-50%" };
  const arrowX = align === "start" ? "14px" : align === "end" ? "calc(100% - 14px)" : "50%";
  const transformOrigin = align === "start" ? "14px 100%" : align === "end" ? "calc(100% - 14px) 100%" : "50% 100%";
  return (
    <motion.div
      role="tooltip"
      style={{ position: "absolute", zIndex: 20, pointerEvents: "none", bottom: "calc(100% + 6px)", ...positionX, transformOrigin, willChange: "transform, opacity, filter" } as never}
      initial={initial}
      animate={show}
      exit={initial}
      transition={TOOLTIP_SPRING}
    >
      <div style={{ borderRadius: 8, background: T.text, padding: "6px 10px", whiteSpace: "nowrap", boxShadow: "0 6px 16px -4px rgba(0,0,0,0.5), 0 2px 4px -1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)" }}>
        <div style={{ fontVariantNumeric: "tabular-nums", fontSize: 11, lineHeight: "14px", color: "rgba(25,26,25,.55)" }}>{label}</div>
        <div style={{ fontVariantNumeric: "tabular-nums", fontSize: 13, lineHeight: "16px", fontWeight: 500, color: "#191a19" }}>{amount}</div>
      </div>
      <svg aria-hidden="true" width="10" height="5" viewBox="0 0 10 5" style={{ position: "absolute", top: "100%", left: arrowX, transform: "translateX(-50%)", marginTop: -1 }}>
        <path d="M0 0h10L5 5z" fill={T.text} />
      </svg>
    </motion.div>
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
      setS(Math.max(0.3, Math.min(1.2, (W - 40) / NAT_W, avail / NAT_H)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return [ref, s] as const;
}

export default function BarChart({ size = "card" }: { size?: "card" | "big" }) {
  const reduced = useReducedMotion() ?? false;
  const [rootRef, scale] = useFit(size);
  const [hovered, setHovered] = useState<number | null>(null);
  const scaleBar = MAX_HEIGHT / Math.max(...BAR_HEIGHTS);
  const count = BAR_HEIGHTS.length;
  const enter = (i: number) => {
    if (hovered !== i) play("tick", { gap: 40 });
    setHovered(i);
  };
  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center" }}>
          <div
            data-own-click=""
            role="group"
            aria-label="Balance per day, April 14 to 27"
            // Touch: let the finger slide across the bars instead of staying captured by the first one.
            onPointerDown={(e) => { const t = e.target as Element; if (t.hasPointerCapture?.(e.pointerId)) t.releasePointerCapture(e.pointerId); }}
            onPointerLeave={() => setHovered(null)}
            style={{ pointerEvents: "auto", position: "relative", width: NAT_W, height: NAT_H, touchAction: "pan-y" }}
          >
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: MAX_HEIGHT + 12, display: "flex", alignItems: "flex-end", padding: 6, boxSizing: "border-box" }}>
              {BAR_HEIGHTS.map((h, i) => {
                const barHeight = Math.max(8, Math.round(h * scaleBar));
                const isHovered = hovered === i;
                const isDimmed = hovered !== null && !isHovered;
                const align: Align = i === 0 ? "start" : i === count - 1 ? "end" : "center";
                return (
                  <div key={i} style={{ display: "flex", height: "100%", flex: 1, alignItems: "flex-end", justifyContent: "center" }} onPointerEnter={() => enter(i)}>
                    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: 14 }}>
                      <AnimatePresence>
                        {isHovered && <Tooltip label={BAR_DATA[i].label} amount={BAR_DATA[i].amount} reduced={reduced} align={align} />}
                      </AnimatePresence>
                      <motion.div
                        style={{ width: 14, height: barHeight, borderRadius: 4, background: T.bar, boxShadow: "inset 0 4px 8px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,0,0,.25)", willChange: "transform, opacity" }}
                        animate={{ opacity: isDimmed ? 0.4 : 1 }}
                        transition={{ opacity: { duration: 0.18, ease: EASE_OUT } }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
