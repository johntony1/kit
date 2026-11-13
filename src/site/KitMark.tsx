// KitMark: Kit's logo. A K built from three chunky parts: a stem block and two quarter-ring arms
// that swing out from the stem's middle and just miss each other. Matte green with one quiet tone
// change from top to foot, and a small solid side face that gives it depth. No glow, no gloss.
// Flat: the same K in two solid greens, for 16 to 24 px.
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
// centre the K and its side face in the 100 box
const PLACE = "translate(50 50) scale(0.86) translate(-48.6 -52.5)";
const DEPTH = 5; // how far the side face drops
const DX = 2; // and leans right, as if seen a little from the left
const STEPS = 14;

/** each part's side face: the part stepped down and right to its depth, in one solid colour */
function Side({ d, fill }: { d: string[]; fill: string }) {
  return (
    <g fill={fill}>
      {d.map((p, i) => Array.from({ length: STEPS }, (_, j) => {
        const t = 1 - j / STEPS;
        return <path key={`${i}-${j}`} d={p} transform={`translate(${f(DX * t)} ${f(DEPTH * t)})`} />;
      }))}
    </g>
  );
}

export function KitMark({ size = 24, flat = false, style, className }: { size?: number; flat?: boolean; style?: CSSProperties; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svg = { viewBox: "0 0 100 100", width: size, height: size, fill: "none", "aria-hidden": true, style, className } as const;
  const P = flat ? FLAT.d : FULL.d;
  if (flat) {
    return (
      <svg {...svg}>
        <g transform={PLACE}>
          <Side d={P} fill="#1c7a3f" />
          {P.map((d, i) => <path key={i} d={d} fill="#3fc06c" />)}
        </g>
      </svg>
    );
  }
  const g = `kit-top-${id}`;
  return (
    <svg {...svg}>
      <defs>
        {/* one quiet tone change: a touch lighter at the top, the site green at the foot */}
        <linearGradient id={g} x1="0" y1={TOP} x2="0" y2={BOT} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4ccb79" />
          <stop offset="1" stopColor="#38b765" />
        </linearGradient>
      </defs>
      <g transform={PLACE}>
        <Side d={P} fill="#1b7a3e" />
        {P.map((d, i) => <path key={i} d={d} fill={`url(#${g})`} />)}
      </g>
    </svg>
  );
}
