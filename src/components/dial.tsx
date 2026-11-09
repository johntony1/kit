// Power dial: a white rounded-square base, like an app icon, with a recessed ring holding a round
// white knob. The knob carries an I mark (on) and an O mark (off). Turn it (drag), click it or use
// the arrow keys: it snaps between two positions with a detent. On, the fine ribbed ring around the
// knob glows blue and the I lights; off, the ring dims to grey.
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

  const ringBase = useTransform(light, [0, 1], ["#bfc4c9", "#24a8e6"]);
  const ringEdge = useTransform(light, [0, 1], ["#a3a9af", "#0a64a3"]);
  const ribs = useTransform(light, [0, 1], ["#e3e6e9", "#aaeaff"]);
  const glow = useTransform(light, [0, 1], [0, 0.85]);
  const markI = useTransform(light, [0, 1], ["#b9bec3", "#10a3ec"]);
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

  const w = size === "big" ? 480 : 236, h = (w * VB.h) / VB.w, k = w / VB.w;
  const u = (n: string) => `url(#${id}-${n})`;

  return (
    <div data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <style>{`.dl-btn{padding:0;border:0;background:none;cursor:grab;touch-action:none;-webkit-tap-highlight-color:transparent;border-radius:24%;outline:none;user-select:none;-webkit-user-select:none}
.dl-btn:active{cursor:grabbing}
.dl-btn:focus-visible{box-shadow:0 0 0 3px #191a19,0 0 0 5px #3fb6ff}`}</style>
      <button type="button" role="switch" aria-checked={on} aria-label="Power" className="dl-btn"
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
        onClick={(e) => { if (e.detail === 0) commit(!onRef.current); }}
        style={{ width: 200 * k, height: 200 * k, display: "block", position: "relative" }}>
        <svg ref={svgRef} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} width={w} height={h} aria-hidden="true" style={{ display: "block", overflow: "visible", position: "absolute", left: VB.x * k, top: VB.y * k, pointerEvents: "none" }}>
          <defs>
            {/* base: a soft white pillow, grey toward its edges and its lower side */}
            <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef0f1" /><stop offset=".6" stopColor="#d9dcdf" /><stop offset="1" stopColor="#b3b7bc" />
            </linearGradient>
            <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" /><stop offset=".6" stopColor="#f7f8f9" /><stop offset="1" stopColor="#eef0f2" />
            </linearGradient>
            <radialGradient id={`${id}-well`} cx=".5" cy=".5" r=".5">
              <stop offset=".86" stopColor="#d5d9dc" /><stop offset=".96" stopColor="#e9ecee" /><stop offset="1" stopColor="#f6f7f8" stopOpacity="0" />
            </radialGradient>
            {/* knob */}
            <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eceef0" /><stop offset=".55" stopColor="#e2e5e8" /><stop offset=".85" stopColor="#cfd3d7" /><stop offset="1" stopColor="#b5babf" />
            </linearGradient>
            <linearGradient id={`${id}-wallSide`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#5a6168" stopOpacity=".18" /><stop offset=".2" stopColor="#5a6168" stopOpacity="0" />
              <stop offset=".8" stopColor="#5a6168" stopOpacity="0" /><stop offset="1" stopColor="#5a6168" stopOpacity=".2" />
            </linearGradient>
            <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef1f2" /><stop offset=".3" stopColor="#e7ebec" /><stop offset=".49" stopColor="#dfe4e6" />
              <stop offset=".53" stopColor="#f5f7f8" /><stop offset=".62" stopColor="#f3f5f7" /><stop offset="1" stopColor="#f7f8f9" />
            </linearGradient>
            <filter id={`${id}-b1`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2" /></filter>
            <filter id={`${id}-b3`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
            <filter id={`${id}-b5`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
            <filter id={`${id}-b8`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
            <clipPath id={`${id}-baseClip`}><rect x="0" y="0" width="200" height="200" rx="48" /></clipPath>
            <clipPath id={`${id}-ringClip`}><circle cx={CX} cy={CY} r={RING_OUT} /></clipPath>
            <clipPath id={`${id}-faceClip`}><circle cx={CX} cy={FY} r={KNOB} /></clipPath>
          </defs>

          {/* the base's shadow on the dark tile: a wide soft one and a tight contact one */}
          <rect x="8" y="22" width="184" height="186" rx="50" fill="#000" opacity=".6" filter={u("b8")} />
          <rect x="3" y="8" width="194" height="196" rx="48" fill="#000" opacity=".55" filter={u("b3")} />

          {/* the base: grey at its rounded edges, a blurred white top swelling out of it */}
          <g clipPath={u("baseClip")}>
            <rect x="0" y="0" width="200" height="200" rx="48" fill={u("edge")} />
            <rect x="7" y="4" width="186" height="182" rx="42" fill={u("top")} filter={u("b5")} />
            <rect x="0" y="0" width="200" height="200" rx="48" fill="none" stroke="#fff" strokeWidth="2" opacity=".9" transform="translate(0 .8)" />
          </g>

          {/* the recess the ring sits in */}
          <circle cx={CX} cy={CY + 1} r={RING_OUT + 5} fill={u("well")} />
          <circle cx={CX} cy={CY} r={RING_OUT + 0.8} fill="none" stroke="#9aa1a8" strokeOpacity=".55" strokeWidth="1" />

          {/* glow: blue light spilling onto the white base */}
          <motion.circle cx={CX} cy={CY} r={RING_OUT - 2} fill="none" stroke="#2fc0ff" strokeWidth="10" filter={u("b8")} style={{ opacity: glow }} />
          <motion.circle cx={CX} cy={CY} r={RING_OUT} fill="none" stroke="#6ad6ff" strokeWidth="4" filter={u("b3")} style={{ opacity: glow }} />

          {/* the ribbed ring: a coloured band, fine radial ribs, dark rims, light from the top right */}
          <g clipPath={u("ringClip")}>
            <motion.circle cx={CX} cy={CY} r={(RING_IN + RING_OUT) / 2} fill="none" strokeWidth={RING_OUT - RING_IN} style={{ stroke: ringBase }} />
            <motion.path d={TICKS} strokeWidth=".8" style={{ stroke: ribs, opacity: 0.8 }} />
            <path d={`M${CX} ${CY - RING_OUT} A${RING_OUT} ${RING_OUT} 0 0 1 ${CX + RING_OUT} ${CY}`} fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth={(RING_OUT - RING_IN) * 2} />
            <motion.circle cx={CX} cy={CY} r={RING_IN + 2.5} fill="none" strokeWidth="3" strokeOpacity=".35" style={{ stroke: ringEdge }} />
          </g>
          <motion.circle cx={CX} cy={CY} r={RING_OUT - 0.5} fill="none" strokeWidth="1.2" style={{ stroke: ringEdge }} />

          {/* the knob's shadow on the ring, heavier at the bottom right */}
          <circle cx={CX + 2.5} cy={CY + 3} r={KNOB + 1} fill="#032a44" opacity=".5" filter={u("b3")} />
          <circle cx={CX + 0.5} cy={CY + 1} r={KNOB + 0.4} fill="#000" opacity=".3" filter={u("b1")} />

          {/* the knob: a short white cylinder, its wall darker toward the bottom, then its face */}
          <path d={BODY} fill={u("wall")} />
          <path d={BODY} fill={u("wallSide")} />
          <circle cx={CX} cy={FY} r={KNOB} fill={u("face")} />
          {/* the face's bevel: a bright lip at the bottom, a soft shade at the top */}
          <g clipPath={u("faceClip")}>
            <circle cx={CX} cy={FY - 1.5} r={KNOB} fill="none" stroke="#fff" strokeWidth="3" filter={u("b1")} />
            <circle cx={CX} cy={FY + 2} r={KNOB} fill="none" stroke="#9aa2a9" strokeOpacity=".35" strokeWidth="2.4" filter={u("b1")} />
          </g>
          <circle cx={CX} cy={FY} r={KNOB - 0.3} fill="none" stroke="#c8cdd1" strokeOpacity=".6" strokeWidth=".6" />

          {/* the marks turn with the knob; the shading stays with the light */}
          <motion.g style={{ rotate: angle, originX: "50%", originY: "50%" }}>
            <circle cx={CX} cy={FY} r={KNOB} fill="none" stroke="none" />
            <motion.rect x={CX - 3} y={FY - KNOB + 11} width="6" height="17" rx="3" fill="#2fc0ff" filter={u("b3")} style={{ opacity: markGlow }} />
            <motion.rect x={CX - 1.4} y={FY - KNOB + 12} width="2.8" height="15" rx="1.4" style={{ fill: markI }} />
            <circle cx={CX} cy={FY + KNOB - 19} r="6.2" fill="none" stroke="#fff" strokeWidth="2.2" transform="translate(0 .8)" />
            <circle cx={CX} cy={FY + KNOB - 19} r="6.2" fill="none" stroke="#a6abb0" strokeWidth="1.8" />
          </motion.g>
        </svg>
      </button>
    </div>
  );
}
