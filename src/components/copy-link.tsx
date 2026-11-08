// Copy link: the link row from the share sheet. Press Copy link and the button squishes,
// flips to Copied and fires a GSAP dot burst; it flips back after a couple of seconds.
// Split out of the old share.tsx (ported from ~/Documents/Share animation/src/ShareModal.tsx),
// same springs and timings.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { play } from "../sound/sound";

/* ── tokens ─────────────────────────────────────────────── */
const T = {
  surface: "#242624",
  raised: "linear-gradient(180deg,#2b2d2b,#242624)",
  raisedShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)",
  text2: "#c2cbc4",
  muted: "#8b968f",
  green: "#34b562",
};

/* ── timing + motion (verbatim) ─────────────────────────── */
const COPY_BTN = { pressScale: 0.88, spring: { type: "spring" as const, visualDuration: 0.3, bounce: 0.55 }, resetMs: 2200 };
const BURST = { count: 12, radius: 48, duration: 0.55, colors: ["#34b562", "#5fd38a", "#9be6b4", "#22994c", "#1f8a45", "#3cc06b", "#2fae5c", "#7ddca0", "#c3f0d3", "#e3f7ec", "#34b562", "#5fd38a"] };

/* ── particles (fixed to the page, so they ignore the card scale) ── */
function fireBurst(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < BURST.count; i++) {
    const dot = document.createElement("span");
    const angle = (i / BURST.count) * Math.PI * 2;
    Object.assign(dot.style, { position: "fixed", width: "6px", height: "6px", borderRadius: "50%", background: BURST.colors[i % BURST.colors.length], left: `${cx}px`, top: `${cy}px`, pointerEvents: "none", zIndex: "9999", transform: "translate(-50%,-50%)" });
    document.body.appendChild(dot);
    gsap.fromTo(dot, { x: 0, y: 0, opacity: 1, scale: 1 }, { x: Math.cos(angle) * BURST.radius, y: Math.sin(angle) * BURST.radius, opacity: 0, scale: 0, duration: BURST.duration, ease: "power2.out", onComplete: () => dot.remove() });
  }
}

/* ── fit: scale into the tile ── */
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
      setScale(Math.min(big ? 1.6 : 1, (W - 32) / w, (H - clear) / h, (H - 16) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); ro.observe(inner); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, innerRef, scale };
}

const Check = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ── component ──────────────────────────────────────────── */
export default function CopyLink({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, innerRef, scale } = useFit(size);
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const copyRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  const handleCopy = () => {
    if (copied) return;
    setCopied(true);
    play("copy");
    try { void navigator.clipboard?.writeText("https://orevbajohn.me").catch(() => {}); } catch { /* clipboard unavailable */ }
    if (copyRef.current && !reduced) fireBurst(copyRef.current);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), COPY_BTN.resetMs);
  };

  return (
    <MotionConfig reducedMotion="user">
      <style>{`.copylink-focus:focus-visible{outline:2px solid ${T.green};outline-offset:2px}`}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click style={{ pointerEvents: "auto", width: 300, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 12px 12px 16px", borderRadius: 20, background: T.surface, boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(0,0,0,.5), 0 12px 32px -12px rgba(0,0,0,.6)" }}>
            <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://orevbajohn.me</span>
            <motion.button ref={copyRef} type="button" className="copylink-focus" onClick={handleCopy} whileTap={{ scale: COPY_BTN.pressScale }} transition={COPY_BTN.spring} aria-label="Copy link"
              style={{ position: "relative", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 6, borderRadius: 8, cursor: "pointer", border: 0, background: T.raised, boxShadow: T.raisedShadow }}>
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span key="copied" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{ display: "flex", alignItems: "center", gap: 4, color: T.green, padding: "0 4px", fontWeight: 500, fontSize: 14, lineHeight: "20px", whiteSpace: "nowrap" }}>
                    <Check /> Copied!
                  </motion.span>
                ) : (
                  <motion.span key="copy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{ color: T.text2, padding: "0 4px", fontWeight: 500, fontSize: 14, lineHeight: "20px", whiteSpace: "nowrap" }}>
                    Copy link
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
