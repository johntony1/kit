// Macro pad: a little aluminium device in two parts. A lid with a black screen held by four
// screws, a fabric strap for a hinge, and a base tray with four mechanical keys (magenta 0,
// black 1, magenta 2, black enter). A USB cable leaves on the left and a braided magenta cable
// loops behind. Each key travels down into the tray and springs back; 0, 1 and 2 type onto the
// screen, enter confirms and clears.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { play } from "../sound/sound";

const VW = 400, VH = 400;
type KeyId = "0" | "1" | "2" | "enter";
const KEYS: { id: KeyId; tone: "pink" | "black"; label: string }[] = [
  { id: "0", tone: "pink", label: "0" },
  { id: "1", tone: "black", label: "1" },
  { id: "2", tone: "pink", label: "2" },
  { id: "enter", tone: "black", label: "Enter" },
];
const KW = 62, KG = 5, KX0 = 68.5, KTOP = 249, TRAVEL = 7;
const MAX = 9;
const INITIAL = "21.02-22.02";

function Screw({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g>
      <circle cx={x} cy={y + 0.6} r={3.9} fill="rgba(20,24,34,.45)" />
      <circle cx={x} cy={y} r={3.5} fill={`url(#${id}-screw)`} stroke="rgba(30,34,46,.55)" strokeWidth={0.5} />
      <path d={`M${x - 1.8} ${y + 1.1}l3.6 -2.2`} stroke="rgba(30,34,46,.6)" strokeWidth={0.8} strokeLinecap="round" />
    </g>
  );
}

function Key({ x, tone, label, id, pressed, reduced }: { x: number; tone: "pink" | "black"; label: string; id: string; pressed: boolean; reduced: boolean | null }) {
  const t = useSpring(0, { stiffness: 1100, damping: 26, mass: 0.6 });
  useEffect(() => { if (reduced) t.jump(pressed ? 1 : 0); else t.set(pressed ? 1 : 0); }, [pressed, reduced, t]);
  const ty = useTransform(t, (v) => v * TRAVEL);
  const pink = tone === "pink";
  const g = pink ? "pk" : "bk";
  const top = 0, faceB = 46;
  return (
    <motion.g style={{ y: ty }}>
      {/* skirt: the cap's front face, tapering up to the top face */}
      <path d={`M${x + 3} ${KTOP + 4} Q${x + 3} ${KTOP} ${x + 8} ${KTOP} H${x + KW - 8} Q${x + KW - 3} ${KTOP} ${x + KW - 3} ${KTOP + 4} L${x + KW} ${KTOP + 80} H${x} Z`}
        fill={`url(#${id}-${g}-skirt)`} />
      {/* side shading on the skirt */}
      <path d={`M${x + 3} ${KTOP + 6} L${x} ${KTOP + 80} H${x + 6} L${x + 7} ${KTOP + 8} Z`} fill="rgba(0,0,0,.28)" />
      <path d={`M${x + KW - 3} ${KTOP + 6} L${x + KW} ${KTOP + 80} H${x + KW - 6} L${x + KW - 7} ${KTOP + 8} Z`} fill="rgba(0,0,0,.18)" />
      {/* top face, slightly dished, with a lit back edge */}
      <rect x={x + 6} y={KTOP + top} width={KW - 12} height={faceB} rx={6} fill={`url(#${id}-${g}-top)`} />
      <rect x={x + 6.5} y={KTOP + 0.5} width={KW - 13} height={faceB - 1} rx={5.6} fill="none" stroke={pink ? "rgba(255,190,220,.45)" : "rgba(255,255,255,.16)"} strokeWidth={0.8} />
      <path d={`M${x + 8} ${KTOP + faceB} H${x + KW - 8}`} stroke={pink ? "rgba(70,0,30,.55)" : "rgba(0,0,0,.6)"} strokeWidth={1.2} />
      <rect x={x + 10} y={KTOP + 4} width={KW - 20} height={14} rx={5} fill={`url(#${id}-sheen)`} />
      {/* legend */}
      {label === "Enter" ? (
        <path d={`M${x + 40} ${KTOP + 14} V${KTOP + 26} H${x + 23} M${x + 28.5} ${KTOP + 20.5} L${x + 22.5} ${KTOP + 26} L${x + 28.5} ${KTOP + 31.5}`}
          fill="none" stroke="#f3f3f5" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <text x={x + KW / 2} y={KTOP + 34} textAnchor="middle" fill="#f6f4f6" fontSize={31}
          style={{ fontFamily: '"DIN Condensed","DIN Alternate","Barlow Condensed","Roboto Condensed","Arial Narrow",sans-serif', fontWeight: 700 }}>{label}</text>
      )}
    </motion.g>
  );
}

