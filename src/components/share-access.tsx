// Share access: the "Anyone" row from the share sheet. Switch it off and the invite field
// springs open with email chips (type an email and press Enter to add one, x to remove);
// switch it back on and the field folds away.
// Split out of the old share.tsx (ported from ~/Documents/Share animation/src/ShareModal.tsx),
// same springs and timings.
import { useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
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

/* ── timing + motion (verbatim) ─────────────────────────── */
/* ── Switch ───────────────────────────────────────────────
 * A rounded rectangle, not a pill: the track is 23:16, the thumb is a near-square with its own
 * hairline border and a soft drop shadow, as tall as the track so it sits on the edge.
 * Off: a dark inset well. On: a green gradient with a darker green rim and a top highlight.
 * Press and the thumb stretches toward where it is going; release and it springs across.
 * The hit area is padded to at least 24px tall around the 16px (or larger) body. */
const SW_SPRING = { type: "spring", stiffness: 700, damping: 42, mass: 0.7 } as const;
function Switch({ checked, onChange, label, h = 16, focus }: { checked: boolean; onChange: (v: boolean) => void; label: string; h?: number; focus?: string }) {
  const w = Math.round(h * 1.45), tw = Math.round(h * 0.84), travel = w - tw;
  const [press, setPress] = useState(false);
  const reduced = useReducedMotion();
  const stretch = press ? Math.round(h * 0.2) : 0;
  const r = h * 0.3, rt = h * 0.27;
  const up = () => setPress(false);
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={focus}
      onClick={() => onChange(!checked)} onPointerDown={() => setPress(true)} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}
      style={{ position: "relative", width: w, height: h, padding: 0, border: 0, background: "transparent", cursor: "pointer", flexShrink: 0, borderRadius: r, WebkitTapHighlightColor: "transparent" }}>
      <span aria-hidden style={{ position: "absolute", inset: `${-Math.max(4, (24 - h) / 2)}px -6px` }} />
      <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: r, background: "linear-gradient(180deg,#363936,#414441)", boxShadow: "inset 0 1px 2px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.08), 0 1px 0 rgba(255,255,255,.04)" }} />
      <motion.span aria-hidden initial={false} animate={{ opacity: checked ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.16, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: r, background: "linear-gradient(180deg,#3ccb73,#1c9747)", boxShadow: "inset 0 0 0 1px #12753a, inset 0 1px 0 rgba(255,255,255,.3), 0 0 0 .5px rgba(0,0,0,.45)" }} />
      <motion.span aria-hidden initial={false} animate={{ x: checked ? travel - stretch : 0, width: tw + stretch }} transition={reduced ? { duration: 0 } : SW_SPRING}
        style={{ position: "absolute", top: 0, left: 0, height: h, borderRadius: rt, background: "linear-gradient(180deg,#ffffff,#eaedea)",
          boxShadow: `inset 0 0 0 1px ${checked ? "rgba(18,117,58,.85)" : "rgba(0,0,0,.32)"}, inset 0 1.5px 0 #fff, 0 1px 1.5px rgba(0,0,0,.35), 0 3px 6px -2px rgba(0,0,0,.45)`,
          transition: "box-shadow 160ms ease" }} />
    </button>
  );
}
const SPRING_LAYOUT = { type: "spring" as const, stiffness: 240, damping: 22 };
const CHIP_SPRING = { type: "spring" as const, visualDuration: 0.2, bounce: 0.3 };

const AV_BG = ["#ffecc0", "#c0d5ff", "#c0eaff", "#cac0ff", "#ffc0c5", "#d6e8c9"];
function avatarBg(email: string) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
  return AV_BG[h % AV_BG.length];
}
const displayName = (e: string) => (e.includes("@") ? e.split("@")[0] : e);

function Avatar({ email, size }: { email: string; size: number }) {
  return (
    <div aria-hidden="true" style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, background: avatarBg(email), color: "#1c1d1c", display: "grid", placeItems: "center", fontSize: Math.round(size * 0.42), fontWeight: 600, lineHeight: 1, textTransform: "uppercase", boxShadow: "inset 0 -1px 2px rgba(0,0,0,.12)" }}>
      {displayName(email).slice(0, 1)}
    </div>
  );
}

/* ── fit: scale into the tile, stay inside when it grows ── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const rest = useRef({ h: 0, W: 0, H: 0 });
  useLayoutEffect(() => {
    const root = rootRef.current, inner = innerRef.current;
    if (!root || !inner) return;
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight, w = inner.offsetWidth, h = inner.offsetHeight;
      if (!W || !H || !w || !h) return;
      const r = rest.current;
      if (r.W !== W || r.H !== H) { r.W = W; r.H = H; r.h = h; }
      if (h < r.h) r.h = h;
      const big = size === "big";
      const clear = big ? 120 : H < 260 ? 84 : 116;
      setScale(Math.min(big ? 1.6 : 1, (W - 32) / w, (H - clear) / r.h, (H - 16) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); ro.observe(inner); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, innerRef, scale };
}

/* ── icons ──────────────────────────────────────────────── */
const Globe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.8" />
    <path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
