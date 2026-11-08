/* Status pill. Split out of Segmented tab, ported from johntony1/segmented-tab-animation.
 * Tap Set status for the popover, pick a status and the pill morphs to fit it.
 *
 * "Set status" opens popover:
 *    0ms   outer pill: scale 0.88→1, y +10→0, opacity 0→1 (spring 440/32)
 *   50ms   icons bounce in, 45ms apart (spring 520/22)
 *  exit    fade + scale 0.88 (120ms ease-in)
 *
 * Status picked → pill morph:
 *    0ms   pill springs to the selected-status size (layoutId morph)
 *   50ms   icon bounces in  |  80ms label shimmer-slides in  |  110ms × springs in
 *
 * Sounds: open / close with the popover, pop when a status is picked, remove on ×.
 * Every size is in em (1em = 14px at size 1) so the widget scales without
 * putting a CSS transform above the layout animation. */

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { play } from "../sound/sound";

const e = (px: number) => `${px / 14}em`;

const C = {
  strong: "#e3e8e3",
  soft: "#8b968f",
  faint: "#5d6862",
  divider: "rgba(255,255,255,0.08)",
  raised: "linear-gradient(180deg,#2b2d2b,#242624)",
  raisedShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)",
  track: "rgba(0,0,0,0.28)",
  trackShadow: "inset 0 1px 2px rgba(0,0,0,.45), 0 1px 0 rgba(255,255,255,.04)",
};

const INDICATOR_SPRING = { type: "spring" as const, stiffness: 440, damping: 38 };
const PRESS = { scale: 0.97, spring: { type: "spring" as const, stiffness: 500, damping: 20 } };
const TIMING = { label: 0.15, divider: 0.18, chevron: 0.18, quickHoverMs: 350 };

const POPOVER_CONTAINER = {
  initial: { opacity: 0, scale: 0.88, y: 10, x: "-50%" },
  animate: {
    opacity: 1, scale: 1, y: 0, x: "-50%",
    transition: { type: "spring" as const, stiffness: 440, damping: 32, staggerChildren: 0.045, delayChildren: 0.05 },
  },
  exit: { opacity: 0, scale: 0.88, y: 8, x: "-50%", transition: { duration: 0.12, ease: "easeIn" as const } },
};
const POPOVER_ICON = {
  initial: { opacity: 0, scale: 0.3, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 520, damping: 22 } },
  exit: { opacity: 0, scale: 0.3, transition: { duration: 0.08 } },
};
const TOOLTIP = {
  spring: { type: "spring" as const, stiffness: 620, damping: 30 },
  initial: { opacity: 0, scale: 0.85, y: 4, x: "-50%" },
  animate: { opacity: 1, scale: 1, y: 0, x: "-50%" },
  exit: { opacity: 0, scale: 0.85, y: 2, x: "-50%", transition: { duration: 0.1, ease: "easeIn" as const } },
};

