/* Currency swap. Ported from ~/Documents/Currency exchange (CurrencySwap.tsx), swap card only.
 * Swap: the card tips forward (rotateX 0 to 90, 160ms ease-in), values swap at the
 * invisible midpoint, it snaps to -90 and springs flat (duration .26, bounce .18);
 * the icon spins 180 on a 480/36 spring. Max counts the amount up (ease-out-quart).
 * Sounds: flip as the card starts to tip; tick on Max, then detents while it counts.
 */
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useAnimation } from "framer-motion";
import { play } from "../sound/sound";

/* ── counting (ease-out-quart) ── */
function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4); }
function useCountTo() {
  const raf = useRef(0);
  const cancel = useCallback(() => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  const countTo = useCallback((from: number, to: number, duration: number, onTick: (v: number) => void, onDone: () => void) => {
    cancel();
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      onTick(Math.round(from + (to - from) * easeOutQuart(p)));
      if (p < 1) raf.current = requestAnimationFrame(step); else onDone();
    };
    raf.current = requestAnimationFrame(step);
  }, [cancel]);
  return { countTo, cancel };
}

/* ── tokens: the shared --k-* ones, plus the swap card's own (dark, then light) ── */
const T = {
  text: "var(--k-text)", sec: "var(--k-text2)", muted: "var(--k-muted)", faint: "var(--cs-side)",
  raised: "var(--k-raised)",
  shadow: "var(--cs-card)",
};
const CSS = `
.curswap { --cs-side: #5d6862; --cs-card: var(--k-lift);
  --cs-chip: rgba(255,255,255,.06); --cs-chip-ring: rgba(255,255,255,.06);
  --cs-well: rgba(0,0,0,.2); --cs-well-ring: rgba(255,255,255,.04);
  --cs-knob: #2f322f; --cs-knob-edge: #282a28; --cs-knob-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 1px 3px rgba(0,0,0,.4);
  --cs-flag-ring: transparent; }
:root[data-theme="light"] .curswap { --cs-side: oklch(0.53 0.011 264);
  --cs-card: inset 0 1px 0 oklch(1 0 0), 0 0 0 1px oklch(0.22 0.008 264 / 0.08), 0 1px 2px oklch(0.22 0.008 264 / 0.05), 0 8px 20px -8px oklch(0.22 0.008 264 / 0.12), 0 24px 48px -24px oklch(0.22 0.008 264 / 0.14);
  --cs-chip: oklch(0.955 0.003 264); --cs-chip-ring: oklch(0.22 0.008 264 / 0.06);
  --cs-well: oklch(0.96 0.003 264); --cs-well-ring: oklch(0.22 0.008 264 / 0.05);
  --cs-knob: oklch(1 0 0); --cs-knob-edge: oklch(0.985 0.002 264); --cs-knob-shadow: 0 0 0 1px oklch(0.22 0.008 264 / 0.1), 0 1px 3px oklch(0.22 0.008 264 / 0.12), 0 3px 8px -3px oklch(0.22 0.008 264 / 0.14);
  --cs-flag-ring: oklch(0.22 0.008 264 / 0.12); }
`;
const SWAP_SPRING = { type: "spring", stiffness: 480, damping: 36, mass: 0.8 } as const;
const PRESS = { type: "spring", stiffness: 700, damping: 42 } as const;
const FADE = { duration: 0.12, ease: "easeOut" } as const;

type Currency = { code: string; symbol: string; balance: number };
const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", balance: 15000 },
  { code: "GBP", symbol: "£", balance: 0 },
  { code: "EUR", symbol: "€", balance: 0 },
  { code: "NGN", symbol: "₦", balance: 0 },
];
const RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.87, GBP: 0.79, NGN: 1618, USD: 1 },
  EUR: { USD: 1.149, GBP: 0.907, NGN: 1859, EUR: 1 },
  GBP: { USD: 1.267, EUR: 1.102, NGN: 2049, GBP: 1 },
  NGN: { USD: 0.00062, EUR: 0.00054, GBP: 0.00049, NGN: 1 },
};
function fmt(n: number) {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}

