// No tracks made yet: a big single music note standing up with a four point sparkle beside it. Hover and the note sways to a beat while the sparkle swells and turns and a small one pops in.
import { type Illustration, type V3 } from "../dots";

type Q = [number, number][];
const HEAD: Q = Array.from({ length: 28 }, (_, i) => {
  const s = (i / 28) * Math.PI * 2, x = Math.cos(s) * 5.4, y = Math.sin(s) * 3.9, a = 0.38;
  return [-2.6 + x * Math.cos(a) - y * Math.sin(a), 5 + x * Math.sin(a) + y * Math.cos(a)];
});
const STEM: Q = [[0.6, 6], [3, 6], [3, 32], [0.6, 32]];
const FLAG: Q = [[0.6, 32], [3, 32], [4.6, 29.4], [8.6, 27], [11.4, 22.6], [11.6, 17.6], [9.6, 12.8], [8.4, 13.6], [9.6, 17.6], [9.2, 21.4], [6.4, 24], [3, 25.4]];
const star = (ca: number, cv: number, R: number, r: number, rot: number): Q =>
  Array.from({ length: 8 }, (_, i) => { const s = rot + (i * Math.PI) / 4, q = i % 2 ? r : R; return [ca + Math.cos(s) * q, cv + Math.sin(s) * q]; });

export const aimusic: Illustration = {
  k: "aimusic", name: "Music generation", title: "No tracks made yet", body: "Describe a mood or a style and your generated tracks will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 22, 10, 0.12);
    p.rotate("z", -0.62);
    // the note sways about its head on the beat
    const sway = h * 0.12 * Math.sin(t * 5.2);
    const sw = (q: Q): Q => q.map(([a, v]) => [a * Math.cos(sway) - v * Math.sin(sway) + 3, v * Math.cos(sway) + a * Math.sin(sway) + 1]);
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a, y, v] as V3);
    const note = [sw(STEM), sw(FLAG), sw(HEAD)];
    for (let y = -3.5; y < 0; y += 0.5) note.forEach((q) => p.face(put(q, y), 0.065, 0));
    note.forEach((q) => p.face(put(q, 0), 0.22, 0));
    p.dot(put(sw([[-5, 6.5]]), 0.1)[0], 0.9, 1);
    // the sparkle: swells and turns on hover; a small one pops in
    const big = star(-10, 25, 6 + 1.6 * h, 1.5 + 0.3 * h, Math.PI / 2 + h * 0.6);
    for (let y = -2.5; y < 0; y += 0.5) p.face(put(big, y), 0.065, 0);
    p.face(put(big, 0), 0.32, 0);
    const k = Math.max(0, (h - 0.5) / 0.5);
    if (k > 0) {
      const sm = star(-13.5, 13, 3.4 * Math.min(1, k * 1.4) * (1 + 0.12 * Math.sin(t * 4)), 0.9, Math.PI / 2);
      p.face(put(sm, -0.8), 0.065, 0);
      p.face(put(sm, 0), 0.32, 0);
    }
  },
};
