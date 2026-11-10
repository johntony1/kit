// Empty folder: a file folder standing up, a lit front, a dense back and two sheets inside. Hover and the front tips open; a sheet peeks up and settles back.
import { SH, type Illustration } from "../dots";

const W = 17, HB = 22, HF = 16, D = 2.6; // half width, back height, front height, gap between panels

export const folder: Illustration = {
  k: "folder", name: "File folder", title: "This folder is empty", body: "Files you add or move here will show up in this folder.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, -1, -13);
    p.shadow(0, 3, 30, 13, 0.11);
    p.rotate("z", -0.42);
    // back panel: its inside in shade (sparse), a lit edge on top, and its tab
    p.box(-W, -0.9, 0, W * 2, 0.9, HB, { top: 0.22, left: 0.07, right: 0.065, edge: 0 });
    p.face([[-W + 1, 0, HB - 0.2], [-W + 11, 0, HB - 0.2], [-W + 9.5, 0, HB + 3.4], [-W + 2.5, 0, HB + 3.4]], 0.12, 0);
    p.face([[-W + 2.5, -0.9, HB + 3.4], [-W + 9.5, -0.9, HB + 3.4], [-W + 9.5, 0, HB + 3.4], [-W + 2.5, 0, HB + 3.4]], 0.22, 0);
    p.line([[-W + 1, 0.03, HB], [W, 0.03, HB]], SH.edge, 0.5); // where the tab meets the panel
    // two sheets of paper inside: solid lit, cut apart, the front one peeking up as the folder opens
    const bump = Math.sin(Math.min(1, h * 1.15) * Math.PI);
    const sz = bump * 6 + Math.sin(t * 2) * 0.2 * h;
    const sheet = (y: number, x0: number, x1: number, top: number) => {
      p.face([[x0, y, 1], [x1, y, 1], [x1, y, top], [x0, y, top]], 0.26, 0);
      p.line([[x0, y + 0.03, 1], [x0, y + 0.03, top], [x1, y + 0.03, top], [x1, y + 0.03, 1]], SH.edge, 0.6);
      for (let i = 0; i < 2; i++) p.line([[x0 + 2.5, y + 0.04, top - 2.2 - i * 2], [x1 - (i ? 9 : 4), y + 0.04, top - 2.2 - i * 2]], SH.edge, 0.7);
    };
    sheet(0.9, -W + 3, W - 5, HB - 1.5);
    sheet(1.8, -W + 5, W - 3, HB - 3.5 + sz);
    // a soft gusset on the right end, stretching as the front opens: sparse
    const a = h * 0.5;
    const fy = D + Math.sin(a) * 7, fz = Math.cos(a) * 7;
    p.face([[W, 0, 0], [W, D, 0], [W, fy, fz], [W, 0, 7]], SH.right, 0);
    // the front panel, hinged on its bottom edge, tipping toward us: a solid lit face with a label cut into it
    p.push();
    p.rotate("x", -a, [0, D, 0]);
    p.box(-W, D, 0, W * 2, 0.9, HF, { top: 0.26, left: 0.2, right: 0.065, edge: 0 });
    p.line([[-W, D + 0.03, HF], [W, D + 0.03, HF]], SH.edge, 0.55);
    const yf = D + 0.93;
    p.line([[-W + 3, yf, HF - 7], [-W + 13, yf, HF - 7], [-W + 13, yf, HF - 3], [-W + 3, yf, HF - 3], [-W + 3, yf, HF - 7]], SH.edge, 0.7);
    p.line([[-W + 5, yf, HF - 5], [-W + 11, yf, HF - 5]], SH.edge, 0.7);
    p.pop();
  },
};
