// No tips yet: a speech bubble tooltip with an i on it, over a round help button. Hover and the button presses in and the tooltip pops up with a bounce.
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
    p.face(q, n[2] / l > 0.55 ? 0.16 : n[1] > n[0] ? 0.1 : 0.065, 0);
  }
  if (facing(p, F) > 0) p.face(F, cap, 0);
}
/** the bubble's outline in (u, v): a rounded box with a tail pointing down at its middle */
const bubble = (W: number, H: number, r: number): [number, number][] => {
  const out: [number, number][] = [];
  const arc = (cu: number, cv: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); } };
  arc(-W + r, r, Math.PI);
  out.push([-3.2, 0], [0, -5.5], [3.2, 0]);
  arc(W - r, r, -Math.PI / 2);
  arc(W - r, H - r, 0);
  arc(-W + r, H - r, Math.PI / 2);
  return out;
};

export const tooltip: Illustration = {
  k: "tooltip", name: "Tooltip", title: "No tips yet", body: "Helpful tips will appear here as you explore.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 22, 11, 0.12);
    p.rotate("z", -0.42);
    // the help button on the floor: presses in on hover
    const press = Math.min(1, h * 2.2) * (1 - Math.max(0, h - 0.6) * 1.5);
    const bh = 3.6 - 1.6 * press;
    p.cylinder(0, 0, 0, 6.5, bh, { side: 0.12, top: 0.26, edge: 0 });
    p.dot([0, 0, bh + 0.02], 1.1, 0);
    // the tooltip: pops up past its rest and settles
    const k = h <= 0 ? 0 : Math.sin(Math.min(1, h * 1.2) * Math.PI) * 0.06 + Math.min(1, h * 1.2) * 0.02;
    const lift = 2.2 * Math.min(1, h * 1.3);
    p.push();
    p.translate(0, 0, 13 + lift);
    p.scale(1 + k, [0, 0, -5.5]);
    const W = 15, H = 15;
    const B = bubble(W, H, 3.5).map(([u, v]) => [u, -2, v] as V3);
    prism(p, B, [0, 4, 0], 0.3);
    const y = 2.03;
    p.line([...B.map(([x, , z]) => [x, y, z] as V3), [B[0][0], y, B[0][2]]], 1, 0.6);
    // the i: a round mark on the left, cut into the face
    const cx = -8.4, cz = 7.5;
    const ring: V3[] = Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [cx + Math.cos(a) * 4, y, cz + Math.sin(a) * 4] as V3; });
    p.line([...ring, ring[0]], 1, 0.9);
    p.dot([cx, y, cz + 2], 0.8, 0);
    p.line([[cx, y, cz - 2.2], [cx, y, cz + 0.6]], 1, 1.1);
    // two lines of text
    p.line([[-2.4, y, 9.6], [10.2, y, 9.6]], 1, 1.2);
    p.line([[-2.4, y, 5.6], [6.4, y, 5.6]], 1, 1.2);
    p.pop();
  },
};
