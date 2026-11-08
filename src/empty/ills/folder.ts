// Empty folder: a file folder standing up. Hover and the front tips open on an empty folder; one sheet peeks up and settles back.
import { SH, type Illustration } from "../dots";

const W = 17, HB = 22, HF = 16, D = 2.6; // half width, back height, front height, gap between panels

export const folder: Illustration = {
  k: "folder", name: "File folder", title: "This folder is empty", body: "Files you add or move here will show up in this folder.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, -2, -12);
    p.shadow(0, 3, 30, 13, 0.11);
    p.rotate("z", -0.42);
    // back panel with its tab
    p.box(-W, -0.7, 0, W * 2, 0.7, HB);
    p.face([[-W + 1, 0, HB], [-W + 11, 0, HB], [-W + 9.5, 0, HB + 3.4], [-W + 2.5, 0, HB + 3.4]], SH.left, SH.edge, 0.55);
    p.face([[-W + 2.5, -0.7, HB + 3.4], [-W + 9.5, -0.7, HB + 3.4], [-W + 9.5, 0, HB + 3.4], [-W + 2.5, 0, HB + 3.4]], SH.top, SH.edge, 0.5);
    // the floor between the panels, dark
    p.face([[-W, 0, 0.2], [W, 0, 0.2], [W, D, 0.2], [-W, D, 0.2]], 0.03, SH.edge, 0.5);
    // a single sheet inside: peeks up as the front opens, then settles
    const bump = Math.sin(Math.min(1, h * 1.15) * Math.PI);
    const sz = -2 + bump * 7 + Math.sin(t * 2) * 0.15 * h;
    p.face([[-W + 4, 1.8, 1], [W - 4, 1.8, 1], [W - 4, 1.8, HB - 4 + sz], [-W + 4, 1.8, HB - 4 + sz]], 0.26, SH.edge, 0.5);
    p.line([[-W + 7, 1.85, HB - 7 + sz], [W - 9, 1.85, HB - 7 + sz]], 0.55, 0.7);
    // a soft gusset on the right end, stretching as the front opens
    const a = h * 0.5;
    const fy = D + Math.sin(a) * 6, fz = Math.cos(a) * 6;
    p.face([[W, 0, 0], [W, D, 0], [W, fy, fz], [W, 0, 6]], 0.05, SH.soft, 0.45);
    // the front panel, hinged on its bottom edge, tipping toward us
    p.push();
    p.rotate("x", -a, [0, D, 0]);
    p.face([[-W, D + 0.7, 0], [W, D + 0.7, 0], [W, D + 0.7, HF], [-W, D + 0.7, HF]], 0.09, SH.edge, 0.6);
    // label strip
    p.face([[-W + 3, D + 0.72, HF - 6], [-W + 13, D + 0.72, HF - 6], [-W + 13, D + 0.72, HF - 3], [-W + 3, D + 0.72, HF - 3]], 0.45, SH.edge, 0.5);
    p.pop();
  },
};
