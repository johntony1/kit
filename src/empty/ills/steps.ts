// No steps yet: a short flight of stairs. Footprints climb it one tread at a time, pause at the top and start again.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const cl = (x: number) => Math.min(1, Math.max(0, x));
const N = 4, RUN = 7.4, RISE = 4.2, WID = 8; // treads, their depth, their height, half the stair's width

/** a footprint on a tread, toes toward -x: a sole and a heel, cut dark into the lit top */
function print(p: Pen, cx: number, cy: number, z: number, s: number) {
  const oval = (ox: number, rx: number, ry: number): V3[] => Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [cx + ox * s + Math.cos(a) * rx * s, cy + Math.sin(a) * ry * s, z] as V3; });
  p.clear(oval(-0.9, 2.1, 1.45));
  p.clear(oval(2.3, 1, 1.05));
}

export const steps: Illustration = {
  k: "steps", name: "Step counter", title: "No steps yet", body: "Take a walk with your phone or watch and your steps will be counted here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -10);
    p.scale(1.2);
    p.shadow(0, 0, 27, 13, 0.12);
    p.rotate("z", -0.1);
    const out = 1 - cl((ph - 0.88) / 0.1);
    // tallest tread first: it stands at the back
    for (let i = N - 1; i >= 0; i--) {
      const x0 = (N / 2 - i - 1) * RUN, hgt = (i + 1) * RISE;
      p.box(x0, -WID, 0, RUN, WID * 2, hgt, { top: 0.22, left: 0.12, right: 0.065, lw: 0.6 });
      const k = cl((ph - 0.08 - i * 0.17) / 0.07);
      // a soft press as the foot lands, then it stays
      const s = k * out * (1 + 0.18 * Math.sin(k * Math.PI));
      if (s > 0.05) print(p, x0 + RUN / 2 + 0.2, i % 2 ? -3.3 : 3.3, hgt + 0.02, s);
    }
    // a small marker hopping up ahead of the prints
    const f = Math.min(N - 0.001, Math.max(0, (ph - 0.08) / 0.17)), i = Math.floor(f), u = f - i;
    if (out > 0 && ph > 0.08) {
      const x = (N / 2 - i - 1) * RUN + RUN / 2 - (i < N - 1 ? u * RUN : 0);
      const z = (i + 1) * RISE + (i < N - 1 ? u * RISE : 0) + Math.sin(Math.min(1, u * 1.2) * Math.PI) * 4 + 7;
      p.dot([x, 0, z], 1.5 * out, 1);
    }
  },
};
