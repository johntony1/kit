// Nothing checked yet: a big chunky checkbox standing on its edge, its dark square empty. Hover and a thick tick pops up out of the box with a bounce, and the box hops.
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
const back = (x: number) => 1 + 2.6 * Math.pow(x - 1, 3) + 1.6 * Math.pow(x - 1, 2);
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

export const checkbox: Illustration = {
  k: "checkbox", name: "Checkbox", title: "Nothing checked yet", body: "Tick off an item and it will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const hop = h > 0.45 && h < 0.85 ? Math.sin(((h - 0.45) / 0.4) * Math.PI) * 2.2 : 0;
    p.translate(0, 0, -16);
    p.shadow(0, 2, 26, 12, 0.12);
    p.rotate("z", -0.42);
    p.translate(0, 0, hop);
    const S = 15, CZ = S + 0.5;
    // the box: a lit square frame round a dark, empty well
    prism(p, rrect(0, CZ, S, S, 4.5, -3), [0, 6, 0], 0.26);
    const rim = rrect(0, CZ, S, S, 4.5, 3.03);
    p.line([...rim, rim[0]], 1, 0.6);
    p.clear(rrect(0, CZ, S - 3.6, S - 3.6, 2.4, 3.04));
    // the tick: rises out of the well past its rest and settles
    const k = back(Math.min(1, Math.max(0, (h - 0.15) / 0.7)));
    if (k > 0.02) {
      p.push();
      p.scale(Math.max(0.01, k), [0, 3, CZ]);
      const T = thick([[-6.4, 0.6], [-1.8, -4.6], [7.4, 6.4]], 4).map(([u, v]) => [u, 0, CZ + v] as V3);
      prism(p, T, [0, 6, 0], 0.42);
      const c = T.map(([u, , z]) => [u, 6.03, z] as V3);
      p.line([...c, c[0]], 1, 0.6);
      p.pop();
    }
  },
};
