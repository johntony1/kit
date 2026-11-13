// Nothing printed yet: a thick stack of paper, its sheet edges cut along the sides. Hover and the top sheet lifts off and drifts up with a gentle curl.
import { SH, type Illustration, type V3 } from "../dots";

const X = 11, Y = 15, H = 12; // half width, half depth, height of the stack
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

export const paperstack: Illustration = {
  k: "paperstack", name: "Paper stack", title: "Nothing printed yet", body: "Print a document and a copy of it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 32, 16, 0.12);
    p.rotate("z", -0.12);
    // the stack: lit top, sheet edges cut along both sides
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.24, left: 0.13, right: 0.075, edge: 0 });
    for (let i = 1; i < 6; i++) {
      const z = i * 2;
      p.line([[-X, Y + 0.03, z], [X, Y + 0.03, z], [X + 0.03, -Y, z]], SH.edge, 0.5);
    }
    // the top sheet: lifts, drifts back and to the left, its far end curling up
    const k = ease(h / 0.8);
    const bob = h > 0.9 ? Math.sin(t * 2.2) * 0.5 : 0;
    const z0 = H + 0.05 + k * 6 + bob, dx = -k * 3, dy = -k * 2, curl = k * 3.5;
    const sheet: V3[] = [[-X + dx, -Y + dy, z0 + curl], [X + dx, -Y + dy, z0 + curl], [X + dx, Y + dy, z0], [-X + dx, Y + dy, z0]];
    if (k > 0.02) {
      p.face([[-X + dx, Y + dy, z0 - 0.5], [X + dx, Y + dy, z0 - 0.5], [X + dx, Y + dy, z0], [-X + dx, Y + dy, z0]], 0.13, 0);
      p.face(sheet, 0.3, SH.edge, 0.6);
    } else p.line([[-X, Y + 0.03, H - 0.5], [X, Y + 0.03, H - 0.5]], SH.edge, 0.5);
    // a few printed lines on it, cut in
    for (let i = 0; i < 3; i++) {
      const v = -Y + 6 + i * 3.4, f = (Y - v) / (2 * Y);
      p.line([[-X + 4 + dx, v + dy, z0 + curl * f + 0.05], [(i === 2 ? 2 : X - 4) + dx, v + dy, z0 + curl * f + 0.05]], SH.edge, 0.8);
    }
  },
};
