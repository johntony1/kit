// Week picker: the calendar widget's week view. Tap the calendar icon and today's card
// morphs into a week picker (pick a day, step a week, switch Home, Work and Family tabs
// and the tasks slide across); close it and it morphs back.
// Split out of the old calendar.tsx (ported from ~/Documents/Calendar animation: TaskWidget,
// CalendarExpanded), same springs and timings.
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { motion, AnimatePresence, LayoutGroup, MotionConfig, useReducedMotion } from "framer-motion";
import { play } from "../sound/sound";

/* ── tokens ─────────────────────────────────────────────── */
const T = {
  surface: "var(--wk-shell)",
  raised: "var(--k-raised)",
  raisedShadow: "var(--k-lift)",
  text: "var(--k-text)",
  text2: "var(--k-text2)",
  muted: "var(--k-muted)",
  faint: "var(--wk-dim)",
  green: "#34b562",
  primary: "linear-gradient(180deg,#3cc06b,#22994c)",
  primaryShadow: "var(--wk-primary-sh)",
  badge: "var(--wk-badge)",
  well: "var(--wk-well)",
  wellShadow: "var(--wk-well-sh)",
};

/* ── theme ──────────────────────────────────────────────────
 * The two hover fills are tweened by framer-motion, so they are picked here as plain rgba.
 * Everything else is painted with the shared --k tokens and the --wk variables below. */
const DARK = { ghost: "rgba(255,255,255,0)", ghostHover: "rgba(255,255,255,0.08)", nav: "rgba(255,255,255,0.04)", navHover: "rgba(255,255,255,0.09)" };
const LIGHT: typeof DARK = { ghost: "rgba(24,26,31,0)", ghostHover: "rgba(24,26,31,0.07)", nav: "rgba(255,255,255,1)", navHover: "rgba(244,245,247,1)" };
const readTheme = () => (typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark");
function usePalette() {
  const [theme, setTheme] = useState<"light" | "dark">(readTheme);
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(readTheme()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    setTheme(readTheme());
    return () => mo.disconnect();
  }, []);
  return theme === "light" ? LIGHT : DARK;
}
const CSS = `.week-focus:focus-visible{outline:2px solid #34b562;outline-offset:2px}
.week-root{--wk-dim:#5d6862;--wk-shell:#242624;--wk-shell-sh:inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(0,0,0,.5), 0 12px 32px -12px rgba(0,0,0,.6);--wk-primary-sh:inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 1px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.4);--wk-badge:rgba(255,255,255,.05);--wk-badge-ring:rgba(255,255,255,.03);--wk-well:rgba(0,0,0,.22);--wk-well-sh:inset 0 1px 2px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.05);--wk-icon-fill:rgba(255,255,255,.06);--wk-hover:rgba(255,255,255,0.05);--wk-nav-sh:inset 0 0 0 1px rgba(255,255,255,.08), 0 1px 2px rgba(0,0,0,.3);--wk-seg:linear-gradient(180deg,#363936,#2b2d2b)}
:root[data-theme="light"] .week-root{--wk-dim:oklch(0.53 0.011 264);--wk-shell:oklch(0.972 0.003 264);--wk-shell-sh:inset 0 1px 0 oklch(1 0 0), 0 0 0 1px oklch(0.22 0.008 264 / 0.08), 0 12px 32px -14px oklch(0.22 0.008 264 / 0.18);--wk-primary-sh:inset 0 1px 0 rgba(255,255,255,.3), 0 0 0 1px oklch(0.5 0.14 150 / 0.75), 0 1px 2px oklch(0.45 0.13 150 / 0.3);--wk-badge:oklch(0.22 0.008 264 / 0.05);--wk-badge-ring:oklch(0.22 0.008 264 / 0.04);--wk-well:oklch(0.95 0.004 264);--wk-well-sh:inset 0 1px 2px oklch(0.22 0.008 264 / 0.07), 0 0 0 1px oklch(0.22 0.008 264 / 0.05);--wk-icon-fill:oklch(0.22 0.008 264 / 0.05);--wk-hover:oklch(0.22 0.008 264 / 0.05);--wk-nav-sh:inset 0 1px 0 oklch(1 0 0), 0 0 0 1px oklch(0.22 0.008 264 / 0.1), 0 1px 2px oklch(0.22 0.008 264 / 0.07);--wk-seg:linear-gradient(180deg,oklch(1 0 0),oklch(0.985 0.002 264))}`;

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

