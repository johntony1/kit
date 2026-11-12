// Flag: a flag on a pole, standing on a round foot. The cloth waves in a steady breeze.
import { type Illustration, type V3 } from "../dots";

const P = 2.4, YAW = -0.42; // seconds per loop; turned to face us
const X0 = -11, L = 23, Z0 = 19.5, Z1 = 35, N = 18; // the pole, the cloth's length, its bottom and top, its strips

export const flag: Illustration = {
  k: "flag", name: "Flag", title: "Nothing flagged", body: "Items you flag for later will be kept here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -18);
    p.shadow(-4, 0, 22, 10, 0.12);
    p.rotate("z", YAW);
    p.cylinder(X0, 0, 0, 6, 1.6, { side: 0.12, top: 0.22 });
    // the cloth: strips that swing in and out, more toward the free end, shaded by which way they turn
    const wave = (s: number) => Math.pow(s, 0.8) * 2.6 * Math.sin((s * 1.5 - u) * Math.PI * 2);
    const dip = (s: number) => s * 1.2 + Math.pow(s, 0.8) * 0.7 * Math.sin((s * 1.5 - u) * Math.PI * 2 + 1);
    const at = (s: number, z: number): V3 => [X0 + 0.9 + s * L, wave(s), z - dip(s)];
    for (let i = 0; i < N; i++) {
      const a = i / N, b = (i + 1) / N, slope = (wave(b) - wave(a)) / (L / N);
      p.face([at(a, Z0), at(b, Z0), at(b, Z1), at(a, Z1)], Math.min(0.26, Math.max(0.06, 0.15 + slope * 0.16)), 0);
    }
    // the pole in front of the cloth's inner edge, a ball on top
    p.cylinder(X0, 0, 1.6, 1.1, 35.4, { side: 0.2, top: 0.26, edge: 0 });
    p.dot([X0, 0, 38.6], 1.7, 1);
  },
};
