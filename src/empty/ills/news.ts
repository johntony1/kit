// No news: a folded newspaper with a headline block. Hover and it unfolds, the front page swinging over to show blank columns inside.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 14, D = 8.5, ZT = 1.6; // half width (x), half depth (y), thickness of the folded paper

/** blank columns: rules down the page, nothing printed between them */
function columns(p: Pen, z: number) {
  for (const x of [-W / 3, W / 3]) p.line([[x, -D + 2, z], [x, D - 2, z]], SH.edge, 0.6);
}

export const news: Illustration = {
  k: "news", name: "Newspaper", title: "No news", body: "Stories from the sources you follow will land here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = easeInOut(h);
    // the paper slides toward us as it opens, so the open spread stays centred
    p.translate(0, D * k, -4);
    p.shadow(0, -D * k, 26, 12 + 6 * k, 0.12);
    // the folded paper: a stack of sheets, the fold along the near (+y) edge
    p.box(-W, -D, 0, W * 2, D * 2, ZT, { top: 0.24, left: 0.13, right: 0.07 });
    p.line([[-W, D + 0.03, ZT * 0.5], [W, D + 0.03, ZT * 0.5]], SH.edge, 0.45);
    // the inside page under the flap: blank columns
    p.face([[-W + 0.6, -D + 0.6, ZT + 0.01], [W - 0.6, -D + 0.6, ZT + 0.01], [W - 0.6, D - 0.6, ZT + 0.01], [-W + 0.6, D - 0.6, ZT + 0.01]], 0.24, 0, 0.4);
    columns(p, ZT + 0.03);

    // the front page: hinged on the far edge, it swings up and over and lies flat behind
    const a = k * Math.PI;
    const z = ZT + 0.06;
    p.push();
    p.rotate("x", a, [0, -D, z]);
    const front = Math.cos(a) - Math.sin(a) > 0; // which side faces us
    p.face([[-W, -D, z], [W, -D, z], [W, D, z], [-W, D, z]], front ? 0.24 : 0.07 + 0.17 * Math.max(0, -Math.cos(a)), SH.edge, 0.55);
    if (front) {
      const f = (pts: [number, number][], fill: number) => p.face(pts.map(([x, y]) => [x, y, z + 0.02] as V3), fill, 0);
      // the masthead, the headline in two bold bars, a picture, a few lines of text
      f([[-W + 2, -D + 1.8], [W - 2, -D + 1.8], [W - 2, -D + 4.6], [-W + 2, -D + 4.6]], 0.01);
      p.line([[-W + 2, -D + 7, z + 0.03], [W * 0.6, -D + 7, z + 0.03]], SH.edge, 1.5);
      p.line([[-W + 2, -D + 9.6, z + 0.03], [0, -D + 9.6, z + 0.03]], SH.edge, 1.5);
      f([[2, -D + 9], [W - 2, -D + 9], [W - 2, D - 1.8], [2, D - 1.8]], 0.01);
      p.dot([W - 4.6, -D + 11.4, z + 0.04], 1.1, 1);
      f([[2.6, D - 2.4], [6.4, D - 6.2], [9, D - 4], [W - 2.6, D - 5.8], [W - 2.6, D - 2.4]], 0.3);
      for (let i = 0; i < 3; i++) p.line([[-W + 2, -D + 12.6 + i * 2.6, z + 0.03], [(i === 2 ? -4.5 : -0.4), -D + 12.6 + i * 2.6, z + 0.03]], SH.edge, 0.6);
    } else {
      // its back: the inside page, blank
      columns(p, z - 0.02);
    }
    p.pop();
  },
};
