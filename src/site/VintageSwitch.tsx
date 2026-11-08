// VintageSwitch: the sound switch in the top bar, built like an old wall switch. A tall matte
// plate with a screw above and below, a recessed slot, and a paddle that rocks up for on and down
// for off. The end of the paddle that sticks out catches the light and grows a little (it is
// nearer to you); the slot behind it falls into shadow. A faint green glow sits in the slot when on.
import { useEffect, useId } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";

const W = 26, H = 38, CX = 13;
// the slot the paddle sits in
const SX0 = 8.6, SX1 = 17.4, SY0 = 12.2, SY1 = 25.8;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const quad = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

function Screw({ y, id }: { y: number; id: string }) {
  return (
    <g>
      <circle cx={CX} cy={y} r={1.75} fill={`url(#${id}-screw)`} stroke="rgba(0,0,0,.7)" strokeWidth={0.35} />
      <path d={`M${CX - 1} ${y + 0.55}L${CX + 1} ${y - 0.55}`} stroke="rgba(0,0,0,.75)" strokeWidth={0.5} strokeLinecap="round" />
    </g>
  );
}

export function VintageSwitch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const p = useSpring(on ? 1 : 0, { stiffness: 620, damping: 26, mass: 0.6 });
  useEffect(() => { if (reduced) p.jump(on ? 1 : 0); else p.set(on ? 1 : 0); }, [on, p, reduced]);

  // u: 1 = rocked up (on), 0 = rocked down (off). The raised end sits proud of the slot and is wider.
  const geo = (v: number) => {
    const u = Math.min(1.08, Math.max(-0.08, v));
    const top = mix(16.4, 11.6, u), bot = mix(26.4, 21.6, u); // paddle's top and bottom edge
    const wTop = mix(8.2, 9.8, u), wBot = mix(9.8, 8.2, u); // the raised end is nearer, so wider
    const lit = mix(1.3, 3.2, u); // the band of the top face that catches the light
    return { top, bot, wTop, wBot, lit };
  };
  const front = useTransform(p, (v) => { const g = geo(v); return quad([[CX - g.wTop / 2, g.top + g.lit], [CX + g.wTop / 2, g.top + g.lit], [CX + g.wBot / 2, g.bot], [CX - g.wBot / 2, g.bot]]); });
  const cap = useTransform(p, (v) => { const g = geo(v); return quad([[CX - g.wTop / 2, g.top], [CX + g.wTop / 2, g.top], [CX + g.wTop / 2, g.top + g.lit], [CX - g.wTop / 2, g.top + g.lit]]); });
  const gapTop = useTransform(p, (v) => Math.max(0, geo(v).top - SY0));
  const gapBot = useTransform(p, (v) => Math.max(0, SY1 - geo(v).bot));
  const gapBotY = useTransform(p, (v) => geo(v).bot);
  const glow = useTransform(p, (v) => Math.min(1, Math.max(0, (v - 0.5) / 0.5)) * 0.55);

  return (
    <motion.button type="button" className="vintage" aria-pressed={on} aria-label={label} title={on ? "Sound on" : "Sound off"} onClick={onToggle}
      whileTap={{ scale: 0.96 }} transition={{ type: "spring", duration: 0.25, bounce: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2e302e" /><stop offset="1" stopColor="#1d1f1d" />
          </linearGradient>
          <linearGradient id={`${id}-slot`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#070807" /><stop offset="1" stopColor="#121412" />
          </linearGradient>
          <linearGradient id={`${id}-paddle`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2c2a" /><stop offset="1" stopColor="#1a1c1a" />
          </linearGradient>
          <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6a6e6a" /><stop offset="1" stopColor="#3c3f3c" />
          </linearGradient>
          <radialGradient id={`${id}-screw`} cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#5d615d" /><stop offset="1" stopColor="#1e201e" />
          </radialGradient>
          <radialGradient id={`${id}-glow`} cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#5dff9a" stopOpacity="1" /><stop offset="1" stopColor="#5dff9a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* the plate: matte, a soft lip of light along the top edge */}
        <rect x=".5" y=".5" width={W - 1} height={H - 1} rx="5" fill={`url(#${id}-plate)`} stroke="rgba(0,0,0,.75)" strokeWidth=".6" />
        <rect x="1.1" y="1" width={W - 2.2} height={H - 2.4} rx="4.5" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".55" />
        <Screw y={5.6} id={id} /><Screw y={H - 5.6} id={id} />

        {/* the slot, its inner shadow, and a faint green glow when on */}
        <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} rx="1.6" fill={`url(#${id}-slot)`} stroke="rgba(255,255,255,.1)" strokeWidth=".45" />
        <motion.rect x={SX0 + 0.8} y={SY0 + 0.8} width={SX1 - SX0 - 1.6} height={SY1 - SY0 - 1.6} rx="1.2" fill={`url(#${id}-glow)`} style={{ opacity: glow }} />

        {/* the paddle: dark front, a lit cap where it rises toward you */}
        <motion.polygon points={front} fill={`url(#${id}-paddle)`} stroke="rgba(0,0,0,.8)" strokeWidth=".45" strokeLinejoin="round" />
        <motion.polygon points={cap} fill={`url(#${id}-cap)`} stroke="rgba(0,0,0,.6)" strokeWidth=".35" strokeLinejoin="round" />
        {/* shade in the slot where the paddle has lifted away */}
        <motion.rect x={SX0 + 0.4} y={SY0 + 0.3} width={SX1 - SX0 - 0.8} height={gapTop} fill="rgba(0,0,0,.55)" />
        <motion.rect x={SX0 + 0.4} y={gapBotY} width={SX1 - SX0 - 0.8} height={gapBot} fill="rgba(0,0,0,.55)" />
      </svg>
    </motion.button>
  );
}
