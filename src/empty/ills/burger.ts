// No food orders: a burger, stacked tight. Hover and it comes apart into its layers: bun, lettuce, cheese, patty, bun.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S = Math.SQRT1_2;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function lathe(p: Pen, prof: [number, number][], z0: number, f: [number, number, number] = [0.26, 0.17, 0.065], N = 48) {
  const strips: { d: number; pts: V3[]; f: number }[] = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const [zs, rs] = prof[i], [ze, re] = prof[i + 1];
    const L = Math.hypot(ze - zs, re - rs) || 1, nr = (ze - zs) / L, nz = -(re - rs) / L, M = Math.max(1, Math.ceil(L / 1.3));
    for (let m = 0; m < M; m++) {
      const za = zs + ((ze - zs) * m) / M, zb = zs + ((ze - zs) * (m + 1)) / M, ra = rs + ((re - rs) * m) / M, rb = rs + ((re - rs) * (m + 1)) / M;
      for (let j = 0; j < N; j++) {
        const a0 = (j / N) * Math.PI * 2 - 0.01, a1 = ((j + 1) / N) * Math.PI * 2 + 0.01, c = (a0 + a1) / 2;
        const nx = Math.cos(c) * nr, ny = Math.sin(c) * nr;
        if (nx + ny + nz <= 0.02) continue;
        const q = (a: number, r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z0 + z];
        strips.push({ d: ((Math.cos(c) + Math.sin(c)) * (ra + rb)) / 2 + (za + zb) / 2, pts: [q(a0, ra, za), q(a1, ra, za), q(a1, rb, zb), q(a0, rb, zb)], f: nz > 0.6 ? f[0] : ny > nx ? f[1] : f[2] });
      }
    }
  }
  strips.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.pts, s.f, 0));
}
const front = (r: number, z: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
function outline(p: Pen, prof: [number, number][], z0: number) {
  for (const s of [-1, 1]) p.line(prof.map(([z, r]) => [s * r * S, -s * r * S, z0 + z] as V3), SH.edge, 0.55);
}
const HEEL: [number, number][] = [[0, 9.6], [1.2, 11.2], [3.6, 11.2]];
const CROWN: [number, number][] = [[0, 10.6], [0.9, 11.5], [2.6, 11.5], [4.8, 10.3], [6.6, 8], [7.9, 4.8], [8.5, 0]];
// sesame seeds: [angle, how far up the crown's profile]
const SEEDS: [number, number][] = [[-0.1, 3.4], [0.75, 3.2], [1.6, 3.5], [0.3, 4.4], [1.2, 4.5], [0.78, 5.4], [-0.5, 4.5], [2.1, 4.6]];

export const burger: Illustration = {
  k: "burger", name: "Burger", title: "No food orders", body: "Order something to eat and you can follow it here until it reaches your door.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h), g = 3.3 * k + 0.25 * h * Math.sin(t * 2.4);
    p.translate(0, 0, -9 - 5.5 * k);
    p.shadow(0, 0, 25 - 3 * k, 12 - 1.5 * k, 0.11);
    // the heel of the bun
    lathe(p, HEEL, 0); outline(p, HEEL, 0);
    p.disc(0, 0, 3.6, 11.2, 0.22, 0);
    p.line(front(11.2, 3.6), SH.edge, 0.5);
    // the patty: dark, with a bright edge
    const zp = 3.6 + g;
    p.cylinder(0, 0, zp, 11.9, 2.6, { side: 0.04, top: 0.09, lw: 0.7 });
    // the cheese: a square slice, its corners hanging over
    const zc = zp + 2.6 + g;
    p.box(-10.3, -10.3, zc, 20.6, 20.6, 0.6, { top: 0.36, left: 0.34, right: 0.3, lw: 0.6 });
    // the lettuce: a frilled leaf
    const zl = zc + 0.6 + g;
    p.face(Array.from({ length: 72 }, (_, i) => { const a = (i / 72) * Math.PI * 2; return [Math.cos(a) * (12 + Math.sin(a * 11) * 0.9), Math.sin(a) * (12 + Math.sin(a * 11) * 0.9), zl + 0.5 + Math.sin(a * 11 + 1) * 0.5] as V3; }), 0.17, SH.edge, 0.6);
    // the crown, with its seeds
    const zb = zl + 1 + g;
    lathe(p, CROWN, zb); outline(p, CROWN, zb);
    p.line(front(11.5, zb + 0.9), SH.edge, 0.5);
    const rad = (z: number) => { for (let i = 0; i < CROWN.length - 1; i++) { const [za, ra] = CROWN[i], [zz, rb] = CROWN[i + 1]; if (z <= zz) return ra + ((rb - ra) * (z - za)) / (zz - za); } return 0; };
    for (const [a, z] of SEEDS) { const r = rad(z) + 0.05; p.dot([Math.cos(a) * r, Math.sin(a) * r, zb + z], 0.62, 1); }
  },
};
