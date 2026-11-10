// No rankings yet: a three step podium with 2, 1 and 3 on its plaques. Hover and the steps rise in turn and a star settles over first place.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const D = 5.5; // half depth of the podium
/** number glyphs as strokes in [u, v], about 2.4 wide and 3.6 tall, centred */
const GLYPH: Record<string, [number, number][][]> = {
  "1": [[[-0.7, 1.1], [0.1, 1.8], [0.1, -1.8]], [[-0.8, -1.8], [1, -1.8]]],
  "2": [[[-1.1, 1.1], [-0.6, 1.7], [0.6, 1.7], [1.1, 1.1], [1.1, 0.4], [-1.1, -1.8], [1.2, -1.8]]],
  "3": [[[-1.1, 1.5], [-0.3, 1.8], [0.8, 1.6], [1.1, 0.9], [0.4, 0.1], [-0.2, 0.1]], [[0.4, 0.1], [1.2, -0.7], [0.9, -1.6], [-0.2, -1.8], [-1.2, -1.4]]],
};
const star = (cx: number, cz: number, y: number, R: number, r: number): V3[] =>
  Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R; return [cx + Math.cos(a) * q, y, cz + Math.sin(a) * q] as V3; });

function step(p: Pen, x0: number, w: number, hgt: number, n: string, plaque: number) {
  p.box(x0, -D, 0, w, D * 2, hgt, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
  // the plaque on the front, with its number cut out
  const y = D + 0.03, zc = Math.max(2.6, hgt * 0.5), cx = x0 + w / 2;
  p.face([[cx - 2.8, y, zc - 2.6], [cx + 2.8, y, zc - 2.6], [cx + 2.8, y, zc + 2.6], [cx - 2.8, y, zc + 2.6]], plaque, SH.edge, 0.6);
  for (const s of GLYPH[n]) p.line(s.map(([u, v]) => [cx + u * 0.95, y + 0.03, zc + v * 0.95] as V3), SH.edge, 0.8);
}

export const leaderboard: Illustration = {
  k: "leaderboard", name: "Leaderboard", title: "No rankings yet", body: "Once people start taking part, the top of the board will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.scale(1.18, [0, 0, 6]);
    p.shadow(-9.6, 0, 10, 7, 0.1); p.shadow(0, 0, 10, 7, 0.1); p.shadow(9.6, 0, 10, 7, 0.1);
    const g = (k: number) => Math.min(1, Math.max(0, (h - k) / 0.55));
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const h2 = 7 + 3 * ease(g(0.1)), h1 = 10 + 5 * ease(g(0)), h3 = 5 + 2.5 * ease(g(0.2));
    // left to right along x: second, first, third
    step(p, -14.3, 9.4, h2, "2", 0.26);
    step(p, -4.7, 9.4, h1, "1", 0.32);
    step(p, 4.9, 9.4, h3, "3", 0.26);
    // the star over first place: small and low at rest, rising and turning on hover
    const zs = h1 + 5.5 + 4 * h + h * Math.sin(t * 2.4) * 0.7;
    const sc = 0.95 + 0.25 * h;
    const tilt = h * Math.sin(t * 1.6) * 0.5;
    if (h > 0.05) p.guide([[0, 0, zs - 3.6 * sc], [0, 0, h1]], true);
    p.push();
    p.rotate("z", tilt, [0, 0, 0]);
    // thickness: the star again a step back, darker, then the lit front
    p.face(star(0, zs, -0.9, 4 * sc, 1.7 * sc), SH.right, 0);
    p.face(star(0, zs, 0, 4 * sc, 1.7 * sc), 0.32, SH.edge, 0.6);
    p.pop();
    // sparkles
    const k = Math.max(0, (h - 0.5) / 0.5);
    if (k > 0) ([[-7, 4, h1 + 13], [8, -6, h1 + 15], [-14, -2, h2 + 6]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.35 * Math.sin(t * 3.2 + i * 2.1), k));
  },
};
