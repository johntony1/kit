// No tests yet: three test tubes standing in a rack, a drop in each. Hover and they fill to different levels and start to bubble.
import { SH, type Illustration } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const XS = [-8, 0, 8], LV = [20, 14.5, 23]; // tube centres and how high each fills
const R = 3, Z0 = 1.6, SB = 9, ST = 10.6, ZT = 27; // tube radius, floor of the tubes, shelf bottom and top, tube mouth

export const tests: Illustration = {
  k: "tests", name: "Test tubes", title: "No tests yet", body: "Add a test and run it. Passes and failures will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 26, 13, 0.12);
    p.rotate("z", -0.45);
    p.box(-14, -5, 0, 28, 10, Z0, { lw: 0.6 });
    p.box(-14, -5, Z0, 1.8, 10, SB - Z0);
    const lv = XS.map((_, i) => 4 + (LV[i] - 4) * ease(cl((h - i * 0.14) / 0.62)));
    XS.forEach((x, i) => {
      // glass below the shelf, then what is in it
      p.cylinder(x, 0, Z0, R, SB - Z0, { side: 0.045, top: 0, lw: 0.5 });
      p.cylinder(x, 0, Z0, R - 0.4, Math.min(lv[i], SB) - Z0, { side: 0.3, top: 0.4, edge: 0 });
    });
    p.box(12.2, -5, Z0, 1.8, 10, SB - Z0);
    // the shelf with its three holes, and the tubes standing up out of it
    p.box(-14, -5, SB, 28, 10, ST - SB, { lw: 0.6 });
    XS.forEach((x, i) => {
      p.disc(x, 0, ST + 0.03, R + 0.6, 0.02, 0);
      p.cylinder(x, 0, ST, R, ZT - ST, { side: 0.085, top: 0.02, lw: 0.75 });
      if (lv[i] > ST) p.cylinder(x, 0, ST, R - 0.4, lv[i] - ST, { side: 0.3, top: 0.42, edge: 0 });
      // bubbles rise out of the mouth once it has filled
      const k = cl((h - 0.6 - i * 0.1) / 0.3);
      if (k > 0) for (let j = 0; j < 2; j++) {
        const f = (t * 0.7 + i * 0.3 + j * 0.5) % 1;
        p.dot([x + Math.sin(f * 6 + i) * 0.9, 0, ZT + 1.5 + f * 6], (1 - 0.5 * f) * k, SH.glow * (1 - f * 0.6));
      }
    });
  },
};
