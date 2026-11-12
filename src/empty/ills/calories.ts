// No calories logged: a whole apple with a leaf. Hover and a bite is taken out of its side, crumbs flying, while the leaf flutters.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const YAW = -0.42, C = 13.5, D = 4.2;
const dip = (a: number, c: number, w: number, k: number) => k * Math.exp(-Math.pow((a - c) / w, 2));
// the apple from the front, as [x, z], counter clockwise from the dimple at the top
const APPLE: P2[] = Array.from({ length: 56 }, (_, i) => {
  const a = (i / 56) * Math.PI * 2, r = 13 * (1 - dip(a, 0, 0.36, 0.32) - dip(a, Math.PI * 2, 0.36, 0.32) - dip(a, Math.PI, 0.4, 0.1));
  return [-Math.sin(a) * r * 1.06, C + Math.cos(a) * r] as P2;
});

/** a profile in [x, z] pushed through from y0 (back) to y1 (front); walls shaded by where they face */
function extrude(p: Pen, prof: P2[], y0: number, y1: number, front: number) {
  const n = prof.length, kx = Math.cos(YAW) + Math.sin(YAW);
  for (let i = 0; i < n; i++) {
    const [xa, za] = prof[i], [xb, zb] = prof[(i + 1) % n];
    const L = Math.hypot(xb - xa, zb - za) || 1, nx = (zb - za) / L, nz = -(xb - xa) / L;
    if (nx * kx + nz <= 0) continue;
    p.face([[xa, y0, za], [xb, y0, zb], [xb, y1, zb], [xa, y1, za]], nz > 0.3 ? 0.26 : 0.065, 0);
  }
  p.face(prof.map(([x, z]) => [x, y1, z] as V3), front, SH.edge, 0.7);
}

export const calories: Illustration = {
  k: "calories", name: "Calories", title: "No calories logged", body: "Add a meal or a snack to start counting your calories for the day.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(cl((h - 0.1) / 0.4));
    p.translate(0, 0, -15);
    p.shadow(0, 0, 21, 9, 0.12);
    p.rotate("z", YAW);
    // the bite: every point inside it is pushed back onto its edge
    const bx = 15.5, bz = C + 2, br = 7 * k;
    const prof = APPLE.map(([x, z]) => { const d = Math.hypot(x - bx, z - bz); return d < br && d > 0 ? [bx + ((x - bx) / d) * br, bz + ((z - bz) / d) * br] as P2 : [x, z] as P2; });
    extrude(p, prof, -D, D, 0.2);
    // a shine cut into the left cheek
    p.line(Array.from({ length: 9 }, (_, i) => { const a = 2.3 + i * 0.13; return [Math.cos(a) * 9, D + 0.03, C + 1 + Math.sin(a) * 9] as V3; }), SH.edge, 1.3);
    // the stem and the leaf, fluttering on hover
    const top = C + 13 * 0.68, w = h * Math.sin(t * 5) * 0.25;
    p.face([[-0.8, 0, top - 1.5], [0.8, 0, top - 1.5], [2.2, 0, top + 7.6], [0.6, 0, top + 7.8]], 0.3, SH.edge, 0.5);
    const leaf: V3[] = Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2, u = 5 + Math.cos(a) * 5, v = Math.sin(a) * 2.8 * Math.sin(Math.min(Math.PI, (u / 10) * Math.PI) * 0.5 + 0.6);
      const ca = Math.cos(0.5 + w), sa = Math.sin(0.5 + w);
      return [2.4 + u * ca - v * sa, 0, top + 5.4 + u * sa + v * ca] as V3;
    });
    p.face(leaf, 0.3, SH.edge, 0.6);
    // crumbs flying from the bite
    const f = cl((h - 0.2) / 0.6);
    if (f > 0 && f < 1) for (let i = 0; i < 5; i++) {
      const a = -0.5 + i * 0.42, d = 6 + 13 * ease(f) * (0.7 + (i % 2) * 0.3);
      p.dot([bx + Math.cos(a) * d, D, bz + Math.sin(a) * d - 9 * f * f], 0.9, 1 - f);
    }
  },
};
