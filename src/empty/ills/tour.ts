// No tours booked: a tour guide's pennant on a tall pole. The pennant ripples in the wind, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const S = Math.SQRT1_2;
const L = 19, Z0 = 19.5, Z1 = 31.5; // pennant length, and where it meets the pole

export const tour: Illustration = {
  k: "tour", name: "Tour flag", title: "No tours booked", body: "Book a guided tour and your meeting point and time will show here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(-6.5, 6.5, -18);
    p.shadow(1.5, -1.5, 17, 8, 0.11);
    // the foot: two stacked discs
    p.cylinder(0, 0, 0, 6.2, 1.5, { side: 0.12, top: 0.2, lw: 0.6 });
    p.cylinder(0, 0, 1.5, 3.4, 1.5, { side: 0.14, top: 0.24, lw: 0.6 });
    // the pole and its finial
    p.cylinder(0, 0, 3, 0.75, 30.5, { side: 0.3, top: 0.3 });
    p.dot([0, 0, 34.6], 1.5, 1);
    // the pennant: runs to the right of the pole and ripples toward and away from us
    const w = (s: number) => 3.4 * s * Math.sin(Math.PI * 2 * (1.25 * s - ph));
    const at = (s: number, z: number): V3 => { const f = w(s); return [0.75 + (s * L + f) * S, (-s * L + f) * S, z + f * 0.25]; };
    const mid = (Z0 + Z1) / 2, half = (Z1 - Z0) / 2, N = 16;
    const top = (s: number) => mid + half * (1 - s), bot = (s: number) => mid - half * (1 - s);
    for (let i = 0; i < N; i++) {
      const a = i / N, b = (i + 1) / N;
      p.face([at(a, bot(a)), at(b, bot(b)), at(b, top(b)), at(a, top(a))], w(b) - w(a) > 0 ? 0.3 : 0.14, 0);
    }
    const edge = (f: (s: number) => number) => Array.from({ length: N + 1 }, (_, i) => at(i / N, f(i / N)));
    p.line([...edge(top), ...edge(bot).reverse()], SH.edge, 0.65);
    // a stripe near the hoist and a round mark
    p.line([at(0.12, bot(0.12)), at(0.12, top(0.12))], SH.edge, 0.55);
    p.dot(at(0.36, mid), 1.9, 1);
    p.dot(at(0.36, mid), 0.8, 0);
  },
};
