// No focus sessions: a round tomato kitchen timer, a star of leaves and a stem on top and a ring of dial ticks round its middle. The dial keeps ticking round, one step at a time, with a little shiver at each click.
import { type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const N = 14; // ticks round the dial; the dial turns one tick per loop
const RX = 25, RY = 22; // the tomato's half width and half height on screen
const ZC = RY / 1.2247 + 0.5; // height of its centre, so it sits on the floor
/** a point in the plane that faces us, (u, v) screen units from the centre, v up */
const q = (u: number, v: number): V3 => [u * 0.5774 - v * 0.3333, -u * 0.5774 - v * 0.3333, ZC + v * 0.6667];
const oval = (cu: number, cv: number, a: number, b: number, n = 44): V3[] => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return q(cu + Math.cos(t) * a, cv + Math.sin(t) * b); });

export const pomodoro: Illustration = {
  k: "pomodoro", name: "Focus timer", title: "No focus sessions", body: "Start a focus session and your time will add up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // the dial holds, then clicks round one tick
    const turn = u < 0.7 ? 0 : u < 0.8 ? Math.sin(((u - 0.7) / 0.1) * Math.PI / 2) : 1;
    const shiver = u > 0.78 && u < 0.92 ? Math.sin((u - 0.78) * 90) * 0.5 * (1 - (u - 0.78) / 0.14) : 0;
    p.translate(0, 0, -18);
    p.shadow(0, 0, 26, 10, 0.12);
    p.translate(shiver * 0.6, -shiver * 0.6, 0);
    // one smooth ball: a shaded body, a big lit side up and left, a small shine
    p.face(oval(0, 0, RX, RY), 0.1, 0);
    p.face(oval(-3.2, 2.6, RX * 0.86, RY * 0.86), 0.22, 0);
    p.face(oval(-11, 10, 4.4, 3), 0.5, 0);
    // the dial: a ring of ticks above a seam round the middle, a pointer under the seam
    const E = 7, V0 = -2; // the seam's half height and its centre
    p.line(Array.from({ length: 25 }, (_, i) => { const a = Math.PI + 0.25 + (i / 24) * (Math.PI - 0.5); return q(Math.cos(a) * RX * 0.995, V0 + Math.sin(a) * E); }), 1, 0.6);
    const off = (turn / N) * Math.PI * 2;
    for (let i = 0; i < N; i++) {
      const a = Math.PI + ((i + 0.5) / N) * Math.PI * 2 + off, s = Math.sin(a);
      if (s > -0.3) continue;
      const x = Math.cos(a) * RX * 0.995, y = V0 + s * E, len = (i % 2 === 0 ? 5 : 2.6) * (0.4 + 0.6 * -s);
      p.line([q(x, y), q(x * 0.99, y + len)], 1, 0.75);
    }
    p.clear([q(-2, V0 - E - 5), q(2, V0 - E - 5), q(0, V0 - E - 1.2)]);
    // the leaves: a dark star lying on top, and a bright stem
    const TV = RY * 0.74;
    p.clear(Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2 + 0.3, r = i % 2 ? 2.4 : 10; return q(Math.cos(a) * r, TV + Math.sin(a) * r * 0.42); }));
    p.face([q(-1.4, TV), q(1.4, TV), q(1.6, TV + 5.5), q(-1.2, TV + 5.5)], 0.45, 0);
    p.face(oval(0.2, TV + 5.5, 1.5, 0.7, 12), 0.3, 0);
  },
};
