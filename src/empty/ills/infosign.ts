// Info sign: a round sign on a short post with a bright letter i in its dark window. Hover and the sign rocks on its post while the dot of the i jumps and lands.
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
const circle = (cx: number, cz: number, r: number, n = 40): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r] as P2; });
const at = (y: number) => ([x, z]: P2): V3 => [x, y, z];
/** a rounded rectangle as [x, z] points, counter clockwise */
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 5): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI * 0.5]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
const C = 22.5, R = 12.6; // the sign's centre height and radius

export const infosign: Illustration = {
  k: "infosign", name: "Info sign", title: "No details yet", body: "Details will appear here once there is something to show.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.85);
    const rock = 0.3 * Math.sin(k * Math.PI * 3) * (1 - k) + h * Math.sin(t * 2) * 0.03;
    const jump = Math.abs(Math.sin(k * Math.PI * 2)) * 4 * (1 - k * 0.7) * (1 - k) * 2;
    p.translate(0, 0, -18);
    p.shadow(0, 0, 22, 9, 0.12);
    p.rotate("z", YAW);
    // the foot and the post
    p.cylinder(0, 0, 0, 7, 1.6, { side: 0.12, top: 0.22 });
    p.cylinder(0, 0, 1.6, 1.5, 9.4, { side: 0.12, top: 0.2, edge: 0 });
    // the sign
    p.rotate("y", rock, [0, 0, 6]);
    slab(p, circle(0, C, R), 1.7, 3.4, 0.2);
    p.clear(circle(0, C, R - 2.9).map(at(1.73)));
    p.face(rr(-1.7, C - 6.6, 1.7, C + 1.7, 0.7, 3).map(at(1.76)), 0.9, 0);
    p.face(circle(0, C + 5.3 + Math.min(jump, 2.2), 1.95, 20).map(at(1.76)), 0.9, 0);
  },
};
