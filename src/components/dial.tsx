// Power dial: a dark charcoal rounded-square base, like an app icon, with a recessed ring holding a round
// dark knob. The knob carries an I mark (on) and an O mark (off). Turn it (drag), click it or use
// the arrow keys: it snaps between two positions with a detent. On, the fine ribbed ring around the
// knob glows blue and the I lights; off, the ring dims to a dark grey rib ring.
import { useEffect, useId, useRef, useState } from "react";
import { play } from "../sound/sound";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

const CX = 100, CY = 104; // ring centre (and the foot of the knob) in the 200 unit art
const RING_IN = 64, RING_OUT = 75; // the ribbed ring
const KNOB = 62; // knob radius
const LIFT = 10; // how far the knob's face sits above its foot (it is a short cylinder seen from above)
const FY = CY - LIFT; // face centre
const OFF = -180; // knob angle when off (O at the top); on is 0 (I at the top)
const VB = { x: -12, y: -10, w: 224, h: 234 };

const TICKS = Array.from({ length: 200 }, (_, i) => {
  const a = (i / 200) * Math.PI * 2;
  const c = Math.cos(a), s = Math.sin(a);
  return `M${(CX + c * (RING_IN + 1.2)).toFixed(2)} ${(CY + s * (RING_IN + 1.2)).toFixed(2)}L${(CX + c * (RING_OUT - 1.3)).toFixed(2)} ${(CY + s * (RING_OUT - 1.3)).toFixed(2)}`;
}).join("");

// the knob's body: the hull of its face and its foot
const BODY = `M${CX - KNOB} ${FY}L${CX - KNOB} ${CY}A${KNOB} ${KNOB} 0 0 0 ${CX + KNOB} ${CY}L${CX + KNOB} ${FY}A${KNOB} ${KNOB} 0 0 0 ${CX - KNOB} ${FY}Z`;

