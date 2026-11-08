// Balance card: total balance, a bar chart with hover tooltips, a date ruler and the share step.
// Port of modal animaation / BalanceCard.tsx, BarChart.tsx, ShareSection.tsx, DateWheel.tsx, dark.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { play } from "../sound/sound";
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";

// ── Storyboard constants (exact from source) ───────────────
const SPRING_SNAPPY = { type: "spring", visualDuration: 0.28, bounce: 0 } as const;
const TOOLTIP_SPRING = { type: "spring", duration: 0.3, bounce: 0 } as const;
const EASE_OUT = [0.2, 0, 0, 1] as const;
const BAR_HEIGHTS = [39, 61, 28, 16, 56, 28, 23, 16, 39, 28, 28, 47, 69, 102] as const;
const BAR_DATA = BAR_HEIGHTS.map((h, i) => ({
  label: `Apr ${i + 14}`,
  amount: `$${(h * 18.5 + 50).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
}));
const TODAY = new Date(2026, 3, 27);

// Natural size (balance state) used to fit the widget into the card.
const NAT_W = 354;
const NAT_H = 300;

// ── Tokens ─────────────────────────────────────────────────
const T = {
  text: "#e3e8e3",
  sub: "#c2cbc4",
  muted: "#8b968f",
  faint: "#5d6862",
  raised: "linear-gradient(180deg,#2b2d2b,#242624)",
  raisedShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)",
  bar: "#3d6bff",
  green: "#34b562",
};

// ── Icons (mingcute shapes, inline) ────────────────────────
const Svg = ({ size, children, style }: { size: number; children: ReactNode; style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0, ...style }}>{children}</svg>
);
const InfoIcon = () => (
  <Svg size={18}><circle cx="12" cy="12" r="8.5" stroke={T.faint} strokeWidth="1.8" /><path d="M12 11v5" stroke={T.faint} strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="8" r="1.1" fill={T.faint} /></Svg>
);
const MoreIcon = () => (
  <Svg size={20}><circle cx="12" cy="5.5" r="1.7" fill={T.faint} /><circle cx="12" cy="12" r="1.7" fill={T.faint} /><circle cx="12" cy="18.5" r="1.7" fill={T.faint} /></Svg>
);
const CalendarIcon = () => (
  <Svg size={18}><rect x="4" y="5.5" width="16" height="14.5" rx="2.5" stroke={T.sub} strokeWidth="1.8" /><path d="M8 3.5v4M16 3.5v4M4 10h16" stroke={T.sub} strokeWidth="1.8" strokeLinecap="round" /><circle cx="8.5" cy="13.5" r="1" fill={T.sub} /><circle cx="12" cy="13.5" r="1" fill={T.sub} /><circle cx="15.5" cy="13.5" r="1" fill={T.sub} /><circle cx="8.5" cy="16.8" r="1" fill={T.sub} /><circle cx="12" cy="16.8" r="1" fill={T.sub} /></Svg>
);
const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <Svg size={size}><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></Svg>
);
const CloseCircleIcon = () => (
  <Svg size={16}><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M9 9l6 6M15 9l-6 6" stroke="#242624" strokeWidth="2" strokeLinecap="round" /></Svg>
);
const ArrowRightIcon = () => (
  <Svg size={18}><path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5" stroke="#191a19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Svg>
);

// ── AutoResize: tween explicit height to the content (CSS, 300ms) ──
function AutoResize({ children, style, reduced, unclip = false }: { children: ReactNode; style?: CSSProperties; reduced: boolean; unclip?: boolean }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    if (innerRef.current) setHeight(innerRef.current.offsetHeight);
  });
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div style={{ ...style, height, overflow: unclip ? "visible" : "clip", overflowClipMargin: "8px", transition: reduced ? "none" : "width 300ms cubic-bezier(0.22, 1, 0.36, 1), height 300ms cubic-bezier(0.22, 1, 0.36, 1)", willChange: "width, height" } as CSSProperties}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

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

// ── Bar chart with tooltips ────────────────────────────────
type Align = "start" | "center" | "end";
function BarChart({ maxHeight, reduced }: { maxHeight: number; reduced: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const localMax = Math.max(...BAR_HEIGHTS);
  const scale = maxHeight / localMax;
  const count = BAR_HEIGHTS.length;
  return (
    <div style={{ position: "relative", width: "100%", height: maxHeight + 12 }} onPointerLeave={() => setHovered(null)}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: 6 }}>
        {BAR_HEIGHTS.map((h, i) => {
          const barHeight = Math.max(8, Math.round(h * scale));
          const isHovered = hovered === i;
          const isDimmed = hovered !== null && !isHovered;
          const align: Align = i === 0 ? "start" : i === count - 1 ? "end" : "center";
          return (
            <div key={i} style={{ display: "flex", height: "100%", flex: 1, alignItems: "flex-end", justifyContent: "center" }} onPointerEnter={() => { if (hovered !== i) play("tick", { gap: 40 }); setHovered(i); }}>
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
  );
}

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

// ── Date ruler (DateWheel) ─────────────────────────────────
const CELL_WIDTH = 36;
const VIEWPORT_WIDTH = 252;
const TICK_HEIGHT = 14;
const LABEL_Y = TICK_HEIGHT + 14;
const RANGE_DAYS = 30;
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function TodayPill({ label, onClick, ariaLabel }: { label: string; onClick: () => void; ariaLabel: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1 }}
      style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 16, background: "rgba(255,255,255,.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)", padding: "6px 12px 6px 8px", border: "none", cursor: "pointer", font: "inherit" }}
    >
      <CalendarIcon />
      <AnimatedLabel value={label} style={{ color: T.sub, fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px" }} />
    </motion.button>
  );
}

function DateWheel({ selected, onChange, label, onClose, reduced }: { selected: Date; onChange: (d: Date) => void; label: string; onClose: () => void; reduced: boolean }) {
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
      onChange(days[idx]);
    }
  };
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const idx = indexFromX(x.get());
    lastIdxRef.current = idx;
    animate(x, -idx * CELL_WIDTH, { type: "spring", visualDuration: 0.32, bounce: 0.1, velocity: info.velocity.x });
    onChange(days[idx]);
  };
  const totalWidth = (days.length - 1) * CELL_WIDTH;
  const mask = "linear-gradient(to right, transparent, black 14%, black 86%, transparent)";
  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <TodayPill label={label} onClick={onClose} ariaLabel="Close date picker" />
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
          if (e.key === "ArrowLeft") { e.preventDefault(); onChange(days[Math.max(0, selectedIdx - 1)]); }
          if (e.key === "ArrowRight") { e.preventDefault(); onChange(days[Math.min(days.length - 1, selectedIdx + 1)]); }
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
                    <line x1={cx} x2={cx} y1={0} y2={TICK_HEIGHT} stroke={T.text} strokeOpacity={isSel ? 0 : 0.5} strokeWidth={1.5} />
                    {[1, 2, 3].map((m) => (
                      <line key={m} x1={cx + (m * CELL_WIDTH) / 4} x2={cx + (m * CELL_WIDTH) / 4} y1={TICK_HEIGHT - 6} y2={TICK_HEIGHT} stroke={T.text} strokeOpacity={0.18} strokeWidth={1} />
                    ))}
                    <text x={cx} y={LABEL_Y} textAnchor="middle" fontSize={11} fill={isSel ? T.text : T.muted} fontWeight={isSel ? 600 : 400} fontFamily="inherit">{d.getDate()}</text>
                  </g>
                );
              })}
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── Share step ─────────────────────────────────────────────
type User = { name: string; email: string };
const ALL_USERS: User[] = [
  { name: "John Smith", email: "john.smith@email.com" },
  { name: "Jane Doe", email: "jane.doe@email.com" },
  { name: "Joel Castro", email: "joel.castro@email.com" },
  { name: "Jenny Park", email: "jenny.park@email.com" },
  { name: "Jordan Lee", email: "jordan.lee@email.com" },
  { name: "Julia Chen", email: "julia.chen@email.com" },
  { name: "Nitish Khagwal", email: "nitish.khagwal@email.com" },
];
const isEmailish = (s: string) => /\S+@\S+\.\S+/.test(s.trim());
const GRADIENTS = [
  "linear-gradient(135deg, #FCD34D 0%, #34D399 100%)",
  "linear-gradient(135deg, #FB7185 0%, #FB923C 100%)",
  "linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)",
  "linear-gradient(135deg, #F472B6 0%, #818CF8 100%)",
  "linear-gradient(135deg, #2DD4BF 0%, #60A5FA 100%)",
  "linear-gradient(135deg, #FBBF24 0%, #F87171 100%)",
] as const;
const pickGradient = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
};
function Avatar({ user, size = 24 }: { user: User; size?: number }) {
  return (
    <span aria-hidden="true" style={{ display: "grid", placeItems: "center", flexShrink: 0, borderRadius: 999, width: size, height: size, fontSize: Math.max(10, Math.floor(size * 0.42)), fontWeight: 600, color: "#fff", background: pickGradient(user.email), boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)", textShadow: "0 1px 1px rgba(0,0,0,0.18)" }}>
      {user.name[0].toUpperCase()}
    </span>
  );
}

const SWAP_SPRING = { type: "spring", visualDuration: 0.24, bounce: 0.18 } as const;

function ShareCard({ onClose, maxSuggestions }: { onClose: () => void; maxSuggestions: number }) {
  const [query, setQuery] = useState("");
  const [pills, setPills] = useState<User[]>([]);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as User[];
    return ALL_USERS.filter((u) => !pills.some((p) => p.email === u.email) && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))).slice(0, maxSuggestions);
  }, [query, pills, maxSuggestions]);
  const dropdownOpen = suggestions.length > 0;
  const isEmpty = pills.length === 0 && query.length === 0;

  const addPill = (user: User) => {
    if (!pills.some((p) => p.email === user.email)) play("pop");
    setPills((prev) => (prev.some((p) => p.email === user.email) ? prev : [...prev, user]));
    setQuery("");
    setHighlighted(0);
    inputRef.current?.focus();
  };
  const removePill = (email: string) => {
    play("remove");
    setPills((prev) => prev.filter((p) => p.email !== email));
    inputRef.current?.focus();
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && query === "" && pills.length > 0) { e.preventDefault(); play("remove"); setPills(pills.slice(0, -1)); }
    else if (e.key === "ArrowDown" && dropdownOpen) { e.preventDefault(); setHighlighted((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp" && dropdownOpen) { e.preventDefault(); setHighlighted((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (dropdownOpen && suggestions[highlighted]) addPill(suggestions[highlighted]);
      else if (isEmailish(query)) addPill({ name: query.trim().split("@")[0], email: query.trim() });
    } else if (e.key === "Escape") { setQuery(""); setHighlighted(0); }
  };
  const handlePaste = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) return inputRef.current?.focus();
      if (isEmailish(text)) addPill({ name: text.split("@")[0], email: text });
      else { setQuery(text); inputRef.current?.focus(); }
    } catch {
      inputRef.current?.focus();
    }
  };
  const handleSend = () => {
    if (isEmailish(query)) addPill({ name: query.trim().split("@")[0], email: query.trim() });
    if (pills.length > 0) { play("chime"); setPills([]); setQuery(""); }
  };

  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, color: T.text, fontWeight: 475, fontSize: 16, lineHeight: "22px", letterSpacing: "-0.18px" }}>Add people</h2>
        <motion.button type="button" onClick={onClose} aria-label="Close share" whileTap={{ scale: 0.92 }} transition={{ duration: 0.1 }} className="balance-icobtn" style={{ marginRight: -4, display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
          <CloseIcon />
        </motion.button>
      </div>
      <div style={{ position: "relative", width: "100%" }}>
        <div onClick={() => inputRef.current?.focus()} style={{ position: "relative", display: "flex", minHeight: 48, cursor: "text", alignItems: "center", gap: 8, borderRadius: 999, background: "#1e1f1e", padding: "6px 6px 6px 12px", boxShadow: "inset 0 1px 2px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.06), 0 1px 0 rgba(255,255,255,.04)", boxSizing: "border-box" }}>
          <div style={{ display: "flex", minWidth: 0, flex: 1, flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            {pills.map((user) => (
              <motion.span
                key={user.email}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", visualDuration: 0.22, bounce: 0.15 }}
                style={{ display: "inline-flex", height: 34, flexShrink: 0, alignItems: "center", gap: 8, borderRadius: 999, background: T.raised, padding: "0 6px 0 4px", boxShadow: T.raisedShadow, willChange: "transform", boxSizing: "border-box" }}
              >
                <Avatar user={user} size={26} />
                <span style={{ color: T.text, fontSize: 14, lineHeight: "20px", fontWeight: 500, letterSpacing: "-0.06px" }}>{user.name}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); removePill(user.email); }} aria-label={`Remove ${user.name}`} className="balance-x" style={{ display: "grid", width: 18, height: 18, flexShrink: 0, placeItems: "center", borderRadius: 999, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
                  <CloseCircleIcon />
                </button>
              </motion.span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
              onKeyDown={handleKeyDown}
              placeholder={pills.length === 0 ? "Email Address" : ""}
              aria-label="Email to invite"
              autoComplete="off"
              className="balance-input"
              style={{ font: "inherit", minWidth: 100, flex: 1, background: "transparent", border: "none", outline: "none", padding: "4px", fontSize: 15, lineHeight: "20px", color: T.text, fontWeight: 400 }}
            />
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {isEmpty ? (
              <motion.div key="paste" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={SWAP_SPRING} style={{ willChange: "transform" }}>
                <motion.button
                  type="button"
                  onClick={handlePaste}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.1 }}
                  style={{ position: "relative", display: "inline-flex", height: 36, flexShrink: 0, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 999, padding: "0 16px", color: "#fff", border: "none", cursor: "pointer", background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%), #34b562", boxShadow: "0 0 0 0.75px #2a9a52, 0 5px 5px -2.5px rgba(52,181,98,0.16), 0 1px 3px -1.5px rgba(0,0,0,0.4), inset 0 1px 2px 0 rgba(255,255,255,0.22)", fontFamily: "inherit", fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px" }}
                >
                  Paste
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="send" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={SWAP_SPRING} style={{ willChange: "transform" }}>
                <motion.button
                  type="button"
                  onClick={handleSend}
                  aria-label="Send invite"
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.1 }}
                  style={{ position: "relative", display: "grid", width: 36, height: 36, flexShrink: 0, placeItems: "center", overflow: "hidden", borderRadius: 999, border: "none", cursor: "pointer", padding: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%), #e3e8e3", boxShadow: "0 0 0 0.75px rgba(255,255,255,.3), 0 1px 3px -1.5px rgba(0,0,0,0.5), inset 0 1px 2px 0 rgba(255,255,255,0.4)" }}
                >
                  <ArrowRightIcon />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.97, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, scale: 0.97, filter: "blur(2px)" }}
              transition={{ type: "spring", duration: 0.24, bounce: 0 }}
              style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 8px)", zIndex: 30, overflow: "hidden", borderRadius: 16, background: T.raised, padding: 6, transformOrigin: "top center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 12px 32px -8px rgba(0,0,0,0.6), 0 4px 8px -4px rgba(0,0,0,0.5)", willChange: "transform, filter" }}
            >
              {suggestions.map((u, i) => {
                const active = i === highlighted;
                return (
                  <button
                    key={u.email}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onPointerDown={(e) => { e.preventDefault(); addPill(u); }}
                    onPointerEnter={() => setHighlighted(i)}
                    style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, borderRadius: 12, padding: 8, textAlign: "left", border: "none", cursor: "pointer", font: "inherit", backgroundColor: active ? "rgba(255,255,255,.06)" : "transparent", transition: "background-color 150ms" }}
                  >
                    <Avatar user={u} size={28} />
                    <div style={{ display: "flex", minWidth: 0, flex: 1, alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14, fontWeight: 500, lineHeight: "20px", color: T.text }}>{u.name}</span>
                      <span style={{ flexShrink: 0, fontSize: 12, lineHeight: "18px", color: T.muted }}>{u.email}</span>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function UserRow() {
  const me = { name: "James okocha", email: "james@email.com" };
  return (
    <div style={{ display: "flex", width: "100%", alignItems: "center", gap: 8, padding: "0 12px", boxSizing: "border-box" }}>
      <Avatar user={me} size={24} />
      <div style={{ display: "flex", minWidth: 0, flex: 1, alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: T.text, fontWeight: 500, fontSize: 13, lineHeight: "20px" }}>James okocha</span>
        <span style={{ flexShrink: 0, color: T.muted, fontSize: 12, lineHeight: "18px" }}>James@email.com</span>
      </div>
    </div>
  );
}

// ── Fit into the card box ──────────────────────────────────
function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      if (size === "big") return setS(Math.min(1.5, (W - 120) / NAT_W, (H - 120) / NAT_H));
      let avail = H - 116;
      if (avail < NAT_H * 0.7) avail = H - 24;
      setS(Math.max(0.3, Math.min(1, (W - 40) / NAT_W, avail / NAT_H)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return [ref, s] as const;
}

function formatDateLabel(date: Date): string {
  const diff = Math.round((TODAY.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const fade = (d: number) => ({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: d, ease: EASE_OUT } });

export default function Balance({ size = "card" }: { size?: "card" | "big" }) {
  const reduced = useReducedMotion() ?? false;
  const [rootRef, scale] = useFit(size);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(TODAY);
  const dateLabel = formatDateLabel(selectedDate);
  // The source clips the suggestions under the card; once the resize has settled we let them show.
  const [unclip, setUnclip] = useState(false);
  useEffect(() => {
    if (!shareOpen) return setUnclip(false);
    const t = setTimeout(() => setUnclip(true), 320);
    return () => clearTimeout(t);
  }, [shareOpen]);

  return (
    <MotionConfig reducedMotion="user" transformPagePoint={(p) => ({ x: p.x / scaleRef.current, y: p.y / scaleRef.current })}>
      <style>{`.balance-input::placeholder{color:${T.muted};opacity:1}.balance-input{caret-color:${T.green}}.balance-icobtn{color:${T.muted};transition:color 150ms}.balance-icobtn:hover{color:${T.text}}.balance-x{color:${T.faint};transition:color 150ms}.balance-x:hover{color:${T.muted}}.balance-root button:focus-visible,.balance-root [tabindex]:focus-visible{outline:2px solid rgba(52,181,98,.55);outline-offset:2px}`}</style>
      <div ref={rootRef} className="balance-root" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center" }}>
          <div
            data-own-click=""
            style={{ pointerEvents: "auto", background: "#202120", padding: "4px 4px 12px 4px", borderRadius: 24, width: NAT_W, boxSizing: "border-box", boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(255,255,255,.04), 0 10px 30px -10px rgba(0,0,0,.5)" }}
          >
            {/* Card surface */}
            <div style={{ position: "relative", width: "100%", borderRadius: 20, padding: 16, background: T.raised, boxShadow: T.raisedShadow, boxSizing: "border-box" }}>
              <AutoResize reduced={reduced} unclip={unclip}>
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 11 }}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {shareOpen ? (
                      <motion.div key="share" {...fade(0.2)} style={{ width: "100%" }}>
                        <ShareCard onClose={() => { play("close"); setShareOpen(false); }} maxSuggestions={size === "big" ? 5 : 3} />
                      </motion.div>
                    ) : (
                      <motion.div key="balance" {...fade(0.2)} style={{ display: "flex", width: "100%", flexDirection: "column", gap: 11 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: T.text, fontSize: 16, lineHeight: "22px", letterSpacing: "-0.18px", fontWeight: 475 }}>Total Balance</span>
                          <InfoIcon />
                          <span style={{ marginLeft: "auto" }}><MoreIcon /></span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: T.text, fontSize: 32, lineHeight: 1.1, letterSpacing: "-1.2px" }}>2,982</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", display: "inline-flex", height: 20, alignItems: "center", borderRadius: 5, background: "rgba(52,181,98,.14)", padding: "0 6px", fontSize: 12, lineHeight: "18px", color: "#5fd38a" }}>2.45%</span>
                        </div>
                        <BarChart maxHeight={102} reduced={reduced} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AutoResize>
            </div>

            {/* Below the surface: actions ↔ date ruler ↔ the sharer */}
            <AutoResize reduced={reduced} style={{ marginTop: 12 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                {pickerOpen ? (
                  <motion.div key="picker" {...fade(0.18)}>
                    <DateWheel selected={selectedDate} onChange={setSelectedDate} label={dateLabel} onClose={() => { play("close"); setPickerOpen(false); }} reduced={reduced} />
                  </motion.div>
                ) : shareOpen ? (
                  <motion.div key="user" {...fade(0.18)}>
                    <UserRow />
                  </motion.div>
                ) : (
                  <motion.div key="actions" {...fade(0.18)}>
                    <div style={{ display: "flex", width: "100%", alignItems: "flex-start", justifyContent: "space-between", padding: "0 12px", boxSizing: "border-box" }}>
                      <TodayPill label={dateLabel} onClick={() => { play("open"); setShareOpen(false); setPickerOpen(true); }} ariaLabel="Open date picker" />
                      <motion.button
                        type="button"
                        onClick={() => { play("open"); setPickerOpen(false); setShareOpen(true); }}
                        aria-label="Open share modal"
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.1 }}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, background: T.raised, padding: "6px 12px", color: T.sub, border: "none", cursor: "pointer", font: "inherit", fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", boxShadow: T.raisedShadow }}
                      >
                        Share
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </AutoResize>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
