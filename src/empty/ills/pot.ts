// Savings pots: three round pots in a row, each with its own mark, a plus, a heart and a star. Hover and a coin drops into each pot in turn.
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
        f: Math.min(0.26, Math.max(0.052, (nz > 0.6 ? SH.top : ny >= nx ? 0.13 : SH.right) * gain)),
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
/** a heart outline in [u, v], about 2 wide, centred */
const HEART: [number, number][] = Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [Math.pow(Math.sin(a), 3), (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16 + 0.1] as [number, number]; });
const STAR: [number, number][] = Array.from({ length: 11 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? 0.45 : 1.1; return [Math.cos(a) * q, Math.sin(a) * q] as [number, number]; });
const PLUS: [number, number][][] = [[[-1, 0], [1, 0]], [[0, -1], [0, 1]]];
const K = 10.2;
const POTS: { x: number; y: number; r: number; h: number; mark: [number, number][][] }[] = [
  { x: -K, y: K, r: 6.2, h: 11, mark: PLUS },
  { x: 0, y: 0, r: 7.2, h: 16, mark: [[...HEART, HEART[0]]] },
  { x: K, y: -K, r: 6.2, h: 13, mark: [STAR] },
];

export const pot: Illustration = {
  k: "pot", name: "Savings pots", title: "No pots yet", body: "Create a pot for something you are saving towards and put money aside in it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -9);
    p.scale(1.06);
    for (const q of POTS) p.shadow(q.x, q.y, q.r * 1.9, q.r, 0.1);
    POTS.forEach((q, i) => {
      const { x, y, r, h: H } = q, rn = r * 0.8;
      // the pot: a round belly, a shoulder and a lip around a dark mouth
      lathe(p, x, y, [[0, r * 0.76], [1.2, r * 0.95], [H * 0.55, r], [H - 2.8, rn - 0.9], [H - 1.5, rn - 0.9], [H - 1.5, rn], [H, rn]], 1.5);
      p.disc(x, y, H, rn, 0.2, 0);
      p.disc(x, y, H + 0.02, rn - 1.3, 0.03, 0);
      // its mark, on the front of the belly
      const s = r * 0.36, zc = H * 0.42;
      for (const stroke of q.mark) p.line(stroke.map(([a, b]) => [x + (r + 0.1) * 0.7071 + a * s * 0.7071, y + (r + 0.1) * 0.7071 - a * s * 0.7071, zc + b * s * 1.15] as V3), SH.edge, 0.95);
      // a coin dropping in, then lying in the mouth
      const k = clamp((h - 0.05 - i * 0.24) / 0.36);
      if (k > 0) {
        const z = H - 0.9 + 22 * (1 - k * k), a = Math.min(1, k * 3), cr = rn - 2.4;
        p.cylinder(x, y, z, cr, 1.2, { side: 0.14 * a, top: 0.3 * a, edge: a });
        if (cr > 2.4) p.disc(x, y, z + 1.22, cr - 1.2, 0, a);
      }
    });
  },
};
