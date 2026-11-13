// Nothing mixed yet: a mixing desk seen three quarter, its sloped top carrying three big faders and two big knobs. Hover and the faders slide to new levels one after another and the knobs turn.
import { type Illustration, type Pen } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 16, D = 12, ZF = 5, ZB = 13; // half width, half depth, front and back height of the slope
const zs = (y: number) => ZF + ((D - y) / (2 * D)) * (ZB - ZF); // the slope's height at y
const CH = [-9, 0, 9];
const Y0 = 9.5, Y1 = -2.5; // where the slots run, front to back
const REST = [0.15, 0.15, 0.15], UP = [0.85, 0.5, 0.7];

function knob(p: Pen, x: number, y: number, a: number) {
  const z = zs(y);
  p.cylinder(x, y, z - 0.6, 3.8, 6, { side: 0.2, top: 0.45, edge: 0 });
  const zt = z + 5.45;
  p.line([[x, y, zt], [x + Math.cos(a) * 3.2, y + Math.sin(a) * 3.2, zt]], 0, 1.2);
}

export const mixer: Illustration = {
  k: "mixer", name: "Mixer", title: "Nothing mixed yet", body: "Add some tracks and start your first mix. It will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 30, 14, 0.12);
    p.rotate("z", -0.5);
    // the body: a wedge, low at the front, high at the back, its edges cut
    p.face([[-W, -D, ZB], [W, -D, ZB], [W, D, ZF], [-W, D, ZF]], 0.075, 0); // the sloped top, kept dim so the bright caps and knobs stand out on it
    p.face([[-W, D, 0], [W, D, 0], [W, D, ZF], [-W, D, ZF]], 0.14, 0); // the front
    p.face([[W, -D, 0], [W, D, 0], [W, D, ZF], [W, -D, ZB]], 0.045, 0); // the end
    p.line([[-W, D + 0.03, ZF - 0.03], [W, D + 0.03, ZF - 0.03], [W + 0.03, -D, ZB - 0.03]], 0, 0.6);
    // a cut across the slope between the faders and the knobs
    p.line([[-W + 1, -5, zs(-5) + 0.03], [W - 1, -5, zs(-5) + 0.03]], 0, 0.7);
    // the two knobs at the back
    [-6, 6].forEach((x, i) => {
      const k = ease(Math.max(0, Math.min(1, h * 1.5 - 0.2 - i * 0.2)));
      knob(p, x, -8.5, -2.4 + k * (1.6 + i * 0.8) + h * 0.06 * Math.sin(t * 3 + i));
    });
    CH.forEach((x, i) => {
      // the slot, cut down the slope
      p.face([[x - 0.9, Y1, zs(Y1) + 0.03], [x + 0.9, Y1, zs(Y1) + 0.03], [x + 0.9, Y0, zs(Y0) + 0.03], [x - 0.9, Y0, zs(Y0) + 0.03]], 0.015, 0);
      // the fader cap, sliding back along its slot
      const k = ease(Math.max(0, Math.min(1, h * 1.6 - i * 0.22)));
      const v = REST[i] + (UP[i] - REST[i]) * k + h * 0.02 * Math.sin(t * 3.4 + i * 1.7);
      const y = Y0 + (Y1 - Y0) * v;
      const zc = zs(y) + 0.06;
      p.box(x - 3, y - 1.8, zc - 0.4, 6, 3.6, 4, { top: 0.45, left: 0.3, right: 0.2, edge: 0 });
      p.line([[x - 3, y, zc + 3.63], [x + 3, y, zc + 3.63]], 0, 0.9);
    });
  },
};
