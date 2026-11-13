// Unlock to continue: a phone standing up, a big padlock on its lit screen. Hover and the shackle pops up and swings open, and the phone lifts a little.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const YAW = -0.42, KX = Math.cos(YAW) + Math.sin(YAW);
function slab(p: Pen, prof: P2[], y: number, T: number, front: number) {
  const n = prof.length;
  let a = 0;
  for (let i = 0; i < n; i++) { const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1, nx = ((z1 - z0) * sg) / L, nz = (-(x1 - x0) * sg) / L;
    if (nx * KX + nz <= 0.001) continue;
    p.face([[x0, y, z0], [x1, y, z1], [x1, y - T, z1], [x0, y - T, z0]], nz > 0.3 ? 0.24 : 0.065, 0);
  }
  p.face(prof.map(([x, z]) => [x, y, z] as V3), front, SH.edge, 0.6);
}
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 5): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI * 0.5]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
const W = 10, H = 34, Z0 = 1.5;
const back = (x: number) => { const v = cl(x); return 1 + 2.4 * Math.pow(v - 1, 3) + 1.4 * Math.pow(v - 1, 2); };

export const lockscreen: Illustration = {
  k: "lockscreen", name: "Lock screen", title: "Unlock to continue", body: "Unlock with your passcode or face to pick up where you left off.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const lift = 2.5 * ease(h / 0.5) + h * Math.sin(t * 2.2) * 0.4;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 20 - lift, 8, 0.12);
    p.rotate("z", YAW);
    p.translate(0, 0, lift);
    slab(p, rr(-W, Z0, W, Z0 + H, 3), 1.3, 2.6, 0.12);
    const at = (y: number) => ([x, z]: P2): V3 => [x, y, z];
    p.clear(rr(-W + 1.3, Z0 + 1.3, W - 1.3, Z0 + H - 1.3, 2).map(at(1.32)));
    p.face(rr(-W + 1.8, Z0 + 1.8, W - 1.8, Z0 + H - 1.8, 1.7).map(at(1.34)), 0.26, 0);
    const y = 1.38;
    // the padlock: a dark body with a lit keyhole, and a bold shackle that springs open
    const bz = 14, bw = 5, bh = 7.5;
    p.clear(rr(-bw, bz, bw, bz + bh, 1.2, 3).map(at(y)));
    p.face(rr(-0.7, bz + 2, 0.7, bz + 4.6, 0.6, 2).map(at(y + 0.02)), 0.3, 0);
    const lift2 = 3.5 * back(h * 1.4), sw = Math.max(0, (h - 0.35) / 0.65);
    const N = 14, top = bz + bh + 3.2 + lift2, lx = 3.4;
    const pts: V3[] = [[lx, y, bz + bh - 0.2 + lift2], [lx, y, top]];
    for (let i = 1; i < N; i++) { const a = (Math.PI * i) / N; pts.push([Math.cos(a) * lx, y, top + Math.sin(a) * lx]); }
    pts.push([-lx, y, top], [-lx, y, bz + bh - 0.2]);
    p.push();
    p.rotate("z", -sw * 0.9, [-lx, y, 0]);
    p.line(pts, SH.edge, 1.8);
    p.pop();
    // the bar to swipe at the foot of the screen
    p.face(rr(-3.5, Z0 + 3.6, 3.5, Z0 + 4.6, 0.45, 2).map(at(y)), 0.02, 0);
  },
};
