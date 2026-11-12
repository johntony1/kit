// No cycle data: a round tracker with a ring of days and a drop in the middle. A marker steps round the ring, day by day, and the drop pulses.
import { SH, type Illustration, type V3 } from "../dots";

const P = 4.2, N = 28, RB = 14.6; // seconds per loop, days, the ring's radius
const A0 = (5 * Math.PI) / 4; // day one sits at the top of the picture
/** on the tracker's face: u to the right and v up, as we see them */
const on = (z: number) => (u: number, v: number): V3 => [(u - v) * 0.7071, -(u + v) * 0.7071, z];

export const cycle: Illustration = {
  k: "cycle", name: "Cycle tracker", title: "No cycle data", body: "Log the first day of your cycle and we will chart the days that follow.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, day = u * N;
    p.translate(0, 0, -3);
    p.shadow(0, 0, 36, 18, 0.11);
    // the tracker: a thick disc with a raised rim round a dark face
    p.cylinder(0, 0, 0, 20.5, 3.6, { side: 0.12, top: 0.2, lw: 0.6 });
    const z = 3.64;
    p.disc(0, 0, z, 18.4, 0.03, SH.edge);
    // the days: the first five bright, a paler window later on, the rest small
    for (let i = 0; i < N; i++) {
      const a = A0 + (i / N) * Math.PI * 2, x = Math.cos(a) * RB, y = Math.sin(a) * RB;
      const near = Math.max(0, 1 - Math.min(Math.abs(day - i), N - Math.abs(day - i)) / 1.6);
      if (i < 5) p.disc(x, y, z + 0.02, 1.45 + 0.4 * near, 0.32, SH.edge);
      else if (i >= 12 && i <= 16) p.disc(x, y, z + 0.02, 1.2 + 0.4 * near, 0.12, SH.soft);
      else p.dot([x, y, z + 0.02], 0.7 + 0.5 * near, 0.5 + 0.5 * near);
    }
    // the drop: pointed at the top, round below
    const f = on(z + 0.02), g = 1 + 0.07 * Math.sin(u * Math.PI * 4);
    const drop: V3[] = [f(0, 9.4 * g), ...Array.from({ length: 21 }, (_, i) => { const a = 0.62 - (i / 20) * (Math.PI + 1.24); return f(Math.cos(a) * 4.9 * g, (-2.4 + Math.sin(a) * 4.9 * 1.25) * g); })];
    p.face(drop, 0.32, SH.edge, 0.6);
    p.line(Array.from({ length: 6 }, (_, i) => { const a = Math.PI + 0.35 + i * 0.16; return f(Math.cos(a) * 2.9 * g, (-2.4 + Math.sin(a) * 2.9 * 1.25) * g); }), SH.edge, 0.8);
    // the marker: a peg that hops from day to day
    const d = Math.floor(day), q = day - d, s = q < 0.35 ? q / 0.35 : 1;
    const am = A0 + ((d + s * s * (3 - 2 * s) - 1) / N) * Math.PI * 2;
    p.cylinder(Math.cos(am) * RB, Math.sin(am) * RB, z + 1.6 * Math.sin(s * Math.PI), 2.3, 2.2, { side: 0.13, top: 0.36, lw: 0.55 });
  },
};
