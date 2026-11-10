// No receipts: a little receipt printer. A slip prints up out of its slot line by line, then tears off and floats away.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const P = 5;
const L = 16; // the full length of a slip
const PW = 5.2; // the slip's half width
const Y = -0.6; // the plane the slip rises in

export const printer: Illustration = {
  k: "printer", name: "Receipt printer", title: "No receipts yet", body: "Receipts for your sales will print here as soon as they come in.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 28, 13, 0.12);
    // the body: a lit top, a dense front, a sparse side
    const H = 8;
    p.box(-9, -7, 0, 18, 14, H, { top: 0.2, left: 0.12, right: 0.065 });
    p.line([[-9, 7, H], [9, 7, H], [9, -7, H]], SH.edge, 0.5);
    // the front: a lit panel with a button and a light
    p.face([[-6.5, 7.02, 2], [6.5, 7.02, 2], [6.5, 7.02, 6], [-6.5, 7.02, 6]], 0.2, SH.edge, 0.55);
    p.line([[-6.5, 7.04, 2], [6.5, 7.04, 2], [6.5, 7.04, 6], [-6.5, 7.04, 6], [-6.5, 7.04, 2]], SH.edge, 0.6);
    p.line([[-4.6, 7.05, 4], [-1, 7.05, 4]], SH.edge, 0.9);
    p.face([[2.4, 7.05, 3], [4.8, 7.05, 3], [4.8, 7.05, 5], [2.4, 7.05, 5]], 0.34, SH.edge, 0.55);
    if (!p.ink) p.line([[2.4, 7.07, 3], [4.8, 7.07, 3], [4.8, 7.07, 5], [2.4, 7.07, 5], [2.4, 7.07, 3]], SH.edge, 0.6);
    // the paper roll under a hinged lid: a seam across the top
    p.line([[-9, 2.6, H + 0.02], [9, 2.6, H + 0.02]], SH.edge, 0.55);
    // the slot
    const Z = H + 0.03;
    p.face([[-PW - 1, Y - 0.9, Z], [PW + 1, Y - 0.9, Z], [PW + 1, Y + 0.9, Z], [-PW - 1, Y + 0.9, Z]], 0.02, SH.edge, 0.55);
    // a dashed ghost of the whole slip
    p.guide([[-PW, Y, Z], [-PW, Y, Z + L], [PW, Y, Z + L], [PW, Y, Z]]);
    // the slip: prints up, holds, then tears off and floats away while the next one starts
    const len = u < 0.62 ? easeInOut(u / 0.62) * L : L;
    const fly = u < 0.8 ? 0 : easeInOut((u - 0.8) / 0.2);
    const slip = (z0: number, n: number, k: number) => {
      if (n < 0.3) return;
      const top = z0 + n;
      const zig: V3[] = [];
      for (let i = 0; i <= 10; i++) zig.push([PW - (i / 10) * PW * 2, Y, top + (i % 2 ? 0.7 : 0)]);
      p.face([[-PW, Y, z0], [PW, Y, z0], ...zig], 0.2, SH.edge, 0.55);
      // lines of print, fixed to the paper as it rises
      const rows: [number, number, number, number][] = [[2, -3.6, 3.6, 1.1], [4, -3.6, 1, 0.6], [5.6, -3.6, 2.4, 0.6], [7.2, -3.6, 0.4, 0.6], [8.8, -3.6, 2, 0.6], [11, -3.6, 3.6, 0.5]];
      for (const [d, x0, x1, w] of rows) {
        const z = top - d;
        if (z > z0 + 0.5) p.line([[x0, Y + 0.03, z], [x1, Y + 0.03, z]], SH.edge, w);
      }
      // the total, the slip's one bright mark
      const zt = top - 13.4;
      if (zt > z0 + 0.4 && k > 0) p.face([[0.6, Y + 0.04, zt], [3.8, Y + 0.04, zt], [3.8, Y + 0.04, zt + 1.1], [0.6, Y + 0.04, zt + 1.1]], 0.34, SH.edge, 0.5);
    };
    if (fly > 0) {
      // the torn slip lifts, turns and shrinks away
      p.push();
      p.translate(0, 0, fly * 10);
      p.rotate("z", fly * 0.6, [0, Y, Z + L / 2]);
      p.scale(1 - fly, [0, Y, Z + L / 2]);
      slip(Z, L, 1);
      p.pop();
    } else slip(Z, len, 1);
    // the next slip just peeking out
    if (fly > 0) slip(Z, fly * 1.6, 0);
  },
};
