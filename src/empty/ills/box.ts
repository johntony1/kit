// No products yet: a cardboard box. Hover and the four flaps fold open on an empty box; a puff of dust rises.
import { SH, type Illustration, type V3 } from "../dots";

const W = 10.5, D = 8.5, H = 13; // half width (x), half depth (y), height

export const box: Illustration = {
  k: "box", name: "Empty box", title: "No products yet", body: "Add your first product and it will show up here, ready to sell.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 26, 13, 0.12);
    // body with an open top: the dark inside shows once the flaps lift
    p.box(-W, -D, 0, W * 2, D * 2, H, { open: true, left: 0.13, right: 0.07 });
    const flap = (pts: V3[], fill: number) => p.face(pts, fill, SH.edge, 0.55);
    const a = (k: number) => Math.min(1, Math.max(0, h * 1.25 - k)) ; // a little stagger per flap
    // back flap on the x side (hinged at x=-W), folds up and back
    p.push(); p.rotate("y", -a(0.1) * 2.2, [-W, 0, H]);
    flap([[-W, -D, H], [0, -D, H], [0, D, H], [-W, D, H]], 0.16);
    p.pop();
    // front flap on the x side (hinged at x=+W), folds out over the right wall
    p.push(); p.rotate("y", a(0.15) * 3.45, [W, 0, H]);
    flap([[0, -D, H], [W, -D, H], [W, D, H], [0, D, H]], 0.1);
    p.pop();
    // back flap on the y side (hinged at y=-D)
    p.push(); p.rotate("x", a(0) * 2.15, [0, -D, H]);
    flap([[-W, -D, H], [W, -D, H], [W, 0, H], [-W, 0, H]], 0.22);
    p.pop();
    // front flap on the y side (hinged at y=+D), folds down over the left wall
    p.push(); p.rotate("x", -a(0.05) * 3.5, [0, D, H]);
    flap([[-W, 0, H], [W, 0, H], [W, D, H], [-W, D, H]], 0.16);
    // tape across the seam, on this flap
    p.face([[-2, 0.02, H + 0.02], [2, 0.02, H + 0.02], [2, D, H + 0.02], [-2, D, H + 0.02]], 0.42, 0.7, 0.4);
    p.pop();
    // the box's label on the left wall
    p.face([[-7, D + 0.02, 3], [-1.5, D + 0.02, 3], [-1.5, D + 0.02, 7], [-7, D + 0.02, 7]], 0.3, 0.8, 0.45);
    p.line([[-6, D + 0.05, 5.7], [-2.5, D + 0.05, 5.7]], 0.9, 0.5);
    p.line([[-6, D + 0.05, 4.3], [-4, D + 0.05, 4.3]], 0.9, 0.5);
    // dust: a soft puff out of the empty box
    const k = Math.max(0, (h - 0.55) / 0.45);
    if (k > 0) for (let i = 0; i < 9; i++) {
      const u = (t * 0.4 + i / 9) % 1;
      const ang = i * 2.4;
      const r = 1 + u * 6;
      p.dot([Math.cos(ang) * r, Math.sin(ang) * r * 0.7, H + 1 + u * 11], 1.15 - 0.5 * u, k * Math.min(1, Math.sin(u * Math.PI) * 1.6));
    }
  },
};
