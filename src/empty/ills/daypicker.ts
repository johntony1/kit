// No date picked: a date picker card standing on a foot, two binding tabs on top, a dark header with two arrows over a grid of day dots. Hover and one day pops out as a bright round bead.
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
const Y = 1.5; // the card's face
const circ = (cu: number, cv: number, r: number, y: number): V3[] => Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [cu + Math.cos(a) * r, y, cv + Math.sin(a) * r] as V3; });

export const daypicker: Illustration = {
  k: "daypicker", name: "Date picker", title: "No date picked", body: "Choose a date and it will be set for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 1, 28, 13, 0.12);
    p.rotate("z", -0.42);
    p.box(-12, -4, 0, 24, 8, 1.4, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    prism(p, rrect(0, 18.4, 16, 17, 3, -Y), [0, Y * 2, 0], 0.22);
    const y = Y + 0.03;
    // two binding tabs over the top edge
    for (const cu of [-8, 8]) prism(p, rrect(cu, 36, 1.4, 3.2, 1.4, -0.8), [0, 1.6, 0], 0.3);
    // the header: a dark band with a left and a right arrow
    p.clear(rrect(0, 31, 13.5, 2.8, 1.2, y));
    const arrow = (cu: number, s: number) => {
      const q = [[cu + s, y, 32.6], [cu - s, y, 31], [cu + s, y, 29.4]].map((v) => p.pt(v as V3));
      p.screen((c) => {
        c.strokeStyle = "#fff"; c.lineWidth = 1.2; c.lineCap = "round"; c.lineJoin = "round";
        c.beginPath(); q.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.stroke();
      });
    };
    arrow(-10, 1.2); arrow(10, -1.2);
    // the days: a grid of dark cells, one of them left for the pick
    const PU = 4.1, PV = 5.4, pick = [4, 1];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const cu = (c - 3) * PU, cv = 24.2 - r * PV;
      if (c === pick[0] && r === pick[1] && h > 0.02) continue;
      p.clear(circ(cu, cv, 1.25, y));
    }
    // the picked day: a round bright bead popping out of its cell
    const k = back(Math.min(1, h * 1.15));
    if (h > 0.02) {
      const cu = (pick[0] - 3) * PU, cv = 24.2 - pick[1] * PV;
      p.clear(circ(cu, cv, 4.4, y));
      p.push();
      p.scale(Math.max(0.01, k), [cu, y, cv]);
      prism(p, circ(cu, cv, 3.4, Y - 0.5), [0, 3.5, 0], 0.45);
      const o = circ(cu, cv, 3.4, Y + 3.03);
      p.line([...o, o[0]], 1, 0.6);
      p.pop();
    }
  },
};
