// Share card: press Share and the balance card fades into an "Add people" card,
// its height tweening to fit, while the row below swaps to who is sharing. Type a
// name (or paste an email) and the matches drop down; pick one and it pops in as
// a pill, then send.
// Sounds: open on Share, close on the X, pop as a pill lands, remove when one is
// taken off, chime when the invite is sent.
// From balance.tsx (port of modal animaation / BalanceCard.tsx, ShareSection.tsx), dark.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { play } from "../sound/sound";

// ── Storyboard constants (exact from source) ───────────────
const EASE_OUT = [0.2, 0, 0, 1] as const;
const SWAP_SPRING = { type: "spring", visualDuration: 0.24, bounce: 0.18 } as const;

// Natural size: the tray, with room under the field for the suggestions.
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
  green: "#34b562",
};

// ── Icons (mingcute shapes, inline) ────────────────────────
const Svg = ({ size, children, style }: { size: number; children: ReactNode; style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0, ...style }}>{children}</svg>
);
const InfoIcon = () => (
  <Svg size={18}><circle cx="12" cy="12" r="8.5" stroke={T.faint} strokeWidth="1.8" /><path d="M12 11v5" stroke={T.faint} strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="8" r="1.1" fill={T.faint} /></Svg>
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

// ── People ─────────────────────────────────────────────────
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

  useEffect(() => { inputRef.current?.focus({ preventScroll: true }); }, []);

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
        <motion.button type="button" onClick={onClose} aria-label="Close share" whileTap={{ scale: 0.92 }} transition={{ duration: 0.1 }} className="share-icobtn" style={{ marginRight: -4, display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
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
                <button type="button" onClick={(e) => { e.stopPropagation(); removePill(user.email); }} aria-label={`Remove ${user.name}`} className="share-x" style={{ display: "grid", width: 18, height: 18, flexShrink: 0, placeItems: "center", borderRadius: 999, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
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
              placeholder={pills.length === 0 ? "Type a name, like J" : ""}
              aria-label="Name or email to invite"
              autoComplete="off"
              className="share-input"
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

function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.8);
  const [short, setShort] = useState(false); // a short box only has room for two suggestions
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      setShort(size !== "big" && H < 260);
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
  return [ref, s, short] as const;
}

const fade = (d: number) => ({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: d, ease: EASE_OUT } });

export default function ShareStep({ size = "card" }: { size?: "card" | "big" }) {
  const reduced = useReducedMotion() ?? false;
  const [rootRef, scale, short] = useFit(size);
  const [shareOpen, setShareOpen] = useState(false);
  // The source clips the suggestions under the card; once the resize has settled we let them show.
  const [unclip, setUnclip] = useState(false);
  useEffect(() => {
    if (!shareOpen) return setUnclip(false);
    const t = setTimeout(() => setUnclip(true), 320);
    return () => clearTimeout(t);
  }, [shareOpen]);
  const openShare = () => { play("open"); setShareOpen(true); };
  const closeShare = () => { play("close"); setShareOpen(false); };

  return (
    <MotionConfig reducedMotion="user">
      <style>{`.share-input::placeholder{color:${T.muted};opacity:1}.share-input{caret-color:${T.green}}.share-icobtn{color:${T.muted};transition:color 150ms}.share-icobtn:hover{color:${T.text}}.share-x{color:${T.faint};transition:color 150ms}.share-x:hover{color:${T.muted}}.share-root button:focus-visible{outline:2px solid rgba(52,181,98,.55);outline-offset:2px}`}</style>
      <div ref={rootRef} className="share-root" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
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
                        <ShareCard onClose={closeShare} maxSuggestions={size === "big" ? 5 : short ? 2 : 3} />
                      </motion.div>
                    ) : (
                      <motion.div key="balance" {...fade(0.2)} style={{ display: "flex", width: "100%", flexDirection: "column", gap: 11 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: T.text, fontSize: 16, lineHeight: "22px", letterSpacing: "-0.18px", fontWeight: 475 }}>Total Balance</span>
                          <InfoIcon />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: T.text, fontSize: 32, lineHeight: 1.1, letterSpacing: "-1.2px" }}>2,982</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", display: "inline-flex", height: 20, alignItems: "center", borderRadius: 5, background: "rgba(52,181,98,.14)", padding: "0 6px", fontSize: 12, lineHeight: "18px", color: "#5fd38a" }}>2.45%</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AutoResize>
            </div>

            {/* Below the surface: the Share button ↔ who is sharing */}
            <AutoResize reduced={reduced} style={{ marginTop: 12 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                {shareOpen ? (
                  <motion.div key="user" {...fade(0.18)}>
                    <UserRow />
                  </motion.div>
                ) : (
                  <motion.div key="actions" {...fade(0.18)}>
                    <div style={{ display: "flex", width: "100%", justifyContent: "flex-end", padding: "0 12px", boxSizing: "border-box" }}>
                      <motion.button
                        type="button"
                        onClick={openShare}
                        aria-label="Share balance"
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
