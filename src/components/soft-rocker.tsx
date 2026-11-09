// Soft rocker: a sculpted charcoal soft-touch paddle in a dark recessed pill bezel, set straight
// into the dark tile. One end of the paddle curls up like the toe of a slipper (with a tiny lamp
// beside it that glows green when on), the other end lies flat. Light always comes from the top left,
// so the two toes are shaded differently rather than mirrored. Click and it rocks: the raised end sinks, passes level, and the other end rises,
// with a soft overshoot. The silhouette, the toe's shading and the cast shadow are all computed
// from one spring value, so the form morphs continuously instead of cross fading.
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";
import { play } from "../sound/sound";

// viewBox space: the bezel pill is 360 wide, centred on x = 180
const VW = 360, CX = 180;
const PT = 33, PB = 148, PL = 18, PR = 342, PRAD = (PB - PT) / 2, PCY = (PT + PB) / 2; // paddle base pill

/** the paddle's flat top edge (its pill outline) */
function pillTop(x: number) {
  const l = PL + PRAD, r = PR - PRAD;
  if (x < l) return PCY - Math.sqrt(Math.max(0, PRAD * PRAD - (l - x) ** 2));
  if (x > r) return PCY - Math.sqrt(Math.max(0, PRAD * PRAD - (x - r) ** 2));
  return PT;
}
/** how far the right toe lifts the silhouette at x (peak just right of centre, falls to the tip) */
function toeLift(x: number) {
  const s = x < 252 ? 74 : 112;
  return 29 * Math.exp(-(((x - 252) / s) ** 2));
}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (v: number) => { const t = clamp(v, 0, 1); return t * t * (3 - 2 * t); };

/** the paddle outline for given toe heights at each end */
function body(hL: number, hR: number) {
  let d = "";
  for (let x = PL; x <= PR + 0.01; x += 3) {
    const y = pillTop(x) - hR * toeLift(x) - hL * toeLift(VW - x);
    d += `${d ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(2)}`;
  }
  return d + `A${PRAD} ${PRAD} 0 0 1 ${PR - PRAD} ${PB}L${PL + PRAD} ${PB}A${PRAD} ${PRAD} 0 0 1 ${PL} ${PCY}Z`;
}

/** the ridge where the flat top turns up into the right toe, drawn for height h (0..1+) */
const RIDGE: [number, number][] = [[226, 0], [221, 20], [212, 48], [200, 78], [188, 106], [178, 128], [170, 146], [166, 158]];
function ridge(h: number) {
  const k = Math.pow(clamp(h, 0, 1.2), 0.75);
  return RIDGE.map(([x, y]) => [PR + 20 - (PR + 20 - x) * k, y] as [number, number]);
}
function curve(pts: [number, number][]) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const z = pts[pts.length - 1];
  return d + `L${z[0].toFixed(1)} ${z[1].toFixed(1)}`;
}

/**
 * One toe, always drawn in right-toe geometry. The left toe is the same group mirrored, but the light
 * is not mirrored with it: it always comes from the top left (world). `mir` says this copy is the
 * mirrored one, so its rising face looks AWAY from the light and its tip flank looks TOWARD it.
 */
function Toe({ h, id, mir }: { h: number; id: string; mir: boolean }) {
  if (h < 0.01) return null;
  const r = ridge(h);
  const edge = curve(r);
  const region = edge + `L${VW + 20} 170L${VW + 20} -20L${r[0][0].toFixed(1)} -20Z`;
  const a = smooth(h * 1.4);
  const off = (dx: number) => curve(r.map(([x, y]) => [x + dx * h, y] as [number, number]));
  return (
    <g opacity={a}>
      {/* the rising face: crown catches the light, falling into shade toward the front and the tip */}
      <path d={region} fill={`url(#${id}-toe${mir ? "L" : "R"})`} filter={`url(#${id}-b6)`} />
      {/* deep shade in the concave valley just past the ridge */}
      <path d={off(16)} fill="none" stroke="#030403" strokeOpacity={mir ? 0.62 : 0.52} strokeWidth="22" filter={`url(#${id}-b12)`} />
      {/* the rising face itself: lit when it faces the top left, a touch darker when it turns away */}
      {mir
        ? <path d={off(40)} fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="22" filter={`url(#${id}-b12)`} />
        : <path d={off(42)} fill="none" stroke="#fff" strokeOpacity=".05" strokeWidth="20" filter={`url(#${id}-b12)`} />}
      {/* the lit lip of the flat top where it turns down into the valley */}
      <path d={off(-11)} fill="none" stroke="#fff" strokeOpacity={mir ? 0.08 : 0.11} strokeWidth="10" filter={`url(#${id}-b6)`} />
      {/* the soft highlight on the crown of the toe (pushed toward whichever side faces the light) */}
      <ellipse cx={mir ? 270 : 250} cy={30 - 10 * h} rx={50 * h} ry={18} fill="#fff" opacity={mir ? 0.13 : 0.17} filter={`url(#${id}-b9)`} />
      <ellipse cx={mir ? 274 : 246} cy={20 - 10 * h} rx={22 * h} ry={6} fill="#fff" opacity={mir ? 0.1 : 0.13} filter={`url(#${id}-b5)`} />
      {/* the flank toward the tip and the front: deep shade when it faces away, a soft sheen when it faces the light */}
      <ellipse cx={318} cy={122} rx={48} ry={32} fill="#000" opacity={(mir ? 0.3 : 0.6) * h} filter={`url(#${id}-b12)`} />
      {mir && <ellipse cx={334} cy={70} rx={14} ry={34} fill="#fff" opacity={0.045 * h} filter={`url(#${id}-b9)`} />}
    </g>
  );
}

