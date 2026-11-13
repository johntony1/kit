// Running cool: a desk fan on its round foot, the cage facing us. Its blades spin while the head sweeps gently from side to side.
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
const P = 3.2; // seconds per loop
const ZC = 27, RC = 14, T = 5; // cage centre height, cage radius, cage depth
const circ = (r: number, n = 40): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, ZC + Math.sin(a) * r] as P2; });
const at = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
/** a blade: a wide petal from the hub out along angle a */
const blade = (a: number): P2[] => Array.from({ length: 24 }, (_, i) => {
  const b = (i / 24) * Math.PI * 2, r = 7 + Math.cos(b) * 5.2, q = Math.sin(b) * 3.6 + Math.cos(b) * 0.8;
  return [Math.cos(a) * r - Math.sin(a) * q, ZC + Math.sin(a) * r + Math.cos(a) * q] as P2;
});

export const fan: Illustration = {
  k: "fan", name: "Fan", title: "Running cool", body: "Everything is running smoothly. Heavy tasks will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, yaw = -0.42 + 0.2 * Math.sin(u * Math.PI * 2);
    p.translate(0, 0, -21);
    p.shadow(0, 0, 20, 10, 0.12);
    p.rotate("z", yaw);
    // the foot and the stem
    p.cylinder(0, 0, 0, 9, 2.6, { side: 0.12, top: 0.2, edge: 0 });
    p.box(-1.3, -1.3, 2.6, 2.6, 2.6, ZC - RC - 1, { edge: 0 });
    p.cylinder(0, -1, ZC - RC - 1.6, 3, 2.2, { side: 0.12, top: 0.2, edge: 0 });
    // the cage: a drum, dark inside
    const y = T / 2;
    ext(p, at(circ(RC), y), [0, -T, 0], 0.035);
    // three blades turning, then the hub
    const spin = -u * Math.PI * 2 * 2;
    for (let i = 0; i < 3; i++) p.face(at(blade(spin + (i * Math.PI * 2) / 3), y + 0.04), 0.24, SH.edge, 0.55);
    p.face(at(circ(2.8, 24), y + 0.08), 0.34, SH.edge, 0.55);
    // the bright rim of the cage
    const o = at(circ(RC), y + 0.1), n = at(circ(RC - 1.6), y + 0.1).reverse();
    p.face([...o, o[0], n[n.length - 1], ...n], 0.3, 0);
  },
};