/* ── flags (brand content, inline SVG from the source) ── */
type FlagProps = { size?: number };
function FlagUSD({ size = 24 }: FlagProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 24 24" fill="none">
        <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="white"/>
      </svg>
      <div style={{ position: 'absolute', top: '10.87%', right: 0, bottom: 0, left: '1.72%' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 23.5866 21.3913" fill="none">
          <path d="M11.0649 9.39131H23.5866C23.5866 8.30822 23.4422 7.25897 23.1732 6.26086H11.0649V9.39131Z" fill="#D80027"/>
          <path d="M11.0649 3.13045H21.8253C21.0907 1.93177 20.1515 0.87225 19.0564 0H11.0649V3.13045Z" fill="#D80027"/>
          <path d="M11.5866 21.3913C14.4108 21.3913 17.0066 20.4152 19.0564 18.7826H4.1168C6.16664 20.4152 8.76244 21.3913 11.5866 21.3913Z" fill="#D80027"/>
          <path d="M1.34789 15.6522H21.8253C22.4151 14.6899 22.8724 13.638 23.1732 12.5217H0C0.300797 13.638 0.758156 14.6899 1.34789 15.6522Z" fill="#D80027"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', top: 0, right: '50%', bottom: '50%', left: 0 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 12 12" fill="none">
          <path d="M5.55862 1.87397H6.65217L5.63498 2.61295L6.02353 3.80869L5.00639 3.0697L3.98925 3.80869L4.32487 2.7757C3.42928 3.52172 2.64431 4.39575 1.99744 5.36963H2.34783L1.70034 5.84002C1.59947 6.0083 1.50272 6.17925 1.41 6.35273L1.71919 7.30434L1.14234 6.88523C0.998953 7.18903 0.867797 7.49967 0.749906 7.81678L1.09055 8.86528H2.34783L1.33064 9.60427L1.71919 10.8L0.702047 10.061L0.0927656 10.5037C0.0317812 10.9939 0 11.4932 0 12H12C12 5.37262 12 4.59131 12 0C9.62944 0 7.41961 0.687656 5.55862 1.87397Z" fill="#0052B4"/>
        </svg>
      </div>
    </div>
  )
}

function FlagEUR({ size = 24 }: FlagProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'hidden', flexShrink: 0 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 24 24" fill="none">
        <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#0052B4"/>
      </svg>
      <div style={{ position: 'absolute', inset: '19.57%' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 14.6086 14.6087" fill="none">
          <path d="M7.30434 0L7.69289 1.19573H8.95008L7.93294 1.93472L8.32149 3.13045L7.30434 2.39142L6.28716 3.13045L6.6757 1.93472L5.65856 1.19573H6.9158L7.30434 0Z" fill="#FFDA44"/>
          <path d="M2.13933 2.13937L3.25964 2.71013L4.14862 1.82119L3.95189 3.06291L5.07216 3.6337L3.83039 3.83039L3.6337 5.0722L3.06291 3.95194L1.82119 4.14867L2.71017 3.25969L2.13933 2.13937Z" fill="#FFDA44"/>
          <path d="M0 7.30434L1.19573 6.9158V5.65856L1.93467 6.67575L3.13045 6.2872L2.39137 7.30434L3.13045 8.32148L1.93467 7.93299L1.19573 8.95012V7.69289L0 7.30434Z" fill="#FFDA44"/>
          <path d="M2.13933 12.4693L2.71012 11.349L1.82119 10.46L3.06295 10.6568L3.63366 9.53653L3.83039 10.7783L5.07211 10.975L3.95198 11.5458L4.14862 12.7875L3.25964 11.8985L2.13933 12.4693Z" fill="#FFDA44"/>
          <path d="M7.30434 14.6087L6.91575 13.413H5.65856L6.67575 12.674L6.28716 11.4783L7.30434 12.2173L8.32149 11.4783L7.93294 12.674L8.95008 13.413H7.69284L7.30434 14.6087Z" fill="#FFDA44"/>
          <path d="M12.4693 12.4693L11.349 11.8986L10.46 12.7875L10.6568 11.5457L9.53658 10.975L10.7783 10.7783L10.975 9.53653L11.5457 10.6568L12.7875 10.46L11.8985 11.3491L12.4693 12.4693Z" fill="#FFDA44"/>
          <path d="M14.6086 7.30434L13.4129 7.69289V8.95012L12.6739 7.93294L11.4783 8.32148L12.2173 7.30434L11.4783 6.2872L12.674 6.67575L13.4129 5.65856V6.91584L14.6086 7.30434Z" fill="#FFDA44"/>
          <path d="M12.4693 2.13937L11.8985 3.25969L12.7875 4.14867L11.5457 3.95189L10.975 5.07216L10.7783 3.83039L9.53658 3.63366L10.6568 3.06291L10.46 1.82123L11.3491 2.71017L12.4693 2.13937Z" fill="#FFDA44"/>
        </svg>
      </div>
    </div>
  )
}

function FlagGBP({ size = 24 }: FlagProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'hidden', flexShrink: 0 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 32 32" fill="none">
        <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#F0F0F0"/>
      </svg>
      <div style={{ position: 'absolute', inset: '1.72%' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 30.8976 30.8976" fill="none">
          <path d="M2.75631 5.70769C1.4995 7.34287 0.551813 9.22756 0 11.275H8.32362L2.75631 5.70769Z" fill="#0052B4"/>
          <path d="M30.8976 11.275C30.3458 9.22762 29.3981 7.34294 28.1413 5.70775L22.5741 11.275H30.8976Z" fill="#0052B4"/>
          <path d="M0 19.6228C0.551875 21.6702 1.49956 23.5549 2.75631 25.19L8.32344 19.6228H0Z" fill="#0052B4"/>
          <path d="M25.1899 2.75638C23.5548 1.49956 21.6701 0.551875 19.6227 0V8.32356L25.1899 2.75638Z" fill="#0052B4"/>
          <path d="M5.70769 28.1413C7.34288 29.3981 9.22756 30.3457 11.2749 30.8976V22.5741L5.70769 28.1413Z" fill="#0052B4"/>
          <path d="M11.2749 0C9.2275 0.551875 7.34281 1.49956 5.70769 2.75631L11.2749 8.3235V0Z" fill="#0052B4"/>
          <path d="M19.6227 30.8976C21.6701 30.3457 23.5548 29.3981 25.1899 28.1413L19.6227 22.5741V30.8976Z" fill="#0052B4"/>
          <path d="M22.5741 19.6228L28.1413 25.1901C29.3981 23.5549 30.3458 21.6702 30.8976 19.6228H22.5741Z" fill="#0052B4"/>
        </svg>
      </div>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 32 32" fill="none">
        <path d="M31.8646 13.9131H18.087V0.135438C17.4038 0.0465 16.7073 0 16 0C15.2926 0 14.5962 0.0465 13.9131 0.135438V13.913H0.135438C0.0465 14.5962 0 15.2927 0 16C0 16.7074 0.0465 17.4038 0.135438 18.0869H13.913V31.8646C14.5962 31.9535 15.2926 32 16 32C16.7073 32 17.4038 31.9536 18.0869 31.8646V18.087H31.8646C31.9535 17.4038 32 16.7074 32 16C32 15.2927 31.9535 14.5962 31.8646 13.9131Z" fill="#D80027"/>
        <path d="M20.1739 20.174L27.3137 27.3137C27.6421 26.9855 27.9553 26.6423 28.2542 26.2866L22.1416 20.1739H20.1739V20.174Z" fill="#D80027"/>
        <path d="M11.8261 20.174H11.8259L4.68625 27.3137C5.0145 27.6421 5.35769 27.9553 5.71344 28.2542L11.8261 22.1414V20.174Z" fill="#D80027"/>
        <path d="M11.8261 11.8262V11.8261L4.68631 4.68625C4.35794 5.0145 4.04469 5.35769 3.74581 5.71344L9.8585 11.8261H11.8261V11.8262Z" fill="#D80027"/>
        <path d="M20.1739 11.8262L27.3137 4.68631C26.9855 4.35794 26.6423 4.04469 26.2866 3.74588L20.1739 9.85856V11.8262Z" fill="#D80027"/>
      </svg>
    </div>
  )
}

function FlagNGN({ size = 24 }: FlagProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'hidden', flexShrink: 0 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 32 32" fill="none">
        <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="white"/>
      </svg>
      <div style={{ position: 'absolute', top: '3.11%', right: 0, bottom: '3.11%', left: 0 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 32 30.0097" fill="none">
          <path d="M0 15.0047C0 21.8842 4.342 27.7489 10.4348 30.0096V0C4.342 2.26062 0 8.12537 0 15.0047Z" fill="#6DA544"/>
          <path d="M32 15.0048C32 8.12538 27.658 2.26062 21.5652 0V30.0097C27.658 27.7489 32 21.8843 32 15.0048Z" fill="#6DA544"/>
        </svg>
      </div>
    </div>
  )
}

function Flag({ code, size = 24 }: { code: string; size?: number }) {
  if (code === "USD") return <FlagUSD size={size} />;
  if (code === "EUR") return <FlagEUR size={size} />;
  if (code === "GBP") return <FlagGBP size={size} />;
  return <FlagNGN size={size} />;
}

function IconTransfer() {
  return (
    <svg width="14" height="15" viewBox="0 0 14.0592 14.8925" fill="none" aria-hidden>
      <path d="M7.41667 11.1963L10.3629 14.1425L13.3092 11.1963M10.3629 4.11283L10.3629 14.1128M0.75 3.69628L3.69628 0.75L6.64256 3.69628M3.69628 0.7795L3.69628 10.7795" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CurrencyTag({ currency }: { currency: Currency }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "flex", flexShrink: 0, borderRadius: 999, boxShadow: "0 0 0 1px var(--cs-flag-ring)" }}><Flag code={currency.code} size={24} /></span>
      <span style={{ fontWeight: 500, fontSize: 18, lineHeight: "24px", letterSpacing: "-0.2px", color: T.text, whiteSpace: "nowrap" }}>{currency.code}</span>
    </div>
  );
}

const BASE_W = 368;
const BASE_H = 204;

function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(size === "big" ? 1.5 : 0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const availH = size === "big" ? h * 0.62 : Math.max(h - 120, h * 0.62);
      const availW = w - (size === "big" ? 200 : 48);
      setS(Math.max(0.2, Math.min(availW / BASE_W, availH / BASE_H, size === "big" ? 1.6 : 1)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return { ref, s };
}

export default function CurrencySwap({ size = "card" }: { size?: "card" | "big" }) {
  const { ref, s } = useFit(size);
  const reduced = useReducedMotion();
  const flip = useAnimation();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [sell, setSell] = useState(CURRENCIES[0]);
  const [receive, setReceive] = useState(CURRENCIES[2]);
  const [inputStr, setInputStr] = useState("1200");
  const [counting, setCounting] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [iconAngle, setIconAngle] = useState(0);
  const { countTo, cancel } = useCountTo();

  const sellAmt = parseFloat(inputStr) || 0;
  const receiveAmt = +(sellAmt * RATES[sell.code][receive.code]).toFixed(3);

  function handleMax() {
    const from = sellAmt, to = sell.balance;
    if (from === to) return;
    play("tick");
    if (reduced) { setInputStr(String(to)); return; }
    setCounting(true);
    const duration = Math.min(700, Math.max(300, Math.abs(to - from) / 20));
    countTo(from, to, duration, (v) => { setInputStr(String(v)); play("detent", { gap: 60 }); }, () => { setInputStr(String(to)); setCounting(false); });
  }

  async function handleSwap() {
    if (swapping) return;
    cancel();
    setCounting(false);
    setSwapping(true);
    play("flip");
    const next = receiveAmt % 1 === 0 ? String(Math.round(receiveAmt)) : String(receiveAmt);
    setIconAngle((a) => a + 180);
    if (reduced) { setSell(receive); setReceive(sell); setInputStr(next); setSwapping(false); return; }
    await flip.start({ rotateX: 90, transition: { duration: 0.16, ease: [0.55, 0, 1, 0.45] } });
    setSell(receive);
    setReceive(sell);
    setInputStr(next);
    flip.set({ rotateX: -90 });
    await flip.start({ rotateX: 0, transition: { type: "spring", duration: 0.26, bounce: 0.18 } });
    setSwapping(false);
  }

  const label: React.CSSProperties = { fontSize: 12, lineHeight: "16px", color: T.muted, margin: 0 };
  const big: React.CSSProperties = { fontWeight: 600, fontSize: 24, lineHeight: 1, letterSpacing: "-0.36px", fontVariantNumeric: "tabular-nums", color: T.text };
  const side: React.CSSProperties = { fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", fontVariantNumeric: "tabular-nums", color: T.faint, whiteSpace: "nowrap" };

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <div style={{ width: BASE_W * s, height: BASE_H * s, position: "relative" }}>
        <div data-own-click className="curswap" style={{ pointerEvents: "auto", position: "absolute", left: 0, top: 0, width: BASE_W, transform: `scale(${s})`, transformOrigin: "0 0", perspective: 900, perspectiveOrigin: "50% 50%" }}>
          <motion.div
            animate={flip}
            style={{
              position: "relative", borderRadius: 32, background: T.raised, boxShadow: T.shadow, padding: 8,
              display: "flex", flexDirection: "column", transformOrigin: "50% 50%", backfaceVisibility: "hidden", willChange: "transform",
            }}
          >
            {/* You sell */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={`sell-${sell.code}`} layout={!reduced} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? undefined : { opacity: 0 }} transition={FADE}>
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor={inputId} style={{ ...label, cursor: "text" }}>You sell</label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 1, flex: 1, minWidth: 0, cursor: "text" }} onClick={() => inputRef.current?.focus()}>
                      <span style={{ fontSize: 24, lineHeight: 1, letterSpacing: "-0.36px", color: T.muted, flexShrink: 0, userSelect: "none" }}>{sell.symbol}</span>
                      <input
                        ref={inputRef} id={inputId} type="text" inputMode="decimal" autoComplete="off" spellCheck={false}
                        value={inputStr} readOnly={counting} maxLength={12} placeholder="0" aria-label="Amount to sell"
                        onChange={(e) => { cancel(); setCounting(false); setInputStr(e.target.value.replace(/[^0-9.]/g, "").replace(/^(\d*\.?\d*).*$/, "$1")); }}
                        style={{ ...big, fontFamily: "inherit", background: "transparent", border: "none", outline: "none", padding: 0, margin: 0, width: "100%", minWidth: 0, caretColor: "#34b562" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", minWidth: 113, flexShrink: 0 }}>
                      <CurrencyTag currency={sell} />
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={side}>{sell.symbol}{sell.balance.toLocaleString("en-US")}</span>
                        <motion.button type="button" whileTap={{ scale: 0.92 }} transition={PRESS} onClick={handleMax}
                          style={{ fontFamily: "inherit", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: T.sec, background: "var(--cs-chip)", border: "none", borderRadius: 999, padding: "4px 8px", cursor: "pointer", boxShadow: "inset 0 0 0 1px var(--cs-chip-ring)" }}>
                          Max
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* swap button: outer div owns centring so the rotate does not fight translateX */}
            <div style={{ position: "absolute", top: 85, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
              <motion.button type="button" onClick={handleSwap} whileTap={{ scale: 0.86 }} animate={reduced ? {} : { rotate: iconAngle }} transition={SWAP_SPRING} aria-label="Swap currencies"
                style={{ width: 36, height: 36, background: "var(--cs-knob)", border: "2px solid var(--cs-knob-edge)", color: T.text, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 8, boxShadow: "var(--cs-knob-shadow)" }}>
                <IconTransfer />
              </motion.button>
            </div>

            {/* Receive at least */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={`receive-${receive.code}`} layout={!reduced} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? undefined : { opacity: 0 }} transition={FADE}>
                <div style={{ background: "var(--cs-well)", boxShadow: "inset 0 0 0 1px var(--cs-well-ring)", borderRadius: "8px 8px 24px 24px", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={label}>Receive at least</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p key={`${receive.code}-${receiveAmt}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={FADE} style={{ ...big, margin: 0, whiteSpace: "nowrap" }}>
                        <span style={{ color: T.muted, fontWeight: 400 }}>{receive.symbol}</span>{fmt(receiveAmt)}
                      </motion.p>
                    </AnimatePresence>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <CurrencyTag currency={receive} />
                      <span style={side}>Bal : {receive.symbol}{receive.balance.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
