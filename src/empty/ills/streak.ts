// No streak yet: a flame burning on a block. It flickers and throws sparks, with tomorrow's block waiting in dashes beside it.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop
const S = 9, H = 12; // half size and height of the block

// a point in the flame's plane, which faces the viewer: sx runs across the screen
const F = (sx: number, z: number): V3 => [sx * 0.707, -sx * 0.707, z];
// a flame outline: round at the bottom, drawn up to a swaying tip
function flame(z0: number, r: number, hgt: number, sway: number): V3[] {
  const side = (dir: number) => Array.from({ length: 13 }, (_, i) => {
    const v = i / 12;
    const w = v < 0.32 ? r * Math.sqrt(Math.max(0, 1 - Math.pow((0.32 - v) / 0.32, 2))) : r * Math.pow(1 - (v - 0.32) / 0.68, 1.3);
    return F(dir * w + sway * v * v, z0 + v * hgt);
  });
  return [...side(1), ...side(-1).reverse()];
}

export const streak: Illustration = {
  k: "streak", name: "Streak flame", title: "No streak yet", body: "Show up today and your streak will start counting.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = (k: number, ph = 0) => Math.sin((t / P) * Math.PI * 2 * k + ph);
    const hgt = 19 + w(2) * 1.6 + w(5, 1) * 0.8;
    const sway = w(3) * 1.6 + w(1, 2) * 0.6;
    p.translate(-2, 2, -12);
    p.shadow(0, 0, 26, 13, 0.11);
    // tomorrow's block, still to come
    const gx = 12, gy = -15, gs = 6, gh = 7;
    const c = (x: number, y: number, z: number): V3 => [gx + x, gy + y, z];
    p.guide([c(0, 0, gh), c(gs * 2, 0, gh), c(gs * 2, gs * 2, gh), c(0, gs * 2, gh), c(0, 0, gh)]);
    p.guide([c(gs * 2, gs * 2, 0), c(gs * 2, gs * 2, gh)]);
    p.guide([c(0, gs * 2, 0), c(gs * 2, gs * 2, 0), c(gs * 2, 0, 0)]);
    p.guide([c(0, gs * 2, 0), c(0, gs * 2, gh)]);
    p.guide([c(gs * 2, 0, 0), c(gs * 2, 0, gh)]);
    // the block, with a row of days on its front: five done, two to go
    p.box(-S, -S, 0, S * 2, S * 2, H, { top: 0.21, left: 0.12, right: SH.right });
    for (let i = 0; i < 7; i++) {
      const x = -7.6 + i * 2.25, done = i < 5;
      p.face([[x, S + 0.02, 3.6], [x + 1.5, S + 0.02, 3.6], [x + 1.5, S + 0.02, 5.6], [x, S + 0.02, 5.6]], done ? 0.24 : 0.03, SH.edge, 0.4);
    }
    p.line([[-7.6, S + 0.03, 8.4], [-1, S + 0.03, 8.4]], SH.edge, 0.7);
    // a scorched ring on top, then the flame: an outer flame and a bright core
    p.disc(0, 0, H + 0.02, 6.2, 0.035, 0);
    p.box(-0.5, -0.5, H, 1, 1, 2.2, { top: 0.2, left: 0.12 }); // the wick
    p.face(flame(H + 1, 5, hgt, sway), 0.32, SH.edge, 1);
    p.face(flame(H + 2.4, 2.4, hgt * 0.48, sway * 0.6), 0.035, SH.edge, 0.6);
    // sparks drifting up
    for (let i = 0; i < 4; i++) {
      const v = ((t / P) * 2 + i / 4) % 1;
      const sx = Math.sin(i * 2.1 + v * 4) * (2 + v * 3);
      p.dot(F(sx, H + hgt * 0.7 + v * 10), 0.65, Math.sin(v * Math.PI));
    }
  },
};
