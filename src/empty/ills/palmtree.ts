// No getaways planned: a tall palm on a little mound of sand, coconuts under its crown. The fronds sway in the breeze and the trunk bends with them, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
function lathe(p: Pen, prof: [number, number][], z0: number, f: [number, number, number], N = 40) {
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
const MOUND: [number, number][] = [[0, 10.5], [1, 9.2], [2, 6.6], [2.6, 3.2], [2.7, 0]];

export const palmtree: Illustration = {
  k: "palmtree", name: "Palm tree", title: "No getaways planned", body: "Plan a trip and your getaways will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = ((t / P) % 1) * Math.PI * 2, sway = Math.sin(ph);
    p.translate(-2, 2, -22);
    p.shadow(0, 0, 20, 10, 0.1);
    lathe(p, MOUND, 0, [0.2, 0.12, 0.065]);
    // the trunk: a curve of short ringed segments, bending with the breeze
    const at = (u: number): V3 => [7 * u * u + sway * 1.6 * u * u, -3 * u * u - sway * 1.6 * u * u, 2.6 + 25 * u];
    const n = 10;
    for (let i = 0; i < n; i++) {
      const [x, y, z] = at(i / n), r = 2.5 - 0.8 * (i / n);
      p.cylinder(x, y, z, r, 2.75, { side: i % 2 ? 0.13 : 0.24, top: 0.2, edge: 0 });
    }
    const C = at(1);
    // the fronds: long arching leaves with ragged edges, the far ones first
    const leaves = Array.from({ length: 7 }, (_, i) => {
      const a = 0.35 + (i * Math.PI * 2) / 7 + 0.06 * Math.sin(ph + i);
      return { a, d: Math.cos(a) + Math.sin(a), i };
    }).sort((u, v) => u.d - v.d);
    const leaf = (a: number, i: number) => {
      const L = 16, ca = Math.cos(a), sa = Math.sin(a), droop = 13 + 1.6 * Math.sin(ph + i * 0.9);
      const spine = (s: number): V3 => [C[0] + ca * L * s, C[1] + sa * L * s, C[2] + 1.5 + 6 * s - droop * s * s];
      const left: V3[] = [], right: V3[] = [];
      for (let j = 0; j <= 16; j++) {
        const s = j / 16, w = 4.4 * Math.sin(Math.PI * Math.pow(s, 0.75)) * (j % 2 ? 1 : 0.5), [x, y, z] = spine(s);
        left.push([x - sa * w, y + ca * w, z - w * 0.25]); right.push([x + sa * w, y - ca * w, z - w * 0.25]);
      }
      p.face([...left, ...right.reverse()], ca + sa > 0 ? 0.3 : 0.15, 0);
      p.line(Array.from({ length: 9 }, (_, j) => spine(j / 8)), 1, 0.6);
    };
    for (const l of leaves) if (l.d <= 0) leaf(l.a, l.i);
    // coconuts tucked under the crown
    ([[-1.4, 1.6, -1.6], [1.7, 1, -2.2], [0.4, -1.4, -1.2]] as V3[]).forEach(([x, y, z]) => p.dot([C[0] + x, C[1] + y, C[2] + z], 2.2, 0.32));
    for (const l of leaves) if (l.d > 0) leaf(l.a, l.i);
  },
};
