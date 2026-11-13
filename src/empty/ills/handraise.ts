// No questions yet: a raised open hand with its sleeve, palm toward you. It waves from side to side, over and over.
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
/** a rounded rectangle in the upright plane y, centred on (cx, cz): half sizes a, b, corner radius r */
const rrect = (cx: number, cz: number, a: number, b: number, r: number, y: number): V3[] => {
  const out: V3[] = [];
  const cs: [number, number, number][] = [[a - r, b - r, 0], [-(a - r), b - r, 0.5], [-(a - r), -(b - r), 1], [a - r, -(b - r), 1.5]];
  for (const [x, z, q] of cs) for (let i = 0; i <= 5; i++) { const t = (q + i / 10) * Math.PI; out.push([cx + x + Math.cos(t) * r, y, cz + z + Math.sin(t) * r]); }
  return out;
};
const P = 2.6; // seconds per loop
const T = 3.4; // thickness of the hand

export const handraise: Illustration = {
  k: "handraise", name: "Raise hand", title: "No questions yet", body: "When someone raises a hand to ask something, it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, a = 0.2 * Math.sin(u * Math.PI * 2);
    p.translate(0, 0, -19);
    p.scale(1.18);
    p.shadow(0, 1, 18, 9, 0.12);
    p.rotate("z", -0.42);
    // the sleeve: a dense cuff the hand rises out of
    prism(p, rrect(0, 3.2, 8, 3.4, 1.4, -T / 2 - 0.6), [0, T + 1.2, 0], 0.12);
    p.push();
    p.rotate("y", a, [0, 0, 6]);
    const y = -T / 2, d: V3 = [0, T, 0];
    // the wrist, the thumb, the palm, then the four fingers
    prism(p, rrect(0, 9, 5.4, 3.4, 1, y), d, 0.26);
    const th = rrect(0, 0, 2.1, 6, 2, y).map(([x, , z]) => { const c = Math.cos(0.75), s = Math.sin(0.75); return [-8 + x * c - z * s, y, 15 + x * s + z * c] as V3; });
    prism(p, th, d, 0.26);
    prism(p, rrect(0, 16.5, 7.4, 6.5, 2.6, y), d, 0.26);
    const F: [number, number, number][] = [[-5.6, 1.5, 31], [-1.85, 1.55, 33.8], [1.9, 1.55, 32.8], [5.6, 1.4, 29.6]];
    for (const [cx, w, top] of F) {
      prism(p, rrect(cx, (19 + top) / 2, w, (top - 19) / 2, w, y), d, 0.26);
      // each finger outlined, so the four stay apart
      const o = rrect(cx, (19 + top) / 2, w, (top - 19) / 2, w, T / 2 + 0.03).filter(([, , z]) => z > 21.5);
      p.line(o, 1, 0.6);
    }
    p.pop();
  },
};
