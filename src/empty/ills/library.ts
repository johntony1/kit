// Your library is empty: a shelf of books. Hover and one book slides out and tips forward, as if picked.
import { type Illustration } from "../dots";

const X0 = -15, X1 = 15; // the case, inside to inside
const YB = -5, YF = 4; // back and front of the shelf
const ZS = 1.6; // top of the shelf board
// the books: width, height, spine shade
const BOOKS: [number, number, number][] = [
  [2.6, 11, 0.2], [2, 9.6, 0.13], [2.8, 12, 0.2], [2.3, 10.4, 0.13], [2.6, 11.6, 0.2], [2.1, 9.8, 0.13], [2.5, 10.8, 0.2],
];
const PICK = 3;

export const library: Illustration = {
  k: "library", name: "Bookshelf", title: "Your library is empty", body: "Save a book or an article and it will be on this shelf.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -10);
    p.shadow(0, -0.5, 32, 16, 0.12);
    // the case: back panel, left side, the shelf board
    p.box(X0 - 1.2, YB - 1, 0, X1 - X0 + 2.4, 1, 7.5, { top: 0.22, left: 0.035, right: 0.08 });
    p.box(X0 - 1.2, YB, 0, 1.2, YF - YB, 7.5, { top: 0.22, left: 0.13, right: 0.065 });
    p.box(X0, YB, 0, X1 - X0, YF - YB, ZS, { top: 0.2, left: 0.13, right: 0.08 });

    const slide = Math.min(1, h * 1.6) * 3.2; // out along y first
    const tip = Math.max(0, (h - 0.35) / 0.65) * 0.5 + h * Math.sin(t * 2.4) * 0.03; // then tips forward
    let x = X0 + 0.6;
    for (let i = 0; i < BOOKS.length; i++) {
      const [w, hh, f] = BOOKS[i], d = YF - YB - 1.2, y = YB + 0.4;
      const pick = i === PICK;
      if (pick && h > 0.05) {
        // the gap it leaves on the shelf, outlined
        p.face([[x, y, ZS + 0.02], [x + w, y, ZS + 0.02], [x + w, y + d, ZS + 0.02], [x, y + d, ZS + 0.02]], 0.03, 1);
        p.guide([[x, y + d, ZS + hh], [x + w, y + d, ZS + hh], [x + w, y, ZS + hh]]);
        p.guide([[x, y + d, ZS], [x, y + d, ZS + hh]]);
      }
      p.push();
      if (pick) { p.translate(0, slide, 0); p.rotate("x", -tip, [0, y + d, ZS]); }
      p.box(x, y, ZS, w, d, hh, { top: 0.24, left: pick ? 0.34 : f, right: f > 0.15 ? 0.12 : 0.1 });
      // spine bands and a label
      const sy = y + d + 0.02;
      p.line([[x + 0.3, sy, ZS + 1.4], [x + w - 0.3, sy, ZS + 1.4]], 1, 0.55);
      p.line([[x + 0.3, sy, ZS + hh - 1.4], [x + w - 0.3, sy, ZS + hh - 1.4]], 1, 0.55);
      p.line([[x + w / 2, sy, ZS + hh * 0.38], [x + w / 2, sy, ZS + hh * 0.7]], 1, 0.55);
      p.pop();
      x += w + 0.15;
    }
    // a book lying flat on the right, with a small one on top
    p.box(x + 0.6, YB + 0.6, ZS, X1 - x - 1.2, YF - YB - 1.6, 1.6, { top: 0.2, left: 0.13, right: 0.07 });
    p.box(x + 1.2, YB + 1.2, ZS + 1.6, X1 - x - 2.6, YF - YB - 2.8, 1.4, { top: 0.22, left: 0.2, right: 0.08 });
    // a low lip at the right end of the shelf
    p.box(X1, YB, 0, 1.2, YF - YB, 3.2, { top: 0.22, left: 0.13, right: 0.065 });
  },
};
