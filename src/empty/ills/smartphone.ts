// Smartphone: a phone standing upright, its screen dark. Hover and it lifts a little while a grid of apps pops onto the screen.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
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
const W = 9.6, H = 33, Z0 = 1.5; // half width, height, gap under it

export const smartphone: Illustration = {
  k: "smartphone", name: "Smartphone", title: "No phone linked", body: "Link your phone to get codes and alerts on it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const lift = 3 * ease(cl(h / 0.5)) + h * Math.sin(t * 2.2) * 0.6;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 20 - lift, 8, 0.12);
    p.rotate("z", YAW);
    p.translate(0, 0, lift);
    slab(p, rr(-W, Z0, W, Z0 + H, 2.8), 1.3, 2.6, 0.2);
    p.clear(rr(-W + 1.3, Z0 + 1.3, W - 1.3, Z0 + H - 1.3, 1.8).map(at(1.33)));
    p.face(rr(-W + 1.3, Z0 + 1.3, W - 1.3, Z0 + H - 1.3, 1.8).map(at(1.34)), 0.04, 0); // a dim screen
    const f = at(1.36);
    // the speaker at the top and the home bar at the bottom
    p.face(rr(-2.3, Z0 + H - 3.9, 2.3, Z0 + H - 2.7, 0.55, 2).map(f), 0.2, 0);
    p.face(rr(-3, Z0 + 2.7, 3, Z0 + 3.6, 0.4, 2).map(f), 0.2, 0);
    // the apps: three across, four down, popping in from the top
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const i = r * 3 + c, a = ease(cl((h * 1.5 - 0.3 - i * 0.07) / 0.3));
      if (a < 0.05) continue;
      const cx = (c - 1) * 5.3, cz = Z0 + H - 8.6 - r * 5.6, s = 1.95 * a;
      p.face(rr(cx - s, cz - s, cx + s, cz + s, 0.6 * a, 2).map(f), i === 4 ? 0.9 : 0.32, 0);
    }
  },
};
