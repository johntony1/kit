// No steps yet: a wooden step ladder with wide treads. Hover and a ball hops up it one step at a time and lands on the top.
import { type Illustration, type Pen, type V3 } from "../dots";

const HT = 30; // height of the top
const clamp = (x: number) => Math.max(0, Math.min(1, x));
// the front frame leans back: its y at height z
const fy = (z: number) => 7 - (z / HT) * 6;
const STEPS = [7.5, 15, 22.5];

/** a slanted rail of width w from (x, y0) on the floor to (x, y1) at height z1 */
function rail(p: Pen, x: number, y0: number, y1: number, z1: number, w: number, lit: number, dim: number) {
  p.face([[x, y0 + w, 0], [x + w, y0 + w, 0], [x + w, y1 + w, z1], [x, y1 + w, z1]], lit, 0);
  p.face([[x + w, y0, 0], [x + w, y0 + w, 0], [x + w, y1 + w, z1], [x + w, y1, z1]], dim, 0);
}

export const ladder: Illustration = {
  k: "ladder", name: "Ladder", title: "No steps yet", body: "Add the first step and the rest will follow from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, -2, 22, 10, 0.12);
    p.rotate("z", -0.5);
    // the back legs, leaning forward to meet the top
    for (const x of [-8, 6]) rail(p, x, -13, -3, HT, 2, 0.12, 0.05);
    // the front frame: the far rail, the treads, the near rail
    rail(p, -8.4, 5, 1, HT, 2.2, 0.24, 0.09);
    for (const z of STEPS) p.box(-7, fy(z) - 3.6, z - 1.6, 14, 4.6, 1.8, { top: 0.3, left: 0.14, right: 0.065, edge: 0 });
    rail(p, 6.4, 5, 1, HT, 2.2, 0.24, 0.09);
    // the top: a wide lid over both frames
    p.box(-9, -5, HT, 18, 8, 2.2, { top: 0.3, left: 0.14, right: 0.065, edge: 0 });
    // the ball: waits on the floor, then hops up a step at a time
    const stops: V3[] = [[0, 12, 0], ...STEPS.map((z) => [0, fy(z) - 1.3, z + 0.2] as V3), [0, -1, HT + 2.2]];
    const k = clamp(h * 1.15) * 4, i = Math.min(3, Math.floor(k)), f = k - i;
    const a = stops[i], b = stops[Math.min(4, i + 1)];
    const at: V3 = [0, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f + Math.sin(Math.PI * f) * 6];
    const squash = h > 0.02 && f < 0.15 ? 1 - 0.18 * Math.sin((f / 0.15) * Math.PI) : 1;
    const r = 3;
    const [x, y] = p.pt([at[0], at[1], at[2] + r * squash]);
    p.screen((g) => {
      g.fillStyle = "#000"; g.beginPath(); g.ellipse(x, y, r + 0.9, r * squash + 0.9, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x, y, r, r * squash, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#000"; g.lineWidth = 0.7; g.beginPath(); g.arc(x, y, r * 0.55, 3.5, 4.7); g.stroke();
    });
    void t;
  },
};
