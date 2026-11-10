// No courses: a graduation cap resting on two books. Hover and it is tossed up, spinning, its tassel swinging.
import { type Illustration, type Pen, type V3 } from "../dots";

const B = 6.5; // half size of the board
const ZB = 7; // top of the books

/** a closed book lying flat: covers on top, the spine on the left wall, page edges on the right */
function book(p: Pen, x: number, y: number, z: number, w: number, d: number, h: number, top: number) {
  p.box(x, y, z, w, d, h, { top, left: 0.12, right: 0.18 });
  // page edges on the right wall, a band on the spine
  for (let i = 1; i < 4; i++) p.line([[x + w + 0.02, y + 1, z + (h * i) / 4], [x + w + 0.02, y + d - 0.4, z + (h * i) / 4]], 1, 0.4);
  p.line([[x + 1.2, y + d + 0.02, z + h * 0.5], [x + w - 1.2, y + d + 0.02, z + h * 0.5]], 1, 0.7);
}

export const courses: Illustration = {
  k: "courses", name: "Graduation cap", title: "No courses yet", body: "Enroll in a course and your progress will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 22, 11, 0.12);
    // the books
    book(p, -10, -8, 0, 20, 15, 3.6, 0.2);
    p.push(); p.rotate("z", -0.18);
    book(p, -8.5, -6.5, 3.6, 17, 12.5, 3.4, 0.22);
    p.pop();

    // the toss: up and spinning, then hanging in the air with a soft bob
    const lift = h * 15 + h * Math.sin(t * 2.6) * 0.8;
    const spin = h * 1.4 + h * Math.sin(t * 1.3) * 0.15;
    const tilt = h * 0.22 * Math.sin(t * 2.6 + 0.6);
    const sw = h * Math.sin(t * 3.4) * 0.5; // the tassel's swing

    // where it rests: a dashed ring on the book, and the drop lines down to it
    if (h > 0.05) {
      p.guide(Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [Math.cos(a) * 4.6, Math.sin(a) * 4.6, ZB] as V3; }), true);
      for (const [x, y] of [[B, 0], [0, B], [-B, 0]]) {
        const a = spin + Math.atan2(y, x), r = Math.hypot(x, y) * Math.SQRT2 * 0.72;
        p.guide([[Math.cos(a) * r, Math.sin(a) * r, ZB + lift], [Math.cos(a) * r, Math.sin(a) * r, ZB]]);
      }
    }

    p.push();
    p.translate(0, 0, ZB + lift);
    p.rotate("x", tilt, [0, 0, 4]);
    p.rotate("z", spin);
    // the skull cap
    p.cylinder(0, 0, 0, 4.8, 5.4, { top: 0.2, side: 0.12 });
    // a band round the cap
    p.line(Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 12; return [Math.cos(a) * 4.8, Math.sin(a) * 4.8, 1.2] as V3; }), 1, 0.6);
    // the board: a thin square, lit on top
    p.box(-B, -B, 5.4, B * 2, B * 2, 0.9, { top: 0.22, left: 0.14, right: 0.08 });
    const zt = 6.32;
    // the button and the cord to the corner
    p.cylinder(0, 0, zt, 0.9, 0.5, { top: 0.22, side: 0.14 });
    const c: V3 = [B - 0.4, B - 0.4, zt];
    p.line([[0, 0, zt + 0.5], [c[0] * 0.5, c[1] * 0.55, zt + 0.1], c], 1, 0.75);
    // the tassel: hangs straight down off the corner, swinging a little
    p.push(); p.translate(sw * 1.2, -sw * 0.6, 0);
    p.box(c[0] - 0.35, c[1] - 0.35, zt - 3.6, 0.7, 0.7, 3.6, { top: 0.22, left: 0.2, right: 0.12 });
    p.box(c[0] - 0.95, c[1] - 0.95, zt - 7, 1.9, 1.9, 3.4, { top: 0.34, left: 0.34, right: 0.3 });
    for (let i = 0; i < 3; i++) p.line([[c[0] - 0.55 + i * 0.55, c[1] + 0.97, zt - 6.8], [c[0] - 0.55 + i * 0.55, c[1] + 0.97, zt - 4]], 1, 0.4);
    p.pop();
    p.pop();

    // a few sparkles at the top of the toss
    const k = Math.max(0, (h - 0.6) / 0.4);
    if (k > 0) for (let i = 0; i < 4; i++) {
      const u = (t * 0.7 + i / 4) % 1, a = i * 1.7 + 0.4;
      if (k * Math.sin(u * Math.PI) > 0.25) p.dot([Math.cos(a) * (9 + u * 3), Math.sin(a) * (9 + u * 3), ZB + lift + 2 + u * 6], 0.7, 1);
    }
  },
};
