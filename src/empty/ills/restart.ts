// Restart to finish: a thick circular arrow standing up. It winds once round clockwise, settles, and goes again.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a flat outline pushed back by `off`: the visible walls (toned by where they point), then the face */
function ext(p: Pen, f: V3[], off: V3, front: number, edge = SH.edge) {
  const n = f.length;
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < n; i++) { const a = f[i], b = f[(i + 1) % n]; nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]); }
  if (nx * off[0] + ny * off[1] + nz * off[2] > 0) f = f.slice().reverse();
  const g = f.map(([x, y, z]) => [x + off[0], y + off[1], z + off[2]] as V3);
  const back = g.slice().reverse();
  if (facing(p, back) > 0) p.face(back, front * 0.5, 0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = f[i], b = f[j], q: V3[] = [g[i], g[j], b, a];
    if (facing(p, q) <= 0) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const wx = dz * off[1] - dy * off[2], wy = dx * off[2] - dz * off[0], wz = dy * off[0] - dx * off[1];
    p.face(q, wz / (Math.hypot(wx, wy, wz) || 1) > 0.5 ? 0.22 : wy > wx ? 0.12 : 0.065, 0);
  }
  if (facing(p, f) > 0) p.face(f, front, edge, 0.6);
}
const P = 2.8; // seconds per loop
const ZC = 16, T = 5, R1 = 13.5, R0 = 8.3; // centre height, thickness, outer and inner radius
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** the arrow's outline turned by `rot`: an arc running clockwise from the top left round to the left, then its head */
function arrow(rot: number): V3[] {
  const a0 = 2.0 + rot, a1 = a0 - 5.0, pts: [number, number][] = [];
  const pol = (r: number, a: number) => pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  for (let i = 0; i <= 30; i++) pol(R1, a0 + ((a1 - a0) * i) / 30);
  pol(R1 + 3.4, a1);
  pol((R0 + R1) / 2, a1 - 0.62);
  pol(R0 - 3.4, a1);
  for (let i = 30; i >= 0; i--) pol(R0, a0 + ((a1 - a0) * i) / 30);
  return pts.map(([u, v]) => [u, T / 2, ZC + v] as V3);
}

export const restart: Illustration = {
  k: "restart", name: "Restart", title: "Restart to finish", body: "Restart the app to finish installing the update.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -ZC);
    p.shadow(0, 0, 22, 10, 0.11);
    p.rotate("z", -0.42);
    ext(p, arrow(-Math.PI * 2 * inOut(Math.min(1, u / 0.7))), [0, -T, 0], 0.26);
    // the hub: a small bright dot at the centre
    p.dot([0, T / 2, ZC], 1.6, SH.glow);
  },
};
