// Donut: a ring donut tipped toward us, iced on top with sprinkles. It turns slowly on the spot and bobs, the icing's drips going round with it.
import { type Illustration, type V3 } from "../dots";

const P = 4; // seconds per loop: a fifth of a turn, and the icing repeats five times round
const R = 10.5, r = 5.4, S = Math.SQRT1_2;
/** tip a point about the level axis that runs across the view, so the top leans toward us */
const tip = (v: V3, c: number, s: number): V3 => {
  const d = S * (v[1] - v[0]) * (1 - c);
  return [v[0] * c + S * v[2] * s - S * d, v[1] * c + S * v[2] * s + S * d, v[2] * c - S * (v[0] + v[1]) * s];
};
// sprinkles in one fifth of the ring: angle round the ring, angle round the tube, slant
const SPR: [number, number, number][] = [[0.15, 1.05, 1], [0.6, 1.95, -1], [0.95, 1.4, 1], [0.38, 1.5, -1]];

export const donut: Illustration = {
  k: "donut", name: "Donut", title: "No sweet things yet", body: "Treats you add to your order will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, spin = (ph * Math.PI * 2) / 5, bob = Math.sin(ph * Math.PI * 2);
    const tau = 0.62, c = Math.cos(tau), s = Math.sin(tau);
    p.translate(0, 0, -5);
    p.shadow(0, 0, 21 - bob, 10.5 - bob * 0.5, 0.11);
    p.translate(0, 0, 3 + bob * 1.2);
    p.scale(0.98);
    const at = (th: number, f: number, o = 0): V3 => { const q = R + (r + o) * Math.cos(f); return tip([q * Math.cos(th), q * Math.sin(th), (r + o) * Math.sin(f)], c, s); };
    const N = 64, M = 20, quads: { q: V3[]; d: number; f: number }[] = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const th = ((i + 0.5) / N) * Math.PI * 2, f = ((j + 0.5) / M) * Math.PI * 2;
      const n = tip([Math.cos(f) * Math.cos(th), Math.cos(f) * Math.sin(th), Math.sin(f)], c, s);
      if (n[0] + n[1] + n[2] <= 0.02) continue;
      const t0 = (i / N) * Math.PI * 2 - 0.004, t1 = ((i + 1) / N) * Math.PI * 2 + 0.004, f0 = (j / M) * Math.PI * 2, f1 = ((j + 1) / M) * Math.PI * 2;
      // icing over the top of the tube, its outer edge running in drips
      const iced = f > 0.2 + 0.42 * (0.5 + 0.5 * Math.sin(5 * (th - spin))) && f < 2.75 + 0.22 * Math.sin(5 * (th - spin) + 1.3);
      const fill = iced ? (n[2] > 0.5 ? 0.4 : n[1] > n[0] ? 0.32 : 0.22) : n[2] > 0.6 ? 0.17 : n[1] > n[0] ? 0.11 : 0.06;
      const m = at(th, f);
      quads.push({ q: [at(t0, f0), at(t1, f0), at(t1, f1), at(t0, f1)], d: m[0] + m[1] + m[2], f: fill });
    }
    quads.sort((a, b) => a.d - b.d).forEach((k) => p.face(k.q, k.f, 0));
    // sprinkles: short dark cuts in the icing, where it faces us
    for (let k = 0; k < 5; k++) for (const [dt, f, sl] of SPR) {
      const th = spin + (k * Math.PI * 2) / 5 + dt;
      const n = tip([Math.cos(f) * Math.cos(th), Math.cos(f) * Math.sin(th), Math.sin(f)], c, s);
      if (n[0] + n[1] + n[2] < 0.75) continue;
      p.line([at(th - 0.07, f - 0.13 * sl, 0.06), at(th + 0.07, f + 0.13 * sl, 0.06)], 1, 1);
    }
  },
};
