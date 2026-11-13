// This item is sold out: an empty shop shelf, three bare boards, with a sign hanging from the top board, a bold cross on it. The sign swings gently on its cords, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const W = 13, D = 6, TOP = 31; // half width, depth, height of the unit
const BOARDS = [2, 15, 28]; // the heights of the shelf boards

export const outofstock: Illustration = {
  k: "outofstock", name: "Out of stock", title: "This item is sold out", body: "We will let you know as soon as it is back. Turn on alerts to hear first.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -16);
    p.shadow(0, 1, 30, 13, 0.12);
    p.rotate("z", -Math.PI / 4); // face on: x runs across, y comes toward us
    // the back panel in shade, a lit top, then the two sides
    p.box(-W, -D / 2 - 1, 0, W * 2, 1, TOP, { top: 0.2, left: 0.025, right: 0.065, edge: 0 });
    p.box(-W - 2, -D / 2 - 1, 0, 2, D + 1, TOP, { top: 0.2, left: 0.13, right: 0.065, edge: 0 });
    // the empty boards: lit tops, bright fronts
    for (const z of BOARDS) p.box(-W, -D / 2, z, W * 2, D, 1.5, { top: 0.2, left: 0.26, right: 0.1, edge: 0 });
    p.box(W, -D / 2 - 1, 0, 2, D + 1, TOP, { top: 0.2, left: 0.13, right: 0.065, edge: 0 });
    // the sign hangs from the front of the top board, swinging toward us and back
    const a = Math.sin(u * Math.PI * 2) * 0.22;
    const hy = D / 2 + 0.4, hz = BOARDS[2];
    p.push();
    p.rotate("x", -Math.abs(a) * 0.4 + a * 0.15, [0, hy, hz]);
    p.rotate("y", a, [0, hy, hz]);
    const sz0 = hz - 10.6, sz1 = hz - 2.6;
    // two cords, as thin bright strokes
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.2; g.lineCap = "round";
      for (const s of [-1, 1]) {
        const [x0, y0] = p.pt([s * 3, hy, hz]), [x1, y1] = p.pt([s * 5.5, hy, sz1]);
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      }
    });
    // the sign: a thick lit plate with a bold cross
    p.box(-7, hy - 0.4, sz0, 14, 0.8, sz1 - sz0, { top: 0.22, left: 0.24, right: 0.1, edge: 0 });
    const y = hy + 0.43, cz = (sz0 + sz1) / 2;
    p.screen((g) => {
      g.strokeStyle = "#000"; g.lineWidth = 2.6; g.lineCap = "round";
      const q = (x: number, z: number) => p.pt([x, y, z] as V3);
      const [a0, a1] = [q(-2.6, cz - 2.6), q(2.6, cz + 2.6)], [b0, b1] = [q(2.6, cz - 2.6), q(-2.6, cz + 2.6)];
      g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.stroke();
    });
    
    p.pop();
  },
};