/* ── week data ──────────────────────────────────────────── */
const BASE_DATE = new Date(2026, 2, 31);
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;
function getWeekDays(offset: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(BASE_DATE);
    d.setDate(BASE_DATE.getDate() + offset * 5 + i);
    return { key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, day: DAY_NAMES[d.getDay()], date: String(d.getDate()).padStart(2, "0"), month: d.getMonth(), year: d.getFullYear() };
  });
}
const TODAY_KEY = "2026-3-2";
const TABS = ["Home", "Work", "Family"] as const;
type Tab = (typeof TABS)[number];
type TaskItem = { id: number; label: string; time: string };
const TASK_POOL: Record<Tab, TaskItem[]> = {
  Home: [{ id: 1, label: "Design landing page", time: "1:00 PM" }, { id: 2, label: "Create dashboard", time: "2:00 PM" }, { id: 3, label: "Review prototype", time: "4:00 PM" }, { id: 4, label: "Update components", time: "10:00 AM" }, { id: 5, label: "Fix layout bugs", time: "11:00 AM" }, { id: 6, label: "Write blog post", time: "3:00 PM" }],
  Work: [{ id: 1, label: "Team standup", time: "9:00 AM" }, { id: 2, label: "Review pull request", time: "11:00 AM" }, { id: 3, label: "Deploy to staging", time: "3:00 PM" }, { id: 4, label: "Client check-in", time: "1:00 PM" }, { id: 5, label: "Sprint planning", time: "10:00 AM" }, { id: 6, label: "Write API docs", time: "4:00 PM" }],
  Family: [{ id: 1, label: "Pick up groceries", time: "5:00 PM" }, { id: 2, label: "School pickup", time: "3:30 PM" }, { id: 3, label: "Movie night", time: "7:00 PM" }, { id: 4, label: "Cook dinner", time: "6:00 PM" }, { id: 5, label: "Morning walk", time: "7:00 AM" }, { id: 6, label: "Call parents", time: "8:00 PM" }],
};
function hashKey(k: string) { let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; return h; }
function getTasksForDay(tab: Tab, dayKey: string) { const pool = TASK_POOL[tab]; const s = hashKey(dayKey) % (pool.length - 2); return pool.slice(s, s + 3); }
function parseKey(k: string) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m, d).getTime(); }
const TASK_SLIDE = {
  enter: (dir: number) => ({ x: dir * 28, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
  exit: (dir: number) => ({ x: dir * -28, opacity: 0, transition: { duration: 0.13, ease: IN } }),
};

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
/* ── icons ──────────────────────────────────────────────── */
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.75" y="3.75" width="14.5" height="13.5" rx="3.25" style={{ fill: "var(--wk-icon-fill)", stroke: T.muted }} strokeWidth="1.5" />
    <path d="M2.75 8h14.5" style={{ stroke: T.muted }} strokeWidth="1.5" />
    <path d="M6.5 2.25v3M13.5 2.25v3" style={{ stroke: T.muted }} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="12.5" r="1.25" fill={T.green} />
  </svg>
);
const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" style={{ stroke: T.muted }} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const Chev = ({ dir }: { dir: "left" | "right" | "down" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ transform: dir === "left" ? "rotate(90deg)" : dir === "right" ? "rotate(-90deg)" : undefined }}>
    <path d="M5 6.5l3 3 3-3" style={{ stroke: T.muted }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2px 6px", borderRadius: 8, flexShrink: 0, background: T.badge, boxShadow: "inset 0 0 0 1px var(--wk-badge-ring)" }}>
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

function ClosedTasks({ tasks }: { tasks: TaskItem[] }) {
  return tasks.length
    ? <>{tasks.map((t, i) => <TaskRow key={t.id} label={t.label} time={t.time} delayS={0.26 + i * 0.07} />)}</>
    : <NoTasks inset={2}>No tasks today</NoTasks>;
}

function CloseButton({ onClose, refEl, label }: { onClose: () => void; refEl: React.RefObject<HTMLButtonElement | null>; label: string }) {
  const P = usePalette();
  return (
    <motion.button ref={refEl} type="button" onClick={onClose} aria-label={label} className="week-focus"
      style={{ width: 20, height: 20, display: "grid", placeItems: "center", borderRadius: 4, border: 0, padding: 0, cursor: "pointer" }}
      initial={false} animate={{ backgroundColor: P.ghost }}
      whileHover={{ backgroundColor: P.ghostHover }} whileTap={{ scale: 0.88 }} transition={SPRING_PRESS}>
      <CloseIcon />
    </motion.button>
  );
}

/* ── Calendar view ──────────────────────────────────────── */
/* ── Calendar view ──────────────────────────────────────── */
function DayCell({ day, date, selected, onSelect }: { day: string; date: string; selected: boolean; onSelect: () => void }) {
  const reduced = useReducedMotion();
  const [hov, setHov] = useState(false);
  return (
    <motion.button type="button" onClick={onSelect} aria-label={`Select ${day} ${date}`} aria-pressed={selected} className="week-focus"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 4px", borderRadius: 8, border: 0, background: "transparent", cursor: "pointer" }}
      whileTap={{ scale: 0.94 }} transition={SPRING_PRESS}>
      {selected && (
        <motion.div layoutId="week-day-selected" style={{ position: "absolute", inset: 0, borderRadius: 8, background: T.primary, boxShadow: T.primaryShadow }} transition={reduced ? { duration: 0.15 } : SPRING} />
      )}
      {!selected && <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "var(--wk-hover)", opacity: hov ? 1 : 0, transition: "opacity 120ms ease", pointerEvents: "none" }} />}
      <span style={{ position: "relative", fontSize: 12, lineHeight: "16px", color: selected ? "rgba(255,255,255,.85)" : T.muted, transition: "color 150ms ease" }}>{day}</span>
      <span style={{ position: "relative", fontWeight: 500, fontSize: 16, lineHeight: "24px", letterSpacing: "-0.176px", color: selected ? "#fff" : T.text, fontVariantNumeric: "tabular-nums", transition: "color 150ms ease" }}>{date}</span>
    </motion.button>
  );
}
function NavArrow({ dir, label, onClick }: { dir: "left" | "right"; label: string; onClick: () => void }) {
  const P = usePalette();
  return (
    <motion.button type="button" onClick={onClick} aria-label={label} className="week-focus"
      style={{ display: "grid", placeItems: "center", padding: 2, borderRadius: 6, border: 0, cursor: "pointer", boxShadow: "var(--wk-nav-sh)" }}
      initial={false} animate={{ backgroundColor: P.nav }}
      whileHover={{ backgroundColor: P.navHover }} whileTap={{ scale: 0.9 }} transition={SPRING_PRESS}>
      <Chev dir={dir} />
    </motion.button>
  );
}
function TaskLine({ task }: { task: TaskItem }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 12px", width: "100%" }}>
      <span title={task.label} style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: T.text, whiteSpace: "nowrap", userSelect: "none" }}>{task.label}</span>
      <Badge>{task.time}</Badge>
    </div>
  );
}

