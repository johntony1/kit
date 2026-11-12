// Surfboard: one tall pointed surfboard stuck upright in a mound of sand, a stripe down its centre, two slanted bands across it and a fin at its narrow tail. Hover and it sways while grains of sand hop at its foot.
import { SH, type Illustration, type V3 } from "../dots";

const L = 47, T = 1.1; // length, half thickness
// half width along the board, tail (0) to nose (1): a narrow tail, widest below the middle, a pointed nose
const half = (v: number) => 6.8 * Math.pow(Math.sin(Math.PI * Math.pow(0.05 + 0.95 * v, 0.9)), 0.7);
const OUT: [number, number][] = (() => {
  const o: [number, number][] = [], N = 30;
  for (let i = 0; i <= N; i++) { const v = i / N; o.push([half(v), v * L]); }
  for (let i = N - 1; i >= 0; i--) { const v = i / N; o.push([-half(v), v * L]); }
  return o;
})();

export const surfboard: Illustration = {
  k: "surfboard", name: "Surfboard", title: "No waves today", body: "The sea is flat right now. Check back for the next swell.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -24);
    p.shadow(0, 0, 20, 9, 0.12);
    // the mound of sand it stands in
    for (let z = 0; z <= 3; z += 0.5) p.disc(0, 0, z, 11.5 - z * 1.8, z < 3 ? 0.12 : 0.24, 0);
    p.push();
    p.rotate("z", -0.62);
    p.rotate("y", 0.1 + h * Math.sin(t * 2.4) * 0.06, [0, 0, 0]);
    p.translate(0, 0, 2.6);
    // the fin: one swept blade past the rail, low on the narrow tail
    p.face([[3, -T, 15], [8.5, -T, 12], [12, -T, 5.5], [8, -T, 7.5], [3.5, -T, 7.5]], 0.3, 0);
    // the board: its rail, then the bright face with a stripe cut down the centre and two slanted bands
    for (let y = -T; y < T; y += p.ink ? T * 2 : 0.4) p.face(OUT.map(([x, z]) => [x, y, z] as V3), 0.3, 0);
    p.face(OUT.map(([x, z]) => [x, T, z] as V3), 0.3, 0);
    const y = T + 0.03;
    p.line([[0, y, 3], [0, y, L - 4]], SH.edge, 0.7);
    for (const z of [21, 25.5]) p.line([[-half((z - 4) / L), y, z - 4], [half((z + 4) / L), y, z + 4]], SH.edge, 0.9);
    p.pop();
    // sand heaped against its foot, and grains that hop on hover
    for (let z = 0; z <= 1.2; z += 0.4) p.disc(2.5, 2.5, 3 + z, 4.6 - z * 1.4, z < 1.2 ? 0.12 : 0.24, 0);
    if (h > 0.02) for (let i = 0; i < 5; i++) {
      const u = (t * 0.9 + i / 5) % 1, a = 0.3 + i * 1.25;
      p.dot([Math.cos(a) * (7 + u * 3), Math.sin(a) * (7 + u * 3), 3 + Math.sin(u * Math.PI) * 4], 0.9, h * Math.sin(u * Math.PI));
    }
  },
};
