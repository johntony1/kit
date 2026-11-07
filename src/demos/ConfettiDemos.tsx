import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flag } from "./flags";
import { ConfettiPop } from "../confetti/ConfettiPop";
import type { ConfettiOptions } from "../confetti/confetti";

function Check({ color = "#16a34a", size = 26 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12L10 17L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── The transaction success screen it came from, as it was built ── */
const SPRING_ENTRY = { type: "spring", visualDuration: 0.42, bounce: 0.14 } as const;
const inter = { fontFamily: "'Inter', -apple-system, sans-serif", fontFeatureSettings: "'ss11', 'calt' 0, 'liga' 0" } as const;

function SuccessBody({ options, onBack }: { options?: Omit<ConfettiOptions, "within">; onBack: () => void }) {
  // like the original, the card clips the confetti to its rounded corners
  const card = useRef<HTMLDivElement>(null);
  return (
    <div ref={card} style={{ position: "relative", overflow: "hidden", borderRadius: 20, height: 320, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", gap: 16 }}>
        <ConfettiPop within={card} {...options}>
          <div className="badge"><Check /></div>
        </ConfettiPop>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_ENTRY, delay: 0.22 }}
            style={{ ...inter, fontWeight: 600, fontSize: 16, lineHeight: "24px", letterSpacing: "-0.096px", color: "#171717", margin: 0, textAlign: "center" }}>
            Transaction completed
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_ENTRY, delay: 0.3 }}
            style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
            <Flag code="USD" size={16} />
            <span style={{ ...inter, fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: "#171717", fontVariantNumeric: "tabular-nums" }}>1,200 USD</span>
            <span style={{ ...inter, fontWeight: 400, fontSize: 13, lineHeight: "20px", letterSpacing: "-0.078px", color: "#5c5c5c" }}>to</span>
            <Flag code="EUR" size={16} />
            <span style={{ ...inter, fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: "#171717", fontVariantNumeric: "tabular-nums" }}>1,044 EUR</span>
          </motion.div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_ENTRY, delay: 0.44 }}
        style={{ padding: "0 16px 20px", position: "relative", zIndex: 1, flexShrink: 0 }}>
        <motion.button type="button" onClick={onBack} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 700, damping: 42 }}
          style={{ width: "100%", height: 40, borderRadius: 24, border: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", cursor: "pointer", boxShadow: "0px 1px 3px 0px rgba(14,18,27,0.12), 0px 0px 0px 1px #ebebeb" }}>
          <span style={{ ...inter, fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: "#5c5c5c" }}>Back to home</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

/** the card, entering like the original: a spring from 97% (visual 0.38 s, bounce 0.1). Back to home plays it again */
export function SuccessCard({ options, trigger = 0 }: { options?: Omit<ConfettiOptions, "within">; trigger?: number }) {
  const [n, setN] = useState(0);
  return (
    <motion.div key={`${n}-${trigger}`} className="success"
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", visualDuration: 0.38, bounce: 0.1 }}>
      <SuccessBody options={options} onBack={() => setN(n + 1)} />
    </motion.div>
  );
}

/* ── A like ── */
export function LikePop() {
  const [liked, setLiked] = useState(false);
  const [n, setN] = useState(0);
  return (
    <button type="button" className="likeBtn" aria-pressed={liked} aria-label={liked ? "Unlike" : "Like"}
      onClick={() => { setLiked(!liked); if (!liked) setN(n + 1); }}>
      <ConfettiPop trigger={n} onMount={false} colors={["#ff4d6d", "#ff8fa3", "#ffb3c1", "#ffffff"]} glow={false} count={36} spread={0.7} duration={1.2}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"
            fill={liked ? "#ff4d6d" : "none"} stroke={liked ? "#ff4d6d" : "currentColor"} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      </ConfettiPop>
      <span className="likeCount">{liked ? 129 : 128}</span>
    </button>
  );
}

/* ── A task that is done ── */
const TASKS = ["Send the invoice to Ada", "Review the launch copy", "Book the studio for Friday"];
export function TaskPop() {
  const [done, setDone] = useState<boolean[]>([true, false, false]);
  const [n, setN] = useState<number[]>([0, 0, 0]);
  return (
    <ul className="tasks">
      {TASKS.map((t, i) => (
        <li key={t}>
          <button type="button" className="task" aria-pressed={done[i]}
            onClick={() => {
              setDone(done.map((d, k) => (k === i ? !d : d)));
              if (!done[i]) setN(n.map((v, k) => (k === i ? v + 1 : v)));
            }}>
            <ConfettiPop trigger={n[i]} onMount={false} count={28} spread={0.55} duration={1} glow={false}>
              <span className={`box ${done[i] ? "on" : ""}`}>{done[i] && <Check color="#121212" size={13} />}</span>
            </ConfettiPop>
            <span className={`taskText ${done[i] ? "done" : ""}`}>{t}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