function NoTasks({ inset, children }: { inset: number; children: React.ReactNode }) {
  return <span style={{ padding: `0 ${inset}px`, fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: T.muted, userSelect: "none" }}>{children}</span>;
}

function CalendarExpanded({ onClose, closeRef }: { onClose: () => void; closeRef: React.RefObject<HTMLButtonElement | null> }) {
  const [selectedDay, setSelectedDay] = useState(TODAY_KEY);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const taskDir = useRef(1);
  const dayDir = useRef(1);
  const reduced = useReducedMotion();
  const weekDays = getWeekDays(weekOffset);
  const mid = weekDays[2];
  const dayTasks = getTasksForDay(activeTab, selectedDay);
  const switchTab = (t: Tab) => { if (t === activeTab) return; play("tick"); taskDir.current = TABS.indexOf(t) > TABS.indexOf(activeTab) ? 1 : -1; setActiveTab(t); };
  const selectDay = (k: string) => {
    if (k === selectedDay) return;
    play("tick");
    const n = weekDays.findIndex((d) => d.key === k), o = weekDays.findIndex((d) => d.key === selectedDay);
    taskDir.current = n !== -1 && o !== -1 ? (n > o ? 1 : -1) : parseKey(k) > parseKey(selectedDay) ? 1 : -1;
    setSelectedDay(k);
  };
  return (
    <>
      <motion.div role="dialog" aria-label="Calendar"
        style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, padding: 12, width: "100%", overflow: "hidden", borderRadius: "20px 20px 16px 16px", background: T.raised, boxShadow: T.raisedShadow }}
        initial={{ opacity: 0, y: reduced ? 0 : -10 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: 0.08 } }}
        exit={{ opacity: 0, y: reduced ? 0 : -6, transition: { duration: 0.14, ease: IN, delay: 0.1 } }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, userSelect: "none" }}>
            <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: T.text2, fontVariantNumeric: "tabular-nums" }}>{MONTH_NAMES[mid.month]} {mid.year}</span>
            <Chev dir="down" />
          </div>
          <CloseButton onClose={onClose} refEl={closeRef} label="Close calendar" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavArrow dir="left" label="Previous week" onClick={() => { play("slide", { gap: 60 }); dayDir.current = -1; setWeekOffset((w) => w - 1); }} />
          <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
            <AnimatePresence custom={dayDir.current} mode="popLayout" initial={false}>
              <motion.div key={weekOffset} custom={dayDir.current} variants={reduced ? undefined : TASK_SLIDE} initial="enter" animate="center" exit="exit" style={{ display: "flex", flex: 1, alignItems: "center", gap: 4 }}>
                {weekDays.map((d) => <DayCell key={d.key} day={d.day} date={d.date} selected={selectedDay === d.key} onSelect={() => selectDay(d.key)} />)}
              </motion.div>
            </AnimatePresence>
          </div>
          <NavArrow dir="right" label="Next week" onClick={() => { play("slide", { gap: 60 }); dayDir.current = 1; setWeekOffset((w) => w + 1); }} />
        </div>
      </motion.div>

      <motion.div
        style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", borderRadius: 16, padding: "8px 0", background: T.well, boxShadow: T.wellShadow, overflow: "hidden", position: "relative" }}
        initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.16 } }}
        exit={{ opacity: 0, y: reduced ? 0 : 4, transition: { duration: 0.1, ease: IN, delay: 0.055 } }}>
        <div style={{ padding: "0 12px" }}><span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.faint, userSelect: "none" }}>Tasks</span></div>
        <AnimatePresence custom={taskDir.current} mode="popLayout" initial={false}>
          <motion.div key={`${activeTab}-${selectedDay}`} custom={taskDir.current} variants={reduced ? undefined : TASK_SLIDE} initial="enter" animate="center" exit="exit" style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {dayTasks.length ? dayTasks.map((t) => <TaskLine key={t.id} task={t} />) : <NoTasks inset={12}>No tasks for this day</NoTasks>}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div role="tablist" aria-label="Task lists"
        style={{ display: "flex", width: "100%", borderRadius: 999, padding: 4, minHeight: 44, background: T.well, boxShadow: T.wellShadow }}
        initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.24 } }}
        exit={{ opacity: 0, y: reduced ? 0 : 5, transition: { duration: 0.08, ease: IN, delay: 0 } }}>
        {TABS.map((tab) => {
          const on = tab === activeTab;
          return (
            <motion.button type="button" role="tab" aria-selected={on} key={tab} onClick={() => switchTab(tab)} className="week-focus"
              style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, border: 0, background: "none", cursor: "pointer" }}
              whileTap={{ scale: 0.96 }} transition={SPRING_PRESS}>
              <AnimatePresence initial={false}>
                {on && <motion.div layoutId="week-seg-pill" style={{ position: "absolute", inset: 0, borderRadius: 999, background: "var(--wk-seg)", boxShadow: T.raisedShadow }} transition={reduced ? { duration: 0.15 } : SPRING} />}
              </AnimatePresence>
              <span style={{ position: "relative", fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: on ? T.text : T.faint, transition: "color 180ms ease", userSelect: "none" }}>{tab}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </>
  );
}

