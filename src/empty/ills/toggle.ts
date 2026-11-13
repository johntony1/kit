// Nothing switched on: a big chunky toggle switch standing up, its knob at off. Hover and the knob slides across with a little overshoot and the track lights up.
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
    p.face(q, n[2] / l > 0.55 ? 0.12 : n[1] > n[0] ? 0.1 : 0.065, 0);
  }
  if (facing(p, F) > 0) p.face(F, cap, 0);
}
/** a stadium in the upright plane y, centred on (cx, cz): half length L, radius r */
const pill = (cx: number, cz: number, L: number, r: number, y: number): V3[] => {
  const out: V3[] = [];
  for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (i / 14) * Math.PI; out.push([cx + L + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
  for (let i = 0; i <= 14; i++) { const a = Math.PI / 2 + (i / 14) * Math.PI; out.push([cx - L + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
  return out;
};

export const toggle: Illustration = {
  k: "toggle", name: "Toggle", title: "Nothing switched on", body: "Turn on a setting or a feature and it will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 2, 30, 13, 0.12);
    p.rotate("z", -0.36);
    const R = 10, L = 8, CZ = R + 1;
    // the knob slides from off (left) to on (right), past its stop and back
    const back = (x: number) => 1 + 2.6 * Math.pow(x - 1, 3) + 1.6 * Math.pow(x - 1, 2);
    const k = back(Math.min(1, h * 1.15));
    const on = k > 0.55;
    // a low foot it stands on
    p.box(-L - R + 3, -4, 0, (L + R - 3) * 2, 8, 1.2, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the track: a thick stadium, dark when off, lit when on
    prism(p, pill(0, CZ, L, R, -1), [0, 4.5, 0], on ? 0.3 : 0.065);
    // the knob: a round button standing proud of the track
    const kx = -L + 2 * L * k;
    // the track's outline, and a dark gap round the knob, so the two stay apart when both are lit
    const tr = pill(0, CZ, L, R, 3.52);
    p.line([...tr, tr[0]], 1, 0.7);
    p.clear(Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2; return [kx + Math.cos(a) * (R - 1.2), 3.53, CZ + Math.sin(a) * (R - 1.2)] as V3; }));
    const ring: V3[] = Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2; return [kx + Math.cos(a) * (R - 2.2), 3.5, CZ + Math.sin(a) * (R - 2.2)] as V3; });
    prism(p, ring, [0, 3, 0], 0.32);
    p.line([...ring.map(([x, , z]) => [x, 6.52, z] as V3), [ring[0][0], 6.52, ring[0][2]]], 1, 0.6);
  },
};
