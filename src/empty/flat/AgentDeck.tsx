/* AgentDeck: an empty state made of real UI. A row of agent cards slides past; the one in the
 * middle arrives as a skeleton, then its agent resolves out of a blur. The card before it drifts
 * off to the left, faded; the next one waits on the right as a skeleton.
 *
 * Storyboard (one beat, then it repeats with the next agent):
 *     0ms   a skeleton card sits in the middle
 *   900ms   the agent resolves: blur 6px to 0, opacity 0 to 1, up 4px (420ms)
 *  2700ms   the row slides one card left (560ms, cubic-bezier(.2,0,0,1)); a new skeleton
 *           arrives in the middle
 *
 * React and framer-motion only. Render it inside a positioned box with a size. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type DeckMode = "light" | "dark";

const TIMING = { resolve: 900, slide: 2700, beat: 3260 };
const W = 300, H = 158, GAP = 22; // one card, and the space between cards

const AGENTS = [
  { name: "Maya", role: "Research agent", text: "Reads the sources, checks the facts and writes a short brief for every question.", a: "#b18cff", b: "#7b5cf0" },
  { name: "Leo", role: "Support agent", text: "Answers incoming tickets, solves the common ones and hands the hard ones to a person.", a: "#ffb46b", b: "#f2742f" },
  { name: "Ava", role: "Data analyst", text: "Works through large datasets, builds clear charts and points out what matters.", a: "#7fd7ff", b: "#2f9ce8" },
  { name: "Noah", role: "Sales agent", text: "Finds good leads, writes the first email and books the call when they reply.", a: "#7ee3a8", b: "#24a865" },
];

const P = {
  light: { card: "#ffffff", foot: "#fafafb", line: "rgba(20,24,32,.07)", skel: "#f0f1f3", ink: "#1d1f23", muted: "#8b9099", key: "#ffffff", shadow: "0 0 0 1px rgba(20,24,32,.07), 0 14px 34px -14px rgba(20,24,32,.22), 0 2px 6px -2px rgba(20,24,32,.06)", flat: "0 0 0 1px rgba(20,24,32,.06)" },
  dark: { card: "#1c1d20", foot: "#18191c", line: "rgba(255,255,255,.07)", skel: "rgba(255,255,255,.07)", ink: "#eceef0", muted: "#8a8f98", key: "#222327", shadow: "0 0 0 1px rgba(255,255,255,.08), 0 18px 40px -16px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.04)", flat: "0 0 0 1px rgba(255,255,255,.06)" },
};

const Bar = ({ w, h = 8, c }: { w: number | string; h?: number; c: string }) => <span style={{ display: "block", width: w, height: h, borderRadius: 99, background: c }} />;

const Sparkle = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d="M12 2.5c.9 4.6 4.9 8.6 9.5 9.5-4.6.9-8.6 4.9-9.5 9.5-.9-4.6-4.9-8.6-9.5-9.5 4.6-.9 8.6-4.9 9.5-9.5z" fill="#fff" fillOpacity=".95" />
    <path d="M5 5.5a8 8 0 0 1 4.5-2.4M18.9 5.5a8 8 0 0 1 2.4 4.5M19 18.5a8 8 0 0 1-4.5 2.4M5.1 18.5a8 8 0 0 1-2.4-4.5" stroke="#fff" strokeOpacity=".45" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </svg>
);
const Clock = ({ c }: { c: string }) => <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill={c} /><path d="M8 4.6V8l2.2 1.4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg>;
const Phone = ({ c }: { c: string }) => <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.4 1.8l1.9 2.7-1.2 1.6a8.6 8.6 0 0 0 4.8 4.8l1.6-1.2 2.7 1.9-.9 2a2 2 0 0 1-2.1 1.1C6.6 13.9 2.1 9.4 1.3 4.8A2 2 0 0 1 2.4 2.7z" fill={c} /></svg>;
const Gear = ({ c }: { c: string }) => <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill={c} fillRule="evenodd" d="M6.8 1h2.4l.4 1.9 1.3.6 1.7-1 1.7 1.7-1 1.7.6 1.3 1.9.4v2.4l-1.9.4-.6 1.3 1 1.7-1.7 1.7-1.7-1-1.3.6-.4 1.9H6.8l-.4-1.9-1.3-.6-1.7 1-1.7-1.7 1-1.7-.6-1.3L.2 9.2V6.8l1.9-.4.6-1.3-1-1.7 1.7-1.7 1.7 1 1.3-.6zM8 10.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z" /></svg>;

function Card({ i, filled, mode, centre }: { i: number; filled: boolean; mode: DeckMode; centre: boolean }) {
  const p = P[mode], ag = AGENTS[((i % AGENTS.length) + AGENTS.length) % AGENTS.length];
  const key = (child: React.ReactNode) => <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", background: filled ? p.key : p.skel, boxShadow: filled ? `0 0 0 1px ${p.line}, 0 1px 2px rgba(0,0,0,.06)` : "none" }}>{filled && child}</span>;
  return (
    <div style={{ width: W, height: H, borderRadius: 14, background: p.card, boxShadow: centre ? p.shadow : p.flat, overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 400ms cubic-bezier(.2,0,0,1)" }}>
      <div style={{ position: "relative", flex: 1 }}>
        {/* the skeleton is always there underneath; the agent resolves over it */}
        <div style={{ position: "absolute", inset: 0, padding: "18px 18px 0", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 42, height: 42, borderRadius: 99, background: p.skel }} />
            <div style={{ display: "grid", gap: 7 }}><Bar w={64} h={10} c={p.skel} /><Bar w={92} c={p.skel} /></div>
          </div>
          <div style={{ display: "grid", gap: 8 }}><Bar w="100%" c={p.skel} /><Bar w="72%" c={p.skel} /></div>
        </div>
        <AnimatePresence initial={false}>
          {filled && (
            <motion.div key="agent" initial={{ opacity: 0, filter: "blur(6px)", y: 4 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.2, 0, 0, 1] }}
              style={{ position: "absolute", inset: 0, padding: "18px 18px 0", background: p.card, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 42, height: 42, borderRadius: 99, display: "grid", placeItems: "center", background: `radial-gradient(circle at 35% 30%, ${ag.a}, ${ag.b})`, boxShadow: `inset 0 0 0 1px rgba(255,255,255,.25)` }}><Sparkle /></span>
                <div style={{ display: "grid", gap: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: p.ink }}>{ag.name}</span>
                  <span style={{ fontSize: 12.5, color: p.muted }}>{ag.role}</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: p.muted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textWrap: "pretty" }}>{ag.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ height: 46, flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "0 10px 0 16px", background: p.foot, boxShadow: `inset 0 1px 0 ${p.line}` }}>
        <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: p.muted, whiteSpace: "nowrap" }}>
          {filled ? <><Clock c={p.muted} /><span>Last active 2 hours ago</span></> : <Bar w={120} h={7} c={p.skel} />}
        </span>
        {key(<Phone c={p.muted} />)}{key(<Gear c={p.muted} />)}
      </div>
    </div>
  );
}

