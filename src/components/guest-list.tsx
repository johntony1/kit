// Guest list: the calendar widget's guests. Tap the stack of faces and today's card morphs
// into the guest list; close it and it morphs back.
// Split out of the old calendar.tsx (ported from ~/Documents/Calendar animation: TaskWidget,
// GuestsExpanded), same springs and timings.
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { motion, AnimatePresence, LayoutGroup, MotionConfig, useReducedMotion } from "framer-motion";
import { play } from "../sound/sound";

/* ── tokens ─────────────────────────────────────────────── */
const T = {
  surface: "var(--gl-shell)",
  raised: "var(--k-raised)",
  raisedShadow: "var(--k-lift)",
  text: "var(--k-text)",
  text2: "var(--k-text2)",
  muted: "var(--k-muted)",
  green: "#34b562",
  primary: "linear-gradient(180deg,#3cc06b,#22994c)",
  primaryShadow: "var(--gl-primary-sh)",
  badge: "var(--gl-badge)",
};

/* ── theme ──────────────────────────────────────────────────
 * The close button's hover fill is tweened by framer-motion, so it is picked here as plain
 * rgba. Everything else is painted with the shared --k tokens and the --gl variables below. */
const DARK = { ghost: "rgba(255,255,255,0)", ghostHover: "rgba(255,255,255,0.08)" };
const LIGHT: typeof DARK = { ghost: "rgba(24,26,31,0)", ghostHover: "rgba(24,26,31,0.07)" };
const readTheme = () => (typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark");
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(readTheme);
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(readTheme()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    setTheme(readTheme());
    return () => mo.disconnect();
  }, []);
  return theme;
}
const CSS = `.guest-focus:focus-visible{outline:2px solid #34b562;outline-offset:2px}
.guest-root{--gl-shell:#242624;--gl-shell-sh:inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(0,0,0,.5), 0 12px 32px -12px rgba(0,0,0,.6);--gl-badge:rgba(255,255,255,.05);--gl-badge-ring:rgba(255,255,255,.03);--gl-primary-sh:inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 1px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.4);--gl-more:#3a3d3a}
:root[data-theme="light"] .guest-root{--gl-shell:oklch(0.972 0.003 264);--gl-shell-sh:inset 0 1px 0 oklch(1 0 0), 0 0 0 1px oklch(0.22 0.008 264 / 0.08), 0 12px 32px -14px oklch(0.22 0.008 264 / 0.18);--gl-badge:oklch(0.22 0.008 264 / 0.05);--gl-badge-ring:oklch(0.22 0.008 264 / 0.04);--gl-primary-sh:inset 0 1px 0 rgba(255,255,255,.3), 0 0 0 1px oklch(0.5 0.14 150 / 0.75), 0 1px 2px oklch(0.45 0.13 150 / 0.3);--gl-more:oklch(0.9 0.005 264)}`;

/* ── springs (verbatim) ─────────────────────────────────── */
const SPRING_ENTRY = { type: "spring" as const, visualDuration: 0.45, bounce: 0.14 };
const SPRING_LAYOUT = { type: "spring" as const, stiffness: 240, damping: 22 };
const SPRING_PRESS = { type: "spring" as const, stiffness: 500, damping: 28 };
const SPRING = { type: "spring" as const, stiffness: 240, damping: 22 };
const SPRING_SOFT = { type: "spring" as const, stiffness: 200, damping: 24 };
const IN: [number, number, number, number] = [0.4, 0, 1, 1];

const TASKS = [
  { id: 1, label: "Design landing page", time: "Today, 1:00PM" },
  { id: 2, label: "Create dashboard", time: "Today, 2:00PM" },
  { id: 3, label: "Build AI skills", time: "Today, 3:00PM" },
  { id: 4, label: "Review code", time: "Today, 4:00PM" },
];
const PEOPLE = [
  { i: "J", bg: "#ffecc0" },
  { i: "J", bg: "#c0d5ff" },
  { i: "J", bg: "#c0eaff" },
  { i: "T", bg: "#cac0ff" },
];
const GUESTS = [
  { id: 1, name: "John tony", role: "Can view", bg: "#ffecc0" },
  { id: 2, name: "James imade", role: "Can view", bg: "#c0d5ff" },
  { id: 3, name: "Johnson eve", role: "Can view", bg: "#c0eaff" },
  { id: 4, name: "Tima sbdhs", role: "Can edit", bg: "#cac0ff" },
];

/* ── fit ────────────────────────────────────────────────── */
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
const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" style={{ stroke: T.muted }} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const Chev = ({ dir }: { dir: "left" | "right" | "down" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ transform: dir === "left" ? "rotate(90deg)" : dir === "right" ? "rotate(-90deg)" : undefined }}>
    <path d="M5 6.5l3 3 3-3" style={{ stroke: T.muted }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2px 6px", borderRadius: 8, flexShrink: 0, background: T.badge, boxShadow: "inset 0 0 0 1px var(--gl-badge-ring)" }}>
    <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", letterSpacing: "-0.078px", color: T.muted, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{children}</span>
  </div>
);

/* today's tasks, shown still: ticking them is the Task tick block */
function TaskRow({ label, time, delayS }: { label: string; time: string; delayS: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 2px", minHeight: 28 }}
      initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: delayS }}>
      <span title={label} style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", whiteSpace: "nowrap", userSelect: "none", color: T.text }}>{label}</span>
      <div style={{ marginLeft: 8, flexShrink: 0 }}><Badge>{time}</Badge></div>
    </motion.div>
  );
}

