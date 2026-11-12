// Lightning bolt: a thick bolt floating over the floor, It flickers on, throws sparks, glows for a while and fades back to dim, over and over.
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
const P = 2.8; // seconds per loop
const BOLT: P2[] = [[2.5, 34], [-9, 15.5], [-1.5, 15.5], [-4.5, 0], [9.5, 20.5], [2.5, 20.5], [8.5, 34]];

export const lightning: Illustration = {
  k: "lightning", name: "Lightning bolt", title: "No energy yet", body: "Usage will show here once there is power to measure.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P + 0.52) % 1;
    // dim, a short flash, a dip, then lit for a long while before it fades
    const lit = u < 0.12 ? 0 : u < 0.18 ? 1 : u < 0.24 ? 0.1 : u < 0.8 ? 1 : cl(1 - (u - 0.8) / 0.12);
    const on = lit > 0.3, bob = Math.sin(u * Math.PI * 2) * 1.2;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 18 - bob, 8, on ? 0.2 : 0.1);
    p.rotate("z", YAW);
    p.translate(0, 0, 2.5 + bob);
    slab(p, BOLT, 2.6, 5.2, on ? 0.34 : 0.075, KX, on ? 0.2 : 0.055, on ? 0.12 : 0.04);
    // sparks flying out from the bolt while it is lit
    if (u > 0.24) {
      const s = cl((u - 0.24) / 0.5), f = Math.sin(s * Math.PI);
      ([[-14, 27], [15, 30], [-15, 8], [16, 9], [-18, 18], [18, 20]] as P2[]).forEach(([x, z], i) => {
        const d = 0.7 + 0.5 * s;
        p.dot([x * d, 2.6, 17 + (z - 17) * d], (0.9 + (i % 2) * 0.35) * f, 1);
      });
    }
  },
};