/* ─── status glyphs (the originals are 3D renders; drawn here as small SVGs) ─── */
type StatusKey = "active" | "busy" | "dnd" | "brb" | "ooo";
function StatusGlyph({ k }: { k: StatusKey }) {
  const s = { width: "100%", height: "100%", display: "block" } as const;
  if (k === "active")
    return (
      <svg viewBox="0 0 20 20" style={s} aria-hidden>
        <defs><linearGradient id="spG1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#1f6fd1" /><stop offset=".6" stopColor="#22a3c4" /><stop offset="1" stopColor="#8be3c8" /></linearGradient></defs>
        <path d="M3 10.5l4.2 4.2L17 5" fill="none" stroke="url(#spG1)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (k === "busy")
    return (
      <svg viewBox="0 0 20 20" style={s} aria-hidden>
        <defs><radialGradient id="spG2" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#f08a8a" /><stop offset=".6" stopColor="#d9434b" /><stop offset="1" stopColor="#a8222c" /></radialGradient></defs>
        <circle cx="10" cy="10" r="7.5" fill="url(#spG2)" />
      </svg>
    );
  if (k === "dnd")
    return (
      <svg viewBox="0 0 20 20" style={s} aria-hidden>
        <defs><linearGradient id="spG3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffa24a" /><stop offset="1" stopColor="#e2541f" /></linearGradient></defs>
        <path d="M3.2 6.2c-.6 4.6 3.6 10 8.6 10.8 1.2.2 2.1-.4 2.4-1.4l.3-1.1c.1-.5-.1-1-.6-1.2l-2.2-1c-.4-.2-.9-.1-1.2.3l-.7.8c-1.7-.8-3-2.2-3.7-3.9l.8-.6c.4-.3.5-.8.3-1.2l-1-2.2c-.2-.5-.7-.7-1.2-.6l-1.1.3c-.4.1-.7.5-.7.8z" fill="url(#spG3)" />
        <path d="M12.5 3.5l3.6 3.6M16.1 3.5l-3.6 3.6" stroke="#c6cbcf" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  if (k === "brb")
    return (
      <svg viewBox="0 0 20 20" style={s} aria-hidden>
        <defs><radialGradient id="spG4" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#f26a5a" /><stop offset="1" stopColor="#b52a22" /></radialGradient></defs>
        <rect x="8.6" y="1.4" width="2.8" height="2.2" rx=".8" fill="#c9cdd1" />
        <circle cx="10" cy="11" r="7" fill="url(#spG4)" />
        <circle cx="10" cy="11" r="5.2" fill="#f4e6d8" />
        <path d="M10 11V7.6M10 11l2.4 1.4" stroke="#b52a22" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 20" style={s} aria-hidden>
      <defs><linearGradient id="spG5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0624f" /><stop offset="1" stopColor="#b8261c" /></linearGradient></defs>
      <ellipse cx="10" cy="16.6" rx="6" ry="2" fill="none" stroke="#f08a3a" strokeWidth="1.4" />
      <path d="M10 17c-3.2-3.6-5-6.3-5-8.8a5 5 0 0110 0c0 2.5-1.8 5.2-5 8.8z" fill="url(#spG5)" />
      <circle cx="10" cy="8.2" r="1.9" fill="#f6e2d6" />
    </svg>
  );
}

type Status = { k: StatusKey; label: string };
const STATUSES: Status[] = [
  { k: "active", label: "Active" },
  { k: "busy", label: "Busy" },
  { k: "dnd", label: "Do not disturb" },
  { k: "brb", label: "Be right back" },
  { k: "ooo", label: "Out of office" },
];

const TEXT = { fontSize: "1em", lineHeight: e(20), fontWeight: 500, letterSpacing: "-0.006em", whiteSpace: "nowrap" as const };

function Shimmer({ children, run = true }: { children: ReactNode; run?: boolean }) {
  const reduced = useReducedMotion();
  const [on, setOn] = useState(run && !reduced);
  return <span className={on ? "status-pill-shimmer" : undefined} onAnimationEnd={() => setOn(false)}>{children}</span>;
}

function Tooltip({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none", userSelect: "none" }}>
      <div style={{ ...TEXT, background: "#323532", borderRadius: e(13), padding: `${e(7)} ${e(13)}`, color: C.strong, boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.5)" }}>{label}</div>
      <svg width={e(18)} height={e(9)} viewBox="0 0 18 9" style={{ display: "block", marginTop: -1 }}>
        <path d="M0 0 C4.5 0, 6.5 9, 9 9 C11.5 9, 13.5 0, 18 0 Z" fill="#323532" />
      </svg>
    </div>
  );
}

function StatusIconButton({ s, getIsQuick, onHoverEnd, onSelect }: { s: Status; getIsQuick: () => boolean; onHoverEnd: () => void; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [quick, setQuick] = useState(false);
  const reduced = useReducedMotion();
  return (
    <motion.div variants={POPOVER_ICON} style={{ position: "relative", flexShrink: 0 }}>
      <AnimatePresence>
        {hovered && (
          <motion.div key="tip" style={{ position: "absolute", bottom: "100%", left: "50%", marginBottom: e(8), zIndex: 70, transformOrigin: "bottom center" }}
            initial={reduced || quick ? false : TOOLTIP.initial} animate={TOOLTIP.animate}
            exit={reduced ? {} : TOOLTIP.exit} transition={reduced || quick ? { duration: 0 } : TOOLTIP.spring}>
            <Tooltip label={s.label} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button type="button" aria-label={s.label} onClick={onSelect} className="status-pill-btn"
        onHoverStart={() => { setQuick(getIsQuick()); setHovered(true); }}
        onHoverEnd={() => { setHovered(false); onHoverEnd(); }}
        whileHover={reduced ? {} : { scale: 1.16 }} whileTap={reduced ? {} : { scale: 0.88 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: e(24), background: "rgba(255,255,255,0.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)", padding: e(6) }}>
        <span style={{ display: "block", width: e(20), height: e(20) }}><StatusGlyph k={s.k} /></span>
      </motion.button>
    </motion.div>
  );
}

function StatusPopover({ onSelect }: { onSelect: (s: Status) => void }) {
  const lastHoverEndAt = useRef(0);
  const getIsQuick = () => Date.now() - lastHoverEndAt.current < TIMING.quickHoverMs;
  return (
    <motion.div variants={POPOVER_CONTAINER} initial="initial" animate="animate" exit="exit"
      style={{ position: "absolute", bottom: "100%", left: "50%", marginBottom: e(12), zIndex: 50, width: "max-content", transformOrigin: "bottom center" }}>
      <div role="menu" aria-label="Set status" style={{ display: "flex", alignItems: "center", borderRadius: e(32), background: C.raised, padding: e(4), gap: e(8), boxShadow: `${C.raisedShadow}, 0 16px 40px rgba(0,0,0,.45)` }}>
        {STATUSES.map((s) => (
          <StatusIconButton key={s.k} s={s} getIsQuick={getIsQuick} onHoverEnd={() => { lastHoverEndAt.current = Date.now(); }} onSelect={() => onSelect(s)} />
        ))}
      </div>
    </motion.div>
  );
}

function Chevron({ active }: { active: boolean }) {
  return (
    <motion.svg width={e(15)} height={e(15)} viewBox="0 0 15 15" fill="none" aria-hidden
      animate={{ rotate: active ? 180 : 0 }} transition={{ duration: TIMING.chevron, ease: "easeInOut" }}>
      <path d="M3.5 5.5L7.5 9.5L11.5 5.5" stroke={active ? C.strong : C.soft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

function CloseIcon() {
  return <svg width={e(20)} height={e(20)} viewBox="0 0 20 20" fill="none" aria-hidden><path d="M6.5 6.5L13.5 13.5M13.5 6.5L6.5 13.5" stroke={C.soft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Indicator({ radius }: { radius: number }) {
  const reduced = useReducedMotion();
  return <motion.span layoutId="status-pill-indicator" style={{ position: "absolute", inset: 0, background: C.raised, boxShadow: C.raisedShadow, zIndex: 0, borderRadius: e(radius) }}
    transition={reduced ? { duration: 0 } : INDICATOR_SPRING} />;
}

function TabBtn({ onClick, px, children, expanded }: { onClick: () => void; px: number; children: ReactNode; expanded: boolean }) {
  const on = true;
  const reduced = useReducedMotion();
  return (
    <motion.button type="button" aria-haspopup="menu" aria-expanded={expanded} onClick={onClick} className="status-pill-btn"
      whileTap={reduced ? {} : { scale: PRESS.scale }} transition={PRESS.spring}
      style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: `${e(4)} ${e(px)}`, borderRadius: e(16) }}>
      {on && <Indicator radius={16} />}
      <motion.span animate={{ color: on ? C.strong : C.soft }} transition={{ duration: TIMING.label, ease: "easeInOut" }}
        style={{ ...TEXT, position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: e(4), userSelect: "none" }}>
        {children}
      </motion.span>
    </motion.button>
  );
}

function SelectedStatusBtn({ status, onOpen, onClear }: { status: Status; onOpen: () => void; onClear: () => void }) {
  const reduced = useReducedMotion();
  const pop = { type: "spring" as const, stiffness: 520, damping: 24 };
  return (
    <div role="button" tabIndex={0} aria-haspopup="menu" onClick={onOpen} className="status-pill-btn"
      onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onOpen(); } }}
      style={{ position: "relative", display: "flex", alignItems: "center", gap: e(6), cursor: "pointer", userSelect: "none", padding: `${e(4)} ${e(8)}`, borderRadius: e(24) }}>
      <Indicator radius={24} />
      <motion.span style={{ position: "relative", zIndex: 1, display: "block", width: e(20), height: e(20), flexShrink: 0 }}
        initial={reduced ? false : { opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...pop, delay: 0.05 }}>
        <StatusGlyph k={status.k} />
      </motion.span>
      <motion.span key={status.label} style={{ ...TEXT, position: "relative", zIndex: 1, color: C.strong }}
        initial={reduced ? false : { opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ ...pop, delay: 0.08 }}>
        <Shimmer>{status.label}</Shimmer>
      </motion.span>
      <motion.button type="button" aria-label="Clear status" className="status-pill-btn" onClick={(ev) => { ev.stopPropagation(); onClear(); }}
        style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 999 }}
        initial={reduced ? false : { opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...pop, delay: 0.11 }}
        whileHover={reduced ? {} : { scale: 1.2 }} whileTap={reduced ? {} : { scale: 0.85 }}>
        <CloseIcon />
      </motion.button>
    </div>
  );
}

const CSS = `
.status-pill-btn { appearance: none; border: 0; background: none; margin: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.status-pill-btn:focus-visible { outline: 2px solid rgba(52,181,98,.7); outline-offset: 1px; }
@keyframes status-pill-shimmer { from { background-position: 200% center; } to { background-position: -200% center; } }
.status-pill-shimmer {
  background: linear-gradient(90deg, currentColor 0%, currentColor 35%, #ffffff 50%, currentColor 65%, currentColor 100%);
  background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  animation: status-pill-shimmer 0.65s cubic-bezier(0.23, 1, 0.32, 1);
}
@media (prefers-reduced-motion: reduce) {
  .status-pill-shimmer { animation: none; background: none; -webkit-text-fill-color: inherit; }
}`;

function useBox(ref: React.RefObject<HTMLDivElement | null>) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([en]) => setBox({ w: en.contentRect.width, h: en.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return box;
}

export default function StatusPill({ size = "card" }: { size?: "card" | "big" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useBox(rootRef);
  const uid = useId();
  const [status, setStatus] = useState<Status | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [clearCount, setClearCount] = useState(0);

  // widest piece is the popover row (~200px at 1em = 14px); keep it clear of the card edges
  const k = size === "big" ? 1.8 : box.w ? Math.max(0.72, Math.min(1.2, (box.w - 40) / 240)) : 1;
  const short = size === "card" && box.h > 0 && box.h < 260;

  const onOpen = () => { play(popoverOpen ? "close" : "open"); setPopoverOpen((p) => !p); };
  const onPick = (s: Status) => { play("pop"); setStatus(s); setPopoverOpen(false); };
  const onClear = () => { play("remove"); setStatus(null); setPopoverOpen(false); setClearCount((c) => c + 1); };

  return (
    <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <LayoutGroup id={uid}>
        <div data-own-click style={{ pointerEvents: "auto", fontSize: 14 * k, transform: short ? "translateY(22px)" : "translateY(16px)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", padding: e(4), borderRadius: e(20), background: C.track, boxShadow: C.trackShadow }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {status ? (
                <SelectedStatusBtn status={status} onOpen={onOpen} onClear={onClear} />
              ) : (
                <TabBtn onClick={onOpen} px={8} expanded={popoverOpen}>
                  <Shimmer key={clearCount} run={clearCount > 0}>Set status</Shimmer>
                  <Chevron active={popoverOpen} />
                </TabBtn>
              )}
              <AnimatePresence>{popoverOpen && <StatusPopover onSelect={onPick} />}</AnimatePresence>
            </div>
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
}