/** the tiny lamp beside the raised end: a dark recessed housing, glowing green when lit */
function Lamp({ h, lit, mir, id }: { h: number; lit: boolean; mir: boolean; id: string }) {
  const a = smooth((h - 0.55) / 0.35);
  if (a <= 0) return null;
  const sx = mir ? -1 : 1; // keep the specular on the top left in world space
  return (
    <g opacity={a} transform={`translate(${(345 - (345 - 193) * h).toFixed(1)} 70)`}>
      {lit && <circle r="10" fill="#3fc06c" opacity=".38" filter={`url(#${id}-b5)`} />}
      <circle r="4.4" fill="#050605" />
      <circle r="4.4" cy=".5" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth=".8" />
      {lit ? (
        <>
          <circle r="3" fill="#3fc06c" />
          <circle r="1.7" cx={-0.3 * sx} cy="-.3" fill="#9df0b8" />
          <circle r=".7" cx={-0.9 * sx} cy="-1.1" fill="#f2fff6" opacity=".9" />
        </>
      ) : (
        <>
          <circle r="3" fill="#141614" />
          <circle r=".7" cx={-0.9 * sx} cy="-1.1" fill="#fff" opacity=".22" />
        </>
      )}
    </g>
  );
}

// content box in viewBox units: the bezel and its lips run y 15..160 (plus a hair of shadow)
const VY = 0, VH = 182;