export default function Dial({ size = "card" }: { size?: "card" | "big" }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const [on, setOn] = useState(true);
  const onRef = useRef(on);
  onRef.current = on;

  // knob angle: the target follows the pointer while dragging, a spring carries the knob
  const target = useMotionValue(0);
  const angle = useSpring(0, { stiffness: 380, damping: 23, mass: 0.9 });
  useEffect(() => target.on("change", (v) => { if (reduced) angle.jump(v); else angle.set(v); }), [target, angle, reduced]);

  // light: rises once the knob lands on I, falls when it leaves
  const light = useSpring(1, { stiffness: 150, damping: 26 });
  useEffect(() => { if (reduced) light.jump(on ? 1 : 0); else light.set(on ? 1 : 0); }, [on, light, reduced]);

  const ringBase = useTransform(light, [0, 1], ["#2c2e2d", "#24a8e6"]);
  const ringEdge = useTransform(light, [0, 1], ["#151615", "#0a64a3"]);
  const ribs = useTransform(light, [0, 1], ["#484b49", "#aaeaff"]);
  const glow = useTransform(light, [0, 1], [0, 0.85]);
  const markI = useTransform(light, [0, 1], ["#8a8f8c", "#5fd0ff"]);
  const wallGlow = useTransform(light, [0, 1], [0, 0.4]);
  const markGlow = useTransform(light, [0, 0.6, 1], [0, 0, 0.8]);

  const commit = (next: boolean) => {
    target.set(next ? 0 : OFF);
    if (next !== onRef.current) {
      play("detent");
      window.setTimeout(() => play(next ? "on" : "off"), 70);
      setOn(next);
    }
  };

  // drag: follow the pointer's angle around the centre, with a little give past the stops
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ a0: number; k: number; moved: boolean; side: boolean } | null>(null);
  const pointerAngle = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = r.left + (r.width * (CX - VB.x)) / VB.w, y = r.top + (r.height * (FY - VB.y)) / VB.h;
    return (Math.atan2(e.clientY - y, e.clientX - x) * 180) / Math.PI;
  };
  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { a0: pointerAngle(e), k: target.get(), moved: false, side: onRef.current };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    const a = pointerAngle(e);
    const delta = ((a - d.a0 + 540) % 360) - 180;
    if (!d.moved && Math.abs(delta) < 4) return;
    d.moved = true;
    d.a0 = a; // accumulate so a full half turn works
    d.k = Math.max(OFF - 60, Math.min(60, d.k + delta));
    let k = d.k;
    if (k > 0) k *= 0.25;
    if (k < OFF) k = OFF + (k - OFF) * 0.25;
    target.set(k);
    const side = k > OFF / 2;
    if (side !== d.side) { d.side = side; play("tick", { gap: 60 }); }
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (!d.moved) { commit(!onRef.current); return; }
    commit(target.get() > OFF / 2);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); commit(true); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); commit(false); }
    else if (e.key === " " || e.key === "Enter") { e.preventDefault(); commit(!onRef.current); }
  };

  // fit the tile: the base (200 units) keeps ~64px clear top and bottom on tall tiles, ~22px on short ones
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = boxRef.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const maxBase = size === "big" ? 400 : 210;
  const fitBase = box ? Math.min(box.h - (box.h >= 300 ? 128 : 44), box.w - 96) : maxBase;
  const k = Math.max(60, Math.min(maxBase, fitBase)) / 200, w = VB.w * k, h = VB.h * k;
  const u = (n: string) => `url(#${id}-${n})`;

  return (
    <div ref={boxRef} data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <style>{`.dl-btn{padding:0;border:0;background:none;cursor:grab;touch-action:none;-webkit-tap-highlight-color:transparent;border-radius:24%;outline:none;user-select:none;-webkit-user-select:none}
.dl-btn:active{cursor:grabbing}
.dl-btn:focus-visible{box-shadow:0 0 0 3px #191a19,0 0 0 5px #3fb6ff}`}</style>
      <button type="button" role="switch" aria-checked={on} aria-label="Power" className="dl-btn"
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
        onClick={(e) => { if (e.detail === 0) commit(!onRef.current); }}
        style={{ width: 200 * k, height: 200 * k, display: "block", position: "relative" }}>
        <svg ref={svgRef} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} width={w} height={h} aria-hidden="true" style={{ display: "block", overflow: "visible", position: "absolute", left: VB.x * k, top: VB.y * k, pointerEvents: "none" }}>
          <defs>
            {/* base: a charcoal pillow, deeper toward its edges and its lower side */}
            <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2f312f" /><stop offset=".55" stopColor="#232523" /><stop offset="1" stopColor="#141514" />
            </linearGradient>
            <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#373937" /><stop offset=".55" stopColor="#2d2f2d" /><stop offset="1" stopColor="#262826" />
            </linearGradient>
            <radialGradient id={`${id}-sheen`} cx=".5" cy="0" r=".75">
              <stop offset="0" stopColor="#fff" stopOpacity=".07" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset=".22" stopColor="#fff" stopOpacity=".05" /><stop offset=".5" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            {/* the well: a dark recess, shaded at the top, a faint lit lip at the bottom */}
            <radialGradient id={`${id}-well`} cx=".5" cy=".5" r=".5">
              <stop offset=".8" stopColor="#121312" /><stop offset=".93" stopColor="#191a19" /><stop offset="1" stopColor="#1d1f1d" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}-wellLip`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#000" stopOpacity=".7" /><stop offset=".5" stopColor="#000" stopOpacity=".15" /><stop offset=".8" stopColor="#fff" stopOpacity=".04" /><stop offset="1" stopColor="#fff" stopOpacity=".13" />
            </linearGradient>
            <linearGradient id={`${id}-ringLight`} x1=".85" y1="0" x2=".15" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".2" /><stop offset=".45" stopColor="#fff" stopOpacity=".03" /><stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".3" />
            </linearGradient>
            {/* knob: a dark soft touch cylinder */}
            <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a2c2a" /><stop offset=".55" stopColor="#222422" /><stop offset=".85" stopColor="#1a1b1a" /><stop offset="1" stopColor="#101110" />
            </linearGradient>
            <linearGradient id={`${id}-wallSide`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity=".45" /><stop offset=".22" stopColor="#000" stopOpacity="0" />
              <stop offset=".78" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".5" />
            </linearGradient>
            <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#323432" /><stop offset=".3" stopColor="#2c2e2c" /><stop offset=".49" stopColor="#252725" />
              <stop offset=".53" stopColor="#2f312f" /><stop offset=".62" stopColor="#2d2f2d" /><stop offset="1" stopColor="#292b29" />
            </linearGradient>
            <radialGradient id={`${id}-faceSheen`} cx=".5" cy=".12" r=".55">
              <stop offset="0" stopColor="#fff" stopOpacity=".09" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.35" />
            </filter>
            <filter id={`${id}-b1`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2" /></filter>
            <filter id={`${id}-b3`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
            <filter id={`${id}-b5`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
            <filter id={`${id}-b8`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
            <clipPath id={`${id}-baseClip`}><rect x="0" y="0" width="200" height="200" rx="48" /></clipPath>
            <clipPath id={`${id}-ringClip`}><circle cx={CX} cy={CY} r={RING_OUT} /></clipPath>
            <clipPath id={`${id}-faceClip`}><circle cx={CX} cy={FY} r={KNOB} /></clipPath>
          </defs>

          {/* the base's shadow on the dark tile: a wide soft one and a tight contact one */}
          <rect x="6" y="24" width="188" height="188" rx="52" fill="#000" opacity=".75" filter={u("b8")} />
          <rect x="2" y="7" width="196" height="197" rx="48" fill="#000" opacity=".7" filter={u("b3")} />

          {/* the base: dark at its rounded edges, a blurred lighter top swelling out of it */}
          <g clipPath={u("baseClip")}>
            <rect x="0" y="0" width="200" height="200" rx="48" fill={u("edge")} />
            <rect x="8" y="5" width="184" height="180" rx="42" fill={u("top")} filter={u("b5")} />
            <rect x="0" y="0" width="200" height="120" fill={u("sheen")} />
            <rect x="0" y="0" width="200" height="200" rx="48" fill="#000" filter={u("grain")} opacity=".18" />
            <rect x=".75" y=".75" width="198.5" height="198.5" rx="47.25" fill="none" stroke={u("rim")} strokeWidth="1.5" />
          </g>
          <rect x="-.5" y="-.5" width="201" height="201" rx="48.5" fill="none" stroke="#000" strokeOpacity=".55" strokeWidth="1" />

          {/* the recess the ring sits in */}
          <circle cx={CX} cy={CY + 1} r={RING_OUT + 6} fill={u("well")} />
          <circle cx={CX} cy={CY} r={RING_OUT + 1.2} fill="none" stroke={u("wellLip")} strokeWidth="1.6" />

          {/* glow: blue light spilling onto the dark base */}
          <motion.circle cx={CX} cy={CY} r={RING_OUT - 2} fill="none" stroke="#2fc0ff" strokeWidth="12" filter={u("b8")} style={{ opacity: glow }} />
          <motion.circle cx={CX} cy={CY} r={RING_OUT} fill="none" stroke="#6ad6ff" strokeWidth="4" filter={u("b3")} style={{ opacity: glow }} />

          {/* the ribbed ring: a coloured band, fine radial ribs, dark rims, light from the top right */}
          <g clipPath={u("ringClip")}>
            <motion.circle cx={CX} cy={CY} r={(RING_IN + RING_OUT) / 2} fill="none" strokeWidth={RING_OUT - RING_IN} style={{ stroke: ringBase }} />
            <motion.path d={TICKS} strokeWidth=".8" style={{ stroke: ribs, opacity: 0.8 }} />
            <circle cx={CX} cy={CY} r={(RING_IN + RING_OUT) / 2} fill="none" stroke={u("ringLight")} strokeWidth={RING_OUT - RING_IN} />
            <motion.circle cx={CX} cy={CY} r={RING_IN + 2.5} fill="none" strokeWidth="3" strokeOpacity=".45" style={{ stroke: ringEdge }} />
          </g>
          <motion.circle cx={CX} cy={CY} r={RING_OUT - 0.5} fill="none" strokeWidth="1.2" style={{ stroke: ringEdge }} />

          {/* the knob's shadow on the ring, heavier at the bottom right */}
          <circle cx={CX + 2.5} cy={CY + 3.5} r={KNOB + 1.5} fill="#000" opacity=".75" filter={u("b3")} />
          <circle cx={CX + 0.5} cy={CY + 1} r={KNOB + 0.4} fill="#000" opacity=".6" filter={u("b1")} />

          {/* the knob: a short dark cylinder, its wall darker toward the bottom, then its face */}
          <path d={BODY} fill={u("wall")} />
          <path d={BODY} fill={u("wallSide")} />
          <path d={`M${CX - KNOB + 0.6} ${CY - 1}A${KNOB - 0.6} ${KNOB - 0.6} 0 0 0 ${CX + KNOB - 0.6} ${CY - 1}`} fill="none" stroke="#fff" strokeOpacity=".05" strokeWidth="1" />
          {/* the ring's light catching the bottom of the knob's wall */}
          <motion.path d={`M${CX - KNOB + 4} ${CY + 18}A${KNOB - 0.8} ${KNOB - 0.8} 0 0 0 ${CX + KNOB - 4} ${CY + 18}`} fill="none" stroke="#3fc6ff" strokeWidth="1.4" filter={u("b1")} style={{ opacity: wallGlow }} />
          <circle cx={CX} cy={FY} r={KNOB} fill={u("face")} />
          <g clipPath={u("faceClip")}>
            <circle cx={CX} cy={FY} r={KNOB} fill={u("faceSheen")} />
            <rect x={CX - KNOB} y={FY - KNOB} width={KNOB * 2} height={KNOB * 2} fill="#000" filter={u("grain")} opacity=".16" />
            {/* the face's bevel: a lit lip at the top, a soft shade at the bottom */}
            <circle cx={CX} cy={FY + 1.6} r={KNOB} fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="2.6" filter={u("b1")} />
            <circle cx={CX} cy={FY - 2} r={KNOB} fill="none" stroke="#000" strokeOpacity=".45" strokeWidth="3" filter={u("b1")} />
          </g>
          <circle cx={CX} cy={FY} r={KNOB - 0.3} fill="none" stroke="#fff" strokeOpacity=".07" strokeWidth=".6" />

          {/* the marks turn with the knob; the shading stays with the light */}
          <motion.g style={{ rotate: angle, originX: "50%", originY: "50%" }}>
            <circle cx={CX} cy={FY} r={KNOB} fill="none" stroke="none" />
            <motion.rect x={CX - 3.5} y={FY - KNOB + 10} width="7" height="19" rx="3.5" fill="#2fc0ff" filter={u("b3")} style={{ opacity: markGlow }} />
            <rect x={CX - 1.4} y={FY - KNOB + 12.8} width="2.8" height="15" rx="1.4" fill="#000" opacity=".5" />
            <motion.rect x={CX - 1.4} y={FY - KNOB + 12} width="2.8" height="15" rx="1.4" style={{ fill: markI }} />
            <circle cx={CX} cy={FY + KNOB - 19} r="6.2" fill="none" stroke="#000" strokeOpacity=".55" strokeWidth="2" transform="translate(0 .9)" />
            <circle cx={CX} cy={FY + KNOB - 19} r="6.2" fill="none" stroke="#9a9f9c" strokeWidth="1.8" />
          </motion.g>
        </svg>
      </button>
    </div>
  );
}
