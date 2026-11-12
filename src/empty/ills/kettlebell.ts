// No routines yet: a kettlebell sitting on the floor. Hover and it swings up off the ground, tips a little and hangs there, its shadow shrinking.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const C: V3 = [0, 0, 10.4]; // the ball's centre
const ZC = 19.6, RB = 6.6, TH = 2.8, BW = 1.9; // the handle: its arch centre, radius, thickness, half width
const circ = (r: number, du = 0, dv = 0): V3[] => Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2, u = Math.cos(a) * r + du, v = Math.sin(a) * r + dv;
  return [C[0] + 0.5774 * u, C[1] - 0.5774 * u, C[2] + v] as V3;
});
const arc = (a: number, r: number, y: number): V3 => [Math.cos(a) * r, y, ZC + Math.sin(a) * r];

export const kettlebell: Illustration = {
  k: "kettlebell", name: "Kettlebell", title: "No routines yet", body: "Build a routine from your favourite exercises and it will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    // up with a little overshoot, then hanging
    const s = clamp(h * 1.1), e = 1 - Math.exp(-5 * s) * Math.cos(5.5 * s);
    const lift = 8 * e + h * Math.sin(t * 2.2) * 0.6;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 23 - 6 * e, 11 - 3 * e, 0.12);
    p.translate(0, 0, lift);
    // a flat foot, then the ball, lit from the upper left
    p.cylinder(0, 0, 0, 6.4, 1.6, { side: 0.065, top: 0.065, edge: 0 });
    const R = 12.2;
    p.face(circ(R), SH.right, 0);
    p.face(circ(R * 0.86, -R * 0.07, R * 0.08), 0.13, 0);
    p.face(circ(R * 0.52, -R * 0.26, R * 0.3), 0.24, 0);
    const o = circ(R);
    p.line([...o, o[0]], SH.edge, 0.6);
    // a round plate on its front
    const pl = circ(4.4, 1.6, -2.6);
    p.line([...pl, pl[0]], SH.edge, 0.8);
    p.dot([C[0] + 0.5774 * 1.6, C[1] - 0.5774 * 1.6, C[2] - 2.6], 1.1, 0);
    // the handle: a thick arch over the top, tipping as it swings
    p.rotate("z", -0.5);
    p.rotate("y", 0.16 * e * Math.cos(t * 2.2) * h, [0, 0, C[2]]);
    const N = 26, a0 = -0.3, a1 = Math.PI + 0.3;
    for (let i = N - 1; i >= 0; i--) {
      const b0 = a0 + ((a1 - a0) * i) / N, b1 = a0 + ((a1 - a0) * (i + 1)) / N, m = (b0 + b1) / 2;
      const out = 0.5 * Math.cos(m) + Math.sin(m) > 0;
      const r = out ? RB + TH / 2 : RB - TH / 2;
      p.face([arc(b0, r, -BW), arc(b0, r, BW), arc(b1, r, BW), arc(b1, r, -BW)], out ? 0.1 + 0.14 * Math.max(0, Math.sin(m)) : 0.06, 0);
    }
    const side: V3[] = [];
    for (let i = 0; i <= N; i++) side.push(arc(a0 + ((a1 - a0) * i) / N, RB + TH / 2, BW));
    for (let i = N; i >= 0; i--) side.push(arc(a0 + ((a1 - a0) * i) / N, RB - TH / 2, BW));
    p.face(side, 0.12, SH.edge, 0.55);
  },
};