function AvatarStack({ onClick, triggerRef }: { onClick: () => void; triggerRef: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <motion.button ref={triggerRef} type="button" onClick={onClick} aria-label="View guests" aria-haspopup="dialog" className="guest-focus"
      style={{ display: "flex", alignItems: "flex-start", paddingRight: 4, border: 0, background: "none", cursor: "pointer", borderRadius: 6 }}
      whileTap={{ scale: 0.94 }} transition={SPRING_PRESS}>
      {PEOPLE.map((p, i) => (
        <div key={i} style={{ width: 20, height: 20, borderRadius: 999, border: `2px solid ${T.surface}`, background: p.bg, marginLeft: i === 0 ? 0 : -4, zIndex: PEOPLE.length - i, display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700, color: "#1c1d1c", flexShrink: 0 }}>{p.i}</div>
      ))}
      <div style={{ width: 20, height: 20, borderRadius: 999, border: `2px solid ${T.surface}`, background: "var(--gl-more)", marginLeft: -4, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <span aria-hidden="true" style={{ fontSize: 8, fontWeight: 500, lineHeight: "12px", color: T.text2, fontVariantNumeric: "tabular-nums" }}>+9</span>
      </div>
    </motion.button>
  );
}

function CloseButton({ onClose, refEl, label }: { onClose: () => void; refEl: React.RefObject<HTMLButtonElement | null>; label: string }) {
  const P = useTheme() === "light" ? LIGHT : DARK;
  return (
    <motion.button ref={refEl} type="button" onClick={onClose} aria-label={label} className="guest-focus"
      style={{ width: 20, height: 20, display: "grid", placeItems: "center", borderRadius: 4, border: 0, padding: 0, cursor: "pointer" }}
      initial={false} animate={{ backgroundColor: P.ghost }}
      whileHover={{ backgroundColor: P.ghostHover }} whileTap={{ scale: 0.88 }} transition={SPRING_PRESS}>
      <CloseIcon />
    </motion.button>
  );
}

/* ── Guests view ────────────────────────────────────────── */
function GuestsExpanded({ onClose, closeRef }: { onClose: () => void; closeRef: React.RefObject<HTMLButtonElement | null> }) {
  const reduced = useReducedMotion();
  return (
    <>
      <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}
        initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: 0.08 } }}
        exit={{ opacity: 0, y: reduced ? 0 : 4, transition: { duration: 0.1, ease: IN, delay: 0.14 } }}>
        <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.muted, userSelect: "none" }}>Guests</span>
        <CloseButton onClose={onClose} refEl={closeRef} label="Close guests" />
      </motion.div>
      <motion.div role="dialog" aria-label="Guests"
        style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, padding: 12, width: "100%", overflow: "hidden", borderRadius: "16px 16px 20px 20px", background: T.raised, boxShadow: T.raisedShadow }}
        initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.16 } }}
        exit={{ opacity: 0, y: reduced ? 0 : 6, transition: { duration: 0.14, ease: IN, delay: 0 } }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {GUESTS.map((g) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                <div aria-hidden="true" style={{ width: 20, height: 20, borderRadius: 999, background: g.bg, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, color: "#1c1d1c", flexShrink: 0 }}>{g.name.slice(0, 1).toUpperCase()}</div>
                <span title={g.name} style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: T.text, whiteSpace: "nowrap", userSelect: "none", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.muted, whiteSpace: "nowrap", userSelect: "none" }}>{g.role}</span>
                <Chev dir="down" />
              </div>
            </div>
          ))}
        </div>
        <motion.button type="button" className="guest-focus" onClick={() => play("tap")}
          style={{ width: "100%", padding: 6, borderRadius: 8, border: 0, cursor: "pointer", background: T.primary, boxShadow: T.primaryShadow, color: "#fff", fontWeight: 500, fontSize: 14, lineHeight: "20px" }}
          whileHover={{ opacity: 0.88 }} whileTap={{ scale: 0.98 }} transition={SPRING_PRESS}>
          Share link
        </motion.button>
      </motion.div>
    </>
  );
}

/* ── component ──────────────────────────────────────────── */
export default function GuestList({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, innerRef, box, scale } = useFit(size);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const groupId = useId();
  const tasks = size === "card" && box.h && box.h < 260 ? TASKS.slice(0, 2) : TASKS;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; } // never steal focus on page load
    if (open) { const id = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 50); return () => clearTimeout(id); }
    triggerRef.current?.focus({ preventScroll: true });
  }, [open]);
  const show = () => { play("open"); setOpen(true); };
  const hide = () => { play("close"); setOpen(false); };

  return (
    <MotionConfig reducedMotion="user"><LayoutGroup id={groupId}>
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click className="guest-root" style={{ pointerEvents: "auto", width: 358, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <motion.div layout
            style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 24, width: "100%", background: T.surface, boxShadow: "var(--gl-shell-sh)", gap: 12, paddingTop: 12, paddingLeft: 4, paddingRight: 4, paddingBottom: 4 }}
            transition={SPRING_LAYOUT} initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              {!open ? (
                <motion.div key="closed" style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14, ease: IN } }}>
                  <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}
                    initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: 0.08 }}>
                    <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.muted, userSelect: "none" }}>Today</span>
                    <AvatarStack triggerRef={triggerRef} onClick={show} />
                  </motion.div>
                  <motion.div
                    style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, padding: 12, width: "100%", overflow: "hidden", borderRadius: "16px 16px 20px 20px", background: T.raised, boxShadow: T.raisedShadow }}
                    initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: 0.16 }}>
                    {tasks.map((t, i) => <TaskRow key={t.id} label={t.label} time={t.time} delayS={0.26 + i * 0.07} />)}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="guests" style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }} exit={{ opacity: 0, transition: { duration: 0.08 } }}>
                  <GuestsExpanded onClose={hide} closeRef={closeRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </LayoutGroup></MotionConfig>
  );
}