export default function MacroPad({ size = "card" }: { size?: "card" | "big" }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState<Record<KeyId, boolean>>({ "0": false, "1": false, "2": false, enter: false });
  const [text, setText] = useState<string>(INITIAL);
  const [fresh, setFresh] = useState(true);
  const [ok, setOk] = useState(false);
  const okTimer = useRef<number | undefined>(undefined);
  const devRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => window.clearTimeout(okTimer.current), []);

  const fire = useCallback((k: KeyId) => {
    play("key");
    window.clearTimeout(okTimer.current);
    if (k === "enter") {
      if (fresh || text === "") { setText(""); setFresh(false); setOk(false); return; }
      setOk(true);
      okTimer.current = window.setTimeout(() => { setOk(false); setText(""); }, 1100);
      return;
    }
    setOk(false);
    setText((cur) => ((fresh ? "" : cur) + k).slice(-MAX));
    setFresh(false);
  }, [fresh, text]);

  const down = (k: KeyId) => { setPressed((p) => (p[k] ? p : { ...p, [k]: true })); };
  const up = (k: KeyId) => { setPressed((p) => (p[k] ? { ...p, [k]: false } : p)); };

  const keyFor = (e: React.KeyboardEvent): KeyId | null =>
    e.key === "0" || e.key === "1" || e.key === "2" ? e.key : e.key === "Enter" ? "enter" : null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = keyFor(e); if (!k) return;
    e.preventDefault();
    if (e.repeat) return;
    down(k); fire(k);
  };
  const onKeyUp = (e: React.KeyboardEvent) => { const k = keyFor(e); if (k) { e.preventDefault(); up(k); } };

  const scale = size === "big" ? 1.45 : 0.76;
  const shown = ok ? "" : text;

  return (
    <div data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <style>{`
        .mp-dev{outline:none;user-select:none;-webkit-user-select:none;border-radius:28px;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
        .mp-dev:focus-visible{box-shadow:0 0 0 2px #191a19,0 0 0 4px #e0408a}
        .mp-key{cursor:pointer}
        .mp-key:focus{outline:none}
        .mp-key{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
        .mp-caret{animation:mp-blink 1.05s steps(1) infinite}
        @keyframes mp-blink{50%{opacity:0}}
        @media (prefers-reduced-motion: reduce){.mp-caret{animation:none}}
      `}</style>
      <div ref={devRef} className="mp-dev" role="group" tabIndex={0} aria-label="Macro pad. Press 0, 1, 2 or Enter."
        onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={() => setPressed({ "0": false, "1": false, "2": false, enter: false })}
        style={{ width: VW * scale, height: VH * scale, position: "relative" }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width={VW * scale} height={VH * scale} style={{ display: "block", overflow: "visible" }}>
          <defs>
            {/* aluminium: cool blue grey, lit from above */}
            <linearGradient id={`${id}-lidface`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b9c1d6" /><stop offset=".12" stopColor="#9ea7c0" /><stop offset=".6" stopColor="#8d96b0" /><stop offset="1" stopColor="#7f88a2" />
            </linearGradient>
            <linearGradient id={`${id}-lidside`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6d7590" /><stop offset="1" stopColor="#434a60" />
            </linearGradient>
            <linearGradient id={`${id}-baseface`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b7bfd4" /><stop offset=".25" stopColor="#9ba4bd" /><stop offset="1" stopColor="#8790aa" />
            </linearGradient>
            <linearGradient id={`${id}-baselip`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bfc6d3" /><stop offset=".35" stopColor="#a3aabb" /><stop offset="1" stopColor="#8d94a6" />
            </linearGradient>
            <linearGradient id={`${id}-baseside`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#77809a" /><stop offset=".5" stopColor="#59617a" /><stop offset="1" stopColor="#3b4155" />
            </linearGradient>
            <linearGradient id={`${id}-sweep`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity=".16" /><stop offset=".3" stopColor="#fff" stopOpacity=".06" /><stop offset=".55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".18" />
            </linearGradient>
            <linearGradient id={`${id}-bezel`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a3e4a" /><stop offset=".5" stopColor="#23262e" /><stop offset="1" stopColor="#4c5160" />
            </linearGradient>
            <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#14161c" /><stop offset=".5" stopColor="#0a0b0f" /><stop offset="1" stopColor="#0e1015" />
            </linearGradient>
            <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".07" /><stop offset=".4" stopColor="#fff" stopOpacity=".015" /><stop offset=".41" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-tray`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a2e38" /><stop offset=".3" stopColor="#14161c" /><stop offset="1" stopColor="#0c0d11" />
            </linearGradient>
            <radialGradient id={`${id}-screw`} cx=".35" cy=".3" r=".8">
              <stop offset="0" stopColor="#eef1f6" /><stop offset=".5" stopColor="#a9b0bf" /><stop offset="1" stopColor="#6c7384" />
            </radialGradient>
            <linearGradient id={`${id}-pk-top`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d23a80" /><stop offset=".55" stopColor="#bb216a" /><stop offset="1" stopColor="#a5175b" />
            </linearGradient>
            <linearGradient id={`${id}-pk-skirt`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a8165c" /><stop offset=".35" stopColor="#8e0f4c" /><stop offset="1" stopColor="#4e0628" />
            </linearGradient>
            <linearGradient id={`${id}-bk-top`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3b3d45" /><stop offset=".55" stopColor="#2a2c33" /><stop offset="1" stopColor="#212227" />
            </linearGradient>
            <linearGradient id={`${id}-bk-skirt`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#25262c" /><stop offset=".4" stopColor="#18191d" /><stop offset="1" stopColor="#0a0a0c" />
            </linearGradient>
            <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-strap`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1c1e24" /><stop offset=".5" stopColor="#30333b" /><stop offset="1" stopColor="#1a1c21" />
            </linearGradient>
            <pattern id={`${id}-weave`} width="3" height="3" patternUnits="userSpaceOnUse">
              <rect width="3" height="3" fill="#2a2c33" /><rect width="1.5" height="3" fill="#353840" /><rect y="1.5" width="3" height=".5" fill="#1d1f24" />
            </pattern>
            <linearGradient id={`${id}-usb`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a3c42" /><stop offset=".4" stopColor="#16171a" /><stop offset="1" stopColor="#060607" />
            </linearGradient>
            <filter id={`${id}-blur8`} x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="8" /></filter>
            <filter id={`${id}-blur2`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6" /></filter>
            <filter id={`${id}-glow`} x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="2.2" /></filter>
            <clipPath id={`${id}-baseclip`}><rect x="40" y="238" width="320" height="122" rx="22" /></clipPath>
            <clipPath id={`${id}-trayclip`}><rect x="64" y="200" width="272" height="132" rx="11" /></clipPath>
          </defs>

          {/* braided cable looping behind both halves */}
          <g fill="none" strokeLinecap="round">
            {(() => {
              const d = "M620 96 C520 60 440 84 412 72 C330 50 214 34 168 66 C132 92 142 170 222 184 C292 196 338 204 352 236 C368 272 352 340 302 360 C236 384 118 384 46 356 C0 338 -60 330 -160 360";
              return (<>
                <path d={d} stroke="#3c0520" strokeWidth={14} />
                <path d={d} stroke="#8a1150" strokeWidth={12} />
                <path d={d} stroke="#b72a6e" strokeWidth={10} strokeDasharray="2.2 2.6" />
                <path d={d} stroke="#5a0a33" strokeWidth={10} strokeDasharray="1.2 3.6" strokeDashoffset={1.6} />
                <path d={d} stroke="#ff8cc0" strokeOpacity={0.18} strokeWidth={2.5} transform="translate(0 -2.5)" />
                <path d={d} stroke="#2a0215" strokeOpacity={0.5} strokeWidth={2} transform="translate(0 4)" />
              </>);
            })()}
          </g>

          {/* soft contact shadow */}
          <ellipse cx={200} cy={366} rx={160} ry={12} fill="rgba(0,0,0,.75)" filter={`url(#${id}-blur8)`} />

          {/* strap hinge between the halves */}
          <rect x={168} y={214} width={64} height={34} fill={`url(#${id}-weave)`} />
          <rect x={168} y={214} width={64} height={34} fill={`url(#${id}-strap)`} opacity={0.55} />
          <path d="M168 222 H232 M168 242 H232" stroke="rgba(0,0,0,.4)" strokeWidth={1} />

          {/* lid: thickness, then the face */}
          <rect x={50} y={94} width={300} height={138} rx={20} fill={`url(#${id}-lidside)`} />
          <rect x={50} y={90} width={300} height={132} rx={20} fill={`url(#${id}-lidface)`} />
          <rect x={50} y={90} width={300} height={132} rx={20} fill={`url(#${id}-sweep)`} />
          <rect x={50.7} y={90.7} width={298.6} height={130.6} rx={19.4} fill="none" stroke="rgba(235,240,255,.38)" strokeWidth={1.1} />
          <path d="M70 221.4 H330" stroke="rgba(40,44,56,.5)" strokeWidth={1} />
          {/* stepped frame around the screen */}
          <rect x={66} y={104} width={268} height={104} rx={13} fill="#7f88a3" />
          <rect x={66} y={104} width={268} height={104} rx={13} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={1} />
          <rect x={72} y={109} width={256} height={94} rx={10} fill={`url(#${id}-bezel)`} />
          <rect x={80} y={116} width={240} height={80} rx={5} fill={`url(#${id}-screen)`} />
          <rect x={80} y={116} width={240} height={80} rx={5} fill="none" stroke="rgba(0,0,0,.8)" strokeWidth={1.4} />
          <Screw x={61} y={101} id={id} /><Screw x={339} y={101} id={id} /><Screw x={61} y={211} id={id} /><Screw x={339} y={211} id={id} />

          {/* base: thickness, face, tray recess */}
          <rect x={40} y={246} width={320} height={120} rx={22} fill={`url(#${id}-baseside)`} />
          <rect x={40} y={238} width={320} height={114} rx={22} fill={`url(#${id}-baseface)`} />
          <rect x={40} y={238} width={320} height={114} rx={22} fill={`url(#${id}-sweep)`} />
          <rect x={40.7} y={238.7} width={318.6} height={112.6} rx={21.4} fill="none" stroke="rgba(235,240,255,.38)" strokeWidth={1.1} />
          <rect x={58} y={247} width={284} height={92} rx={15} fill="#7e87a2" />
          <rect x={58} y={247} width={284} height={92} rx={15} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={1} />
          <rect x={64} y={252} width={272} height={80} rx={11} fill={`url(#${id}-tray)`} />
          <Screw x={50} y={248} id={id} /><Screw x={350} y={248} id={id} /><Screw x={50} y={342} id={id} /><Screw x={350} y={342} id={id} />

          {/* keys sit in the tray; the front lip hides their lower skirt */}
          <g clipPath={`url(#${id}-trayclip)`}>
            {/* switch housings under the caps */}
            {KEYS.map((k, i) => {
              const x = KX0 + i * (KW + KG);
              return <rect key={k.id} x={x + 6} y={300} width={KW - 12} height={40} rx={3} fill="#0d0e12" stroke="rgba(255,255,255,.05)" />;
            })}
          </g>
          <g clipPath={`url(#${id}-baseclip)`}>
            <g clipPath={`url(#${id}-trayclip)`}>
              {KEYS.map((k, i) => (
                <Key key={k.id} x={KX0 + i * (KW + KG)} tone={k.tone} label={k.label} id={id} pressed={pressed[k.id]} reduced={reduced} />
              ))}
            </g>
            {/* inner shadow along the tray's back wall */}
            <rect x={64} y={252} width={272} height={9} rx={4} fill="rgba(0,0,0,.45)" filter={`url(#${id}-blur2)`} />
          </g>
          {/* front lip of the tray, drawn over the key skirts */}
          <path d="M64 322 H336 V332 Q336 336 332 336 H68 Q64 336 64 332 Z" fill="#0b0c10" />
          <path d="M58 324 H342 V324 Q342 339 327 339 H73 Q58 339 58 324 Z" fill="#8a93ad" />
          <path d="M64 324 H336" stroke="rgba(255,255,255,.55)" strokeWidth={1.2} />
          <path d="M64 325.4 H336" stroke="rgba(0,0,0,.35)" strokeWidth={0.8} />

          {/* USB plug on the left and its cable */}
          <path d="M24 312 C0 314 -10 342 -22 378" fill="none" stroke="#050506" strokeWidth={17} strokeLinecap="round" />
          <path d="M24 306 C2 309 -8 336 -20 372" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={2} strokeLinecap="round" />
          <rect x={8} y={296} width={46} height={30} rx={7} fill={`url(#${id}-usb)`} />
          <rect x={8.5} y={296.5} width={45} height={29} rx={6.5} fill="none" stroke="rgba(255,255,255,.16)" />
        </svg>

        {/* the screen text: HTML for crisp tabular digits */}
        <div aria-live="polite" style={{
          position: "absolute", left: 82 * scale, top: 118 * scale, width: 236 * scale, height: 76 * scale,
          display: "grid", placeItems: "center", pointerEvents: "none", color: "#f2f3f5",
          fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 400, fontSize: 34 * scale, letterSpacing: "0.02em",
          fontVariantNumeric: "tabular-nums lining-nums", textShadow: `0 0 ${3 * scale}px rgba(255,255,255,.35)`, whiteSpace: "pre",
        }}>
          {ok ? (
            <motion.span key="ok" initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }} style={{ display: "inline-flex", alignItems: "center", gap: 10 * scale }}>
              <svg width={26 * scale} height={26 * scale} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5" fill="none" stroke="#e0408a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>Sent {text}</span>
            </motion.span>
          ) : (
            <span>
              {shown}
              {!fresh && <span className="mp-caret" aria-hidden="true" style={{ display: "inline-block", width: 3 * scale, height: 30 * scale, marginLeft: 3 * scale, verticalAlign: "-0.12em", background: "#e0408a", boxShadow: `0 0 ${4 * scale}px #e0408a` }} />}
            </span>
          )}
        </div>

        {/* hit areas for the keys, over the key caps */}
        {KEYS.map((k, i) => {
          const x = KX0 + i * (KW + KG);
          return (
            <button key={k.id} type="button" className="mp-key" tabIndex={-1} aria-label={k.label}
              onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); down(k.id); fire(k.id); }}
              onPointerUp={() => up(k.id)} onPointerCancel={() => up(k.id)} onLostPointerCapture={() => up(k.id)}
              onClick={(e) => { if (e.detail === 0) { fire(k.id); } }}
              style={{ position: "absolute", left: x * scale, top: (KTOP - 2) * scale, width: KW * scale, height: 80 * scale, padding: 0, border: 0, background: "transparent" }} />
          );
        })}
      </div>
    </div>
  );
}
