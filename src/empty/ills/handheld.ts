// Handheld console: an upright handheld with a dark screen, a cross pad and two buttons. Hover and it lifts, the screen lights and a pixel heart appears.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 9.5, H = 31, Y = 1.6; // half width, height, half thickness
const HEART = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];

export const handheld: Illustration = {
  k: "handheld", name: "Handheld console", title: "No saved games", body: "Save a game and you can pick it up here where you left off.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h / 0.5)), on = h > 0.5;
    p.translate(1, -1, -17);
    p.shadow(0, 0, 24, 12, 0.11);
    p.rotate("z", -0.5);
    p.translate(0, 0, 2.5 * k);
    p.rotate("x", 0.24);
    p.rotate("y", h * Math.sin(t * 2) * 0.03, [0, 0, H / 2]);
    p.scale(1.1);
    p.box(-W, -Y, 0, W * 2, Y * 2, H, { top: 0.3, left: 0.2, right: 0.065, lw: 0.6 });
    const y = Y + 0.03;
    const rect = (x0: number, z0: number, x1: number, z1: number): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
    // the screen: a dark bezel, then the glass, dim until it wakes
    p.clear(rect(-7.6, 15.4, 7.6, 28.6));
    p.face(rect(-5.8, 16.8, 5.8, 27.2).map(([x, yy, z]) => [x, yy + 0.02, z] as V3), on ? 0.3 : 0.03, on ? SH.edge : 0, 0.5);
    if (on) {
      // a pixel heart, beating
      const s = 1.15 * (1 + 0.06 * Math.sin(t * 6)), x0 = -3.5 * s, z1 = 22 + 3 * s;
      HEART.forEach((row, r) => [...row].forEach((c, i) => {
        if (c === "1") p.clear([[x0 + i * s, y + 0.04, z1 - (r + 1) * s], [x0 + (i + 1) * s, y + 0.04, z1 - (r + 1) * s], [x0 + (i + 1) * s, y + 0.04, z1 - r * s], [x0 + i * s, y + 0.04, z1 - r * s]]);
      }));
    }
    // the cross pad
    p.clear(rect(-6.6, 7.4, -1.8, 9.2)); p.clear(rect(-5.1, 5.9, -3.3, 10.7));
    // two round buttons, one a step higher
    for (const [x, z] of [[2.6, 6.9], [6, 9.3]]) p.clear(Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [x + Math.cos(a) * 1.5, y, z + Math.sin(a) * 1.5] as V3; }));
    // start and select
    p.line([[-2.2, y, 2.9], [-0.6, y, 3.5]], SH.edge, 0.7); p.line([[0.8, y, 2.9], [2.4, y, 3.5]], SH.edge, 0.7);
  },
};
