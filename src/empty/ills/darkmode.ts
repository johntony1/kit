// No theme set: a thick round token standing up, half light and half dark. Hover and the dark half turns over to the other side, and little stars come out on it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a flat outline pushed back by `off`: the visible walls, toned by where they point, then the face */
function ext(p: Pen, f: V3[], off: V3, front: number) {
  const n = f.length;
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < n; i++) { const a = f[i], b = f[(i + 1) % n]; nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]); }
  if (nx * off[0] + ny * off[1] + nz * off[2] > 0) f = f.slice().reverse();
  const g = f.map(([x, y, z]) => [x + off[0], y + off[1], z + off[2]] as V3);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = f[i], b = f[j], q: V3[] = [g[i], g[j], b, a];
    if (facing(p, q) <= 0) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const wx = dz * off[1] - dy * off[2], wy = dx * off[2] - dz * off[0], wz = dy * off[0] - dx * off[1];
    p.face(q, wz / (Math.hypot(wx, wy, wz) || 1) > 0.5 ? 0.2 : wy > wx ? 0.12 : 0.065, 0);
  }
  if (facing(p, f) > 0) p.face(f, front, 0);
}
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const popK = (b: number) => (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
/** a circle in the upright plane y, centred on (cx, cz) */
const circle = (cx: number, cz: number, r: number, y: number, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });
const T = 4.5, ZC = 16, R = 15;

export const darkmode: Illustration = {
  k: "darkmode", name: "Dark mode", title: "No theme set", body: "Pick light, dark or match your system, and the choice will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 24, 10, 0.11);
    p.rotate("z", -0.42);
    const y = T / 2 + 0.03;
    // a small foot so it stands
    p.box(-6, -4, 0, 12, 8, 1.6, { edge: 0 });
    ext(p, circle(0, ZC, R, T / 2, 48), [0, -T, 0], 0.26);
    // the dark side: a half disc on the right that turns over to the left
    const k = ease(Math.min(1, h / 0.7));
    const rot = k * Math.PI, r = R - 1.6, half: V3[] = [];
    for (let i = 0; i <= 30; i++) { const a = rot - Math.PI / 2 + (i / 30) * Math.PI; half.push([Math.cos(a) * r, y, ZC + Math.sin(a) * r]); }
    p.clear(half);
    p.line([...circle(0, ZC, r, y + 0.02, 48), [r, y + 0.02, ZC]], SH.edge, 0.7);
    // stars come out on the dark side
    const s = Math.max(0, (h - 0.55) / 0.45);
    if (s > 0) ([[0.55, 0.62, 1.2], [0.2, 0.3, 0.9], [0.62, 0.15, 0.8]] as [number, number, number][]).forEach(([fx, fz, rr], i) => {
      const a = rot + (fx - 0.5) * Math.PI * 0.7, d = r * (0.35 + fz * 0.9);
      p.dot([Math.cos(a) * d * 0.8, y + 0.04, ZC + Math.sin(a) * d * 0.8], rr * s * (0.85 + 0.15 * Math.sin(t * 3 + i * 2)), 1);
    });
  },
};
