import { useState } from "react";
import { ConfettiPop } from "../confetti/ConfettiPop";
import type { ConfettiOptions } from "../confetti/confetti";

function Check({ color = "#16a34a", size = 26 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12L10 17L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── The transaction success screen it came from ── */
export function SuccessCard({ options, trigger }: { options?: ConfettiOptions; trigger?: number }) {
  const [n, setN] = useState(0);
  return (
    <div className="success">
      <div className="successBody">
        <ConfettiPop trigger={`${n}-${trigger ?? 0}`} {...options}>
          <div className="badge"><Check /></div>
        </ConfettiPop>
        <div className="successText">
          <p className="successTitle">Transaction completed</p>
          <p className="successPair">
            <span className="flag us" aria-hidden="true" />1,200 USD <span className="muted">to</span> <span className="flag eu" aria-hidden="true" />1,044 EUR
          </p>
        </div>
      </div>
      <button type="button" className="successBtn" onClick={() => setN(n + 1)}>Back to home</button>
    </div>
  );
}

/* ── A like ── */
export function LikePop() {
  const [liked, setLiked] = useState(false);
  const [n, setN] = useState(0);
  return (
    <button type="button" className="likeBtn" aria-pressed={liked} aria-label={liked ? "Unlike" : "Like"}
      onClick={() => { setLiked(!liked); if (!liked) setN(n + 1); }}>
      <ConfettiPop trigger={n} onMount={false} colors={["#ff4d6d", "#ff8fa3", "#ffb3c1", "#ffffff"]} glow={false} count={16} spread={0.8}>
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
            <ConfettiPop trigger={n[i]} onMount={false} count={14} spread={0.6} glow={false}>
              <span className={`box ${done[i] ? "on" : ""}`}>{done[i] && <Check color="#121212" size={13} />}</span>
            </ConfettiPop>
            <span className={`taskText ${done[i] ? "done" : ""}`}>{t}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
