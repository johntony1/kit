// Nothing has grown yet: one big leaf on a short stem, its two halves lit and shaded around a midrib. Hover and it sways while a dewdrop rolls down to the tip.
import { SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const L = 36, W = 11, D = 1.6; // leaf length, half width, thickness
const A = -0.62; // the leaf's tilt: the tip hangs down to the right
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const B: P2 = [-15, 12]; // where the stem meets the leaf
/** a point on the leaf: s along the midrib, v across it */
const on = (s: number, v: number): P2 => [B[0] + Math.cos(A) * s - Math.sin(A) * v, B[1] + Math.sin(A) * s + Math.cos(A) * v];
const width = (u: number) => W * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.85);
const half = (side: 1 | -1): P2[] => [...Array.from({ length: 25 }, (_, i) => { const u = i / 24; return on(u * L, side * width(u)); }), on(L, 0), on(0, 0)];
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);

export const leaf: Illustration = {
  k: "leaf", name: "Leaf", title: "Nothing has grown yet", body: "Start something new and watch it grow here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(2, 0, 4);
    p.push(); p.translate(0, 0, -22); p.shadow(0, 0, 18, 7, 0.1); p.pop();
    p.rotate("z", -0.6); // turned to face us
    p.push();
    p.rotate("y", -(0.08 * e + h * Math.sin(t * 2) * 0.04), [B[0], 0, B[1]]);
    // the stem: a short bright stalk out of the leaf's base
    p.face(at([on(-7, -0.8), on(2, -0.8), on(2, 0.8), on(-7, 0.8)], -D / 2), 0.3, 0);
    // the leaf: a shaded edge behind, then the lit upper half and the shaded lower half
    const up = half(1), dn = half(-1);
    for (let y = -D; y < 0; y += 0.4) { p.face(at(up, y), 0.1, 0); p.face(at(dn, y), 0.1, 0); }
    p.face(at(up), 0.28, 0);
    p.face(at(dn), 0.09, 0);
    // the midrib and the veins, cut into the leaf
    p.line(at([on(0, 0), on(L * 0.92, 0)], 0.05), SH.edge, 0.9);
    for (const k of [0.2, 0.4, 0.6]) for (const s of [1, -1]) p.line(at([on(L * k, 0), on(L * (k + 0.14), s * width(k + 0.14) * 0.72)], 0.05), SH.edge, 0.6);
    // a dewdrop rolls along the midrib to the tip
    if (h > 0.02) {
      const s = L * (0.3 + 0.62 * e);
      const [sx, sy] = p.pt(at([on(s, 1.6)], 0.5)[0]);
      const r = 1.6 + 1.4 * e;
      p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill(); g.fillStyle = "#000"; g.beginPath(); g.arc(sx + r * 0.3, sy + r * 0.25, r * 0.38, 0, Math.PI * 2); g.fill(); });
    }
    p.pop();
  },
};
