// No shoes yet: a long shoe box with a shoe printed on its side. Hover and the lid lifts and tips back; tissue paper folds out of the empty box.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 14.5, D = 8, H = 10; // half length, half depth, height of the box
const LW = 15.3, LD = 8.8, LH = 3.4; // the lid
// a shoe from the side, in [along, up]
const SHOE: [number, number][] = [[-7, 0], [7.2, 0], [8, 1], [7.6, 2.2], [5.6, 3], [2.2, 3.6], [-0.4, 6.6], [-2.6, 7], [-3.6, 5.6], [-5.6, 5.4], [-6.8, 7], [-7.4, 6.4]];

export const shoebox: Illustration = {
  k: "shoebox", name: "Shoe box", title: "No shoes yet", body: "Shoes you add will be boxed up and kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    // the lid lifts past its rest and settles with a little bounce, then bobs while hovered
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const lift = 9 * back(h) + h * Math.sin(t * 3) * 0.6, tilt = h * (0.2 + Math.sin(t * 3 + 0.8) * 0.03);
    p.translate(0, 0, -10);
    p.shadow(0, 0, 30, 15, 0.12);
    // the box, open at the top: the dark inside shows once the lid is off
    p.box(-W, -D, 0, W * 2, D * 2, H, { open: true, left: 0.2, right: 0.065, lw: 0.6 });
    // the shoe on its long side: a dark shape on a pale sole
    const Y = D + 0.03;
    p.clear(SHOE.map(([u, v]) => [u, Y, 1.6 + v] as V3));
    p.face([[-7, Y + 0.02, 1.6], [7.4, Y + 0.02, 1.6], [7.6, Y + 0.02, 2.5], [-7, Y + 0.02, 2.5]], 0.2, 0);
    // tissue paper folding out over the rim
    const k = ease(Math.max(0, Math.min(1, (h - 0.3) / 0.5)));
    if (k > 0.02) {
      p.face([[-9, D, H], [3, D, H], [-1, D + 3.4 * k, H + 4.5 * k - 6 * k * k], [-7, D + 2.6 * k, H + 5.5 * k - 5 * k * k]], 0.42, SH.edge, 0.5);
      p.face([[W, -5, H], [W, 4, H], [W + 3 * k, 1, H + 5 * k - 5.5 * k * k]], 0.3, SH.edge, 0.5);
      p.face([[-4, -D, H], [8, -D, H], [5, -D + 1, H + 6 * k], [-1, -D + 1.5, H + 4.6 * k]], 0.34, SH.edge, 0.5);
    }
    // the lid
    p.push();
    p.translate(0, 0, lift);
    p.rotate("x", tilt, [0, -LD, H]);
    p.box(-LW, -LD, H - 0.6, LW * 2, LD * 2, LH, { top: 0.24, left: 0.13, right: 0.065, lw: 0.6 });
    p.pop();
  },
};
