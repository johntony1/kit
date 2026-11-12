// Nothing imported yet: an open box with a down arrow on its front. A page drops in from above, the box takes it with a small bounce, and the next page follows.
import { easeInOut, SH, type Illustration } from "../dots";

const X = 12, Y = 9, Z = 14;
const P = 3;
const cl = (x: number) => Math.max(0, Math.min(1, x));

export const imports: Illustration = {
  k: "imports", name: "Import", title: "Nothing imported yet", body: "Bring in a file from another tool and your data will appear here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // the page: fades in high up, falls, lands, then fades away inside the box
    const fall = cl((u - 0.12) / 0.43);
    const pz = 1.2 + 30 * (1 - fall * fall);
    const a = u < 0.12 ? u / 0.12 : u > 0.72 ? 1 - cl((u - 0.72) / 0.2) : 1;
    // the box squashes a touch as the page lands
    const b = cl((u - 0.55) / 0.2), sq = Math.sin(b * Math.PI) * (1 - b) * 1.6;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 27, 13, 0.12);
    p.rotate("z", -0.3);
    const top = Z - sq;
    // inside of the box
    p.face([[-X, -Y, top], [X, -Y, top], [X, Y, top], [-X, Y, top]], 0.035, SH.edge, 0.55);
    p.face([[-X, -Y, 2], [X, -Y, 2], [X, -Y, top], [-X, -Y, top]], 0.09, SH.edge, 0.5);
    p.face([[-X, -Y, 2], [-X, Y, 2], [-X, Y, top], [-X, -Y, top]], 0.06, SH.edge, 0.5);
    // the page
    if (a > 0.04) {
      const w = 7.5, hh = 11.5, e = SH.edge * a;
      p.box(-w, -0.4, pz, w * 2, 0.8, hh, { top: 0.3 * a, left: 0.26 * a, right: 0.1 * a, edge: e });
      p.line([[-w + 2, 0.45, pz + hh - 2.6], [1, 0.45, pz + hh - 2.6]], e, 0.9);
      for (let i = 0; i < 2; i++) p.line([[-w + 2, 0.45, pz + hh - 5.2 - i * 2.4], [w - 2 - i * 4, 0.45, pz + hh - 5.2 - i * 2.4]], e, 0.6);
    }
    // the front walls, over the page
    p.face([[-X, Y, 0], [X, Y, 0], [X, Y, top], [-X, Y, top]], 0.2, SH.edge, 0.55);
    p.face([[X, -Y, 0], [X, Y, 0], [X, Y, top], [X, -Y, top]], SH.right, SH.edge, 0.55);
    // the arrow on the front, nudging down as the page falls
    const fy = Y + 0.03, n = easeInOut(Math.sin(fall * Math.PI)) * 1.2, zc = top / 2 + 0.6 - n;
    p.line([[0, fy, zc + 4], [0, fy, zc - 3.6]], SH.edge, 1.15);
    p.line([[-3.2, fy, zc - 0.6], [0, fy, zc - 3.8], [3.2, fy, zc - 0.6]], SH.edge, 1.15);
  },
};
