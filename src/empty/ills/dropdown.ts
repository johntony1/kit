// Nothing selected: a dropdown, its field over an open list of three options. Hover and a bright highlight slides down onto an option and its value types into the blank field.
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
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const rect = (u0: number, v0: number, u1: number, v1: number, y: number): V3[] => [[u0, y, v0], [u1, y, v0], [u1, y, v1], [u0, y, v1]];

export const dropdown: Illustration = {
  k: "dropdown", name: "Dropdown", title: "Nothing selected", body: "Pick an option from the list and your choice will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 1, 30, 13, 0.12);
    p.rotate("z", -0.42);
    // the list: a lit panel standing on the floor, three options as dark slots
    prism(p, rrect(-0.5, 10, 14.5, 9.5, 2.4, -2.5), [0, 3, 0], 0.2);
    const ly = 0.53;
    const rows = [15.5, 10, 4.5];
    rows.forEach((v, i) => p.clear(rect(-11.5, v - 1.2, [5, 8, 2][i], v + 1.2, ly)));
    // the highlight slides from the top option down onto the second
    const s = ease(Math.min(1, h * 1.3));
    if (h > 0.02) {
      const v = 15.5 - 5.5 * s;
      const yy = ly + 1.6 * Math.min(1, h * 4) + 0.53;
      prism(p, rrect(-0.5, v, 13, 2.6, 1.4, ly - 0.5), [0, yy - ly + 0.5 - 0.03, 0], 0.42);
      const o = rrect(-0.5, v, 13, 2.6, 1.4, yy);
      p.line([...o, o[0]], 1, 0.7);
      p.clear(rect(-10.5, v - 1, 7, v + 1, yy + 0.01));
    }
    // the field above it, standing proud: a value slot and a chevron
    prism(p, rrect(0, 28, 17, 5, 2.4, -3), [0, 6, 0], 0.26);
    const y = 3.03;
    const o = rrect(0, 28, 17, 5, 2.4, y);
    p.line([...o, o[0]], 1, 0.6);
    // the chevron button: a dark square at the right end, a bright arrow in it
    p.clear(rrect(11.6, 28, 3.6, 3.4, 1, y));
    const q = ([[9.8, y, 29.1], [11.6, y, 26.9], [13.4, y, 29.1]] as V3[]).map((v) => p.pt(v));
    p.screen((c) => {
      c.strokeStyle = "#fff"; c.lineWidth = 1.3; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); q.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.stroke();
    });
    // the value: the field is blank at rest, and the picked option types into it
    const f = Math.max(0, (h - 0.6) / 0.4);
    if (f > 0) p.clear(rect(-13, 26.8, -13 + 16 * ease(f), 29.2, y));
  },
};
