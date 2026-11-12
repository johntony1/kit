// VintageSwitch: the light switch in the top bar and the dock, built like an old panel toggle, standing upright.
// A small plate in our dark tones with a chrome rim and four screws; a hex nut holds a polished
// lever. Flip it and the lever travels straight up (on) or down (off), passing toward you through
// the middle (it shortens as it points at the viewer, the ball grows), overshoots a touch and
// settles. Up is the light theme, and a small green lamp shows the lights are on.
import { useEffect, useId, useSyncExternalStore } from "react";
import { play } from "../sound/sound";
import { theme } from "./theme";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";

const W = 30, H = 42, CX = 15, CY = 23, L = 11.5;

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

export function VintageSwitch({ on, onToggle, label, title }: { on: boolean; onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void; label: string; title: string }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const p = useSpring(on ? 1 : 0, { stiffness: 520, damping: 22, mass: 0.75 });
  useEffect(() => { if (reduced) p.jump(on ? 1 : 0); else p.set(on ? 1 : 0); }, [on, p, reduced]);

  // the lever swings through the viewer: it is shortest at the middle of the throw
  // straight up and down: the lever's tip only moves along the vertical, through the viewer
  const near = useTransform(p, (v) => 1 - Math.abs(Math.cos(Math.PI * Math.min(1, Math.max(0, v)))));
  const x2 = useTransform(p, () => CX);
  const y2 = useTransform(p, (v) => CY + Math.cos(Math.PI * v) * L);
  const hx2 = useTransform(p, () => CX - 0.75);
  const hy2 = y2;
  const ballR = useTransform(near, (n) => 3.1 + 1.5 * n);
  const shX = useTransform(x2, (x) => x + 1.4);
  const shY = useTransform(y2, (y) => y + 2.2);
  const lamp = useTransform(p, (v) => Math.min(1, Math.max(0, (v - 0.55) / 0.45)));

  return (
    <motion.button type="button" className="vintage" role="switch" aria-checked={on} aria-label={label} title={title} onClick={onToggle}
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
        <rect x=".6" y=".6" width={W - 1.2} height={H - 1.2} rx="7.5" fill={`url(#${id}-rim)`} />
        <rect x="2" y="2" width={W - 4} height={H - 4} rx="6.2" fill={`url(#${id}-plate)`} stroke="rgba(0,0,0,.65)" strokeWidth=".5" />
        <rect x="2.6" y="2.5" width={W - 5.2} height={H - 5.5} rx="5.8" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth=".6" />

        <Screw x={6.2} y={6.2} id={id} /><Screw x={W - 6.2} y={6.2} id={id} /><Screw x={6.2} y={H - 6.2} id={id} /><Screw x={W - 6.2} y={H - 6.2} id={id} />

        {/* lamp: dark glass when off, green with a glow when on */}
        <circle cx={CX} cy={5.4} r={1.55} fill="#0e110e" stroke="rgba(0,0,0,.7)" strokeWidth=".35" />
        <motion.circle cx={CX} cy={5.4} r={3.6} fill={`url(#${id}-glow)`} style={{ opacity: lamp }} />
        <motion.circle cx={CX} cy={5.4} r={1.2} fill="#7dffae" style={{ opacity: lamp }} />

        {/* hex nut, its washer ring and the bushing the lever comes out of */}
        <polygon points={hex(CX, CY + 0.6, 6.6)} fill="rgba(0,0,0,.45)" filter={`url(#${id}-soft)`} />
        <polygon points={hex(CX, CY, 6.4)} fill={`url(#${id}-chrome)`} stroke="rgba(0,0,0,.55)" strokeWidth=".4" />
        <circle cx={CX} cy={CY} r={4.2} fill="#2a2d2a" stroke="rgba(255,255,255,.35)" strokeWidth=".4" />
        <circle cx={CX} cy={CY} r={2.8} fill={`url(#${id}-chrome)`} stroke="rgba(0,0,0,.5)" strokeWidth=".35" />

        {/* the lever: its shadow, the rod, a highlight along the rod, the ball */}
        <motion.line x1={CX + 1.4} y1={CY + 2} x2={shX} y2={shY} stroke="rgba(0,0,0,.45)" strokeWidth="3.2" strokeLinecap="round" filter={`url(#${id}-soft)`} />
        <motion.line x1={CX} y1={CY} x2={x2} y2={y2} stroke="#7f8480" strokeWidth="3.4" strokeLinecap="round" />
        <motion.line x1={CX - 0.75} y1={CY} x2={hx2} y2={hy2} stroke="#f2f4f2" strokeOpacity=".85" strokeWidth="1" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={1.9} fill={`url(#${id}-ball)`} />
        <motion.circle cx={x2} cy={y2} r={ballR} fill={`url(#${id}-ball)`} stroke="rgba(0,0,0,.45)" strokeWidth=".35" />
      </svg>
    </motion.button>
  );
}

/** light or dark, remembered. The same switch wherever it is placed (the top bar, the dock).
 * The new theme grows out of the switch as a circle. */
export function ThemeToggle() {
  const t = useSyncExternalStore(theme.subscribe, theme.get, () => "dark" as const);
  const light = t === "light";
  return (
    <VintageSwitch on={light} title={light ? "Light" : "Dark"} label={light ? "Light mode. Switch to dark" : "Dark mode. Switch to light"}
      onToggle={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        play(light ? "off" : "on");
        theme.set(light ? "dark" : "light", r.left + r.width / 2, r.top + r.height / 2);
      }} />
  );
}
