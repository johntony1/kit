// No forms yet: a clipboard. A sheet floats down onto the board and slides under the clip, which lifts and snaps shut.
import { easeInOut, SH, type Illustration, type Pen } from "../dots";

const PERIOD = 4.4;
const BX = 11, BY = 13.5, T = 1.4; // board half width, half depth, thickness
const SX = 8.6, SY = 10.6; // sheet half sizes

function clip(p: Pen, a: number) {
  // a dark cast shadow in front of the jaw, so the clip stands off the lit sheet in the dot styles
  if (!p.ink) p.face([[-5.6, -BY, T + 0.3], [6.4, -BY, T + 0.3], [6.4, -BY + 7.8, T + 0.3], [-5.6, -BY + 7.8, T + 0.3]], 0.02, 0);
  // the clip's base, fixed to the board, then the jaw hinged at its back edge
  p.box(-6, -BY - 0.6, T, 12, 3.4, 2, { top: 0.2, left: 0.12, right: 0.065 });
  p.push(); p.rotate("x", a, [0, -BY + 0.4, T + 2]);
  p.box(-5, -BY + 0.4, T + 2, 10, 6, 2.2, { top: 0.34, left: 0.14, right: 0.07 });
  // the ring hole and a ridge across the jaw
  p.disc(0, -BY + 2.6, T + 4.25, 1.3, 0.02, SH.edge);
  p.line([[-4, -BY + 5, T + 4.25], [4, -BY + 5, T + 4.25]], SH.edge, 0.7);
  p.pop();
}

export const clipboard: Illustration = {
  k: "clipboard", name: "Clipboard", title: "No forms yet", body: "Create a form and every response will be collected here.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    // the sheet's path: down from the air, then in under the clip; the same way back at the end
    const seg = (a: number, b: number) => easeInOut(Math.max(0, Math.min(1, (u - a) / (b - a))));
    const down = seg(0.04, 0.3) - seg(0.86, 0.98), slide = seg(0.32, 0.5) - seg(0.74, 0.86);
    const z = T + 0.05 + (1 - down) * 13, dy = 6 * (1 - slide);
    // the jaw opens while the sheet goes under it
    const a = Math.sin(Math.max(0, Math.min(1, (u - 0.3) / 0.24)) * Math.PI) * 0.55 + Math.sin(Math.max(0, Math.min(1, (u - 0.72) / 0.16)) * Math.PI) * 0.55;

    p.translate(0, 2, -12);
    p.shadow(0, 0.5, 28, 14, 0.12);
    // a stand behind, then the board leaning back on it
    p.box(-6, -BY * 0.86 - 1.5, 0, 12, 1.5, 9.6, { top: 0.2, left: 0.12, right: 0.065 });
    p.rotate("x", -0.42, [0, BY, 0]);
    // the board
    p.box(-BX, -BY, 0, BX * 2, BY * 2, T, { top: 0.065, left: 0.14, right: 0.07 });
    // a hanging hole near the top of the board
    p.disc(7.5, -BY + 2.6, T + 0.02, 1, 0.02, SH.edge);
    // where the sheet lands
    if (dy > 0.3 || z > T + 0.3) p.guide([[-SX, -SY, T + 0.05], [SX, -SY, T + 0.05], [SX, SY, T + 0.05], [-SX, SY, T + 0.05], [-SX, -SY, T + 0.05]], true);

    const sheet = () => {
      const y0 = -SY + dy, y1 = SY + dy;
      // dashed drops from the corners while it floats
      if (z > T + 1) for (const [x, y] of [[-SX, y1], [SX, y1], [SX, y0]]) p.guide([[x, y, z], [x, y, T + 0.05]]);
      p.face([[-SX, y0, z], [SX, y0, z], [SX, y1, z], [-SX, y1, z]], 0.22, SH.edge, 0.55);
      // three rows: a tick box and a line each
      for (let i = 0; i < 3; i++) {
        const yy = y0 + 7 + i * 4.6;
        p.face([[-6.4, yy - 1.2, z + 0.02], [-4, yy - 1.2, z + 0.02], [-4, yy + 1.2, z + 0.02], [-6.4, yy + 1.2, z + 0.02]], 0.02, SH.edge, 0.5);
        p.line([[-2.4, yy, z + 0.03], [i === 1 ? 2.6 : 5.6, yy, z + 0.03]], SH.edge, 0.65);
      }
    };
    if (z > T + 3.5) { clip(p, a); sheet(); }
    else { sheet(); clip(p, a); }
  },
};
