// This folder is empty: a folder standing with its front panel tipped open on a dark, empty inside. Hover and the front swings wider and settles with a little bounce.
import { SH, type Illustration } from "../dots";

const W = 16, HB = 24, HF = 16, D = 5; // half width, back height, front height, depth of the floor

export const folderopen: Illustration = {
  k: "folderopen", name: "Open folder", title: "This folder is empty", body: "Nothing is in here yet. Drop files in or create one to get started.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 3, 30, 13, 0.11);
    p.rotate("z", -0.5);
    // the back panel with its tab
    p.box(-W, -1.2, 0, W * 2, 1.2, HB, { top: 0.26, left: 0.14, right: 0.065, edge: SH.edge });
    p.box(-W + 1.5, -1.2, HB - 0.5, 12, 1.2, 4.6, { top: 0.26, left: 0.2, right: 0.065, edge: SH.edge });
    // the inside, dark: the floor and the shade on the back panel's lower part
    p.clear([[-W, 0.05, 0], [W, 0.05, 0], [W, 0.05, HF - 7], [-W, 0.05, HF - 7]]);
    p.clear([[-W, 0, 0.1], [W, 0, 0.1], [W, D, 0.1], [-W, D, 0.1]]);
    // the front panel, hinged at the front of the floor, tipping toward us
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const a = 0.18 + 0.26 * back(Math.min(1, h)) + (h > 0.9 ? Math.sin(t * 2.4) * 0.015 : 0);
    // the right gusset between the panels, sparse
    p.face([[W, 0, 0], [W, D, 0], [W, D + Math.sin(a) * HF * 0.75, Math.cos(a) * HF * 0.75], [W, 0, HF - 2.5]], SH.right, SH.edge, 0.5);
    p.push();
    p.rotate("x", -a, [0, D, 0]);
    p.box(-W, D, 0, W * 2, 1.2, HF, { top: 0.3, left: 0.24, right: 0.065, edge: SH.edge });
    p.line([[-W + 3, D + 1.25, HF - 4], [-W + 12, D + 1.25, HF - 4]], SH.edge, 0.9);
    p.pop();
  },
};
