// No moves planned: three moving boxes, two on the floor with a gap between them and one on top, each taped and with a hand hole. Hover and the top box hops.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a moving box: lit walls, tape over the top and down the front, a dark hand hole
function carton(p: Pen, x: number, y: number, z: number, w: number, d: number, hh: number) {
  p.box(x, y, z, w, d, hh, { top: 0.3, left: 0.22, right: 0.065, edge: 0 });
  const cx = x + w / 2, cy = y + d / 2, X = x + w + 0.03, Y = y + d + 0.03, Z = z + hh;
  p.line([[x, Y, Z], [x + w, Y, Z], [X, y, Z]], SH.edge, 0.8);
  p.line([[x + w, Y, z], [x + w, Y, Z]], SH.edge, 0.6);
  p.line([[cx, y, Z + 0.03], [cx, y + d, Z + 0.03], [cx, Y, Z - hh * 0.3]], SH.edge, 1.2);
  // hand holes on both walls we see
  const hole = (f: (u: number, v: number) => V3) => p.clear([f(-2.6, -1), f(2.6, -1), f(2.6, 1), f(-2.6, 1)]);
  hole((u, v) => [cx + u, Y, z + hh * 0.42 + v]);
  hole((u, v) => [X, cy + u, z + hh * 0.62 + v]);
}

export const movers: Illustration = {
  k: "movers", name: "Moving boxes", title: "No moves planned", body: "Book a move and your boxes, dates and crew will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 32, 14, 0.12);
    p.rotate("z", -0.3);
    carton(p, -16.5, -7, 0, 14.5, 14, 12);
    carton(p, 2, -7, 0, 14.5, 14, 12);
    const k = Math.max(0, Math.min(1, (h - 0.1) / 0.7));
    p.translate(0, 0, 6 * Math.sin(k * Math.PI));
    p.rotate("z", 0.16 + 0.1 * Math.sin(k * Math.PI));
    carton(p, -7, -6.5, 12.9, 14, 13, 11);
  },
};
