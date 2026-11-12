// Storage is empty: a storage unit with four drive bays. Hover and one bay slides out, an empty tray, and its light comes on.
import { easeInOut, SH, type Illustration } from "../dots";

const X = 12.5, Y = 8, Z = 23;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const OUT = 1; // the bay that opens

export const storage: Illustration = {
  k: "storage", name: "Storage", title: "Storage is empty", body: "Nothing is stored yet. Files you upload will take up space here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(cl(h / 0.75));
    p.translate(2, -2, -12);
    p.shadow(-1, 3, 27, 13, 0.12);
    p.rotate("z", -0.3);
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.2, left: 0.1, right: 0.065 });
    // vents on the top
    for (let i = 0; i < 4; i++) p.line([[-6 + i * 4, -Y + 3, Z + 0.03], [-6 + i * 4, Y - 3, Z + 0.03]], SH.edge, 0.6);
    const fy = Y + 0.03, bw = 4.6, z0 = 3, z1 = Z - 3;
    const bay = (i: number, y: number, lit: number) => {
      const x = -X + 2 + i * (bw + 1.1);
      p.face([[x, y, z0], [x + bw, y, z0], [x + bw, y, z1], [x, y, z1]], 0.24, SH.edge, 0.5);
      p.line([[x + bw / 2, y + 0.02, z1 - 2.2], [x + bw / 2, y + 0.02, z1 - 7.5]], SH.edge, 0.85); // handle
      p.dot([x + bw / 2, y + 0.02, z0 + 2.2], 0.6 + lit * 0.7, 0.55 + lit * 0.45);
      return x;
    };
    for (let i = 0; i < 4; i++) if (i !== OUT) bay(i, fy, 0);
    // the open bay: a dark slot, and the tray drawn out of it
    const x = -X + 2 + OUT * (bw + 1.1), d = k * 11;
    p.clear([[x, fy, z0], [x + bw, fy, z0], [x + bw, fy, z1], [x, fy, z1]]);
    if (d > 0.2) {
      p.face([[x, Y, z1], [x + bw, Y, z1], [x + bw, Y + d, z1], [x, Y + d, z1]], 0.04, SH.edge, 0.5); // empty inside
      p.line([[x, Y, z0 + 1.4], [x, Y + d, z0 + 1.4]], 0.4, 0.4);
      p.face([[x + bw, Y, z0], [x + bw, Y + d, z0], [x + bw, Y + d, z1], [x + bw, Y, z1]], SH.right, SH.edge, 0.5);
    }
    const blink = h > 0.8 ? 0.75 + 0.25 * Math.sin(t * 5) : k;
    bay(OUT, Y + d + 0.03, blink);
  },
};
