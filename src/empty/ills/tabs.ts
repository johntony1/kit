// No tabs open: a panel with three tabs along its top. Over and over the next tab steps forward, lifts and joins the panel, and the content below changes with it.
import { easeInOut, type Illustration, type Pen, type V3 } from "../dots";

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
const P = 3.6; // seconds per loop
const TAB: [number, number][] = [[-5.2, 0], [5.2, 0], [4, 6], [-4, 6]];
const rect = (u0: number, v0: number, u1: number, v1: number, y: number): V3[] => [[u0, y, v0], [u1, y, v0], [u1, y, v1], [u0, y, v1]];
/** how far tab i is the open one at phase u: each holds a third of the loop, easing over to the next */
const open = (u: number, i: number) => {
  const x = (u * 3 - i + 3) % 3; // 0..3, the open spell starts at 0
  if (x < 0.75) return easeInOut(x / 0.75);
  if (x < 1) return 1;
  if (x < 1.75) return 1 - easeInOut((x - 1) / 0.75);
  return 0;
};

export const tabs: Illustration = {
  k: "tabs", name: "Tabs", title: "No tabs open", body: "Open something to work on and it will get its own tab up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 1, 30, 13, 0.12);
    p.rotate("z", -0.42);
    const CU = [-11.2, 0, 11.2], ZT = 26;
    const a = CU.map((_, i) => open(u, i));
    const tab = (i: number, front: boolean) => {
      const k = a[i], y0 = -1.5, depth = front ? 3 : 2.2;
      const B = TAB.map(([x, v]) => [CU[i] + x, y0 - (front ? 0 : 0.6), ZT - 1 + v * (v ? 0.6 + 0.5 * k : 1) + 1.5 * k] as V3);
      prism(p, B, [0, depth, 0], front ? 0.24 : 0.065);
    };
    // the closed tabs sit back, behind the panel's top edge
    a.forEach((k, i) => { if (k <= 0.5) tab(i, false); });
    // the panel
    prism(p, rrect(0, 13.5, 17, 12.5, 2, -1.5), [0, 3, 0], 0.24);
    const y = 1.53;
    p.line([[-17, y, ZT - 0.2], [17, y, ZT - 0.2]], 1, 0.7);
    // the open tab: in line with the panel's face, joined to it
    a.forEach((k, i) => { if (k > 0.5) {
      tab(i, true);
      p.face([[CU[i] - 5, y + 0.01, ZT - 0.8], [CU[i] + 5, y + 0.01, ZT - 0.8], [CU[i] + 5, y + 0.01, ZT + 0.5], [CU[i] - 5, y + 0.01, ZT + 0.5]], 0.24, 0);
      const o = TAB.map(([x, v]) => [CU[i] + x, y + 0.02, ZT - 1 + v * (v ? 0.6 + 0.5 * k : 1) + 1.5 * k] as V3);
      p.line(o.slice(1).concat([o[0]]).reverse(), 1, 0.7);
    } });
    // the content: one block and two bars, sized by which tab is open
    const w = a[0] * 10 + a[1] * 4 + a[2] * 13;
    p.clear(rect(-13, 12, -1, 22, y));
    p.clear(rect(2, 19, 2 + w, 21.6, y));
    p.clear(rect(2, 13, 2 + w * 0.7, 15.6, y));
    p.clear(rect(-13, 5, 13, 7.6, y));
  },
};
