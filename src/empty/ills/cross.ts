// Error cross: a thick cross standing on end. Hover and it shakes from side to side, throws off a few sparks and settles a little crooked.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const YAW = -0.42, KX = Math.cos(YAW) + Math.sin(YAW); // turned to face us; how far a wall facing +x looks at us
/** a profile in [x, z] standing in the plane y (facing +y), thickness T going back: the rim, then the front */
function slab(p: Pen, prof: P2[], y: number, T: number, front: number, kx = KX, top = 0.26, side = 0.065) {
  const n = prof.length;
  let a = 0;
  for (let i = 0; i < n; i++) { const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1, nx = ((z1 - z0) * sg) / L, nz = (-(x1 - x0) * sg) / L;
    if (nx * kx + nz <= 0.001) continue;
    p.face([[x0, y, z0], [x1, y, z1], [x1, y - T, z1], [x0, y - T, z0]], nz > 0.3 ? top : side, 0);
  }
  p.face(prof.map(([x, z]) => [x, y, z] as V3), front, SH.edge, 0.6);
}
const C = 15.5, A = 3.5, B = 13.6; // centre height, half width and half length of an arm
const X: P2[] = ([[-A, -B], [A, -B], [A, -A], [B, -A], [B, A], [A, A], [A, B], [-A, B], [-A, A], [-B, A], [-B, -A], [-A, -A]] as P2[]).map(([x, y]) => [(x - y) * 0.7071, C + (x + y) * 0.7071] as P2);

export const cross: Illustration = {
  k: "cross", name: "Error cross", title: "That did not work", body: "Something went wrong. Check the details and try again.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.7);
    const shake = Math.sin(k * Math.PI * 6) * 3 * (1 - k), lean = 0.16 * k * k + h * Math.sin(t * 2) * 0.02;
    p.translate(0, 0, -19);
    p.scale(1.22);
    p.shadow(0, 0, 20, 8, 0.12);
    p.rotate("z", YAW);
    p.translate(shake, 0, 0.6);
    p.rotate("y", lean, [8, 0, 0]);
    slab(p, X, 2.6, 5.2, 0.2);
    // sparks thrown off by the shake
    const s = cl((h - 0.15) / 0.6), f = Math.sin(s * Math.PI);
    if (f > 0.02) ([[-15, 30], [15, 31], [-18, 14], [18, 12]] as P2[]).forEach(([x, z], i) => {
      const d = 0.75 + 0.45 * s;
      p.dot([x * d, 2.6, C + (z - C) * d], (1 + (i % 2) * 0.3) * f, 1);
    });
  },
};