/* ── component ──────────────────────────────────────────── */
export default function WeekPicker({ size = "card" }: { size?: "card" | "big" }) {
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
        <div ref={innerRef} data-own-click className="week-root" style={{ pointerEvents: "auto", width: 358, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <motion.div layout
            style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 24, width: "100%", background: T.surface, boxShadow: "var(--wk-shell-sh)", gap: open ? 4 : 12, paddingTop: open ? 4 : 12, paddingLeft: 4, paddingRight: 4, paddingBottom: 4 }}
            transition={SPRING_LAYOUT} initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              {!open ? (
                <motion.div key="closed" style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14, ease: IN } }}>
                  <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}
                    initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: 0.08 }}>
                    <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.muted, userSelect: "none" }}>Today</span>
                    <motion.button ref={triggerRef} type="button" onClick={show} aria-label="Open calendar" aria-haspopup="dialog" className="week-focus"
                      style={{ display: "grid", placeItems: "center", border: 0, padding: 0, background: "none", cursor: "pointer", borderRadius: 4 }}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }} transition={SPRING_PRESS}>
                      <CalendarIcon />
                    </motion.button>
                  </motion.div>
                  <motion.div
                    style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, padding: 12, width: "100%", overflow: "hidden", borderRadius: "16px 16px 20px 20px", background: T.raised, boxShadow: T.raisedShadow }}
                    initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: 0.16 }}>
                    <ClosedTasks tasks={tasks} />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="calendar" style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }} exit={{ opacity: 0, transition: { duration: 0.08 } }}>
                  <CalendarExpanded onClose={hide} closeRef={closeRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </LayoutGroup></MotionConfig>
  );
}
