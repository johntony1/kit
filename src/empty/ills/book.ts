// No books: an open book lying flat, its pages turning over by themselves, one after another.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.6; // seconds per page
const W = 15, D = 10.5, ZP = 3.4; // page width (x), half depth (y), height of the page tops
const ROWS = [-6.8, -3.8, -0.8, 2.2, 5.2];

/** the text on a page: rows of lines across it, the last row short */
function text(p: Pen, x0: number, x1: number, z: number) {
  ROWS.forEach((y, i) => {
    const e = i === ROWS.length - 1 ? x0 + (x1 - x0) * 0.45 : x1;
    p.line([[x0, y, z], [e, y, z]], SH.edge, 0.6);
  });
}

export const book: Illustration = {
  k: "book", name: "Open book", title: "No books", body: "Books you add to your library will be on this shelf.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -2);
    p.shadow(0, 0, 30, 15, 0.12);
    // the cover, a little bigger than the pages
    p.box(-W - 1.2, -D - 1.2, 0, (W + 1.2) * 2, (D + 1.2) * 2, 1.2, { top: 0.1, left: 0.13, right: 0.07 });
    // the two blocks of pages, with the leaves showing on their sides
    for (const s of [-1, 1]) {
      const xa = s < 0 ? -W : 0.3, xb = s < 0 ? -0.3 : W;
      p.box(xa, -D, 1.2, xb - xa, D * 2, ZP - 1.2, { top: 0.24, left: 0.13, right: 0.07 });
      p.line([[xa, D + 0.03, 2], [xb, D + 0.03, 2]], SH.edge, 0.45);
      text(p, s < 0 ? -W + 2.2 : 2.2, s < 0 ? -2.2 : W - 2.2, ZP + 0.02);
    }
    // the gutter
    p.line([[0, -D, ZP - 0.4], [0, D, ZP - 0.4]], SH.edge, 0.9);

    // the turning page: hinged at the spine, the free half curls behind as it goes over
    const u = (t % P) / P;
    const th = easeInOut(Math.min(1, u / 0.72)) * Math.PI;
    const curl = Math.sin(th) * 0.55;
    const hinge: V3 = [0, 0, ZP + 0.05];
    const W2 = W / 2;
    const shade = (a: number) => 0.15 + 0.1 * Math.abs(Math.cos(a));
    p.push();
    p.rotate("y", -th, hinge);
    p.face([[0, -D, ZP + 0.05], [W2, -D, ZP + 0.05], [W2, D, ZP + 0.05], [0, D, ZP + 0.05]], shade(th), SH.edge, 0.5);
    if (th < Math.PI / 2) text(p, 2.2, W2, ZP + 0.07); else text(p, 2.2, W2, ZP + 0.03);
    p.rotate("y", curl, [W2, 0, ZP + 0.05]);
    p.face([[W2, -D, ZP + 0.05], [W, -D, ZP + 0.05], [W, D, ZP + 0.05], [W2, D, ZP + 0.05]], shade(th - curl), SH.edge, 0.5);
    ROWS.forEach((y, i) => {
      const e = i === ROWS.length - 1 ? W2 : W - 2.2;
      if (e > W2) p.line([[W2, y, ZP + 0.06], [e, y, ZP + 0.06]], SH.edge, 0.6);
    });
    p.pop();
    // a ribbon marker hanging out of the bottom of the spine
    p.face([[-0.6, D, ZP - 0.5], [0.6, D, ZP - 0.5], [0.8, D + 4, 0.3], [-0.4, D + 4.6, 0.3]], 0.3, SH.edge, 0.4);
  },
};
