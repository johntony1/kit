// Sound is off: a big speaker symbol standing up, a cross beside its cone. Hover and the cross shrinks away while two sound waves grow out of the cone.
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
const back = (x: number) => (x <= 0 ? 0 : 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2));
const ZC = 15, T = 5; // the symbol's centre height, its thickness
const at = (pts: P2[]): V3[] => pts.map(([u, v]) => [u, T / 2, v] as V3);
/** a thick arc around (cx, ZC) */
const band = (cx: number, r: number, w: number, a: number, s: number): P2[] => {
  const o: P2[] = [];
  for (let i = 0; i <= 12; i++) { const b = -a + (2 * a * i) / 12; o.push([cx + Math.cos(b) * (r + w) * s, ZC + Math.sin(b) * (r + w) * s]); }
  for (let i = 12; i >= 0; i--) { const b = -a + (2 * a * i) / 12; o.push([cx + Math.cos(b) * (r - w) * s, ZC + Math.sin(b) * (r - w) * s]); }
  return o;
};
/** a bar through (cx, cz) at angle a, length l, width w, scaled by s */
const bar = (cx: number, cz: number, a: number, l: number, w: number, s: number): P2[] => {
  const c = Math.cos(a) * s, n = Math.sin(a) * s;
  return [[-l, -w], [l, -w], [l, w], [-l, w]].map(([u, v]) => [cx + u * c - v * n, cz + u * n + v * c] as P2);
};

export const volume: Illustration = {
  k: "volume", name: "Volume", title: "Sound is off", body: "Turn the sound on to hear alerts and playback here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -ZC);
    p.shadow(0, 0, 24, 10, 0.11);
    p.rotate("z", -0.42);
    p.translate(-1.5, 0, 0);
    // the speaker: a box and a flared cone, one piece
    const body: P2[] = [[-15, ZC - 5.5], [-7.5, ZC - 5.5], [1.5, ZC - 13], [1.5, ZC + 13], [-7.5, ZC + 5.5], [-15, ZC + 5.5]];
    ext(p, at(body), [0, -T, 0], 0.22);
    p.line([[-7.5, T / 2 + 0.03, ZC - 5.5], [-7.5, T / 2 + 0.03, ZC + 5.5]], SH.edge, 0.7);
    // the cross: off, shrinking away on hover
    const x = 1 - ease(cl(h / 0.35));
    if (x > 0.04) {
      ext(p, at(bar(9.5, ZC, 0.785, 5.2, 1.4, x)), [0, -T, 0], 0.3);
      ext(p, at(bar(9.5, ZC, -0.785, 5.2, 1.4, x)), [0, -T, 0], 0.3);
    }
    // two waves growing out of the cone, breathing a little while it plays
    const live = 1 + 0.04 * Math.sin(t * 7) * h;
    const w1 = back(cl((h - 0.3) / 0.35)) * live, w2 = back(cl((h - 0.5) / 0.4)) * live;
    if (w1 > 0.05) ext(p, at(band(1.5, 7.5, 1.5, 0.8, w1)), [0, -T, 0], 0.3);
    if (w2 > 0.05) ext(p, at(band(1.5, 13.5, 1.5, 0.8, w2)), [0, -T, 0], 0.3);
  },
};
