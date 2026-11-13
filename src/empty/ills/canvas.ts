// Start with a prompt: an easel holding a large blank canvas, a cursor resting on its lower corner. Hover and the cursor nudges in and a sparkle pops on the canvas's upper left corner.
import { type Illustration, type V3 } from "../dots";

type Q = [number, number][];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const popK = (b: number) => (b < 0.65 ? ease(b / 0.65) * 1.2 : 1.2 - 0.2 * ease((b - 0.65) / 0.35));
const CW = 15, Z0 = 13, Z1 = 36; // canvas half width, bottom, top
// the cursor, its tip at the origin
const ARROW: Q = [[0, 0], [0, -11], [2.7, -8.5], [4.6, -12.8], [6.6, -11.9], [4.7, -7.8], [8.1, -7.8]];

export const canvas: Illustration = {
  k: "canvas", name: "Canvas", title: "Start with a prompt", body: "Describe what you want to make and it will take shape on the canvas.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -19);
    p.shadow(0, -2, 26, 10, 0.12);
    p.rotate("z", -0.62);
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a, y, v] as V3);
    // a leg: a flat strip between two points
    const leg = (a: V3, b: V3, w: number, fill: number) => p.face([[a[0] - w, a[1], a[2]], [a[0] + w, a[1], a[2]], [b[0] + w, b[1], b[2]], [b[0] - w, b[1], b[2]]], fill, 0);
    // the back leg, then the two front legs meeting at the top
    leg([0, -3, 41], [0, -15, 0], 0.9, 0.1);
    leg([-1.6, -2.5, 41], [-12, 1.5, 0], 1, 0.22);
    leg([1.6, -2.5, 41], [12, 1.5, 0], 1, 0.16);
    // the canvas: depth layers, then a blank lit face
    const B: Q = [[-CW, Z0], [CW, Z0], [CW, Z1], [-CW, Z1]];
    for (let y = -2.5; y < 0; y += 0.5) p.face(put(B, y), 0.065, 0);
    p.face(put(B, 0), 0.24, 0);
    // the ledge it rests on
    p.box(-CW - 2, -3, Z0 - 2, 2 * CW + 4, 5.5, 2, { top: 0.28, left: 0.12, right: 0.065, edge: 0 });
    // the sparkle pops on the upper left corner
    const b = Math.max(0, (h - 0.35) / 0.65);
    const sp = (cx: number, cz: number, r: number) => {
      const q: Q = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r * 0.3 : r; return [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr]; });
      p.clear(put(q.map(([a, v]) => [cx + (a - cx) * 1.35, cz + (v - cz) * 1.35]), 0.1));
      p.face(put(q, 0.2), 0.45, 0);
    };
    sp(-CW + 5, Z1 - 5.5, 2.2 + 2.6 * (b > 0 ? popK(b) : 0));
    if (b > 0.3) sp(-CW + 10.5, Z1 - 3.5, 2 * popK(Math.min(1, (b - 0.3) / 0.7)));
    // the cursor: dark with a bright rim, its tip on the lower corner
    const k = ease(Math.min(1, h / 0.5));
    const tx = CW - 8 - 2 * k + h * Math.sin(t * 3) * 0.3, tz = Z0 + 13 + 1.5 * k;
    const cur = (g: number): Q => ARROW.map(([a, v]) => {
      const l = Math.hypot(a - 3.5, v + 7) || 1;
      return [tx + a + ((a - 3.5) / l) * g, tz + v + ((v + 7) / l) * g];
    });
    p.face(put(cur(1.2), 0.3), 0.45, 0);
    p.face(put(cur(0), 0.4), 0.03, 0);
  },
};
