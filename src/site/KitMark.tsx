// KitMark: Kit's logo. A K built from three chunky extruded parts: a stem block and two quarter-ring
// arms that swing out from the stem's middle and just miss each other. Full: glossy green enamel,
// a deep side face for depth, a mint rim light along the top edges, a soft sheen and a glow.
// Flat: the same silhouette in one green with a single highlight, for 16 to 24 px.
import { useId, type CSSProperties } from "react";

const f = (n: number) => +n.toFixed(2);
const pt = (cx: number, cy: number, rad: number, a: number) => `${f(cx + rad * Math.cos(a))} ${f(cy + rad * Math.sin(a))}`;

/** a quarter of a ring, centred on (cx, cy), from angle a0 clockwise to a1, its four corners rounded by k */
function ring(cx: number, cy: number, R: number, r: number, a0: number, a1: number, k: number) {
  const P = (rad: number, a: number) => pt(cx, cy, rad, a);
  return `M${P(R - k, a0)}Q${P(R, a0)} ${P(R, a0 + k / R)}A${R} ${R} 0 0 1 ${P(R, a1 - k / R)}Q${P(R, a1)} ${P(R - k, a1)}`
    + `L${P(r + k, a1)}Q${P(r, a1)} ${P(r, a1 - k / r)}A${r} ${r} 0 0 0 ${P(r, a0 + k / r)}Q${P(r, a0)} ${P(r + k, a0)}Z`;
}

/** a block with rounded corners */
function block(x: number, y: number, w: number, h: number, k: number) {
  return `M${x + k} ${y}H${x + w - k}Q${x + w} ${y} ${x + w} ${y + k}V${y + h - k}Q${x + w} ${y + h} ${x + w - k} ${y + h}`
    + `H${x + k}Q${x} ${y + h} ${x} ${y + h - k}V${y + k}Q${x} ${y} ${x + k} ${y}Z`;
}

const Q = Math.PI / 2;
const TOP = 6, BOT = 94, X0 = 12, W = 24, ARM = 23;

/** the K on a 100 unit grid, g the gap between its parts: [stem, upper arm, lower arm] */
function parts(g: number, k: number) {
  const ax = X0 + W + g; // the arms start just right of the stem
  const R = (BOT - TOP) / 2 - g / 2; // so the two arms reach the stem with a gap g between them
  const r = R - ARM;
  return {
    d: [
      block(X0, TOP, W, BOT - TOP, k + 1),
      ring(ax, TOP, R, r, 0, Q, k), // the bottom right quarter of a ring on the stem's top corner
      ring(ax, BOT, R, r, -Q, 0, k), // the top right quarter of a ring on the stem's bottom corner
    ],
    ax, R, r,
  };
}

const FULL = parts(5, 3);
const FLAT = parts(7, 2);
// centre the K and its extrusion in the 100 box
const PLACE = "translate(50 50) scale(0.83) translate(-48.8 -54)";
const DEPTH = 8; // how deep the parts are extruded
const DX = 2.6; // and the extrusion leans a little right, as if seen from the top left
const STEPS = 20;

/** a short glossy streak along an arm, at radius rad between angles a0 and a1 */
function streak(cx: number, cy: number, rad: number, a0: number, a1: number) {
  return `M${pt(cx, cy, rad, a0)}A${rad} ${rad} 0 0 1 ${pt(cx, cy, rad, a1)}`;
}

