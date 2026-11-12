// Nest egg: one large egg sitting in a nest of twigs. Hover and the egg lifts a little, a currency mark shows on its shell and it glints.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a surface of revolution about a vertical axis through (cx, cy); prof is [z, r] from the bottom up.
 *  Small quads, back to front, each in a face tone by its normal, then the outline */
function lathe(p: Pen, cx: number, cy: number, rough: [number, number][], gain = 1, nu = 32) {
  const prof: [number, number][] = [rough[0]];
  for (let j = 1; j < rough.length; j++) {
    const [z0, r0] = rough[j - 1], [z1, r1] = rough[j], n = Math.ceil(Math.hypot(z1 - z0, r1 - r0) / 1.3);
    for (let s = 1; s <= n; s++) prof.push([z0 + ((z1 - z0) * s) / n, r0 + ((r1 - r0) * s) / n]);
  }
  const P = (a: number, z: number, r: number): V3 => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z];
  const A = (i: number) => (i / nu) * Math.PI * 2;
  const quads: { d: number; pts: V3[]; f: number }[] = [], see: boolean[][] = [];
  for (let j = 0; j < prof.length - 1; j++) {
    const [z0, r0] = prof[j], [z1, r1] = prof[j + 1];
    const L = Math.hypot(z1 - z0, r1 - r0) || 1, nz = (r0 - r1) / L, nr = (z1 - z0) / L;
    see.push([]);
    for (let i = 0; i < nu; i++) {
      const am = A(i + 0.5), nx = Math.cos(am) * nr, ny = Math.sin(am) * nr, v = nx + ny + nz > 0;
      see[j].push(v);
      if (!v) continue;
      quads.push({
        d: (Math.cos(am) + Math.sin(am)) * (r0 + r1) / 2 + (z0 + z1) / 2,
        pts: [P(A(i) - 0.03, z0 - 0.08, r0), P(A(i + 1) + 0.03, z0 - 0.08, r0), P(A(i + 1) + 0.03, z1 + 0.08, r1), P(A(i) - 0.03, z1 + 0.08, r1)],
        f: Math.max(0.052, (nz > 0.6 ? SH.top : ny >= nx ? 0.13 : SH.right) * gain),
      });
    }
  }
  quads.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));
  for (let j = 0; j < see.length; j++) for (let i = 0; i < nu; i++) {
    if (!see[j][i]) continue;
    const [z0, r0] = prof[j], [z1, r1] = prof[j + 1];
    if (!see[j][(i + 1) % nu]) p.line([P(A(i + 1), z0, r0), P(A(i + 1), z1, r1)], SH.edge, 0.55);
    if (!see[j][(i + nu - 1) % nu]) p.line([P(A(i), z0, r0), P(A(i), z1, r1)], SH.edge, 0.55);
    if (j === see.length - 1 || !see[j + 1][i]) p.line([P(A(i), z1, r1), P(A(i + 1), z1, r1)], SH.edge, 0.55);
    if (j === 0 || !see[j - 1][i]) p.line([P(A(i), z0, r0), P(A(i + 1), z0, r0)], SH.edge, 0.55);
  }
}
/** a point on the plane that faces us through c: u to the right, v up */
const bb = (c: V3, u: number, v: number): V3 => [c[0] + u * 0.7071 - v * 0.4082, c[1] - u * 0.7071 - v * 0.4082, c[2] + v * 0.8165];
const NEST: [number, number][] = [[0, 10], [1.6, 13], [5, 14.6], [8.4, 14], [10, 12.6]];
const RIN = 9.4, ZT = 10; // the hollow: its radius and the height of the rim
const EZ = 14.6; // the egg's middle
const EGG: [number, number][] = Array.from({ length: 19 }, (_, i) => { const a = -Math.PI / 2 + (i / 18) * Math.PI, s = Math.sin(a); return [EZ + s * (s > 0 ? 11.4 : 8.6), Math.max(0.05, Math.cos(a) * 7.8 * (s > 0 ? 1 - 0.1 * s : 1))] as [number, number]; });
const MARK: [number, number][] = [[2.4, 2.5], [1.3, 3.6], [-1.3, 3.6], [-2.4, 2.5], [-2.4, 1.1], [-1.3, 0.1], [1.3, -0.1], [2.4, -1.1], [2.4, -2.5], [1.3, -3.6], [-1.3, -3.6], [-2.4, -2.5]];
const arc = (r: number, z: number, a0: number, a1: number): V3[] => Array.from({ length: 13 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 12; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
/** the nest's radius at a height on its outer wall */
const wall = (z: number) => { for (let i = 1; i < NEST.length; i++) if (z <= NEST[i][0]) { const [z0, r0] = NEST[i - 1], [z1, r1] = NEST[i]; return r0 + ((r1 - r0) * (z - z0)) / (z1 - z0); } return 12.6; };

export const pension: Illustration = {
  k: "pension", name: "Nest egg", title: "No pension linked", body: "Link a pension and you can watch your nest egg grow from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(clamp(h / 0.6));
    p.translate(0, 0, -13);
    p.scale(1.12);
    p.shadow(0, 0, 24, 12, 0.12);
    // twigs poking out behind the nest
    const twig = (a: number, r0: number, z0: number, len: number, rise: number) => {
      const c = Math.cos(a), s = Math.sin(a), w = 0.45;
      p.face([[c * r0 - s * w, s * r0 + c * w, z0], [c * (r0 + len), s * (r0 + len), z0 + rise], [c * r0 + s * w, s * r0 - c * w, z0]], 0.2, 0);
    };
    for (const [a, len, rise] of [[3.5, 5, 4], [4.3, 4.4, 5.5], [5, 5, 3.6], [2.6, 4.6, 2.4], [5.8, 4.6, 2.6]]) twig(a, 12, 8.6, len, rise);
    // the nest: a woven wall, a rim and the dark hollow
    lathe(p, 0, 0, NEST, 1, 76);
    p.disc(0, 0, ZT, 12.6, 0.2, 0);
    p.disc(0, 0, ZT + 0.02, RIN, 0.03, 0);
    // the weave: broken bands round the wall, strokes across the rim
    for (let i = 0; i < 16; i++) {
      const z = 1.4 + ((i * 5) % 8) * 1.05, a0 = -0.7 + ((i * 0.83) % 3.1);
      p.line(arc(wall(z) + 0.05, z, a0, a0 + 0.5 + ((i * 7) % 5) * 0.12).map(([x, y, zz], j) => [x, y, zz + j * 0.07 * (i % 2 ? 1 : -1)] as V3), SH.edge, 0.55);
    }
    for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2 + 0.1; p.line([[Math.cos(a) * (RIN + 0.3), Math.sin(a) * (RIN + 0.3), ZT + 0.04], [Math.cos(a + 0.22) * 12.4, Math.sin(a + 0.22) * 12.4, ZT + 0.04]], SH.edge, 0.45); }
    // the egg
    const up = 3.2 * e + (h > 0.9 ? Math.sin(t * 2.2) * 0.4 : 0);
    lathe(p, 0, 0, EGG.map(([z, r]) => [z + up, r] as [number, number]));
    // the mark on its shell, written in on hover
    const k = clamp((h - 0.3) / 0.45), C: V3 = [0, 0, EZ + up + 0.6];
    if (k > 0) {
      const n = Math.max(2, Math.round(MARK.length * Math.min(1, k * 1.3)));
      p.line(MARK.slice(0, n).map(([a, b]) => bb(C, a, b)), SH.edge, 1.1);
      if (k > 0.75) p.line([bb(C, 0, 4.8), bb(C, 0, -4.8)], SH.edge, 0.8);
    }
    // glints around it
    const g = clamp((h - 0.7) / 0.3);
    if (g > 0) ([[-9.5, 8], [9, 10.5], [10.5, -1]] as [number, number][]).forEach(([a, b], i) => p.dot(bb(C, a, b), (0.75 + 0.3 * Math.sin(t * 3.2 + i * 2.1)) * g, 1));
  },
};
