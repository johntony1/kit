// No treats yet: a waffle cone in a little stand with one scoop. Hover and a second scoop drops on with a bounce, then a cherry pops on top.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const Q = Math.PI / 4, S2 = Math.SQRT1_2, SPLIT = Math.PI / 6;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const R = 8, Z0 = 1.5, ZC = 23; // the cone's mouth radius, its tip and its mouth
const cone = (a: number, f: number): V3 => [Math.cos(a) * R * f, Math.sin(a) * R * f, Z0 + (ZC - Z0) * f];
const rim = (a0: number, a1: number, f = 1, n = 20): V3[] => Array.from({ length: n + 1 }, (_, i) => cone(a0 + ((a1 - a0) * i) / n, f));

/** a ball, as a circle that faces the screen */
function ball(p: Pen, c: V3, r: number, fill: number, lw = 0.6) {
  const k = (r / 1.2247) * S2;
  p.face(Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [c[0] + Math.cos(a) * k, c[1] - Math.cos(a) * k, c[2] + Math.sin(a) * r] as V3; }), fill, SH.edge, lw);
}
// height of the falling scoop above its seat: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k < 0.5) return 30 * (1 - Math.pow(k / 0.5, 2));
  if (k < 0.78) { const v = (k - 0.5) / 0.28; return 3.6 * 4 * v * (1 - v); }
  if (k < 0.92) { const v = (k - 0.78) / 0.14; return 1 * 4 * v * (1 - v); }
  return 0;
}

export const icecream: Illustration = {
  k: "icecream", name: "Ice cream", title: "No treats yet", body: "Rewards and treats you earn will be kept here. Check back after your next order.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -21.5);
    p.scale(0.86);
    p.shadow(0, 0, 17, 8.5, 0.13);
    // the stand: a low block with a hole the tip sits in
    p.box(-6.5, -6.5, 0, 13, 13, 2.6);
    p.disc(0, 0, 2.62, 2.6, 0.03, SH.edge);
    // the cone
    const tip = cone(0, 0);
    if (p.ink) p.face([tip, ...rim(-Q, 3 * Q)], SH.left, 0);
    else { p.face([tip, ...rim(-Q, SPLIT)], 0.11, 0); p.face([tip, ...rim(SPLIT, 3 * Q)], 0.2, 0); }
    // waffle lines: two sets of spirals and a band under the mouth
    for (let j = -2; j <= 5; j++) for (const dir of [1, -1]) {
      const pts: V3[] = [];
      for (let i = 0; i <= 10; i++) { const f = 1 - i * 0.075, a = Q + (j - 1.5) * 0.62 + dir * (1 - f) * 1.9; if (a > -Q && a < 3 * Q) pts.push(cone(a, f)); }
      if (pts.length > 1) p.line(pts, 0.85, 0.32);
    }
    p.line([cone(-Q, 1), tip, cone(3 * Q, 1)], SH.edge, 0.6);
    p.line(rim(-Q, 3 * Q, 0.84), SH.edge, 0.5);
    p.face(rim(0, Math.PI * 2, 1, 40), 0.1, SH.edge, 0.6);
    // the first scoop, with a frill where it meets the cone
    const k = seg(h, 0.05, 0.75), fall = drop(k), squash = k > 0.5 && k < 0.6 ? 0.6 : 0;
    const c1: V3 = [0, 0, ZC + 5 - squash * 0.5];
    ball(p, c1, 8.2, 0.2);
    p.line(Array.from({ length: 41 }, (_, i) => { const a = -Q + (i / 40) * Math.PI; return [Math.cos(a) * 8.3, Math.sin(a) * 8.3, ZC + 0.6 + 0.7 * Math.cos(i * 1.26)] as V3; }), SH.edge, 0.6);
    p.line(Array.from({ length: 9 }, (_, i) => { const a = 2 + i * 0.1; return [c1[0] + Math.cos(a) * 5.6 * S2, c1[1] - Math.cos(a) * 5.6 * S2, c1[2] + Math.sin(a) * 6] as V3; }), SH.edge, 0.5);
    // the second scoop
    if (k > 0) {
      const c2: V3 = [0, 0, ZC + 15.6 + fall];
      ball(p, c2, 6.6, 0.26);
      p.line(Array.from({ length: 9 }, (_, i) => { const a = 2 + i * 0.1; return [c2[0] + Math.cos(a) * 4.5 * S2, c2[1] - Math.cos(a) * 4.5 * S2, c2[2] + Math.sin(a) * 4.8] as V3; }), SH.edge, 0.5);
      // the cherry and its stalk
      const b = seg(h, 0.74, 1);
      if (b > 0) {
        const s = b < 0.65 ? ease(b / 0.65) * 1.2 : 1.2 - 0.2 * ease((b - 0.65) / 0.35), zc = ZC + 15.6 + 6.6 + 1.4 + Math.sin(t * 2.4) * 0.15;
        p.face([[0, 0, zc + 1], [0.9, -0.9, zc + 3.6 * s], [2.2, -2.2, zc + 4.6 * s], [2.5, -2.5, zc + 4 * s], [1.3, -1.3, zc + 3 * s], [0.5, -0.5, zc + 1]], 0.3, 0);
        ball(p, [0, 0, zc], 2.6 * s, 0.34, 0.5);
      }
    }
  },
};
