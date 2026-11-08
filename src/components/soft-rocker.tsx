// Soft rocker: a pale sculpted paddle in a recessed pill bezel, on a pale grained plate.
// One end of the paddle curls up like the toe of a slipper (with a tiny dot beside it), the other
// end lies flat. Click and it rocks: the raised end sinks, passes level, and the other end rises,
// with a soft overshoot. The silhouette, the toe's shading and the cast shadow are all computed
// from one spring value, so the form morphs continuously instead of cross fading.
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";
import { play } from "../sound/sound";

// viewBox space: the bezel pill is 360 wide, centred on x = 180
const VW = 360, CX = 180;
const PT = 29, PB = 148, PL = 15, PR = 345, PRAD = (PB - PT) / 2, PCY = (PT + PB) / 2; // paddle base pill

/** the paddle's flat top edge (its pill outline) */
function pillTop(x: number) {
  const l = PL + PRAD, r = PR - PRAD;
  if (x < l) return PCY - Math.sqrt(Math.max(0, PRAD * PRAD - (l - x) ** 2));
  if (x > r) return PCY - Math.sqrt(Math.max(0, PRAD * PRAD - (x - r) ** 2));
  return PT;
}
/** how far the right toe lifts the silhouette at x (peak just right of centre, falls to the tip) */
function toeLift(x: number) {
  const s = x < 225 ? 80 : 64;
  return 21 * Math.exp(-(((x - 225) / s) ** 2));
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
const RIDGE: [number, number][] = [[236, 4], [232, 22], [222, 54], [204, 88], [178, 116], [148, 136], [118, 150], [100, 156]];
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

/** one toe (drawn for the right end; the left one is the same group mirrored) */
function Toe({ h, id }: { h: number; id: string }) {
  if (h < 0.01) return null;
  const r = ridge(h);
  const edge = curve(r);
  const region = edge + `L${VW + 20} 170L${VW + 20} -20L${r[0][0].toFixed(1)} -20Z`;
  const a = smooth(h * 1.4);
  const off = (dx: number) => curve(r.map(([x, y]) => [x + dx * h, y] as [number, number]));
  return (
    <g opacity={a}>
      {/* the rising face: lit on its crown, falling into shade toward the front and the tip */}
      <path d={region} fill={`url(#${id}-toe)`} filter={`url(#${id}-b6)`} />
      {/* the concave valley just past the ridge, and the bright lip of the flat top before it */}
      <path d={off(16)} fill="none" stroke="#9ba7b3" strokeOpacity=".5" strokeWidth="18" filter={`url(#${id}-b9)`} />
      <path d={off(-12)} fill="none" stroke="#eef1f3" strokeOpacity=".45" strokeWidth="14" filter={`url(#${id}-b9)`} />
      {/* the crown highlight of the toe */}
      <ellipse cx={282} cy={40 - 8 * h} rx={50 * h} ry={22} fill="#f7f9fa" opacity=".85" filter={`url(#${id}-b9)`} />
      {/* the shaded flank toward the tip and the front */}
      <ellipse cx={318} cy={124} rx={46} ry={30} fill="#74818e" opacity={0.36 * h} filter={`url(#${id}-b12)`} />
    </g>
  );
}

/** the tiny recessed dot beside the raised end */
function Dot({ h }: { h: number }) {
  const a = smooth((h - 0.55) / 0.35);
  if (a <= 0) return null;
  return (
    <g opacity={a} transform={`translate(${(345 - (345 - 206) * h).toFixed(1)} 64)`}>
      <circle r="3.4" fill="#c8cfd6" />
      <circle r="2.8" cy=".6" fill="#6d7a87" />
      <circle r="2" cy="-.2" fill="#cfd6dc" />
      <circle r=".8" cx="-.6" cy="-1" fill="#fff" opacity=".85" />
    </g>
  );
}

export function SoftRockerSwitch({ on, onToggle, scale = 1 }: { on: boolean; onToggle: () => void; scale?: number }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  // p: +1 raised right, -1 raised left. A soft spring: about 380ms with a small overshoot
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
  const shX = CX + 70 * clamp(v, -1.2, 1.2);

  const W = VW * scale, H = 196 * scale;
  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Soft rocker" className="srk-btn"
      onClick={onToggle}
      onPointerDown={() => press.set(1)} onPointerUp={() => press.set(0)} onPointerLeave={() => press.set(0)}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") press.set(1); }} onKeyUp={() => press.set(0)}
      style={{ position: "relative", width: W, height: H, padding: 0, border: 0, background: "none", cursor: "pointer", borderRadius: 999, WebkitTapHighlightColor: "transparent" }}>
      <style>{`.srk-btn{outline:none}.srk-btn:focus-visible .srk-ring{opacity:1}`}</style>
      <svg viewBox={`0 -10 ${VW} 196`} width={W} height={H} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
        <defs>
          {[5, 6, 9, 12, 3, 2].map((s) => (
            <filter key={s} id={`${id}-b${s}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={s} /></filter>
          ))}
          <linearGradient id={`${id}-bezel`} x1="0" y1="15" x2="0" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#97a2ad" /><stop offset=".3" stopColor="#a9b3bd" /><stop offset=".75" stopColor="#c6cdd4" /><stop offset="1" stopColor="#d3d9de" />
          </linearGradient>
          <linearGradient id={`${id}-body`} x1="0" y1="8" x2="0" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e3e7ea" /><stop offset=".45" stopColor="#d8dde2" /><stop offset=".8" stopColor="#ced4da" /><stop offset=".92" stopColor="#b6bfc8" /><stop offset="1" stopColor="#7e8a97" />
          </linearGradient>
          <radialGradient id={`${id}-toe`} cx="280" cy="30" r="135" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e6e9ec" /><stop offset=".3" stopColor="#d3d9de" /><stop offset=".62" stopColor="#b3bdc6" /><stop offset="1" stopColor="#7f8b98" />
          </radialGradient>
          <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8f9ba7" stopOpacity="0" /><stop offset=".7" stopColor="#8f9ba7" stopOpacity=".28" /><stop offset="1" stopColor="#5d6a78" stopOpacity=".55" />
          </linearGradient>
          <clipPath id={`${id}-clip`}><path d={body(hL, hR)} /></clipPath>
          <clipPath id={`${id}-well`}><rect x="0" y="15" width={VW} height="145" rx="72.5" /></clipPath>
        </defs>

        {/* soft shadow the raised end throws on the plate below the bezel */}
        <ellipse cx={shX} cy={164} rx={120} ry={12} fill="#6c7986" opacity={0.3 + 0.12 * lift} filter={`url(#${id}-b9)`} />
        {/* the recessed bezel: its upper wall falls into shade, a light lip along its lower edge */}
        <rect x="0" y="15" width={VW} height="145" rx="72.5" fill={`url(#${id}-bezel)`} />
        <g clipPath={`url(#${id}-well)`}>
          <rect x="-6" y="7" width={VW + 12} height="157" rx="78" fill="none" stroke="#5f6c79" strokeOpacity=".35" strokeWidth="10" filter={`url(#${id}-b3)`} />
        </g>
        <rect x=".5" y="15.5" width={VW - 1} height="144" rx="72" fill="none" stroke="#7d8996" strokeOpacity=".35" strokeWidth="1" />
        <path d="M18 128 A72 72 0 0 0 72.5 159.5 L287.5 159.5 A72 72 0 0 0 342 128" fill="none" stroke="#eef1f3" strokeOpacity=".7" strokeWidth="1.2" />

        {/* the dark gap between paddle and bezel */}
        <rect x="11.5" y="26" width="337" height="128.5" rx="64" fill="#26313e" />
        <rect x="11.5" y="26" width="337" height="128.5" rx="64" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="2" filter={`url(#${id}-b2)`} />

        {/* the paddle */}
        <g transform={`translate(0 ${(1.2 * pr).toFixed(2)})`}>
          <path d={body(hL, hR)} fill={`url(#${id}-body)`} />
          <g clipPath={`url(#${id}-clip)`}>
            {/* rounded edge: shade along the front and the two ends */}
            <path d={body(hL, hR)} fill="none" stroke="#7a8794" strokeOpacity=".35" strokeWidth="10" transform="translate(0 6)" filter={`url(#${id}-b6)`} />
            <Toe h={hR} id={id} />
            <g transform={`translate(${VW} 0) scale(-1 1)`}><Toe h={hL} id={id} /></g>
            {/* the top lip catches the light */}
            <path d={body(hL, hR)} fill="none" stroke="#fbfcfd" strokeOpacity=".7" strokeWidth="2.5" transform="translate(0 1.6)" filter={`url(#${id}-b2)`} />
            {/* the rounded front of the paddle turns away from the light */}
            <rect x={PL} y={PB - 34} width={PR - PL} height="36" fill={`url(#${id}-front)`} />
            {/* front edge settles into the gap */}
            <rect x={PL} y={PB - 5} width={PR - PL} height="8" fill="#5a6775" opacity=".35" filter={`url(#${id}-b3)`} />
          </g>
          <Dot h={hR} />
          <g transform={`translate(${VW} 0) scale(-1 1)`}><Dot h={hL} /></g>
        </g>

        {/* keyboard focus ring */}
        <rect className="srk-ring" x="-7" y="8" width={VW + 14} height="159" rx="79.5" fill="none" stroke="#ff8a3d" strokeWidth="3" opacity="0" />
      </svg>
    </button>
  );
}

/** the block: a pale grained plate, the rocker on it, a sound on each rock */
export default function SoftRocker({ size = "card" }: { size?: "card" | "big" }) {
  const [on, setOn] = useState(true);
  const big = size === "big";
  // fit the plate (aspect 336:248) into whatever tile we are given
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => { const r = el.getBoundingClientRect(); const base = big ? [780, 500] : [336, 248]; setK(Math.min(1, (r.width * 0.86) / base[0], (r.height * 0.84) / base[1])); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); return () => ro.disconnect();
  }, [big]);
  const s = (big ? 1.55 : 0.68) * k;
  const pw = (big ? 780 : 336) * k, ph = (big ? 500 : 248) * k;
  return (
    <div ref={ref} data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <motion.div style={{
        position: "relative", width: pw, height: ph, borderRadius: (big ? 44 : 26) * k, display: "grid", placeItems: "center", overflow: "hidden",
        background: "radial-gradient(120% 90% at 50% 0%, #f2f4f6 0%, #e3e7ea 45%, #ccd3d9 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(120,132,145,.35), 0 1px 2px rgba(0,0,0,.5), 0 18px 40px -12px rgba(0,0,0,.65)",
      }}>
        <SoftRockerSwitch on={on} scale={s} onToggle={() => { play(on ? "off" : "on"); setOn(!on); }} />
        {/* fine grain over plate and paddle alike */}
        <svg aria-hidden="true" width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "multiply", opacity: 0.5 }}>
          <filter id="srk-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .5  0 0 0 0 .55  0 0 0 -1.6 1.05" /></filter>
          <rect width="100%" height="100%" filter="url(#srk-grain)" />
        </svg>
      </motion.div>
    </div>
  );
}
