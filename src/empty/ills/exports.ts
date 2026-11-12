// No exports yet: a page standing up with a bold arrow leaving it to the right. Hover and the arrow shoots out, leaving a short trail.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 10, H = 26, T = 0.5, F = 5;
const cl = (x: number) => Math.max(0, Math.min(1, x));

function sheet(p: Pen, fill: number) {
  p.face([[W, -T, 0], [W, T, 0], [W, T, H - F], [W, -T, H - F]], SH.right, SH.edge, 0.5);
  p.face([[-W, -T, H], [W - F, -T, H], [W - F, T, H], [-W, T, H]], SH.top, SH.edge, 0.5);
  p.face([[-W, T, 0], [W, T, 0], [W, T, H - F], [W - F, T, H], [-W, T, H]], fill, SH.edge, 0.55);
  p.face([[W - F, T + 0.03, H], [W, T + 0.03, H - F], [W - F, T + 0.03, H - F]], 0.36, SH.edge, 0.5);
}
const arrow = (x0: number, x1: number, y: number, zc: number): V3[] => {
  const s = 2.3, hh = 5.6, hd = 6.5;
  return [[x0, y, zc - s], [x1 - hd, y, zc - s], [x1 - hd, y, zc - hh], [x1, y, zc], [x1 - hd, y, zc + hh], [x1 - hd, y, zc + s], [x0, y, zc + s]];
};

export const exports: Illustration = {
  k: "exports", name: "Export", title: "No exports yet", body: "Export your data and the finished files will be listed here to download.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const g = cl(h / 0.7);
    const k = g < 0.7 ? easeInOut(g / 0.7) * 1.12 : 1.12 - 0.12 * easeInOut((g - 0.7) / 0.3);
    p.translate(-3, 0, -13);
    p.shadow(3, 2, 28, 12, 0.11);
    p.rotate("z", -0.42);
    p.push();
    p.translate(-6, -2, 0);
    sheet(p, 0.2);
    const fy = T + 0.03;
    p.line([[-7, fy, 22], [-1, fy, 22]], SH.edge, 0.95);
    for (let i = 0; i < 2; i++) p.line([[-7, fy, 18.6 - i * 2.8], [i ? 2 : 6, fy, 18.6 - i * 2.8]], SH.edge, 0.65);
    p.line([[-7, fy, 4], [3, fy, 4]], SH.edge, 0.65);
    p.pop();
    // the arrow, with a little depth, and its trail
    const x0 = -4 + k * 7, x1 = 15 + k * 7, y = 2.6, zc = 10.5;
    for (let i = 0; i < 3; i++) {
      const s = cl(k * 1.6 - i * 0.3);
      if (s > 0) p.dot([x0 - 2.6 - i * 2.8, y, zc], 0.75, s);
    }
    p.face(arrow(x0, x1, y - 1.6, zc), SH.right, SH.edge, 0.5);
    p.face(arrow(x0, x1, y, zc), 0.34, SH.edge, 0.7);
  },
};
