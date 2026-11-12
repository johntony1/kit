// Nothing in the pantry: an empty storage jar with a label. Hover and the lid lifts aside while a handful of beans drops in.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const S = Math.SQRT1_2;
const R = 8.6, HB = 17; // the jar's radius and the height of its body
const front = (r: number, z: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
// where each bean comes to rest: [x, y, z]
const BEANS: V3[] = [[1.5, 4.6, 1.4], [5, 1.5, 1.4], [3.8, 4.2, 1.5], [-1.4, 5.6, 1.5], [5.6, -1.6, 1.5], [2.8, 3, 3.5], [0.4, 5, 3.6], [4.8, 0.6, 3.6], [2.4, 3.6, 5.6]];

export const pantry: Illustration = {
  k: "pantry", name: "Pantry jar", title: "Nothing in the pantry", body: "Add the staples you keep at home and they will be stocked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(seg(h, 0, 0.45));
    p.translate(0, 0, -13);
    p.scale(1.2, [0, 0, 11]);
    p.shadow(0, 0, 20, 10, 0.11);
    // the glass body: pale, with a bright outline and a floor you can see through to
    p.cylinder(0, 0, 0, R, HB, { side: 0.05, top: 0.1, lw: 0.65 });
    p.disc(0, 0, HB + 0.01, 6.6, 0.02, SH.edge);
    p.line(front(R - 1.1, 1), 0.45, 0.45);
    // a highlight down the glass
    p.line([[R * Math.cos(2), R * Math.sin(2), 3], [R * Math.cos(2), R * Math.sin(2), HB - 2.5]], 0.8, 0.8);
    // the beans, falling in one after another
    BEANS.forEach(([x, y, z], i) => {
      const q = seg(h, 0.28 + i * 0.055, 0.56 + i * 0.055);
      if (q <= 0) return;
      p.dot([x, y, z + (HB + 14 - z) * (1 - q * q)], 1.25, 1);
    });
    // the label on the front
    const lab = (a: number, z: number): V3 => [Math.cos(a) * (R + 0.05), Math.sin(a) * (R + 0.05), z];
    const A0 = Math.PI / 4 - 0.62, A1 = Math.PI / 4 + 0.62, arc = (z: number) => Array.from({ length: 9 }, (_, i) => lab(A0 + ((A1 - A0) * i) / 8, z));
    p.face([...arc(7.4), ...arc(13).reverse()], 0.3, SH.edge, 0.55);
    p.line(arc(10.9).slice(2, 7), 0.02, 0.7); p.line(arc(9.2).slice(3, 6), 0.02, 0.55);
    // the neck, then the lid: lifting up and to the side
    p.cylinder(0, 0, HB, 6.9, 1.7, { side: 0.1, top: 0.03, lw: 0.6 });
    p.push();
    p.translate(7 * k * S, -7 * k * S, 8.5 * k);
    p.rotate("y", 0.3 * k, [0, 0, HB + 1.7]);
    p.cylinder(0, 0, HB + 1.7, 7.7, 2.8, { side: 0.2, top: 0.3, lw: 0.65 });
    p.cylinder(0, 0, HB + 4.5, 2.2, 1.5, { side: 0.2, top: 0.34, lw: 0.6 });
    p.pop();
  },
};
