// Salad bowl: a round bowl with three big leaves and half a tomato. Hover and the leaves toss.
import { type Illustration, type Pen, type V3 } from "../dots";

const R = 16, H = 10.5; // the bowl's rim radius and height
// a point in the plane that faces us: u to the right, v up
const F = (c: V3, u: number, v: number): V3 => [c[0] + u * 0.707, c[1] - u * 0.707, c[2] + v];

// a broad leaf growing from c, leaning by `lean`, with a vein cut down its middle
function leaf(p: Pen, c: V3, len: number, wid: number, lean: number, fill: number) {
  const n = 14, cs = Math.cos(lean), sn = Math.sin(lean), pts: V3[] = [];
  const at = (side: number, along: number) => F(c, side * cs + along * sn, -side * sn + along * cs);
  const w = (k: number) => wid * Math.pow(Math.sin(k * Math.PI), 0.7);
  for (let i = 0; i <= n; i++) pts.push(at(w(i / n), (i / n) * len));
  for (let i = n - 1; i > 0; i--) pts.push(at(-w(i / n), (i / n) * len));
  p.face(pts, fill, 0);
  p.line([...pts, pts[0]], 1, 0.8);
  p.line([at(0, len * 0.06), at(0, len * 0.84)], 1, 0.75);
}

export const salad: Illustration = {
  k: "salad", name: "Salad bowl", title: "No healthy picks yet", body: "Save the lighter dishes you like and they will be gathered here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 27, 12, 0.11);
    // the bowl: a foot, a round side, a lit rim and the dark inside
    p.cylinder(0, 0, 0, 6.5, 1.2, { side: 0.065, top: 0.1, edge: 0 });
    for (let i = 0; i <= 24; i++) { const k = i / 24; p.disc(0, 0, 1.2 + k * (H - 1.2), 6.5 + (R - 6.5) * Math.sqrt(1 - (1 - k) * (1 - k)), 0.14); }
    p.disc(0, 0, H, R, 0.2);
    p.disc(0, 0, H, R - 1.7, 0.04);
    // three big leaves, tossed on hover
    const up = (i: number) => h * (1.8 + 1.8 * Math.sin(t * 4.2 + i * 2.1));
    const sway = (i: number) => h * 0.07 * Math.sin(t * 4.2 + i * 2.1 + 1);
    const c: V3 = [0, 0, H - 3.5];
    leaf(p, F(c, 0.5, up(0)), 19, 6, 0.06 + sway(0), 0.11);
    leaf(p, F(c, -4.5, up(1)), 16.5, 5.6, -0.85 + sway(1), 0.2);
    leaf(p, F(c, 5, up(2)), 16, 5.4, 0.8 + sway(2), 0.2);
    // half a tomato in front, its cut face toward us
    const tc: V3 = [3.4, 3.4, H + 1.6 + up(3) * 0.5], r = 4.8;
    const ring = (k: number) => Array.from({ length: 29 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return F(tc, Math.cos(a) * r * k, Math.sin(a) * r * k); });
    p.face(ring(1), 0.3, 0);
    p.line(ring(1), 1, 0.9);
    p.line(ring(0.6), 1, 0.75);
    p.dot(tc, 0.9, 0);
  },
};
