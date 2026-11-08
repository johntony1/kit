// VintageSwitch: the sound switch in the top bar, built like an old panel toggle. A small plate in
// our dark tones with a chrome rim and four screws; a hex nut holds a polished lever. Flip it and
// the lever swings through toward you (it shortens as it points at the viewer, the ball grows),
// overshoots a touch and settles. A small green lamp shows when sound is on.
import { useEffect, useId } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";

const W = 62, H = 34, CX = 31, CY = 18.5, L = 15;
const OFF = 198, ON = -18; // lever angle in degrees: pointing left and a little down, right and a little down

function hex(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i + Math.PI / 6; return `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`; }).join(" ");
}

function Screw({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={1.9} fill={`url(#${id}-chrome)`} stroke="rgba(0,0,0,.6)" strokeWidth={0.35} />
      <path d={`M${x - 1.05} ${y}h2.1M${x} ${y - 1.05}v2.1`} stroke="rgba(0,0,0,.55)" strokeWidth={0.45} strokeLinecap="round" />
    </g>
  );
}

export function VintageSwitch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const p = useSpring(on ? 1 : 0, { stiffness: 520, damping: 22, mass: 0.75 });
  useEffect(() => { if (reduced) p.jump(on ? 1 : 0); else p.set(on ? 1 : 0); }, [on, p, reduced]);

  // the lever swings through the viewer: it is shortest at the middle of the throw
  const near = useTransform(p, (v) => 1 - Math.abs(Math.cos(Math.PI * Math.min(1, Math.max(0, v)))));
  const ang = useTransform(p, (v) => ((OFF + (ON - OFF) * v) * Math.PI) / 180);
  const len = useTransform([ang, near], ([, n]: number[]) => L * (1 - 0.72 * n));
  const x2 = useTransform([ang, len], ([a, l]: number[]) => CX + Math.cos(a) * l);
  const y2 = useTransform([ang, len], ([a, l]: number[]) => CY + Math.sin(a) * l);
  const hx2 = useTransform([ang, len], ([a, l]: number[]) => CX + Math.cos(a) * l - 0.5 * Math.sin(a) * 0.9);
  const hy2 = useTransform([ang, len], ([a, l]: number[]) => CY + Math.sin(a) * l - 0.9);
  const ballR = useTransform(near, (n) => 3.1 + 1.5 * n);
  const shX = useTransform(x2, (x) => x + 1.2);
  const shY = useTransform(y2, (y) => y + 2.2);
  const lamp = useTransform(p, (v) => Math.min(1, Math.max(0, (v - 0.55) / 0.45)));

  return (
    <motion.button type="button" className="vintage" aria-pressed={on} aria-label={label} title={on ? "Sound on" : "Sound off"} onClick={onToggle}
      whileTap={{ scale: 0.97 }} transition={{ type: "spring", duration: 0.25, bounce: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4f6f4" /><stop offset=".35" stopColor="#8e938f" /><stop offset=".55" stopColor="#4a4e4b" /><stop offset="1" stopColor="#c9cdca" />
          </linearGradient>
          <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#323532" /><stop offset="1" stopColor="#1f211f" />
          </linearGradient>
          <linearGradient id={`${id}-chrome`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" /><stop offset=".45" stopColor="#a9aeaa" /><stop offset=".7" stopColor="#5a5f5b" /><stop offset="1" stopColor="#d8dcd9" />
          </linearGradient>
          <radialGradient id={`${id}-ball`} cx=".35" cy=".3" r=".75">
            <stop offset="0" stopColor="#ffffff" /><stop offset=".35" stopColor="#d6dad7" /><stop offset=".8" stopColor="#6c716d" /><stop offset="1" stopColor="#3b3f3c" />
          </radialGradient>
          <radialGradient id={`${id}-glow`} cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#5dff9a" stopOpacity=".9" /><stop offset="1" stopColor="#5dff9a" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".9" /></filter>
        </defs>

        {/* chrome rim and the plate inside it */}
        <rect x=".6" y=".6" width={W - 1.2} height={H - 1.2} rx="9" fill={`url(#${id}-rim)`} />
        <rect x="2" y="2" width={W - 4} height={H - 4} rx="7.6" fill={`url(#${id}-plate)`} stroke="rgba(0,0,0,.65)" strokeWidth=".5" />
        <rect x="2.6" y="2.5" width={W - 5.2} height={H - 5.5} rx="7.2" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth=".6" />

        <Screw x={7} y={7} id={id} /><Screw x={W - 7} y={7} id={id} /><Screw x={7} y={H - 7} id={id} /><Screw x={W - 7} y={H - 7} id={id} />

        {/* lamp: dark glass when off, green with a glow when on */}
        <circle cx={CX} cy={5.6} r={1.55} fill="#0e110e" stroke="rgba(0,0,0,.7)" strokeWidth=".35" />
        <motion.circle cx={CX} cy={5.6} r={3.6} fill={`url(#${id}-glow)`} style={{ opacity: lamp }} />
        <motion.circle cx={CX} cy={5.6} r={1.2} fill="#7dffae" style={{ opacity: lamp }} />

        {/* hex nut, its washer ring and the bushing the lever comes out of */}
        <polygon points={hex(CX, CY + 0.6, 7.6)} fill="rgba(0,0,0,.45)" filter={`url(#${id}-soft)`} />
        <polygon points={hex(CX, CY, 7.4)} fill={`url(#${id}-chrome)`} stroke="rgba(0,0,0,.55)" strokeWidth=".4" />
        <circle cx={CX} cy={CY} r={4.9} fill="#2a2d2a" stroke="rgba(255,255,255,.35)" strokeWidth=".4" />
        <circle cx={CX} cy={CY} r={3.3} fill={`url(#${id}-chrome)`} stroke="rgba(0,0,0,.5)" strokeWidth=".35" />

        {/* the lever: its shadow, the rod, a highlight along the rod, the ball */}
        <motion.line x1={CX + 1} y1={CY + 2} x2={shX} y2={shY} stroke="rgba(0,0,0,.45)" strokeWidth="3.2" strokeLinecap="round" filter={`url(#${id}-soft)`} />
        <motion.line x1={CX} y1={CY} x2={x2} y2={y2} stroke="#7f8480" strokeWidth="3.4" strokeLinecap="round" />
        <motion.line x1={CX} y1={CY - 0.6} x2={hx2} y2={hy2} stroke="#f2f4f2" strokeOpacity=".85" strokeWidth="1" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={1.9} fill={`url(#${id}-ball)`} />
        <motion.circle cx={x2} cy={y2} r={ballR} fill={`url(#${id}-ball)`} stroke="rgba(0,0,0,.45)" strokeWidth=".35" />
      </svg>
    </motion.button>
  );
}
