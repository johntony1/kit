// Swipe to delete: the members list from the share sheet. Swipe a member left to reveal the
// red delete button; press it and the row evaporates while the list closes the gap.
// Once everyone is gone, Bring everyone back refills the list.
// Split out of the old share.tsx (ported from ~/Documents/Share animation/src/ShareModal.tsx),
// same springs and timings.
import { useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig, useMotionValue, useTransform, animate as fmAnimate } from "framer-motion";
import { gsap } from "gsap";
import { play } from "../sound/sound";

/* ── tokens ─────────────────────────────────────────────── */
const T = {
  raised: "linear-gradient(180deg,#2b2d2b,#242624)",
  raisedShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)",
  text: "#e3e8e3",
  text2: "#c2cbc4",
  muted: "#8b968f",
  faint: "#5d6862",
  green: "#34b562",
};

/* ── timing + motion (verbatim) ─────────────────────────── */
const SPRING_LAYOUT = { type: "spring" as const, stiffness: 240, damping: 22 };
const MEMBER_SPRING = { type: "spring" as const, visualDuration: 0.28, bounce: 0.18 };
const SWIPE_DELETE_WIDTH = 44;
const SWIPE_SNAP = { type: "spring" as const, stiffness: 500, damping: 38 };
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

/* ── fit: scale into the tile, stay inside when it changes ── */
function useFit(size: "card" | "big", full: boolean) {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState(0);
  const rest = useRef({ h: 0, W: 0, H: 0 });
  useLayoutEffect(() => {
    const root = rootRef.current, inner = innerRef.current;
    if (!root || !inner) return;
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight, w = inner.offsetWidth, h = inner.offsetHeight;
      if (!W || !H || !w || !h) return;
      const r = rest.current;
      if (r.W !== W || r.H !== H) { r.W = W; r.H = H; r.h = h; setBoxH(H); }
      if (full) r.h = h; // fit the full list; while rows are removed, hold that scale
      else if (h > r.h) r.h = h;
      const big = size === "big";
      const clear = big ? 120 : H < 260 ? 84 : 116;
      setScale(Math.min(big ? 1.6 : 1, (W - 32) / w, (H - clear) / r.h, (H - 16) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); ro.observe(inner); update();
    return () => ro.disconnect();
  }, [size, full]);
  return { rootRef, innerRef, scale, boxH };
}

const XIcon = ({ c = T.muted, s = 10 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 2l6 6M8 2L2 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" /></svg>
);

/* ── member row: swipe left to reveal delete ────────────── */
interface Member { email: string; permission: "Can view" | "Can edit" }
function MemberRow({ member, delay, onDelete }: { member: Member; delay: number; onDelete: () => void }) {
  const x = useMotionValue(0);
  const delOpacity = useTransform(x, [-6, 0], [1, 0]);
  const delRef = useRef<HTMLButtonElement>(null);
  const open = useRef(false);
  const snap = (to: number) => {
    const next = to !== 0;
    if (next !== open.current) play("slide", { gap: 60 });
    open.current = next;
    fmAnimate(x, to, SWIPE_SNAP);
  };
  return (
    <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6, transition: { duration: 0.12, ease: "easeIn" } }}
      transition={{ ...MEMBER_SPRING, delay }} style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 10 }}>
      <motion.div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: SWIPE_DELETE_WIDTH, display: "flex", opacity: delOpacity }}>
        <button ref={delRef} type="button" aria-label={`Remove ${member.email}`} className="swipe-focus"
          onClick={() => { if (delRef.current) fireEvaporate(delRef.current); play("remove"); onDelete(); }}
          style={{ flex: 1, border: 0, cursor: "pointer", background: "#ef4444", borderRadius: "0 10px 10px 0", display: "grid", placeItems: "center" }}>
          <XIcon c="#fff" s={12} />
        </button>
      </motion.div>
      <motion.div style={{ x, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", position: "relative", background: "#272927", padding: "2px 4px", cursor: "grab", touchAction: "pan-y" }}
        drag="x" dragConstraints={{ left: -SWIPE_DELETE_WIDTH, right: 0 }} dragElastic={0.06} dragMomentum={false}
        onDragEnd={() => snap(x.get() < -(SWIPE_DELETE_WIDTH / 2) ? -SWIPE_DELETE_WIDTH : 0)}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Avatar email={member.email} size={32} />
          <div style={{ display: "flex", flexDirection: "column", whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: 500, lineHeight: "20px", fontSize: 13, color: T.text }}>{displayName(member.email)}</span>
            <span style={{ lineHeight: "18px", fontSize: 12, color: T.muted }}>{member.email}</span>
          </div>
        </div>
        <span style={{ fontSize: 13, lineHeight: "20px", color: T.muted, whiteSpace: "nowrap", paddingRight: 4 }}>{member.permission}</span>
      </motion.div>
    </motion.div>
  );
}

const MEMBERS: Member[] = [
  { email: "john@email.com", permission: "Can edit" },
  { email: "james@email.com", permission: "Can view" },
  { email: "eve@email.com", permission: "Can view" },
];

/* ── component ──────────────────────────────────────────── */
export default function SwipeDelete({ size = "card" }: { size?: "card" | "big" }) {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [round, setRound] = useState(0);
  const { rootRef, innerRef, scale, boxH } = useFit(size, members.length === MEMBERS.length);
  const short = size === "card" && boxH > 0 && boxH < 260; // a short tile shows two rows
  const shown = short ? members.slice(0, 2) : members;

  const restore = () => { setMembers(MEMBERS); setRound((r) => r + 1); play("drop"); };

  return (
    <MotionConfig reducedMotion="user">
      <style>{`.swipe-focus:focus-visible{outline:2px solid ${T.green};outline-offset:2px}`}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click style={{ pointerEvents: "auto", width: 340, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <motion.div layout transition={SPRING_LAYOUT} style={{ borderRadius: 20, background: T.raised, boxShadow: T.raisedShadow, padding: 12, display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" }}>
            <motion.div layout="position" transition={SPRING_LAYOUT} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.43, color: T.text2 }}>Members with access</span>
              <span style={{ fontSize: 12, lineHeight: "18px", color: T.faint, whiteSpace: "nowrap" }}>Swipe left to remove</span>
            </motion.div>
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((m, i) => (
                <MemberRow key={`${m.email}-${round}`} member={m} delay={i * 0.045} onDelete={() => setMembers((p) => p.filter((x) => x.email !== m.email))} />
              ))}
              {members.length === 0 && (
                <motion.button key="restore" type="button" layout className="swipe-focus" onClick={restore}
                  initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12, ease: "easeIn" } }}
                  whileTap={{ scale: 0.95 }} transition={MEMBER_SPRING}
                  style={{ height: 36, borderRadius: 10, border: 0, cursor: "pointer", background: "rgba(255,255,255,.05)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)", color: T.text2, fontWeight: 500, fontSize: 14 }}>
                  Bring everyone back
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
