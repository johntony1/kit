// Nothing to explore yet: a compass lying flat. Its needle hunts back and forth, then settles on north, and every so often it is nudged again.
import { SH, type Illustration, type V3 } from "../dots";

const P = 4.5; // seconds per loop
const R = 15, H = 4.2; // radius and height of the case
const RD = 11.8; // the dial inside the bezel

export const compass: Illustration = {
  k: "compass", name: "Compass", title: "Nothing to explore yet", body: "Follow a few topics and we will point you to things worth a look.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // the needle swings out, overshoots back and forth, and comes to rest
    const ang = 1.5 * Math.exp(-3.6 * u) * Math.sin(Math.PI * 2 * 2.2 * u);
    p.translate(0, 0, -2);
    p.scale(1.22);
    p.shadow(0, 0, 25, 13, 0.12);
    // the bail at north (toward the top right), then the case
    p.box(-1.8, -R - 3.2, 1, 3.6, 4, 2.4, { top: 0.26 });
    p.cylinder(0, 0, 0, R, H, { side: SH.left, top: 0.26, edge: 0 });
    // the case's foot, a cut round the side
    const front = (r: number, z: number, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
    p.line(front(R, 1.3), SH.edge, 0.6);
    // the dial, sunk in the bezel
    const Z = H + 0.04;
    p.disc(0, 0, Z, RD, 0.2, 0);
    p.line(Array.from({ length: 49 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * RD, Math.sin(a) * RD, Z + 0.02] as V3; }), SH.edge, 0.7);
    // ticks: long at the four points, short between
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, big = i % 4 === 0;
      if (i === 12) continue; // north gets a notch instead
      const r0 = big ? RD - 3 : RD - 1.6;
      p.line([[Math.cos(a) * r0, Math.sin(a) * r0, Z + 0.03], [Math.cos(a) * (RD - 0.6), Math.sin(a) * (RD - 0.6), Z + 0.03]], SH.edge, big ? 0.9 : 0.55);
    }
    // north: a little triangle cut out of the bezel
    p.clear([[-1.4, -R + 0.6, H + 0.06], [1.4, -R + 0.6, H + 0.06], [0, -RD - 0.2, H + 0.06]]);
    // the needle: the north half dark and solid, the south half an outline
    const c = Math.cos(ang), s = Math.sin(ang);
    const rot = (x: number, y: number): V3 => [x * c - y * s, x * s + y * c, Z + 0.06];
    const NL = RD - 2, W = 2.1;
    p.clear([rot(0, -NL), rot(W, 0), rot(-W, 0)]);
    p.line([rot(W, 0), rot(0, NL), rot(-W, 0)], SH.edge, 0.75);
    p.line([rot(0, 1.6), rot(0, NL - 3)], SH.edge, 0.55);
    // the pivot
    p.disc(0, 0, Z + 0.1, 1.5, 0.3, 0);
    p.line(Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [Math.cos(a) * 1.5, Math.sin(a) * 1.5, Z + 0.12] as V3; }), SH.edge, 0.55);
  },
};
