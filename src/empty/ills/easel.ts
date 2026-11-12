// Easel: a wooden easel holding a blank canvas. Hover and one bold brush stroke paints itself across the canvas, with a dot above it.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const LEAN = 0.2, TOP = 41; // how far it leans back, the height of the frame

export const easel: Illustration = {
  k: "easel", name: "Easel", title: "Blank canvas", body: "Start something new and it will take shape here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, 1, -20);
    p.shadow(0, -3, 28, 14, 0.1);
    p.rotate("z", -0.5);
    // the back leg, from the top of the frame to the floor behind
    const ty = -Math.sin(LEAN) * TOP, tz = Math.cos(LEAN) * TOP;
    p.face([[-1.1, ty, tz], [1.1, ty, tz], [1.1, -19, 0], [-1.1, -19, 0]], 0.1, 0);
    p.rotate("x", LEAN);
    // the two front legs, meeting at the top
    for (const s of [-1, 1]) p.face([[s * 12.2, 0, 0], [s * 9.8, 0, 0], [s * 0.4, 0, TOP], [s * 2.6, 0, TOP]], 0.3, 0);
    p.box(-2.6, -0.6, TOP - 5, 5.2, 1.2, 5, { top: 0.3, left: 0.3, right: 0.12, lw: 0.5 });
    // the tray and the canvas standing on it
    p.box(-13, 0, 8.6, 26, 3.4, 1.4, { top: 0.3, left: 0.2, right: 0.1, lw: 0.5 });
    p.box(-11.5, 0.4, 10, 23, 1.6, 23.5, { top: 0.3, left: 0.24, right: 0.07, lw: 0.6 });
    // one bold stroke painted across the canvas, then a dot
    const y = 2.03, k = ease(Math.min(1, h / 0.75)), N = 26;
    const at = (s: number, w: number): V3 => [-8 + 16 * s, y, 19.5 + 4.2 * Math.sin(s * Math.PI * 2) - 3 * s + w];
    const n = Math.round(N * k);
    if (n > 0) {
      const w = (a: number) => 1.3 + 0.7 * Math.sin(a * Math.PI), ix = Array.from({ length: n + 1 }, (_, i) => i / N);
      p.clear([...ix.map((a) => at(a, w(a))), ...ix.reverse().map((a) => at(a, -w(a)))]);
    }
    const d = Math.max(0, (h - 0.75) / 0.25);
    if (d > 0) p.clear(Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [5.6 + Math.cos(a) * 2.2 * d, y, 28.2 + Math.sin(a) * 2.2 * d] as V3; }));
    p.line([[-11.5, 2.03, 10], [11.5, 2.03, 10]], SH.edge, 0.5);
  },
};
