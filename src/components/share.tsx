// Share: the share sheet. Switch "Anyone" off and the invite field springs open
// (chips, permission menu, invite, swipe-to-delete members); Copy link squishes,
// flips to Copied and fires a GSAP dot burst.
// Ported from ~/Documents/Share animation/src/ShareModal.tsx, same springs and timings.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { motion, AnimatePresence, MotionConfig, useMotionValue, useTransform, useReducedMotion, animate as fmAnimate } from "framer-motion";
import { gsap } from "gsap";

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
  primaryShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 1px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.4)",
};

/* ── timing + motion (verbatim) ─────────────────────────── */
const TIMING = { card: 80, accessRow: 360, urlRow: 460 };
const CARD = { initialY: 28, initialScale: 0.94, spring: { type: "spring" as const, visualDuration: 0.55, bounce: 0.35 } };
const ROW = { offsetY: 12, spring: { type: "spring" as const, visualDuration: 0.42, bounce: 0.28 } };
const COPY_BTN = { pressScale: 0.88, spring: { type: "spring" as const, visualDuration: 0.3, bounce: 0.55 }, resetMs: 2200 };
const TOGGLE = { thumbTravel: 14, spring: { type: "spring" as const, visualDuration: 0.3, bounce: 0.3 } };
const SPRING_LAYOUT = { type: "spring" as const, stiffness: 240, damping: 22 };
const CHIP_SPRING = { type: "spring" as const, visualDuration: 0.2, bounce: 0.3 };
const MEMBER_SPRING = { type: "spring" as const, visualDuration: 0.28, bounce: 0.18 };
const DROP_SPRING = { type: "spring" as const, visualDuration: 0.22, bounce: 0.2 };
const SWIPE_DELETE_WIDTH = 44;
const SWIPE_SNAP = { type: "spring" as const, stiffness: 500, damping: 38 };
const BURST = { count: 12, radius: 48, duration: 0.55, colors: ["#34b562", "#5fd38a", "#9be6b4", "#22994c", "#1f8a45", "#3cc06b", "#2fae5c", "#7ddca0", "#c3f0d3", "#e3f7ec", "#34b562", "#5fd38a"] };
const EVAPORATE = { count: 6, duration: 0.45, colors: ["#fca5a5", "#f87171", "#ef4444", "#fecaca", "#fda4af", "#f87171"] };

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
function fireEvaporate(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < EVAPORATE.count; i++) {
    const dot = document.createElement("span");
    const s = 3 + Math.random() * 3;
    Object.assign(dot.style, { position: "fixed", width: `${s}px`, height: `${s}px`, borderRadius: "50%", background: EVAPORATE.colors[i % EVAPORATE.colors.length], left: `${cx}px`, top: `${cy}px`, pointerEvents: "none", zIndex: "9999", transform: "translate(-50%, -50%)" });
    document.body.appendChild(dot);
    gsap.fromTo(dot, { x: 0, y: 0, opacity: 1, scale: 1 }, { x: (Math.random() - 0.5) * 22, y: -(16 + Math.random() * 24), opacity: 0, scale: 0.25, duration: EVAPORATE.duration, delay: i * 0.028, ease: "power1.out", onComplete: () => dot.remove() });
  }
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
const ArrowDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 10l5 5 5-5" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const XIcon = ({ c = T.muted, s = 10 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 2l6 6M8 2L2 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" /></svg>
);
const Check = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ── permission dropdown (anchored, not portaled, so it scales with the card) ── */
type Permission = "view" | "edit";
function PermissionDropdown({ value, onChange }: { value: Permission; onChange: (v: Permission) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button type="button" className="share-focus" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
        style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0, cursor: "pointer", background: "none", border: 0, padding: 0, borderRadius: 4 }}>
        <span style={{ fontSize: 13, lineHeight: "20px", color: T.muted, whiteSpace: "nowrap" }}>{value === "view" ? "Can view" : "Can edit"}</span>
        <ArrowDown />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 20, transformOrigin: "top right" }}
            initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8, transition: { duration: 0.12, ease: "easeIn" } }} transition={DROP_SPRING}>
            <div style={{ background: "#2b2d2b", display: "flex", flexDirection: "column", gap: 2, padding: 4, borderRadius: 24, width: 132, boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.6), 0 12px 24px -8px rgba(0,0,0,.6)" }}>
              {(["edit", "view"] as const).map((opt) => {
                const sel = value === opt;
                return (
                  <button type="button" role="menuitemradio" aria-checked={sel} key={opt} className="share-focus" onClick={() => { onChange(opt); setOpen(false); }}
                    style={{ display: "flex", gap: 12, alignItems: "center", minHeight: 36, padding: "6px 12px", borderRadius: 20, width: "100%", textAlign: "left", cursor: "pointer", border: 0, background: sel ? "rgba(255,255,255,.07)" : "transparent", color: sel ? T.text : T.muted }}>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, lineHeight: 1.43, whiteSpace: "nowrap" }}>Can {opt}</span>
                    {sel && <span style={{ color: T.green, display: "flex" }}><Check s={14} /></span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── member row: swipe left to reveal delete ────────────── */
interface Member { email: string; permission: Permission }
function MemberRow({ member, delay, onPermissionChange, onDelete }: { member: Member; delay: number; onPermissionChange: (v: Permission) => void; onDelete: () => void }) {
  const x = useMotionValue(0);
  const delOpacity = useTransform(x, [-6, 0], [1, 0]);
  const delRef = useRef<HTMLButtonElement>(null);
  return (
    <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6, transition: { duration: 0.12, ease: "easeIn" } }}
      transition={{ ...MEMBER_SPRING, delay }} style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 10 }}>
      <motion.div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: SWIPE_DELETE_WIDTH, display: "flex", opacity: delOpacity }}>
        <button ref={delRef} type="button" aria-label={`Remove ${member.email}`} className="share-focus"
          onClick={() => { if (delRef.current) fireEvaporate(delRef.current); onDelete(); }}
          style={{ flex: 1, border: 0, cursor: "pointer", background: "#ef4444", borderRadius: "0 10px 10px 0", display: "grid", placeItems: "center" }}>
          <XIcon c="#fff" s={12} />
        </button>
      </motion.div>
      <motion.div style={{ x, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", position: "relative", background: "#272927", padding: "2px 4px", cursor: "grab" }}
        drag="x" dragConstraints={{ left: -SWIPE_DELETE_WIDTH, right: 0 }} dragElastic={0.06} dragMomentum={false}
        onDragEnd={() => fmAnimate(x, x.get() < -(SWIPE_DELETE_WIDTH / 2) ? -SWIPE_DELETE_WIDTH : 0, SWIPE_SNAP)}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Avatar email={member.email} size={32} />
          <div style={{ display: "flex", flexDirection: "column", whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: 500, lineHeight: "20px", fontSize: 13, color: T.text }}>{displayName(member.email)}</span>
            <span style={{ lineHeight: "18px", fontSize: 12, color: T.muted }}>{member.email.includes("@") ? member.email : `${member.email}@email.com`}</span>
          </div>
        </div>
        <PermissionDropdown value={member.permission} onChange={onPermissionChange} />
      </motion.div>
    </motion.div>
  );
}

