// Nothing shredded: a shredder head with a sheet feeding into its slot and strips hanging out below. The sheet keeps sliding in and the strips keep coming out, over and over.
import { SH, type Illustration } from "../dots";

const P = 2.4; // seconds per loop
const X = 15, D = 6, Z0 = 9, Z1 = 20; // half width, half depth, bottom and top of the head
const SW = 10, SY = D - 1; // half width of the sheet, its plane

export const shredder: Illustration = {
  k: "shredder", name: "Shredder", title: "Nothing shredded", body: "Files you shred are gone for good. Anything you shred will be logged here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t % P) / P;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 10, 0.1);
    p.rotate("z", -0.5);
    // the sheet above the head: a lit page with lines of text running down into the slot
    const top = Z1 + 13;
    p.face([[-SW, 0, Z1], [SW, 0, Z1], [SW, 0, top], [-SW, 0, top]], 0.26, SH.edge, 0.6);
    for (let i = 0; i < 4; i++) {
      const z = Z1 + 1 + ((i * 3.4 + 13.6 - ph * 3.4 * 1) % 13.6);
      if (z > top - 2) continue;
      p.line([[-SW + 3, 0.05, z], [SW - (i % 2 ? 7 : 3), 0.05, z]], SH.edge, 0.8);
    }
    // the strips below, hanging out of the head's underside: bright ribbons with dark gaps, their ends fluttering
    const n = 6, sw = (SW * 2) / n;
    for (let i = 0; i < n; i++) {
      const x0 = -SW + i * sw + 0.45, x1 = x0 + sw - 0.9;
      const len = 12 + 1.6 * Math.sin(ph * Math.PI * 2 + i * 1.3);
      const sway = 0.5 * Math.sin(ph * Math.PI * 2 + i);
      p.face([[x0, SY, Z0], [x1, SY, Z0], [x1 + sway, SY + 0.4, Z0 - len], [x0 + sway, SY + 0.4, Z0 - len + 0.8]], 0.26, SH.edge, 0.5);
      // a dash of text on the strip, running down with it
      const z = Z0 - 1.5 - ((ph * 3.4 + i * 1.1) % 3.4) * 2.2;
      if (z > Z0 - len + 1.5) p.line([[x0 + 0.3, SY + 0.1, z], [x1 - 0.3, SY + 0.1, z]], SH.edge, 0.8);
    }
    // the head: a wide box, the slot dark along its top, a button and a vent on its front
    p.box(-X, -D, Z0, X * 2, D * 2, Z1 - Z0, { top: 0.22, left: 0.12, right: 0.065, lw: 0.6 });
    p.clear([[-SW - 1, -0.8, Z1 + 0.03], [SW + 1, -0.8, Z1 + 0.03], [SW + 1, 0.8, Z1 + 0.03], [-SW - 1, 0.8, Z1 + 0.03]]);
    p.face([[-SW, 0, Z1 + 0.05], [SW, 0, Z1 + 0.05], [SW, 0, Z1 + 3], [-SW, 0, Z1 + 3]], 0.26, 0);
    const y = D + 0.05;
    p.line([[-X + 3, y, Z0 + 3.5], [X - 9, y, Z0 + 3.5]], SH.edge, 0.9);
    p.ringV("y", [X - 4.5, y + 0.02, Z0 + 5.5], 2, 0.34, SH.edge, 0.7);
    // the bin edge it sits on: a lip at the bottom of the head
    p.line([[-X, y + 0.02, Z0 + 1.2], [X, y + 0.02, Z0 + 1.2]], SH.edge, 0.6);
  },
};
