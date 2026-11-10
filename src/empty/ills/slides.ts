// No presentations yet: a screen on a tripod. The slides flip through a title, a chart and a picture, over and over.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const PERIOD = 6;
const W = 13, Z0 = 13, Z1 = 29, FY = 0.7; // half width, bottom and top of the screen, its front face

const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const norm = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** a square rod from a to b: its sides that face us, lit on top, dense on the left, sparse on the right */
function rod(p: Pen, a: V3, b: V3, r: number) {
  const d = norm(add(b, a, -1)), u = norm(cross(d, Math.abs(d[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1])), v = cross(u, d);
  const corner = (o: V3, i: number) => { const t = (i / 4) * Math.PI * 2 + Math.PI / 4; return add(add(o, u, Math.cos(t) * r), v, Math.sin(t) * r); };
  for (let i = 0; i < 4; i++) {
    const t = ((i + 0.5) / 4) * Math.PI * 2 + Math.PI / 4, n = add(add([0, 0, 0], u, Math.cos(t)), v, Math.sin(t));
    if (n[0] + n[1] + n[2] <= 0) continue;
    const f = n[2] > 0.5 ? 0.22 : n[1] >= n[0] ? 0.13 : 0.065;
    p.face([corner(a, i), corner(a, i + 1), corner(b, i + 1), corner(b, i)], f, SH.edge, 0.45);
  }
}

/** a mark on the screen's face: x across, z up, squashed toward the middle by s */
const on = (x: number, z: number, s: number): V3 => [x, FY + 0.03, (Z0 + Z1) / 2 + (z - (Z0 + Z1) / 2) * s];

export const slides: Illustration = {
  k: "slides", name: "Presentation screen", title: "No presentations yet", body: "Create a deck and your slides will be lined up here, ready to present.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD, n = Math.floor(u * 3), f = u * 3 - n;
    // each slide holds, then flips shut and the next one opens
    const s = f < 0.1 ? easeInOut(f / 0.1) : f > 0.9 ? easeInOut((1 - f) / 0.1) : 1;
    p.translate(0, 0, -15);
    p.shadow(-6, 0, 17, 9, 0.12);
    p.shadow(6, 0, 17, 9, 0.12);
    // the tripod: a pole and three legs
    const hub: V3 = [0, -1.6, 7];
    rod(p, [-7.5, -7.5, 0], hub, 0.75);
    rod(p, [7.5, -6, 0], hub, 0.75);
    rod(p, [0, -1.6, 0.2], [0, -1.6, Z0 + 1], 0.85);
    // the screen: a lit face, a thin case and a roller on top
    p.box(-W, -FY, Z0, W * 2, FY * 2, Z1 - Z0, { top: 0.2, left: 0.22, right: 0.065 });
    p.box(-W - 1, -1.4, Z1, W * 2 + 2, 2.8, 2, { top: 0.24, left: 0.12, right: 0.065 });
    // a pull tab under the screen
    p.box(-1.4, -0.4, Z0 - 1.6, 2.8, 0.8, 1.6, { top: 0.2, left: 0.14, right: 0.07 });
    // the front leg, drawn last: it stands in front of the screen
    rod(p, [0, 7, 0], hub, 0.75);

    // the slide
    const Lz = (z: number) => on(0, z, s)[2];
    if (s > 0.08) {
      if (n === 0) {
        // a title slide
        p.face([on(-9, 25, s), on(6, 25, s), on(6, 22.5, s), on(-9, 22.5, s)], 0.34, SH.edge, 0.55);
        p.line([on(-9, 19.5, s), on(8, 19.5, s)], SH.edge, 0.7);
        p.line([on(-9, 17, s), on(3, 17, s)], SH.edge, 0.7);
      } else if (n === 1) {
        // a bar chart, one bar picked out
        const hs = [4, 7, 5.5, 10];
        hs.forEach((hh, i) => {
          const x = -8 + i * 4.6;
          p.face([on(x, 16, s), on(x + 3, 16, s), on(x + 3, 16 + hh, s), on(x, 16 + hh, s)], i === 3 ? 0.34 : p.ink ? 0.13 : 0, SH.edge, 0.55);
        });
        p.line([[-9.5, FY + 0.03, Lz(15.4)], [9.5, FY + 0.03, Lz(15.4)]], SH.edge, 0.6);
      } else {
        // a picture: hills and a sun
        p.face([on(-9, 26, s), on(9, 26, s), on(9, 16, s), on(-9, 16, s)], p.ink ? 0.13 : 0, SH.edge, 0.6);
        p.line([on(-7.5, 17.5, s), on(-3, 22.5, s), on(0.5, 19, s), on(3, 21, s), on(7.5, 17.5, s)], SH.edge, 0.7);
        p.face([on(3, 24.6, s), on(5.4, 24.6, s), on(5.4, 22.6, s), on(3, 22.6, s)], 0.34, SH.edge, 0.5);
      }
    }
    // which slide this is: three pips along the bottom, the current one long and lit
    for (let i = 0; i < 3; i++) {
      const x = -3.4 + i * 2.6, w = i === n ? 2 : 0.8;
      p.face([on(x, 14.6, 1), on(x + w, 14.6, 1), on(x + w, 13.9, 1), on(x, 13.9, 1)], i === n ? 0.34 : 0.02, i === n ? SH.edge : 0, 0.4);
    }
    // dashed drops from the screen's corners to the floor
    p.guide([[-W, FY, Z0], [-W, FY, 0]]);
    p.guide([[W, FY, Z0], [W, FY, 0]]);
  },
};
