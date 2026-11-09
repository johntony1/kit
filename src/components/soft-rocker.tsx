/* Soft rocker: a sculpted paddle in a pill-shaped recess, in charcoal soft-touch. One end is a
 * flat, softly lit top that sits low in the recess; the other swells into a rounded heel that rises
 * past the rim, its crown catching the light and its front falling into shade through a curved
 * valley. Flip it and the heel sinks, the paddle passes level, and the heel rises at the other end.
 * A tiny dimple on the flat side glows green while it is on.
 *
 * Proportions are measured from the reference: the recess is 2.5 : 1, the flat top covers the
 * first 55% of the paddle, the valley sweeps from the top edge down to the front corner of the
 * heel, and the heel rises about 15% of the paddle's height above the rim.
 *
 * One file, React and framer-motion. Render it inside a positioned box. */
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { play } from "../sound/sound";

const VW = 380, VH = 196;      // drawing size
const OX = 10, OY = 26;        // where the recess starts inside the drawing
const BW = 360, BH = 144;      // the recess (bezel)
const CX = OX + BW / 2;        // the paddle's centre line, for mirroring

/** the paddle outline, traced from the reference. k: how high the heel is (0 = a level pill, 1 = full heel on the right).
 * The right end stays a big rounded curve; the heel peaks about 60% along; the left end is a pill end. */
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
function paddlePath(k: number) {
  const X = (v: number) => OX + v, Y = (v: number) => OY + v;
  const top = 14, bot = 128, mid = (top + bot) / 2;
  // [pill value, heel value] for each point that moves
  const P = (pv: number, hv: number) => lerp(pv, hv, k);
  return [
    `M ${X(78)} ${Y(bot)}`,
    `L ${X(286)} ${Y(bot)}`,
    `C ${X(P(320, 326))} ${Y(bot)} ${X(347)} ${Y(P(104, 110))} ${X(347)} ${Y(P(mid, 80))}`,
    `C ${X(347)} ${Y(P(38, 46))} ${X(P(322, 340))} ${Y(P(top, 20))} ${X(P(286, 306))} ${Y(P(top, 4))}`,
    `C ${X(P(262, 282))} ${Y(P(top, -4))} ${X(P(240, 252))} ${Y(P(top, -10))} ${X(P(222, 224))} ${Y(P(top, -10))}`,
    `C ${X(P(190, 192))} ${Y(P(top, -10))} ${X(P(160, 164))} ${Y(P(top, 4))} ${X(P(130, 128))} ${Y(P(top, 12))}`,
    `C ${X(110)} ${Y(top)} ${X(96)} ${Y(top)} ${X(78)} ${Y(top)}`,
    `C ${X(42)} ${Y(top)} ${X(16)} ${Y(40)} ${X(16)} ${Y(mid)}`,
    `C ${X(16)} ${Y(104)} ${X(42)} ${Y(bot)} ${X(78)} ${Y(bot)} Z`,
  ].join(" ");
}
/** the heel's front face: from the crease (low on the left, up to the peak) round the right end */
function heelFace() {
  const X = (v: number) => OX + v, Y = (v: number) => OY + v;
  return `M ${X(104)} ${Y(132)} C ${X(150)} ${Y(96)} ${X(186)} ${Y(30)} ${X(214)} ${Y(-14)} L ${X(370)} ${Y(-14)} L ${X(370)} ${Y(140)} Z`;
}
const pill = (x: number, y: number, w: number, h: number) => {
  const r = h / 2;
  return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};

