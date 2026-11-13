// No metrics tracked: a KPI card standing up, a label slot over a big rising arrow cut into its face. Hover and the arrow pops up out of the card with a bounce and climbs a step higher.
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
const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const Y = 1.5; // the card's face
/** a thick polyline as one outline, mitred at the joints, in [u, v] */
function thick(pts: [number, number][], w: number): [number, number][] {
  const n = (a: [number, number], b: [number, number]) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); return [-dz / l, dx / l]; };
  const L: [number, number][] = [], R: [number, number][] = [];
  pts.forEach((q, i) => {
    const s0 = i > 0 ? n(pts[i - 1], q) : n(q, pts[i + 1]), s1 = i < pts.length - 1 ? n(q, pts[i + 1]) : s0;
    let nx = s0[0] + s1[0], nz = s0[1] + s1[1];
    const l = Math.hypot(nx, nz); nx /= l; nz /= l;
    const m = w / 2 / (nx * s0[0] + nz * s0[1]);
    L.push([q[0] + nx * m, q[1] + nz * m]); R.push([q[0] - nx * m, q[1] - nz * m]);
  });
  return [...L, ...R.reverse()];
}
/** the arrow: a zigzag rising to the right, with a head on its end. c lifts the last leg */
function arrow(c: number): [number, number][][] {
  const end: [number, number] = [11 - 1.2 * c, 25 + 3 * c], prev: [number, number] = [2.5, 13];
  const line = thick([[-13, 5], [-5, 14], [-0.5, 9.5], prev, end], 3.4);
  const dx = end[0] - prev[0], dz = end[1] - prev[1], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
  const tip: [number, number] = [end[0] + ux * 4.5, end[1] + uz * 4.5];
  const head: [number, number][] = [tip, [end[0] - uz * 4.6 - ux * 1.5, end[1] + ux * 4.6 - uz * 1.5], [end[0] + uz * 4.6 - ux * 1.5, end[1] - ux * 4.6 - uz * 1.5]];
  return [line, head];
}

export const kpi: Illustration = {
  k: "kpi", name: "KPI", title: "No metrics tracked", body: "Pick the numbers that matter and they will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 1, 30, 13, 0.12);
    p.rotate("z", -0.42);
    p.box(-14, -4, 0, 28, 8, 1.4, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    prism(p, rrect(0, 17.4, 18, 16, 3, -Y), [0, Y * 2, 0], 0.22);
    const y = Y + 0.03;
    // the label: a short dark slot at the top left
    p.clear(rrect(-10.5, 29, 5, 1.5, 1.4, y));
    // the arrow's slot, then the arrow itself once it pops
    const k = back(Math.min(1, h * 1.1)), c = Math.min(1, Math.max(0, (h - 0.4) / 0.6));
    for (const s of arrow(0)) p.clear(s.map(([u, v]) => [u, y, v] as V3));
    if (h > 0.02) {
      const lift = 3.5 * k;
      for (const s of arrow(c)) {
        prism(p, s.map(([u, v]) => [u, Y - 0.5, v] as V3), [0, 0.5 + lift, 0], 0.42);
        const o = s.map(([u, v]) => [u, Y + lift + 0.03, v] as V3);
        p.line([...o, o[0]], 1, 0.6);
      }
    }
  },
};
