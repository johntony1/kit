// Sale sign: a pavement A board with a big percent mark on it. Rays flash out from the top twice a loop and the board brightens with them.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const W = 10, D = 7, H = 28;
type P2 = [number, number];
// a board with two feet, in [x, z]
const BOARD: P2[] = [[-W, 0], [-W + 3, 0], [-W + 3, 3], [W - 3, 3], [W - 3, 0], [W, 0], [W, H], [-W, H]];

export const salesign: Illustration = {
  k: "salesign", name: "Sale sign", title: "No sales on now", body: "When a sale starts, the offers will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    const pulse = Math.pow(Math.sin(Math.PI * ((ph * 2) % 1)), 2);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 23, 11, 0.1);
    p.rotate("z", -0.5);
    // the two boards lean together at the top; o steps a point back through the board's thickness
    const front = (x: number, z: number, o = 0): V3 => [x, D - (D - 0.6) * (z / H) - o, z];
    const back = (x: number, z: number): V3 => [x, -D + (D - 0.6) * (z / H), z];
    p.face(BOARD.map(([x, z]) => back(x, z)), 0.05, SH.edge, 0.5);
    // the brace between them, seen through the open side
    p.face([[W, -D * 0.62, 10], [W, D * 0.62, 10], [W, D * 0.55, 12], [W, -D * 0.55, 12]], 0.1, 0);
    p.face([front(W, 0, 1.2), front(W, 0), front(W, H), front(W, H, 1.2)], SH.right, 0);
    p.face(BOARD.map(([x, z]) => front(x, z)), 0.2 + 0.1 * pulse, SH.edge, 0.6);
    const f = (x: number, z: number) => front(x, z, -0.04);
    // a frame, then the percent mark
    p.line([f(-W + 1.8, 5), f(W - 1.8, 5), f(W - 1.8, H - 1.8), f(-W + 1.8, H - 1.8), f(-W + 1.8, 5)], SH.edge, 0.5);
    const ring = (cx: number, cz: number) => Array.from({ length: 19 }, (_, i) => { const a = (i / 18) * Math.PI * 2; return f(cx + Math.cos(a) * 2.2, cz + Math.sin(a) * 2.6); });
    p.line(ring(-3.4, 20.2), SH.edge, 1.2);
    p.line(ring(3.4, 10.6), SH.edge, 1.2);
    p.line([f(4.6, 22.4), f(-4.6, 8.4)], SH.edge, 1.3);
    // the rays: a fan of short strokes over the top
    const [cx, cy] = p.pt([0, 0.6, H - 6]);
    p.screen((c) => {
      const n = Math.round(255 * Math.min(1, pulse * 1.4));
      c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.2; c.lineCap = "round";
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI * (0.14 + 0.18 * i), r0 = 15 + 2 * pulse, r1 = r0 + 1.5 + 3.5 * pulse;
        c.beginPath(); c.moveTo(cx + Math.cos(a) * r0 * 1.15, cy + Math.sin(a) * r0 * 0.8); c.lineTo(cx + Math.cos(a) * r1 * 1.15, cy + Math.sin(a) * r1 * 0.8); c.stroke();
      }
    });
  },
};