export function SoftRockerSwitch({ on, onToggle, scale = 1 }: { on: boolean; onToggle: () => void; scale?: number }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  // p: +1 raised right (on), -1 raised left (off). A soft spring: about 380ms with a small overshoot
  const p = useSpring(on ? 1 : -1, { stiffness: 260, damping: 17, mass: 0.7 });
  const press = useSpring(0, { stiffness: 900, damping: 40 });
  const [v, setV] = useState(on ? 1 : -1);
  const [pr, setPr] = useState(0);
  useMotionValueEvent(p, "change", setV);
  useMotionValueEvent(press, "change", setPr);
  useEffect(() => { if (reduced) { p.jump(on ? 1 : -1); setV(on ? 1 : -1); } else p.set(on ? 1 : -1); }, [on, p, reduced]);

  // toe heights: each end rises as the paddle rocks past level; a press squashes the raised end
  const squash = 1 - 0.1 * pr;
  const hR = Math.max(0, (v + 0.15) / 1.15) ** 1.25 * squash;
  const hL = Math.max(0, (-v + 0.15) / 1.15) ** 1.25 * squash;
  const lift = Math.max(hL, hR);
  // the raised end throws its shadow down and to the right (light from the top left)
  const shX = CX + 8 + 46 * clamp(v, -1.2, 1.2);
  const d = body(hL, hR);
  const lowL = clamp(1 - hL, 0, 1), lowR = clamp(1 - hR, 0, 1); // how low (flat, in the recess) each end is

  const W = VW * scale, H = VH * scale;
  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Soft rocker" className="srk-btn"
      onClick={onToggle}
      onPointerDown={() => press.set(1)} onPointerUp={() => press.set(0)} onPointerLeave={() => press.set(0)}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") press.set(1); }} onKeyUp={() => press.set(0)}
      style={{ position: "relative", width: W, height: H, padding: 0, border: 0, background: "none", cursor: "pointer", borderRadius: 999, WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
      <style>{`.srk-btn{outline:none}.srk-btn:focus-visible .srk-ring{opacity:1}`}</style>
      <svg viewBox={`0 ${VY} ${VW} ${VH}`} width={W} height={H} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
        <defs>
          {[2, 3, 5, 6, 9, 12].map((s) => (
            <filter key={s} id={`${id}-b${s}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={s} /></filter>
          ))}
          {/* fine soft-touch grain: light specks and dark specks */}
          <filter id={`${id}-gl`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="3" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -.72" />
          </filter>
          <filter id={`${id}-gd`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="9" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 1.6 0 0 -.68" />
          </filter>
          {/* the recess: its floor darkest under the upper wall, lifting toward the lower lip */}
          <linearGradient id={`${id}-bezel`} x1="0" y1="15" x2="0" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0e0f0e" /><stop offset=".07" stopColor="#171817" /><stop offset=".35" stopColor="#1d1f1d" /><stop offset=".85" stopColor="#252725" /><stop offset="1" stopColor="#2e302e" />
          </linearGradient>
          {/* charcoal soft-touch body, rolling into deep shade along its rounded front */}
          <linearGradient id={`${id}-body`} x1="0" y1="8" x2="0" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#333633" /><stop offset=".4" stopColor="#2b2d2b" /><stop offset=".76" stopColor="#252725" /><stop offset=".9" stopColor="#1b1c1b" /><stop offset="1" stopColor="#0e0f0e" />
          </linearGradient>
          {/* light falls off from left to right across the whole paddle */}
          <linearGradient id={`${id}-side`} x1={PL} y1="0" x2={PR} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity=".045" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".2" />
          </linearGradient>
          {/* the toe faces (local right-toe space). Right toe: lit crown toward the ridge. Left toe: lit toward its tip */}
          <radialGradient id={`${id}-toeR`} cx="272" cy="26" r="140" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#434743" /><stop offset=".3" stopColor="#343734" /><stop offset=".62" stopColor="#242624" /><stop offset="1" stopColor="#121312" />
          </radialGradient>
          <radialGradient id={`${id}-toeL`} cx="302" cy="26" r="135" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3f423f" /><stop offset=".3" stopColor="#303330" /><stop offset=".62" stopColor="#222422" /><stop offset="1" stopColor="#141514" />
          </radialGradient>
          <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset=".65" stopColor="#000" stopOpacity=".22" /><stop offset="1" stopColor="#000" stopOpacity=".55" />
          </linearGradient>
          {/* the top lip: brightest on the left end, fading to the right */}
          <linearGradient id={`${id}-lip`} x1={PL} y1="0" x2={PR} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity=".36" /><stop offset=".5" stopColor="#fff" stopOpacity=".2" /><stop offset="1" stopColor="#fff" stopOpacity=".09" />
          </linearGradient>
          <linearGradient id={`${id}-rim`} x1="0" y1="15" x2="0" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".16" />
          </linearGradient>
          <linearGradient id={`${id}-low`} x1={PL} y1="0" x2={PR} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#000" stopOpacity={0.16 * lowL} /><stop offset=".45" stopColor="#000" stopOpacity="0" /><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity={0.16 * lowR} />
          </linearGradient>
          <linearGradient id={`${id}-lowEdge`} x1={PL} y1="0" x2={PR} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#000" stopOpacity={0.75 * lowL} /><stop offset=".5" stopColor="#000" stopOpacity={0.3 * (lowL + lowR)} /><stop offset="1" stopColor="#000" stopOpacity={0.75 * lowR} />
          </linearGradient>
          <clipPath id={`${id}-clip`}><path d={d} /></clipPath>
          <clipPath id={`${id}-well`}><rect x="0" y="15" width={VW} height="145" rx="72.5" /></clipPath>
        </defs>

        {/* the raised hump throws a soft shadow onto the surface below the bezel, offset toward its side */}
        <ellipse cx={shX} cy={164} rx={132} ry={11} fill="#000" opacity={0.3 + 0.3 * lift} filter={`url(#${id}-b9)`} />
        {/* the cut in the tile: a faint lit edge along its lower rim, a dark ring all round */}
        <rect x="-1.5" y="14" width={VW + 3} height="148" rx="74" fill="none" stroke="#fff" strokeOpacity=".06" strokeWidth="1.2" transform="translate(0 1)" />
        {/* the recessed bezel */}
        <rect x="0" y="15" width={VW} height="145" rx="72.5" fill={`url(#${id}-bezel)`} />
        <g clipPath={`url(#${id}-well)`}>
          {/* the upper wall falls into deep shade */}
          <rect x="-6" y="6" width={VW + 12} height="158" rx="78" fill="none" stroke="#000" strokeOpacity=".45" strokeWidth="8" filter={`url(#${id}-b5)`} />
        </g>
        <rect x=".5" y="15.5" width={VW - 1} height="144" rx="72" fill="none" stroke="#000" strokeOpacity=".55" strokeWidth="1" />
        {/* the lower lip of the recess catches the light */}
        <rect x=".6" y="15.6" width={VW - 1.2} height="143.8" rx="71.9" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.2" />

        {/* the dark gap between paddle and bezel */}
        {/* the thin dark gap around the paddle, thicker along the bottom */}
        <rect x={PL - 3} y={PT - 2.5} width={PR - PL + 6} height={PB - PT + 9} rx={(PB - PT + 9) / 2} fill="#050605" />
        <rect x={PL - 3} y={PT - 2.5} width={PR - PL + 6} height={PB - PT + 9} rx={(PB - PT + 9) / 2} fill="none" stroke="#000" strokeOpacity=".5" strokeWidth="2" filter={`url(#${id}-b2)`} />

        {/* the paddle */}
        <g transform={`translate(0 ${(1.2 * pr).toFixed(2)})`}>
          <path d={d} fill={`url(#${id}-body)`} />
          <g clipPath={`url(#${id}-clip)`}>
            <rect x={PL} y="-20" width={PR - PL} height="180" fill={`url(#${id}-side)`} />
            {/* a broad soft sheen where the flat top faces the light */}
            <ellipse cx={100} cy={58} rx={110} ry={34} fill="#fff" opacity=".035" filter={`url(#${id}-b12)`} />
            {/* rounded edge: shade along the front and the two ends */}
            <path d={d} fill="none" stroke="#000" strokeOpacity=".45" strokeWidth="10" transform="translate(0 6)" filter={`url(#${id}-b6)`} />
            <Toe h={hR} id={id} mir={false} />
            <g transform={`translate(${VW} 0) scale(-1 1)`}><Toe h={hL} id={id} mir /></g>
            {/* the low flat end sits in the recess: the bezel's upper wall shades its top, and it is a touch darker */}
            <rect x={PL} y="-20" width={PR - PL} height="180" fill={`url(#${id}-low)`} />
            <path d={d} fill="none" stroke={`url(#${id}-lowEdge)`} strokeWidth="16" transform="translate(0 -5)" filter={`url(#${id}-b6)`} />
            {/* soft-touch grain */}
            <rect x={PL} y="-20" width={PR - PL} height="180" filter={`url(#${id}-gl)`} opacity=".07" />
            <rect x={PL} y="-20" width={PR - PL} height="180" filter={`url(#${id}-gd)`} opacity=".35" />
            {/* the top lip catches the light, brightest on the left */}
            <path d={d} fill="none" stroke={`url(#${id}-lip)`} strokeWidth="2.4" transform="translate(0 1.5)" filter={`url(#${id}-b2)`} />
            <path d={d} fill="none" stroke={`url(#${id}-lip)`} strokeWidth=".9" transform="translate(0 .9)" opacity=".8" />
            {/* the rounded front of the paddle turns away from the light */}
            <rect x={PL} y={PB - 36} width={PR - PL} height="38" fill={`url(#${id}-front)`} />
            {/* front edge settles into the gap */}
            <rect x={PL} y={PB - 5} width={PR - PL} height="8" fill="#000" opacity=".5" filter={`url(#${id}-b3)`} />
          </g>
          <Lamp h={hR} lit={on} mir={false} id={id} />
          <g transform={`translate(${VW} 0) scale(-1 1)`}><Lamp h={hL} lit={false} mir id={id} /></g>
        </g>

        {/* keyboard focus ring */}
        <rect className="srk-ring" x="-7" y="8" width={VW + 14} height="159" rx="79.5" fill="none" stroke="#ff8a3d" strokeWidth="3" opacity="0" />
      </svg>
    </button>
  );
}

/** the block: the rocker set straight into the dark tile, a sound on each rock */
export default function SoftRocker({ size = "card" }: { size?: "card" | "big" }) {
  const [on, setOn] = useState(true);
  const big = size === "big";
  // fit the switch into whatever tile we are given, with room above and below for the corner pills
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(big ? 1.3 : 0.6);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const ideal = big ? 1.3 : 0.62;
      const vPad = big ? 140 : 64; // clear space kept at the top and at the bottom
      setS(Math.max(0.2, Math.min(ideal, (r.width * (big ? 0.5 : 0.6)) / VW, (r.height - 2 * vPad) / VH)));
    };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); return () => ro.disconnect();
  }, [big]);
  return (
    <div ref={ref} data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <SoftRockerSwitch on={on} scale={s} onToggle={() => { play(on ? "off" : "on"); setOn(!on); }} />
    </div>
  );
}
