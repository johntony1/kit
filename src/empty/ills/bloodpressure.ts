// No readings yet: a blood pressure monitor joined by a tube to its cuff. The cuff swells and lets go while a heart beats on the screen.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.8; // seconds per loop
/** a stroke through 3D points, flat to the screen: a tube, a rope, a needle */
function tube(p: Pen, pts: V3[], w: number, shade = 1) {
  const q = pts.map((v) => p.pt(v));
  p.screen((g) => {
    const n = Math.round(255 * shade);
    g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  });
}
/** a point on the monitor's top: u to the right and v up, as we see them */
const on = (cx: number, cy: number, z: number) => (u: number, v: number): V3 => [cx + (u - v) * 0.6, cy - (u + v) * 0.6, z];
const HEART: [number, number][] = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2;
  return [Math.pow(Math.sin(a), 3), (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16] as [number, number];
});

export const bloodpressure: Illustration = {
  k: "bloodpressure", name: "Blood pressure", title: "No readings yet", body: "Take a reading and add it here to watch the trend over time.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const sw = Math.pow(0.5 - 0.5 * Math.cos(u * Math.PI * 2), 1.4); // the cuff's swell
    const b = (c: number) => Math.exp(-Math.pow((((u * 2) % 1) - c) / 0.07, 2));
    const beat = b(0.15) + 0.6 * b(0.4);
    p.translate(1, 0, -7);
    p.shadow(-11, -5, 16, 9, 0.11); p.shadow(9, 2, 20, 11, 0.11);
    // the cuff: a wide band standing on its edge, hollow
    const r = 8 + 1.3 * sw, cx = -11, cy = -6;
    p.cylinder(cx, cy, 0, r, 11, { side: 0.13, top: 0.22, lw: 0.6 });
    p.disc(cx, cy, 11.03, r - 2.4 - 0.8 * sw, 0.02, SH.edge);
    for (const a of [0.2, 0.55]) p.line([[cx + Math.cos(a) * (r + 0.05), cy + Math.sin(a) * (r + 0.05), 0.6], [cx + Math.cos(a) * (r + 0.05), cy + Math.sin(a) * (r + 0.05), 10.6]], a < 0.3 ? 1 : 0.6, 0.5);
    // the tube from the cuff to the monitor
    tube(p, Array.from({ length: 13 }, (_, i) => { const q = i / 12; return [cx + r * 0.2 + q * 8, cy + r + 0.6 + 5 * Math.sin(q * Math.PI) * (1 - q * 0.4), 0.6 + (q > 0.8 ? (q - 0.8) * 12 : 0)] as V3; }), 1.5, 0.85);
    // the monitor: a low box with a dark screen and a button
    const X = 0, Yy = -7, Z = 7;
    p.box(X, Yy, 0, 19, 18, Z, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    const z = Z + 0.03;
    p.face([[X + 2, Yy + 2, z], [X + 12.4, Yy + 2, z], [X + 12.4, Yy + 16, z], [X + 2, Yy + 16, z]], 0.02, SH.edge, 0.5);
    p.disc(X + 15.6, Yy + 12.4, z, 1.7, 0.36, SH.edge);
    p.disc(X + 15.6, Yy + 5.6, z, 1.2, 0.1, SH.soft);
    // on the screen: a heart that beats, and two bars of a reading
    const f = on(X + 6.6, Yy + 6.6, z + 0.02), g = 2.5 + 0.7 * beat;
    p.face(HEART.map(([a, c]) => f(a * g, c * g)), 0.42, SH.edge, 0.5);
    const f2 = on(X + 8.4, Yy + 11.4, z + 0.02);
    const bar = (v: number, len: number) => p.face([f2(-3.2, v), f2(-3.2 + len, v), f2(-3.2 + len, v + 1.1), f2(-3.2, v + 1.1)], 0.3, 0);
    bar(0.2, 3.4 + 2.8 * sw); bar(-2.2, 2.4 + 1.5 * sw);
  },
};
