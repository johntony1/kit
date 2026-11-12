// No vaccinations recorded: a syringe leaning with its needle up. Hover and the plunger pushes in, the dose drops and a few drops leave the needle.
import { type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a stroke through 3D points, flat to the screen: a tube, a rope, a needle */
function tube(p: Pen, pts: V3[], w: number, shade = 1) {
  const q = pts.map((v) => p.pt(v));
  p.screen((g) => {
    const n = Math.round(255 * shade);
    g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  });
}
const BZ = 10, BH = 19, R = 4.4; // where the barrel starts, its length and radius

export const vaccine: Illustration = {
  k: "vaccine", name: "Vaccine", title: "No vaccinations recorded", body: "Add a vaccination and its date, and your record will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(clamp(h * 1.15)), push = 8.5 * e;
    p.translate(-5.5, 5.5, -19);
    p.shadow(7, -7, 22, 9, 0.11);
    p.scale(1.02);
    p.rotate("z", -Math.PI / 4); // lean it across the picture, not toward us
    p.rotate("y", 0.5);
    // the plunger: a thumb plate and a rod
    p.cylinder(0, 0, push, 3.6, 1.3, { side: 0.12, top: 0.24 });
    p.cylinder(0, 0, 1.3 + push, 1.3, Math.max(0.1, BZ - 1.3 - push), { side: 0.2, top: 0.2, edge: 0.7 });
    // the finger flange and the glass barrel
    p.cylinder(0, 0, BZ, 6.2, 1.2, { side: 0.12, top: 0.22 });
    const b0 = BZ + 1.2, top = b0 + BH;
    p.cylinder(0, 0, b0, R, BH, { side: 0.09, top: 0.14, lw: 0.6 });
    // inside it: the rod, the stopper and the dose
    const sz = b0 + 1 + push;
    p.cylinder(0, 0, b0, 1.3, sz - b0, { side: 0.12, top: 0.12, edge: 0 });
    p.cylinder(0, 0, sz, R - 0.9, 1.8, { side: 0.16, top: 0.16, edge: 0.8, lw: 0.45 });
    p.cylinder(0, 0, sz + 1.8, R - 0.9, Math.max(0.2, top - 0.5 - sz - 1.8), { side: 0.36, top: 0.46, edge: 1, lw: 0.5 });
    // the scale on the barrel
    for (let i = 0; i < 6; i++) {
      const z = b0 + 2.6 + i * 2.5, w = i % 2 ? 0.34 : 0.6;
      p.line(Array.from({ length: 6 }, (_, j) => { const a = 0.95 - (w * j) / 5; return [Math.cos(a) * (R + 0.05), Math.sin(a) * (R + 0.05), z] as V3; }), 1, 0.45);
    }
    // the hub and the needle
    p.cylinder(0, 0, top, 2, 2.6, { side: 0.14, top: 0.24 });
    tube(p, [[0, 0, top + 2.6], [0, 0, top + 12]], 1.1);
    // drops off the tip while the plunger is in
    const k = clamp((h - 0.45) / 0.4);
    if (k > 0) for (let i = 0; i < 3; i++) {
      const q = (t * 0.9 + i / 3) % 1;
      p.dot([(i - 1) * 2.4 * q, (i === 1 ? 1 : -1) * 1.2 * q, top + 12.6 + 7 * q - 6 * q * q], 0.85 - 0.3 * q, k * (1 - q * 0.8));
    }
  },
};