function EmailChip({ email, onRemove }: { email: string; onRemove: () => void }) {
  return (
    <motion.div layout initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.12, ease: "easeIn" } }} transition={CHIP_SPRING}
      style={{ display: "flex", gap: 6, alignItems: "center", padding: "2px 4px", borderRadius: 16, flexShrink: 0, background: T.raised, boxShadow: T.raisedShadow }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Avatar email={email} size={16} />
        <span style={{ lineHeight: "18px", fontSize: 12, color: T.text, whiteSpace: "nowrap" }}>{displayName(email)}</span>
      </div>
      <button type="button" onClick={onRemove} aria-label={`Remove ${email}`} className="share-focus" style={{ width: 16, height: 16, borderRadius: 999, border: 0, padding: 0, cursor: "pointer", background: "transparent", display: "grid", placeItems: "center" }}>
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

/* ── component ──────────────────────────────────────────── */
export default function Share({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, innerRef, scale } = useFit(size);
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [toggled, setToggled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [inputPermission, setInputPermission] = useState<Permission>("view");
  const [members, setMembers] = useState<Member[]>([]);
  const copyRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = [setTimeout(() => setStage(1), TIMING.card), setTimeout(() => setStage(3), TIMING.accessRow), setTimeout(() => setStage(4), TIMING.urlRow)];
    return () => { t.forEach(clearTimeout); if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, []);

  const addEmail = (raw: string) => {
    const v = raw.trim().replace(/,$/, "");
    if (v && !emails.includes(v)) setEmails((p) => [...p, v]);
    setInputValue("");
  };
  const handleInvite = () => {
    const pending = inputValue.trim().replace(/,$/, "");
    const toInvite = [...emails, ...(pending ? [pending] : [])];
    if (!toInvite.length) return;
    setMembers((prev) => {
      const have = new Set(prev.map((m) => m.email));
      return [...prev, ...toInvite.filter((e) => !have.has(e)).map((e) => ({ email: e, permission: inputPermission }))];
    });
    setEmails([]); setInputValue("");
  };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); if (inputValue.trim()) addEmail(inputValue); }
    else if (e.key === "Backspace" && inputValue === "" && emails.length) setEmails((p) => p.slice(0, -1));
  };
  const handleCopy = () => {
    if (copied) return;
    setCopied(true);
    try { void navigator.clipboard?.writeText("https://orevbajohn.me").catch(() => {}); } catch { /* clipboard unavailable */ }
    if (copyRef.current && !reduced) fireBurst(copyRef.current);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), COPY_BTN.resetMs);
  };
  const rowIn = (s: number, delay: number) => ({ initial: { opacity: 0, y: ROW.offsetY }, animate: { opacity: stage >= s ? 1 : 0, y: stage >= s ? 0 : ROW.offsetY }, transition: { ...ROW.spring, delay } });

  return (
    <MotionConfig reducedMotion="user">
      <style>{`.share-focus:focus-visible{outline:2px solid ${T.green};outline-offset:2px}.share-input::placeholder{color:${T.faint}}`}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click style={{ pointerEvents: "auto", width: 360, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: CARD.initialY, scale: CARD.initialScale }}
            animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : CARD.initialY, scale: stage >= 1 ? 1 : CARD.initialScale }}
            transition={CARD.spring}
            style={{ position: "relative", borderRadius: 20, background: T.surface, boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(0,0,0,.5), 0 12px 32px -12px rgba(0,0,0,.6)" }}>

            {/* raised section: access row + invite + members */}
            <div style={{ position: "relative", borderRadius: 20, background: T.raised, boxShadow: T.raisedShadow, display: "flex", flexDirection: "column", paddingTop: 12, paddingBottom: toggled && members.length === 0 ? 12 : 0, transition: "padding-bottom 0.2s cubic-bezier(0.215, 0.61, 0.355, 1)" }}>
              <motion.div {...rowIn(3, 0.04)} style={{ padding: "0 12px" }}>
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
                  <button type="button" role="switch" aria-checked={toggled} aria-label="Public access" className="share-focus" onClick={() => setToggled((v) => !v)}
                    style={{ position: "relative", flexShrink: 0, height: 20, width: 40, borderRadius: 999, cursor: "pointer", border: 0, padding: 0, background: toggled ? T.green : "rgba(255,255,255,.14)", boxShadow: "inset 0 1px 2px rgba(0,0,0,.35)", transition: "background 0.22s ease" }}>
                    <motion.span animate={{ x: toggled ? TOGGLE.thumbTravel : 0 }} transition={TOGGLE.spring}
                      style={{ position: "absolute", top: 2, left: 2, width: 22, height: 16, borderRadius: 999, background: "#f4f6f4", boxShadow: toggled ? "0 0 1px rgba(0,0,0,.4), 0 2px 8px rgba(0,0,0,.25)" : "0 2px 4px rgba(0,0,0,.25), 0 1px 2px rgba(0,0,0,.3)", transition: "box-shadow 0.22s ease" }} />
                  </button>
                </div>
              </motion.div>

              <AnimatePresence initial={false}>
                {!toggled && (
                  <motion.div key="invite" style={{ overflow: "hidden", width: "100%" }} {...collapse}>
                    <div style={{ padding: 12, paddingTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.43, color: T.text2 }}>Invite members</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div onClick={() => inputRef.current?.focus()}
                          style={{ flex: 1, minHeight: 36, display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", borderRadius: 12, background: "rgba(0,0,0,.22)", boxShadow: "inset 0 1px 2px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.06)", cursor: "text", minWidth: 0 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", flex: 1, minWidth: 0 }}>
                            <AnimatePresence mode="popLayout" initial={false}>
                              {emails.map((e) => <EmailChip key={e} email={e} onRemove={() => setEmails((p) => p.filter((x) => x !== e))} />)}
                            </AnimatePresence>
                            <input ref={inputRef} type="text" aria-label="Email" value={inputValue} className="share-input"
                              onChange={(ev) => setInputValue(ev.target.value)} onKeyDown={onKey} onBlur={() => { if (inputValue.trim()) addEmail(inputValue); }}
                              placeholder={emails.length ? "" : "Enter email"}
                              style={{ flex: 1, minWidth: 70, height: 20, fontSize: 14, lineHeight: "20px", color: T.text, background: "transparent", outline: "none", border: "none", padding: 0 }} />
                          </div>
                          <div style={{ flexShrink: 0, height: 20, display: "flex", alignItems: "center" }}>
                            <PermissionDropdown value={inputPermission} onChange={setInputPermission} />
                          </div>
                        </div>
                        <motion.button type="button" className="share-focus" onClick={handleInvite} whileTap={{ scale: 0.93 }} transition={{ type: "spring", visualDuration: 0.25, bounce: 0.4 }}
                          style={{ height: 36, padding: "0 14px", borderRadius: 10, border: 0, cursor: "pointer", flexShrink: 0, background: T.primary, boxShadow: T.primaryShadow, color: "#fff", fontWeight: 500, fontSize: 14 }}>
                          Invite
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {members.length > 0 && (
                  <motion.div key="members" style={{ overflow: "hidden", width: "100%" }} {...collapse}>
                    <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                      <span style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.43, color: T.text2 }}>Members with access</span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        {members.map((m, i) => (
                          <MemberRow key={m.email} member={m} delay={i * 0.045}
                            onPermissionChange={(v) => setMembers((p) => p.map((x) => (x.email === m.email ? { ...x, permission: v } : x)))}
                            onDelete={() => setMembers((p) => p.filter((x) => x.email !== m.email))} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* url + copy link */}
            <motion.div {...rowIn(4, 0.06)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 12px 12px 16px" }}>
              <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://orevbajohn.me</span>
              <motion.button ref={copyRef} type="button" className="share-focus" onClick={handleCopy} whileTap={{ scale: COPY_BTN.pressScale }} transition={COPY_BTN.spring} aria-label="Copy link"
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
