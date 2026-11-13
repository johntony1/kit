// Click to get started: a big arrow pointer standing in the air. Over and over it jabs forward to click, and three little click marks burst from its tip.
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
const P = 2.8; // seconds per loop
/** the pointer's outline, tip at the origin, in [u, v] */
const ARROW: [number, number][] = [[0, 0], [0, -18], [4.3, -14], [7.3, -21], [10.4, -19.7], [7.5, -13], [13, -13]];

export const cursor: Illustration = {
  k: "cursor", name: "Cursor", title: "Click to get started", body: "Pick something to begin with and your work will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // a quick jab toward the tip and back, then rest
    const jab = u < 0.42 ? 0 : u < 0.5 ? Math.sin(((u - 0.42) / 0.08) * Math.PI / 2) : u < 0.68 ? Math.cos(((u - 0.5) / 0.18) * Math.PI / 2) : 0;
    const bob = Math.sin(u * Math.PI * 2) * 0.8;
    const s = 1.7;
    p.translate(0, 0, -16);
    p.shadow(2, 2, 18, 9, 0.12 + 0.03 * jab);
    p.rotate("z", -0.42);
    p.translate(-2.4 * jab, 0, bob - 2.6 * jab);
    const at = (a: number, b: number, y: number): V3 => [(a - 6.5) * s, y, 17 + (b + 10.5) * s];
    const B = ARROW.map(([a, b]) => at(a, b, -2.2));
    prism(p, B, [0, 4.4, 0], 0.3);
    const c = ARROW.map(([a, b]) => at(a, b, 2.23));
    p.line([...c, c[0]], 1, 0.7);
    // the click marks: three short bright strokes bursting out of the tip
    const k = u > 0.46 && u < 0.86 ? (u - 0.46) / 0.4 : 0;
    if (k > 0) {
      const [x, y] = p.pt(at(0, 0, 2.2));
      p.screen((g) => {
        const n = Math.round(255 * Math.min(1, (1 - k) * 2.2));
        g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 1.6; g.lineCap = "round";
        g.beginPath();
        for (const a of [Math.PI, Math.PI * 1.25, Math.PI * 1.5]) {
          const r0 = 2.6 + 3 * k, r1 = r0 + 3.2;
          g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
        }
        g.stroke();
      });
    }
  },
};