const XIcon = ({ c = T.muted, s = 10 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 2l6 6M8 2L2 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" /></svg>
);

function EmailChip({ email, onRemove }: { email: string; onRemove: () => void }) {
  return (
    <motion.div layout initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.12, ease: "easeIn" } }} transition={CHIP_SPRING}
      style={{ display: "flex", gap: 6, alignItems: "center", padding: "2px 4px", borderRadius: 16, flexShrink: 0, background: T.raised, boxShadow: T.raisedShadow }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Avatar email={email} size={16} />
        <span style={{ lineHeight: "18px", fontSize: 12, color: T.text, whiteSpace: "nowrap" }}>{displayName(email)}</span>
      </div>
      <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label={`Remove ${email}`} className="access-focus" style={{ width: 16, height: 16, borderRadius: 999, border: 0, padding: 0, cursor: "pointer", background: "transparent", display: "grid", placeItems: "center" }}>
        <XIcon s={8} />
      </button>
    </motion.div>
  );
}

const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto" as const, opacity: 1 },
  exit: { height: 0, opacity: 0, transition: { height: { duration: 0.2, ease: [0.4, 0, 1, 1] as [number, number, number, number] }, opacity: { duration: 0.1, ease: "easeIn" as const } } },
  transition: { height: SPRING_LAYOUT, opacity: { duration: 0.22, ease: "easeOut" as const } },
};

const SEED = ["john@email.com", "james@email.com"];

/* ── component ──────────────────────────────────────────── */
export default function ShareAccess({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, innerRef, scale } = useFit(size);
  const [toggled, setToggled] = useState(true);
  const [emails, setEmails] = useState<string[]>(SEED);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = () => {
    const next = !toggled;
    setToggled(next);
    play(next ? "on" : "off");
    play(next ? "close" : "open");
    if (!next && emails.length === 0) setEmails(SEED); // open again with chips so the demo repeats
  };
  const addEmail = (raw: string) => {
    const v = raw.trim().replace(/,$/, "");
    if (v && !emails.includes(v)) { setEmails((p) => [...p, v]); play("pop"); }
    setInputValue("");
  };
  const removeEmail = (e: string) => { setEmails((p) => p.filter((x) => x !== e)); play("remove"); };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); if (inputValue.trim()) addEmail(inputValue); }
    else if (e.key === "Backspace" && inputValue === "" && emails.length) { setEmails((p) => p.slice(0, -1)); play("remove"); }
    else if (e.key.length === 1 || e.key === "Backspace") play("key", { gap: 40 });
  };

  return (
    <MotionConfig reducedMotion="user">
      <style>{`.access-focus:focus-visible{outline:2px solid ${T.green};outline-offset:2px}.access-input::placeholder{color:${T.faint}}`}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click style={{ pointerEvents: "auto", width: 360, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <div style={{ position: "relative", borderRadius: 20, background: T.raised, boxShadow: T.raisedShadow, display: "flex", flexDirection: "column", paddingTop: 12, paddingBottom: toggled ? 12 : 0, transition: "padding-bottom 0.2s cubic-bezier(0.215, 0.61, 0.355, 1)" }}>
            <div style={{ padding: "0 12px" }}>
              <div style={{ background: "rgba(255,255,255,.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)", padding: 12, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                  <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0, borderRadius: 8, display: "grid", placeItems: "center", background: "linear-gradient(180deg, rgba(255,255,255,0.154) 6.67%, rgba(255,255,255,0) 103.33%), #0088fe", boxShadow: "inset 0 -2px 4px rgba(255,255,255,.25), inset 0 2px 4px rgba(255,255,255,.16), 0 0 0 1px rgba(0,0,0,.45), 0 4px 8px -4px rgba(0,136,254,.5)" }}>
                    <Globe />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: "20px", minWidth: 0 }}>
                    <span style={{ fontWeight: 500, fontSize: 14, color: T.text }}>Anyone</span>
                    <span style={{ fontSize: 13, color: T.muted, whiteSpace: "nowrap" }}>Everyone with the link can access</span>
                  </div>
                </div>
                <Switch checked={toggled} onChange={() => toggle()} label="Public access" h={18} focus="access-focus" />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {!toggled && (
                <motion.div key="invite" style={{ overflow: "hidden", width: "100%" }} {...collapse}>
                  <div style={{ padding: 12, paddingTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.43, color: T.text2 }}>Invite members</span>
                    <div onClick={() => inputRef.current?.focus()}
                      style={{ minHeight: 36, display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", borderRadius: 12, background: "rgba(0,0,0,.22)", boxShadow: "inset 0 1px 2px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.06)", cursor: "text", minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", flex: 1, minWidth: 0 }}>
                        <AnimatePresence mode="popLayout" initial={false}>
                          {emails.map((e) => <EmailChip key={e} email={e} onRemove={() => removeEmail(e)} />)}
                        </AnimatePresence>
                        <input ref={inputRef} type="text" aria-label="Email" value={inputValue} className="access-input"
                          onChange={(ev) => setInputValue(ev.target.value)} onKeyDown={onKey} onBlur={() => { if (inputValue.trim()) addEmail(inputValue); }}
                          placeholder={emails.length ? "Add email" : "Enter email"}
                          style={{ flex: 1, minWidth: 70, height: 20, fontSize: 14, lineHeight: "20px", color: T.text, background: "transparent", outline: "none", border: "none", padding: 0 }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
