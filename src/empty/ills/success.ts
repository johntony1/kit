// All done: a thick medallion with a tick on it. Hover and it hops with a little twist while confetti bursts out around it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const C = 16, R = 14; // the medallion's centre height and radius
const circle = (r: number, n = 44): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, C + Math.sin(a) * r] as P2; });
const TICK: P2[] = [[-4.9, 0.6], [-1.8, -2.7], [5.4, 5.6], [7.6, 3.6], [-1.8, -6.9], [-7.1, -1.6]];

/** a profile in [x, z] pushed through from y0 (back) to y1 (front); walls shaded by where they face */
function extrude(p: Pen, prof: P2[], y0: number, y1: number, front: number, yaw: number) {
  const n = prof.length, kx = Math.cos(yaw) + Math.sin(yaw);
  for (let i = 0; i < n; i++) {
    const [xa, za] = prof[i], [xb, zb] = prof[(i + 1) % n];
    const L = Math.hypot(xb - xa, zb - za) || 1, nx = (zb - za) / L, nz = -(xb - xa) / L;
    if (nx * kx + nz <= 0) continue;
    p.face([[xa, y0, za], [xb, y0, zb], [xb, y1, zb], [xa, y1, za]], nz > 0.3 ? 0.26 : 0.065, 0);
  }
  p.face(prof.map(([x, z]) => [x, y1, z] as V3), front, SH.edge, 0.7);
}

export const success: Illustration = {
  k: "success", name: "All done", title: "All done", body: "Everything is taken care of. There is nothing left to do here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.6), hop = Math.sin(k * Math.PI) * 6 + h * Math.sin(t * 2.2) * 0.6;
    const yaw = -0.42 + 0.3 * Math.sin(k * Math.PI * 2) * (1 - k);
    p.translate(0, 0, -17);
    p.shadow(0, 0, 21 - hop * 0.5, 8, 0.12);
    p.rotate("z", yaw);
    // confetti behind and around, thrown out from the middle
    const b = ease(cl((h - 0.15) / 0.7));
    if (b > 0) for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3, d = R * 0.6 + (10 + (i % 3) * 3.2) * b;
      p.dot([Math.cos(a) * d * 1.05, i % 2 ? -3 : 4, C + 3 + Math.sin(a) * d - 3 * b * b], (i % 3 ? 0.9 : 1.3) * (0.75 + 0.25 * Math.sin(t * 4 + i * 1.7)), Math.min(1, b * 1.6));
    }
    p.translate(0, 0, hop + 2);
    extrude(p, circle(R), -2.3, 2.3, 0.2, yaw);
    // the dark well and the bright tick in it
    p.clear(circle(R - 3.2).map(([x, z]) => [x, 2.33, z] as V3));
    const s = 1.12 + 0.12 * Math.sin(k * Math.PI);
    p.face(TICK.map(([x, z]) => [x * s, 2.36, C + 0.4 + z * s] as V3), 0.9, 0);
  },
};
