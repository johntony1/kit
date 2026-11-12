// All cleaned up: a broom standing by a little pile of dust. Hover and it sweeps the dust away, leaving the floor sparkling.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
// a pop: grows past full size, then settles
const pop = (b: number) => (b <= 0 ? 0 : b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease(Math.min(1, (b - 0.65) / 0.35)));
// a four point sparkle, flat to the screen
const spark = (p: Pen, at: V3, r: number) => {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, q = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); });
};
export const broom: Illustration = {
  k: "broom", name: "Broom", title: "All cleaned up", body: "Everything has been cleared. New items will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const gone = ease(clamp(h * 1.5));
    p.translate(2, -2, -19);
    p.shadow(0, 1, 19, 9.5, 0.11);
    // the dust: a small pile at rest, pushed off and gone on hover
    const dust: [number, number, number][] = [[-12, 9, 1.5], [-14, 6.5, 1.1], [-10.5, 6, 1.2], [-13.5, 10.5, 0.8], [-9.5, 9.5, 0.9], [-12, 7.5, 1.3]];
    if (gone < 0.98) for (const [x, y, r] of dust) p.dot([x - 9 * gone, y + 9 * gone, 0.4], r * (1 - gone), 0.85);
    p.push();
    p.rotate("z", -0.5);
    // one sweep out and back, then a gentle sway while hovered
    p.rotate("y", 0.1 + Math.sin(clamp(h * 1.25) * Math.PI * 2) * 0.2 + h * Math.sin(t * 2.4) * 0.03, [0, 0, 40]);
    // the bristles: a flared block, cut into strands
    p.face([[5, -1.8, 10], [5, 1.8, 10], [8.5, 2.7, 0], [8.5, -2.7, 0]], 0.07, SH.edge, 0.5);
    p.face([[-5, 1.8, 10], [5, 1.8, 10], [8.5, 2.7, 0], [-8.5, 2.7, 0]], 0.2, SH.edge, 0.6);
    for (let i = -3; i <= 3; i++) p.line([[i * 1.25, 1.87, 9.5], [i * 2.15, 2.72, 0.7]], SH.edge, 0.5);
    // the binding and the handle
    p.box(-5.5, -2.2, 10, 11, 4.4, 3, { top: 0.24, left: 0.34, right: 0.12 });
    p.box(-0.95, -0.95, 13, 1.9, 1.9, 27, { top: 0.3, left: 0.3, right: 0.14 });
    p.pop();
    // the clean floor
    const s1 = pop(clamp((h - 0.55) / 0.4)), s2 = pop(clamp((h - 0.7) / 0.3));
    spark(p, [-13, 9, 2], 3.2 * s1 * (1 + 0.12 * Math.sin(t * 4)));
    spark(p, [-17, 4, 6], 2 * s2 * (1 + 0.12 * Math.sin(t * 4 + 2)));
  },
};
