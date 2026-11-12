// Standing order: a coin on its edge inside two arrows that chase each other round it. The arrows turn a quarter at a time, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const CZ = 18, R = 7.4; // the coin: height of its centre, radius
const R0 = 12.4, R1 = 15; // the arrows: inner and outer radius
const MARK: [number, number][] = [[2.4, 2.5], [1.3, 3.6], [-1.3, 3.6], [-2.4, 2.5], [-2.4, 1.1], [-1.3, 0.1], [1.3, -0.1], [2.4, -1.1], [2.4, -2.5], [1.3, -3.6], [-1.3, -3.6], [-2.4, -2.5]];

export const recurring: Illustration = {
  k: "recurring", name: "Standing order", title: "No recurring payments", body: "Set up a payment that repeats and it will go out on schedule from here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, q = u * 2;
    const turn = -(Math.PI / 2) * (Math.floor(q) + ease(q - Math.floor(q)));
    p.translate(0, 0, -17);
    p.shadow(0, 0, 17, 7, 0.12);
    p.rotate("z", -0.52); // turned to face us
    const at = (a: number, r: number, y = 0): V3 => [Math.cos(a) * r, y, CZ + Math.sin(a) * r];
    // the two arrows: a band each, ending in a head
    for (const i of [0, 1]) {
      const a0 = turn + i * Math.PI + 0.5, a1 = a0 + 2, band: V3[] = [];
      for (let s = 0; s <= 20; s++) band.push(at(a0 + ((a1 - a0) * s) / 20, R1));
      for (let s = 20; s >= 0; s--) band.push(at(a0 + ((a1 - a0) * s) / 20, R0));
      p.face(band, 0.3, 0);
      p.face([at(a1 - 0.02, R0 - 2.6), at(a1 + 0.56, (R0 + R1) / 2), at(a1 - 0.02, R1 + 2.6)], 0.3, 0);
    }
    // the coin: a milled rim, a lit face and a mark struck in it; it tips a little with each turn
    const z = CZ + Math.sin(u * Math.PI * 4) * 0.5;
    for (let i = 0; i <= 5; i++) p.ringV("y", [0, -1.2 + i * 0.4, z], R, i ? SH.right : 0.12, 0);
    p.ringV("y", [0, 1, z], R, 0.22, 0);
    p.line(MARK.map(([a, b]) => [a * 0.95, 1.06, z + b * 0.95] as V3), SH.edge, 1.1);
    p.line([[0, 1.06, z + 4.7], [0, 1.06, z - 4.7]], SH.edge, 0.8);
  },
};
