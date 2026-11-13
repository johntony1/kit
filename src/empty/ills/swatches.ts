// No colours saved: a big fan deck of colour swatch strips, pinned at the foot and fanned out wide, each strip a different shade cut into chips. Hover and the deck fans a little wider.
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
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const S = 0.82, L = 36, A = 4.4, T = 1.6, Z0 = 4; // x squeeze, strip length, half width, thickness, pin height
const TONES = [0.065, 0.3, 0.12, 0.3, 0.09, 0.3];
/** a point on a strip turned by th round the pin: u across it, v along it */
const at = (th: number, u: number, v: number, y: number): V3 => [(u * Math.cos(th) + v * Math.sin(th)) * S, y, Z0 + v * Math.cos(th) - u * Math.sin(th)];
/** a strip's outline turned by th round the pin: a rounded rectangle from below the pin up to its tip, grown by g */
const strip = (th: number, y: number, g = 0): V3[] => {
  const r = 2.2 + g, a = A + g, v0 = -4 - g, v1 = L + g, out: V3[] = [];
  const cs: [number, number, number][] = [[a - r, v1 - r, 0], [-(a - r), v1 - r, 0.5], [-(a - r), v0 + r, 1], [a - r, v0 + r, 1.5]];
  for (const [u, v, q] of cs) for (let i = 0; i <= 5; i++) { const t = (q + i / 10) * Math.PI; out.push(at(th, u + Math.cos(t) * r, v + Math.sin(t) * r, y)); }
  return out;
};

export const swatches: Illustration = {
  k: "swatches", name: "Swatches", title: "No colours saved", body: "Save a colour you like and it will be kept here, ready to use.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -20);
    p.shadow(0, 0, 22, 8, 0.12);
    p.rotate("z", -0.7);
    const n = TONES.length;
    // back strip first, each one a step nearer, fanned from the left
    TONES.forEach((tone, i) => {
      const k = ease(Math.min(1, Math.max(0, h * 1.4 - (n - 1 - i) * 0.07)));
      const spread = 0.29 + 0.05 * k + h * Math.sin(t * 2.2) * 0.006;
      const th = (i - (n - 1) / 2) * spread, y = -n + i * 1;
      p.clear(strip(th, y + T + 0.02, 1.1));
      prism(p, strip(th, y), [0, T, 0], tone);
      // the chips: cuts across the strip
      const f = y + T + 0.05;
      for (const v of [L * 0.36, L * 0.6, L * 0.82]) p.line([at(th, -A, v, f), at(th, A, v, f)], 1, 1);
    });
    // the pin through them all
    const f = 1.5;
    p.face(Array.from({ length: 20 }, (_, j) => { const a = (j / 20) * Math.PI * 2; return [Math.cos(a) * 2.2 * S, f, Z0 + Math.sin(a) * 2.2] as V3; }), 0.5, 0);
    p.dot([0, f + 0.1, Z0], 0.8, 0);
  },
};
