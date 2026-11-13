// Nothing to move: a hand truck seen side on, a tall frame with a handle bent back at the top, a toe plate at the foot, a big wheel and one box on it. It tips back onto its wheel, rolls a little and sets back down.
import { type Illustration, type Pen, type V3 } from "../dots";

const facing = (p: Pen, q: V3[]) => {
  const s = q.map((v) => p.pt(v));
  let a = 0;
  for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; }
  return a;
};
const depth = (q: V3[]) => q.reduce((s, v) => s + v[0] + v[1] + v[2], 0) / q.length;
/** a slab: the outline B pushed along d. The sides it shows are shaded by where they face, then the cap */
function prism(p: Pen, B: V3[], d: V3, cap: number) {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < B.length; i++) {
    const a = B[i], b = B[(i + 1) % B.length];
    nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  if (nx * d[0] + ny * d[1] + nz * d[2] < 0) B = B.slice().reverse();
  const F = B.map(([x, y, z]) => [x + d[0], y + d[1], z + d[2]] as V3);
  const sides = B.map((b, i) => [b, B[(i + 1) % B.length], F[(i + 1) % B.length], F[i]] as V3[]).filter((q) => facing(p, q) > 0).sort((a, b) => depth(a) - depth(b));
  for (const q of sides) {
    const e = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]];
    const n = [e[1] * d[2] - e[2] * d[1], e[2] * d[0] - e[0] * d[2], e[0] * d[1] - e[1] * d[0]], l = Math.hypot(n[0], n[1], n[2]) || 1;
    p.face(q, n[2] / l > 0.55 ? 0.2 : n[1] > n[0] ? 0.12 : 0.065, 0);
  }
  if (facing(p, F) > 0) p.face(F, cap, 0);
}
const P = 3.4; // seconds per loop
const S = 0.82, W = 6.5; // x squeeze so the wheel stays round, half width of the truck
const WR = 7, AX = -3.6; // wheel radius, axle x
const RW = 2.6; // the rail's width
/** a thick stroke along a path of (x, z) points, as an outline in the plane y */
function stroke(path: [number, number][], w: number, y: number): V3[] {
  const l: V3[] = [], r: V3[] = [];
  path.forEach(([x, z], i) => {
    const [x0, z0] = path[Math.max(0, i - 1)], [x1, z1] = path[Math.min(path.length - 1, i + 1)];
    const d = Math.hypot(x1 - x0, z1 - z0) || 1, nx = -(z1 - z0) / d, nz = (x1 - x0) / d;
    l.push([x + nx * w / 2, y, z + nz * w / 2]); r.push([x - nx * w / 2, y, z - nz * w / 2]);
  });
  return [...l, ...r.reverse()];
}
const circ = (cx: number, cz: number, r: number, y: number, n = 36): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r * S, y, cz + Math.sin(a) * r] as V3; });

export const handtruck: Illustration = {
  k: "handtruck", name: "Hand truck", title: "Nothing to move", body: "Shipments waiting to go out will be lined up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const e = Math.pow(Math.sin(Math.PI * u), 2); // 0 at rest, 1 at the middle of the loop
    const tilt = 0.3 * e, roll = -3 * e;
    p.translate(0, 0, -22);
    p.shadow(2, 0, 24, 9, 0.12);
    p.rotate("z", -0.7); // turned so its side faces us
    p.translate(roll, 0, 0);
    // the frame, the toe plate and the box tip back round the axle
    p.push();
    p.rotate("y", -tilt, [AX, 0, WR]);
    // the rail: up from the toe plate, then bent back into the handle
    const path: [number, number][] = [[RW / 2, 1], [RW / 2, 38]];
    for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); path.push([RW / 2 - 4 + Math.cos(a) * 4, 38 + Math.sin(a) * 4]); }
    path.push([-8, 42]);
    // two rails, the far one first; a cross bar between them halfway up
    prism(p, stroke(path, RW, -W), [0, 1.6, 0], 0.2);
    p.box(-0.2, -W + 1.6, 20, 2.2, 2 * W - 3.2, 1.8, { top: 0.3, left: 0.14, right: 0.065, edge: 0 });
    prism(p, stroke(path, RW, W - 1.6), [0, 1.6, 0], 0.3);
    // the grip across the end of the handle
    p.box(-10, -W - 0.6, 40.7, 2.6, 2 * W + 1.2, 2.6, { top: 0.3, left: 0.14, right: 0.065, edge: 0 });
    // the toe plate along the floor
    p.box(-1, -W - 0.5, 0, 17, 2 * W + 1, 1.8, { top: 0.3, left: 0.22, right: 0.1, edge: 0 });
    // the box standing on it, leaning on the frame, tape across its top
    const bx = RW + 0.9, bw = 13, bh = 15, Z = 1.8 + bh;
    p.clear([[bx - 0.6, W, 1.8], [bx - 0.6, W, Z + 0.6], [bx + bw, W, Z + 0.6], [bx + bw, W, 1.8]]);
    p.box(bx, -W + 0.6, 1.8, bw, 2 * W - 1.2, bh, { top: 0.3, left: 0.13, right: 0.065, edge: 0 });
    p.line([[bx, 0, Z + 0.03], [bx + bw, 0, Z + 0.03]], 1, 0.9);
    p.line([[bx + bw / 2 - 2.4, W - 0.55, Z - 2.5], [bx + bw / 2 + 2.4, W - 0.55, Z - 2.5]], 1, 0.9);
    p.pop();
    // the near wheel: a thick tyre, a bright hub, spokes that turn as it rolls
    const y = W + 0.6, spin = roll / WR;
    p.clear(circ(AX, WR, WR + 1.2, y + 2.6));
    prism(p, circ(AX, WR, WR, y), [0, 2.5, 0], 0.13);
    const f = y + 2.55;
    p.face(circ(AX, WR, 4.4, f), 0.34, 0);
    for (let i = 0; i < 3; i++) {
      const a = spin + (i / 3) * Math.PI * 2;
      p.line([[AX + Math.cos(a) * 1.4 * S, f + 0.02, WR + Math.sin(a) * 1.4], [AX + Math.cos(a) * 4.2 * S, f + 0.02, WR + Math.sin(a) * 4.2]], 1, 0.8);
    }
    p.dot([AX, f + 0.04, WR], 1, 0);
  },
};