export function KitMark({ size = 24, flat = false, style, className }: { size?: number; flat?: boolean; style?: CSSProperties; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const u = (n: string) => `${n}-${id}`;
  const url = (n: string) => `url(#${u(n)})`;
  const svg = { viewBox: "0 0 100 100", width: size, height: size, fill: "none", "aria-hidden": true, style, className } as const;

  if (flat) {
    const P = FLAT.d;
    return (
      <svg {...svg}>
        <defs><clipPath id={u("c")}>{P.map((d, i) => <path key={i} d={d} />)}</clipPath></defs>
        <g transform={PLACE}>
          {P.map((d, i) => <path key={`s${i}`} d={d} transform={`translate(${DX} ${DEPTH})`} fill="#15733a" />)}
          {/* tops in mint, then the green face laid over them a little lower: a lit top edge */}
          {P.map((d, i) => <path key={`t${i}`} d={d} fill="#bff7d1" />)}
          <g clipPath={url("c")}>{P.map((d, i) => <path key={`g${i}`} d={d} transform="translate(0 3.6)" fill="#3fc06c" />)}</g>
        </g>
      </svg>
    );
  }

  const P = FULL.d;
  const all = P.join("");
  const { ax, R, r } = FULL;
  const mid = (R + r) / 2;
  return (
    <svg {...svg}>
      <defs>
        {/* top face: mint at the top, the site green, deep at the foot */}
        <linearGradient id={u("top")} x1="0" y1={TOP} x2="0" y2={BOT} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#86f0aa" />
          <stop offset="0.36" stopColor="#3fc06c" />
          <stop offset="1" stopColor="#1f9149" />
        </linearGradient>
        {/* side face: the extrusion, dark and a touch cooler */}
        <linearGradient id={u("side")} x1="0" y1={TOP} x2="0" y2={BOT + DEPTH} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1a8443" />
          <stop offset="1" stopColor="#0a4321" />
        </linearGradient>
        {/* light from the top left over the enamel */}
        <radialGradient id={u("sheen")} cx="26" cy="10" r="74" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f0fff4" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#f0fff4" stopOpacity="0.06" />
          <stop offset="1" stopColor="#f0fff4" stopOpacity="0" />
        </radialGradient>
        <clipPath id={u("c")}><path d={all} /></clipPath>
        {/* rim light where a part's top edge faces up, and a dark lip along its foot */}
        <filter id={u("rim")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feOffset in="SourceAlpha" dx="1.1" dy="2.4" result="o" />
          <feComposite in="SourceAlpha" in2="o" operator="out" result="edge" />
          <feGaussianBlur in="edge" stdDeviation="0.45" result="eb" />
          <feFlood floodColor="#f4fff7" />
          <feComposite in2="eb" operator="in" result="lit" />
          <feOffset in="SourceAlpha" dx="-1.1" dy="-2.4" result="o2" />
          <feComposite in="SourceAlpha" in2="o2" operator="out" result="foot" />
          <feGaussianBlur in="foot" stdDeviation="1.3" result="fb" />
          <feFlood floodColor="#0a4521" floodOpacity="0.75" />
          <feComposite in2="fb" operator="in" result="shade" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="shade" /><feMergeNode in="lit" /></feMerge>
        </filter>
        <filter id={u("glow")} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id={u("soft")} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>
      <g transform={PLACE}>
        <path d={all} transform={`translate(${DX} ${DEPTH})`} fill="#3fc06c" opacity="0.5" filter={url("glow")} />
        {/* side faces: each part stacked down to its depth */}
        {P.map((d, i) => (
          <g key={`s${i}`} fill={url("side")}>
            {Array.from({ length: STEPS }, (_, j) => { const t = 1 - j / STEPS; return <path key={j} d={d} transform={`translate(${f(DX * t)} ${f(DEPTH * t)})`} />; })}
          </g>
        ))}
        {/* the foot of the side face catches a little bounce light */}
        <path d={all} transform={`translate(${DX} ${DEPTH})`} stroke="#4fe085" strokeOpacity="0.35" strokeWidth="0.6" />
        <g filter={url("rim")}>{P.map((d, i) => <path key={`t${i}`} d={d} fill={url("top")} />)}</g>
        {/* enamel: a broad sheen and a glossy streak down each part */}
        <g clipPath={url("c")}>
          <rect width="100" height="100" fill={url("sheen")} />
          <g stroke="#ffffff" strokeLinecap="round" filter={url("soft")}>
            <path d={`M${X0 + 6} ${TOP + 9}V${TOP + 40}`} strokeWidth="3.2" strokeOpacity="0.5" />
            <path d={streak(ax, TOP, mid + 6, 0.2, 0.95)} strokeWidth="3" strokeOpacity="0.38" />
            <path d={streak(ax, BOT, mid + 6, -1.35, -0.75)} strokeWidth="2.6" strokeOpacity="0.22" />
          </g>
        </g>
      </g>
    </svg>
  );
}