export function AgentDeck({ mode = "dark" }: { mode?: DeckMode }) {
  const box = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  const [n, setN] = useState(0); // the card in the middle
  const [filled, setFilled] = useState(false);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setS(Math.max(0.3, Math.min(1.5, el.clientWidth / (W * 2.3), el.clientHeight / (H * 1.5)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setFilled(true); return; }
    const t: number[] = [];
    const beat = () => {
      t.push(window.setTimeout(() => setFilled(true), TIMING.resolve));
      t.push(window.setTimeout(() => { setFilled(false); setN((v) => v + 1); }, TIMING.slide));
    };
    beat();
    const iv = window.setInterval(beat, TIMING.beat);
    return () => { t.forEach(clearTimeout); clearInterval(iv); };
  }, []);

  // the row fades out toward both sides, so the neighbours read as more of the same
  const mask = "linear-gradient(90deg, transparent 0%, #000 30%, #000 70%, transparent 100%)";
  return (
    <div ref={box} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", overflow: "hidden" }}>
      <div style={{ width: (W * 3 + GAP * 2) * s, height: (H + 40) * s, position: "relative", WebkitMaskImage: mask, maskImage: mask }}>
        <div style={{ position: "absolute", left: "50%", top: 20 * s, width: W, height: H, transform: `scale(${s})`, transformOrigin: "0 0", marginLeft: (-W / 2) * s }}>
          {[n - 2, n - 1, n, n + 1, n + 2].map((i) => (
            <motion.div key={i} initial={false} animate={{ x: (i - n) * (W + GAP), opacity: i === n ? 1 : 0.55, filter: i === n ? "blur(0px)" : "blur(1px)" }}
              transition={{ duration: 0.56, ease: [0.2, 0, 0, 1] }} style={{ position: "absolute", left: 0, top: 0 }}>
              <Card i={i} mode={mode} centre={i === n} filled={i < n || (i === n && filled)} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
