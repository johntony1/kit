// No bestsellers yet: a prize rosette standing on its two ribbon tails, a scalloped edge round a dark centre with a star. Hover and the rosette spins round once and settles with a wobble.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const CZ = 19, R = 11; // centre height and outer radius

// a scalloped ring of points in the x, z plane at depth y
const scallop = (y: number, r: number, n = 16): V3[] => Array.from({ length: n * 6 }, (_, i) => {
  const a = (i / (n * 6)) * Math.PI * 2, k = (i % 6) / 6;
  return [Math.cos(a) * (r - 1.3 * (1 - Math.sin(k * Math.PI))), y, CZ + Math.sin(a) * (r - 1.3 * (1 - Math.sin(k * Math.PI)))] as V3;
});
const circle = (y: number, r: number): V3[] => Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * r, y, CZ + Math.sin(a) * r] as V3; });
const star = (y: number, R0: number, r0: number): V3[] => Array.from({ length: 10 }, (_, i) => {
  const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r0 : R0;
  return [Math.cos(a) * q, y, CZ + Math.sin(a) * q] as V3;
});

export const bestseller: Illustration = {
  k: "bestseller", name: "Bestseller", title: "No bestsellers yet", body: "Your top selling products will be ranked here once the first orders come in.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15.5);
    p.shadow(0, 0, 20, 9, 0.12);
    p.rotate("z", -0.75); // the rosette's face looks at us
    const spin = easeInOut(Math.min(1, h * 1.25)) * Math.PI * 2;
    const wob = h > 0.8 ? Math.sin(t * 7) * 0.04 * h : 0;
    p.rotate("z", spin + wob);
    // two ribbon tails behind, each with a notched foot standing on the floor
    const tail = (s: number, fill: number) => {
      const yy = -0.6, x0 = s * 1, x1 = s * 8.5, xm = (x0 + x1) / 2;
      p.face([[x0 - s * 2.6, yy, CZ - 2], [x0 + s * 2.6, yy, CZ - 2], [x1 + s * 1.5, yy, 0], [xm + s * 1, yy, 3], [x1 - s * 4, yy, 0]], fill, 0);
    };
    tail(-1, 0.13); tail(1, 0.2);
    // the rosette: a darker back, the scalloped front, a rim cut, a dark centre with a bright star
    p.face(scallop(-0.9, R), 0.065, 0);
    p.face(scallop(0, R), 0.22, 0);
    p.line([...circle(0.03, R - 3), circle(0.03, R - 3)[0]], SH.edge, 0.7);
    p.face(circle(0.05, R - 4.6), 0.035, 0);
    p.face(star(0.08, 4.4, 1.9), 0.32, 0);
  },
};
