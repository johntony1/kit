// Monitor: a desktop display on its stand, the screen dark. A small bright block drifts around the screen and bounces off its edges, like a display with nothing to show.
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
const at = (y: number) => ([x, z]: P2): V3 => [x, y, z];
/** a rounded rectangle as [x, z] points, counter clockwise */
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 5): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI * 0.5]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
const P = 4; // seconds per loop
const tri = (x: number) => 1 - Math.abs(2 * (x - Math.floor(x)) - 1);

export const monitor: Illustration = {
  k: "monitor", name: "Monitor", title: "No displays found", body: "Connect a display and it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 26, 11, 0.12);
    p.rotate("z", YAW);
    // the foot and the neck, behind the panel
    p.box(-8.5, -6.5, 0, 17, 10, 1.3, { top: 0.22, left: 0.13, right: 0.065 });
    p.box(-2.4, -4.4, 1.3, 4.8, 2.2, 10, { top: 0.2, left: 0.1, right: 0.065 });
    // the panel and its dark screen
    slab(p, rr(-18, 9.5, 18, 33, 1.8), 0, 2.4, 0.2);
    p.clear(rr(-16.4, 11.1, 16.4, 31.4, 0.8, 2).map(at(0.03)));
    // the block: twice across and three times up and down each loop, with a faint trail
    const pos = (v: number): P2 => [-13.6 + 27.2 * tri(v * 2 + 0.2), 13.6 + 15.3 * tri(v * 3 + 0.65)];
    for (let i = 3; i >= 0; i--) {
      const [x, z] = pos(u - i * 0.012 + 1), s = 2.2 - i * 0.35;
      p.face(rr(x - s, z - s, x + s, z + s, 0.6, 2).map(at(0.06 + (3 - i) * 0.01)), i ? 0.04 : 0.9, 0);
    }
    p.face(rr(-1.2, 9.9, 1.2, 10.5, 0.25, 2).map(at(0.04)), cl(Math.sin(u * Math.PI * 4) * 4) > 0.5 ? 0.9 : 0.04, 0);
  },
};
