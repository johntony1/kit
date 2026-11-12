// Review stars: three empty stars in a row, the middle one larger. They fill one after another with a little hop, hold, then empty again.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const star = (cx: number, cz: number, y: number, R: number): V3[] =>
  Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? R * 0.44 : R; return [cx + Math.cos(a) * q, y, cz + Math.sin(a) * q] as V3; });
// where each star stands: x, centre height, size
const STARS: [number, number, number][] = [[-14.6, 12.5, 7], [0, 18, 9.6], [14.6, 12.5, 7]];

export const reviews: Illustration = {
  k: "reviews", name: "Review stars", title: "No ratings yet", body: "Ratings from your customers will add up here once the first one comes in.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -15);
    for (const [x] of STARS) p.shadow(x * 0.8, -x * 0.5, 9, 4.5, 0.1);
    p.rotate("z", -0.55); // turned to face us
    const off = 1 - seg(ph, 0.86, 0.97);
    STARS.forEach(([cx, cz, R], i) => {
      const a = 0.08 + 0.2 * i;
      const on = seg(ph, a, a + 0.1) * off, hop = Math.sin(Math.PI * seg(ph, a, a + 0.24));
      const z = cz + 2.4 * hop, r = R * (1 + 0.16 * hop);
      // thickness: the star again a step back, then the front, dark while empty and bright once filled
      p.face(star(cx, z, -2, r), SH.right, SH.edge, 0.5);
      p.face(star(cx, z, 0, r), 0.1 + 0.28 * on, SH.edge, 0.7);
      if (on < 0.5) p.line([...star(cx, z, 0.04, r * 0.62), star(cx, z, 0.04, r * 0.62)[0]], 0.5, 0.4);
    });
    // a twinkle once all three are lit
    const k = seg(ph, 0.6, 0.7) * off;
    if (k > 0) ([[-8, 2, 28], [9.5, 2, 30], [21, 2, 23]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.35 * Math.sin(ph * Math.PI * 8 + i * 2), k));
  },
};