export function SoftRocker({ on, onToggle, scale = 1 }: { on: boolean; onToggle: () => void; scale?: number }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  // s runs from 1 (heel right, on) to -1 (heel left, off); it passes 0 (level) on the way
  const s = useSpring(on ? 1 : -1, { stiffness: 230, damping: 19, mass: 0.8 });
  useEffect(() => { if (reduced) s.jump(on ? 1 : -1); else s.set(on ? 1 : -1); }, [on, s, reduced]);
  const [press, setPress] = useState(false);

  const k = useTransform(s, (v) => Math.min(1.08, Math.abs(v)));
  const d = useTransform(k, (v) => paddlePath(v));
  // the heel is drawn on the right; for the left it is mirrored about the centre line
  const [left, setLeft] = useState(!on);
  useMotionValueEvent(s, "change", (v) => { const l = v < 0; setLeft((cur) => (cur === l ? cur : l)); });
  const shadowX = useTransform(s, (v) => CX + 70 * v);
  const heelO = useTransform(k, (v) => Math.min(1, v));
  const shadowO = useTransform(k, (v) => 0.25 + 0.45 * Math.min(1, v));
  const lamp = useTransform(s, (v) => Math.max(0, Math.min(1, (v - 0.6) / 0.4)));

  const P = `${id}`;
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={on ? "On. Switch off" : "Off. Switch on"} className="sr-btn"
      onClick={onToggle} onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerLeave={() => setPress(false)}
      style={{ display: "block", padding: 0, border: 0, background: "none", cursor: "pointer", borderRadius: 999, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
      <style>{`.sr-btn:focus-visible{outline:2px solid rgba(63,192,108,.7);outline-offset:6px}`}</style>
      <svg viewBox={`0 0 ${VW} ${VH}`} width={VW * scale} height={VH * scale} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={`${P}-wall`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b0c0b" /><stop offset=".55" stopColor="#151615" /><stop offset="1" stopColor="#2b2d2b" />
          </linearGradient>
          <linearGradient id={`${P}-body`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#484b48" /><stop offset=".5" stopColor="#393c39" /><stop offset="1" stopColor="#292b29" />
          </linearGradient>
          <linearGradient id={`${P}-front`} x1="0" y1="0" x2="0" y2="1">
            <stop offset=".7" stopColor="#000" stopOpacity="0" /><stop offset=".94" stopColor="#000" stopOpacity=".28" /><stop offset="1" stopColor="#000" stopOpacity=".4" />
          </linearGradient>
          <linearGradient id={`${P}-heel`} x1="0" y1="0" x2=".55" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".11" /><stop offset=".4" stopColor="#fff" stopOpacity=".02" /><stop offset="1" stopColor="#000" stopOpacity=".4" />
          </linearGradient>
          <radialGradient id={`${P}-heelface`} cx=".86" cy=".92" r=".55">
            <stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <filter id={`${P}-b6`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" /></filter>
          <filter id={`${P}-b9`} x="-50%" y="-30%" width="200%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
          <radialGradient id={`${P}-glow`}><stop offset="0" stopColor="#3fc06c" stopOpacity=".55" /><stop offset="1" stopColor="#3fc06c" stopOpacity="0" /></radialGradient>
          <filter id={`${P}-b10`} x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id={`${P}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0" />
          </filter>
          <clipPath id={`${P}-clip`}><motion.path d={d} /></clipPath>
        </defs>

        {/* soft shadow on the tile below the switch, heavier under the heel */}
        <motion.g style={{ opacity: shadowO }}>
          <motion.ellipse cx={shadowX} cy={OY + BH + 12} rx={130} ry={13} fill="#000" filter={`url(#${P}-b10)`} />
        </motion.g>

        {/* the recess: a lit outer edge, a shaded upper wall, a lit lower lip */}
        <path d={pill(OX - 1, OY - 1, BW + 2, BH + 2)} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" />
        <path d={pill(OX, OY, BW, BH)} fill={`url(#${P}-wall)`} />
        <path d={pill(OX + 3, OY + 3, BW - 6, BH - 6)} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth="3" />
        {/* the dark gap line around the paddle, thickest along the bottom */}
        <path d={pill(OX + 13, OY + 11, 337, 121)} fill="#000" />
        {/* a lit lip on the recess floor just below the gap */}
        <path d={`M ${OX + 70} ${OY + 136} H ${OX + BW - 70}`} stroke="rgba(255,255,255,.09)" strokeWidth="1.2" strokeLinecap="round" />

        <g transform={left ? `translate(${2 * CX} 0) scale(-1 1)` : undefined}>
          <motion.g animate={{ y: press ? 1.6 : 0 }} transition={{ type: "spring", stiffness: 600, damping: 30 }}>
            {/* body */}
            <motion.path d={d} fill={`url(#${P}-body)`} />
            <g clipPath={`url(#${P}-clip)`}>
              {/* the flat top: a broad soft light */}
              <ellipse cx={OX + 96} cy={OY + 44} rx={110} ry={30} fill="#fff" opacity=".08" filter={`url(#${P}-b10)`} />
              <motion.g style={{ opacity: heelO }}>
                {/* the flat top darkens a little where the heel shades it, along the crease */}
                <path d={`M ${OX + 98} ${OY + 132} C ${OX + 144} ${OY + 96} ${OX + 180} ${OY + 30} ${OX + 208} ${OY - 6}`} fill="none" stroke="#000" strokeWidth="34" opacity=".24" filter={`url(#${P}-b10)`} />
                {/* the heel's front face: lit at the top, falling into shade toward the lower right */}
                <path d={heelFace()} fill={`url(#${P}-heel)`} filter={`url(#${P}-b9)`} />
                {/* its crown catches the light near the peak */}
                <ellipse cx={OX + 250} cy={OY + 12} rx={56} ry={16} fill="#fff" opacity=".1" filter={`url(#${P}-b10)`} />
              </motion.g>
              {/* the rounded front edge rolls away into shadow */}
              <rect x={OX} y={OY - 30} width={BW} height={BH + 34} fill={`url(#${P}-front)`} />
              {/* fine soft-touch grain */}
              <rect x={OX} y={OY - 30} width={BW} height={BH + 40} filter={`url(#${P}-grain)`} opacity=".15" />
            </g>
            {/* a thin light along the whole top edge */}
            <motion.path d={d} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.2" clipPath={`url(#${P}-clip)`} />

            {/* the dimple, on the flat top just before the slope */}
            <circle cx={OX + 206} cy={OY + 48} r="3.6" fill="#141514" stroke="rgba(0,0,0,.6)" strokeWidth=".8" />
            <circle cx={OX + 206} cy={OY + 49} r="3.6" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".6" />
            <motion.circle style={{ opacity: lamp }} cx={OX + 206} cy={OY + 48} r="11" fill={`url(#${P}-glow)`} />
            <motion.circle style={{ opacity: lamp }} cx={OX + 206} cy={OY + 48} r="2.6" fill="#7dffae" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
}

export default function SoftRockerBlock({ size = "card" }: { size?: "card" | "big" }) {
  const box = useRef<HTMLDivElement>(null);
  const [sc, setSc] = useState(0.6);
  const [on, setOn] = useState(true);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      const vClear = size === "big" ? 160 : h < 260 ? 40 : 128;
      setSc(Math.max(0.25, Math.min(size === "big" ? 1.35 : 0.72, (w * (size === "big" ? 0.5 : 0.66)) / VW, (h - vClear) / VH)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return (
    <div ref={box} data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <SoftRocker on={on} scale={sc} onToggle={() => { play(on ? "off" : "on"); setOn(!on); }} />
    </div>
  );
}
