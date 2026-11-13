// Nothing to adjust: a brightness sun standing up, its centre half lit and its rays short. Hover and the rays stretch out with a little turn while the centre fills with light.
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
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const ZC = 17, T = 3, R = 7.5; // centre height, thickness, radius of the centre
const at = (pts: P2[], y = T / 2): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
/** a round ended ray along angle a, from radius r0 to r1 */
const ray = (a: number, r0: number, r1: number, w: number): P2[] => {
  const c = Math.cos(a), s = Math.sin(a), o: P2[] = [];
  const pt = (r: number, q: number) => o.push([c * r - s * q, ZC + s * r + c * q]);
  for (let i = 0; i <= 6; i++) { const b = -Math.PI / 2 + (i / 6) * Math.PI; pt(r1 + Math.cos(b) * w, Math.sin(b) * w); }
  for (let i = 0; i <= 6; i++) { const b = Math.PI / 2 + (i / 6) * Math.PI; pt(r0 + Math.cos(b) * w, Math.sin(b) * w); }
  return o;
};
/** a circle's arc from a0 to a1 closed through the centre (a full circle when the span is 2 pi) */
const sector = (r: number, a0: number, a1: number): P2[] => {
  const o: P2[] = [];
  for (let i = 0; i <= 32; i++) { const a = a0 + ((a1 - a0) * i) / 32; o.push([Math.cos(a) * r, ZC + Math.sin(a) * r]); }
  return o;
};

export const brightness: Illustration = {
  k: "brightness", name: "Brightness", title: "Nothing to adjust", body: "Settings you can change for this screen will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(cl(h / 0.6)), fill = ease(cl((h - 0.25) / 0.6));
    p.translate(0, 0, -ZC);
    p.shadow(0, 0, 24, 10, 0.11);
    p.rotate("z", -0.3);
    // eight rays, short at rest, stretching out and turning a little on hover
    const turn = k * 0.39 + h * Math.sin(t * 2) * 0.03;
    for (let i = 0; i < 8; i++) ext(p, at(ray(turn + (i * Math.PI) / 4, R + 3.6, R + 6.4 + 3.6 * k, 1.5)), [0, -T, 0], 0.28);
    // the centre: a disc, its left half lit, the lit part sweeping round to fill it
    ext(p, at(sector(R, 0, Math.PI * 2)), [0, -T, 0], 0.075);
    const a0 = Math.PI / 2, a1 = Math.PI * 1.5 + Math.PI * fill;
    p.face(at(sector(R - 1.3, a0, a1), T / 2 + 0.05), 0.3, 0);
    if (fill < 0.98) p.line([[0, T / 2 + 0.06, ZC - R + 1.3], [0, T / 2 + 0.06, ZC + R - 1.3]], SH.edge, 0.6);
  },
};
