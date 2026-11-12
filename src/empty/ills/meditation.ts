// No meditations yet: a small stack of balanced stones. The top stone floats up and settles with each slow breath while rings spread over the floor.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 4; // seconds per breath
/** a smooth stone: a flattened ball of floor radius r and half height c, centred on `at` */
function stone(p: Pen, at: V3, r: number, c: number) {
  const a = 1.2247 * r, b = Math.sqrt(c * c + 0.5 * r * r);
  const el = (ra: number, rb: number, dv: number): V3[] => Array.from({ length: 40 }, (_, i) => {
    const q = (i / 40) * Math.PI * 2, u = Math.cos(q) * ra, v = Math.sin(q) * rb + dv;
    return [at[0] + 0.5774 * u, at[1] - 0.5774 * u, at[2] + v] as V3;
  });
  const out = el(a, b, 0);
  p.face(out, 0.05, 0);
  p.face(el(a * 0.93, 0.707 * r * 0.93, c * 0.62), 0.17, 0); // the top, seen from above
  p.face(el(a * 0.6, 0.707 * r * 0.55, c * 0.85), 0.3, 0); // where the light lands
  p.line([...out, out[0]], SH.edge, 0.6);
}

const STONES: [number, number, number][] = [[12, 4.4, 0], [8.4, 3.8, 2], [5.8, 3.2, -1.3], [3.6, 2.5, 0.7]]; // radius, half height, sideways shift

export const meditation: Illustration = {
  k: "meditation", name: "Meditation", title: "No meditations yet", body: "Start a session and your quiet minutes will add up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, s = 0.5 - 0.5 * Math.cos(u * Math.PI * 2);
    p.translate(0, 0, -15);
    p.scale(1.05);
    // rings that spread and fade with each breath
    for (const o of [0, 0.5]) {
      const v = (u + o) % 1;
      p.disc(0, 0, 0, 13 + v * 13, 0, Math.sin(v * Math.PI) * 0.6);
    }
    p.shadow(0, 0, 22, 10, 0.12);
    let z = 0;
    STONES.forEach(([r, c, dx], i) => {
      const last = i === STONES.length - 1;
      const lift = last ? 1 + 4 * s : i === 2 ? 0.6 * s : 0;
      stone(p, [dx, -dx, z + c * 0.92 + lift], r, c);
      z += c * 1.84 + (i === 2 ? 0.6 * s : 0);
    });
  },
};
