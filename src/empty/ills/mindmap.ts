// No ideas mapped: a mind map standing up, a bright central idea joined by thick curved branches to the ideas around it. Hover and two new branches grow out to the right and their ideas pop in.
import { type Illustration, type V3 } from "../dots";

type Q = [number, number][];
const rrect = (a0: number, v0: number, a1: number, v1: number, r: number): Q => {
  const out: Q = [];
  const cs: [number, number, number][] = [[a1 - r, v1 - r, 0], [a0 + r, v1 - r, 1], [a0 + r, v0 + r, 2], [a1 - r, v0 + r, 3]];
  for (const [x, y, q] of cs) for (let i = 0; i <= 6; i++) { const s = ((q + i / 6) * Math.PI) / 2; out.push([x + Math.cos(s) * r, y + Math.sin(s) * r]); }
  return out;
};
// a thick branch from (a0, v0) to (a1, v1), leaving and arriving level, grown to s
const branch = (a0: number, v0: number, a1: number, v1: number, s: number): Q => {
  const n = 16, w = 1.15, c: Q = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * s, m = 1 - u;
    const ax = m * m * m * a0 + 3 * m * m * u * (a0 + (a1 - a0) * 0.55) + 3 * m * u * u * (a1 - (a1 - a0) * 0.55) + u * u * u * a1;
    const vx = m * m * m * v0 + 3 * m * m * u * v0 + 3 * m * u * u * v1 + u * u * u * v1;
    c.push([ax, vx]);
  }
  const nrm = (i: number): [number, number] => {
    const [x0, y0] = c[Math.max(0, i - 1)], [x1, y1] = c[Math.min(n, i + 1)], l = Math.hypot(x1 - x0, y1 - y0) || 1;
    return [-(y1 - y0) / l, (x1 - x0) / l];
  };
  return [...c.map(([x, y], i) => { const [nx, ny] = nrm(i); return [x + nx * w, y + ny * w] as [number, number]; }),
    ...c.map(([x, y], i) => { const [nx, ny] = nrm(i); return [x - nx * w, y - ny * w] as [number, number]; }).reverse()];
};
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pop = (x: number) => { const b = Math.min(1, x); return b <= 0 ? 0 : b < 0.65 ? ease(b / 0.65) * 1.15 : 1.15 - 0.15 * ease((b - 0.65) / 0.35); };

export const mindmap: Illustration = {
  k: "mindmap", name: "Mind map", title: "No ideas mapped", body: "Start with one idea in the middle and branch out from there.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 30, 11, 0.12);
    p.rotate("z", -0.62);
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a, y, v + 1] as V3);
    const g1 = Math.min(1, Math.max(0, h / 0.45)), g2 = Math.min(1, Math.max(0, (h - 0.25) / 0.45));
    const p1 = pop((h - 0.38) / 0.3), p2 = pop((h - 0.62) / 0.3);
    // the branches and the side ideas: the two on the left always, the two on the right grow in on hover
    const N = 13.5, T = 25.5, B = 3; // where the side ideas sit
    const node = (a: number, v: number, k: number) => rrect(a - 5.6 * k, v - 3.4 * k, a + 5.6 * k, v + 3.4 * k, 1.8 * k);
    const arms: Q[] = [branch(-4, 14, -N, T, 1), branch(-4, 14, -N, B, 1)];
    if (g1 > 0.02) arms.push(branch(4, 14, N, T, ease(g1)));
    if (g2 > 0.02) arms.push(branch(4, 14, N, B, ease(g2)));
    const nodes: Q[] = [node(-N, T, 1), node(-N, B, 1)];
    if (p1 > 0) nodes.push(node(N, T, p1));
    if (p2 > 0) nodes.push(node(N, B, p2));
    const core = rrect(-7.5, 9.5, 7.5, 18.5, 2.6);
    const all = [...arms, ...nodes, core];
    for (let y = -3; y < 0; y += 0.5) all.forEach((q) => p.face(put(q, y), 0.065, 0));
    arms.forEach((q) => p.face(put(q, 0), 0.16, 0));
    // the ideas: bright, each with a dark rim so it stands apart from its branch
    const grow = (q: Q, g: number): Q => { const ca = q.reduce((s, [a]) => s + a, 0) / q.length, cv = q.reduce((s, [, v]) => s + v, 0) / q.length; return q.map(([a, v]) => [ca + (a - ca) * (1 + g / 6), cv + (v - cv) * (1 + g / 3.8)]); };
    nodes.forEach((q) => { p.face(put(grow(q, 0.9), 0.05), 0.03, 0); p.face(put(q, 0.1), 0.26, 0); });
    p.face(put(grow(core, 1.2), 0.05), 0.03, 0);
    p.face(put(core, 0.1), 0.34, 0);
    p.line(put([[-3.8, 15.2], [3.8, 15.2]], 0.2), 1, 0.9);
    p.line(put([[-3.8, 12.6], [1.8, 12.6]], 0.2), 1, 0.9);
  },
};
