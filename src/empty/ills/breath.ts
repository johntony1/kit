// Take a breath: a soft orb with two halos. It swells as you breathe in and sinks back as you breathe out, the halos following and motes drifting with it.
import { SH, type Illustration, type V3 } from "../dots";

const P = 4; // seconds per breath
const C: V3 = [0, 0, 18];
/** a circle flat to the viewer round C */
const circ = (r: number, du = 0, dv = 0): V3[] => Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2, u = Math.cos(a) * r + du, v = Math.sin(a) * r + dv;
  return [C[0] + 0.5774 * u, C[1] - 0.5774 * u, C[2] + v] as V3;
});
const band = (r: number, w: number): V3[] => { const o = circ(r + w), i = circ(r); return [...o, o[0], i[0], ...i.slice().reverse()]; };

export const breath: Illustration = {
  k: "breath", name: "Breathing", title: "Take a breath", body: "Follow the circle. Breathe in as it grows and out as it settles.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const s = 0.5 - 0.5 * Math.cos(u * Math.PI * 2), s2 = 0.5 - 0.5 * Math.cos((u - 0.07) * Math.PI * 2), s3 = 0.5 - 0.5 * Math.cos((u - 0.14) * Math.PI * 2);
    p.translate(0, 0, -17);
    p.shadow(0, 0, 15 + 8 * s, 8, 0.12);
    p.disc(0, 0, 0, 12 + 8 * s, 0, 0.5);
    const R = 8 + 4.6 * s;
    // the halos: the far one fainter, both a beat behind the orb
    p.face(band(R + 6.4 + 4.4 * s3, 1.3), 0.065, 0);
    p.face(band(R + 2.6 + 2 * s2, 1.2), 0.12, 0);
    // the orb: shaded like a ball, lit from the upper left
    p.face(circ(R), SH.right, 0);
    p.face(circ(R * 0.86, -R * 0.07, R * 0.08), 0.13, 0);
    p.face(circ(R * 0.56, -R * 0.22, R * 0.25), 0.24, 0);
    const o = circ(R);
    p.line([...o, o[0]], SH.edge, 0.6);
    // motes: drawn in on the in breath, let go on the out breath
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.5, d = 24 - 6.5 * s - (i % 2) * 2.5;
      p.dot([C[0] + 0.5774 * Math.cos(a) * d, C[1] - 0.5774 * Math.cos(a) * d, C[2] + Math.sin(a) * d], 0.6 + 0.3 * s, 0.35 + 0.6 * s);
    }
  },
};
