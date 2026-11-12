// No lessons planned: a blackboard on a stand, a chalk and an eraser on its ledge. Hover and the chalk draws a triangle, a circle and a line under them.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const F = 1.03; // the writing face
const on = (x: number, z: number): V3 => [x, F, z];
/** the first k of a path, by length, as a row of chalk dots; returns where the chalk is */
function chalk(p: Pen, pts: V3[], k: number): V3 | null {
  if (k <= 0) return null;
  const len = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[2] - pts[i][2]));
  const total = len.reduce((a, b) => a + b, 0);
  let tip = pts[0];
  for (let d = 0; d <= total * Math.min(1, k); d += 0.55) {
    let r = d, i = 0;
    while (i < len.length - 1 && r > len[i]) { r -= len[i]; i++; }
    const f = len[i] ? r / len[i] : 0, a = pts[i], b = pts[i + 1];
    tip = [a[0] + (b[0] - a[0]) * f, F + 0.03, a[2] + (b[2] - a[2]) * f];
    p.dot(tip, 0.5, 1);
  }
  return k < 1 ? tip : null;
}

export const blackboard: Illustration = {
  k: "blackboard", name: "Blackboard", title: "No lessons planned", body: "Plan your first lesson and it will be written up here for the class.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-2, 0, -16);
    p.shadow(0, 0, 30, 13, 0.12);
    // the stand: two back legs, then two front legs and feet
    const post = (x: number, y: number, hgt: number) => p.box(x - 0.7, y - 0.7, 0, 1.4, 1.4, hgt, { top: 0.2, left: 0.3, right: 0.16, lw: 0.4 });
    post(-12, -4, 10); post(12, -4, 10);
    p.box(-13, -5, 0, 2, 11, 1.2); p.box(11, -5, 0, 2, 11, 1.2);
    post(-12, 0, 9); post(12, 0, 9);
    // the board: a frame, a dark face, a ledge
    p.box(-17, -1, 8, 34, 2, 23);
    p.face([on(-15.4, 10.4), on(15.4, 10.4), on(15.4, 29.4), on(-15.4, 29.4)], 0.035, SH.edge, 0.6);
    p.box(-15, 1, 8, 30, 2.2, 0.9, { top: 0.28 });
    p.box(8, 1.4, 8.9, 4.6, 1.5, 1.3, { top: 0.34, left: 0.24, right: 0.14, lw: 0.4 });
    // what the chalk draws
    const tri: V3[] = [on(-11.5, 15.5), on(-3.5, 15.5), on(-7.5, 25.5), on(-11.5, 15.5)];
    const circ: V3[] = Array.from({ length: 33 }, (_, i) => { const a = Math.PI / 2 - (i / 32) * Math.PI * 2; return on(6.5 + Math.cos(a) * 5, 20.5 + Math.sin(a) * 5); });
    const under: V3[] = Array.from({ length: 17 }, (_, i) => on(-11.5 + i * 1.45, 12.6 + Math.sin(i * 1.1) * 0.5));
    const tip = chalk(p, tri, ease(seg(h, 0.02, 0.36))) ?? chalk(p, circ, ease(seg(h, 0.36, 0.72))) ?? chalk(p, under, ease(seg(h, 0.72, 0.98)));
    // the chalk: on the ledge at rest, at the line while it draws
    if (tip && h > 0.02 && h < 0.98) p.box(tip[0] - 0.5, F, tip[2] - 0.5, 1, 2.6, 1, { top: 0.36, left: 0.36, right: 0.2, lw: 0.4 });
    else p.box(-11, 1.5, 8.9, 3.4, 1, 0.9, { top: 0.36, left: 0.3, right: 0.2, lw: 0.4 });
  },
};
