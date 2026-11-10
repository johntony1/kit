// No news: a folded newspaper with a headline block. Hover and its front page lifts and flutters, showing blank columns inside.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 15, D = 10.5, ZT = 1.8; // half width (x), half depth (y), thickness of the folded paper

/** blank columns: rules down the page, nothing printed between them */
function columns(p: Pen, z: number) {
  for (const x of [-W / 3, W / 3]) p.line([[x, -D + 2, z], [x, D - 2, z]], SH.edge, 0.8);
}

export const news: Illustration = {
  k: "news", name: "Newspaper", title: "No news", body: "Stories from the sources you follow will land here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(h);
    p.translate(0, 0, -3);
    p.scale(1.32);
    p.shadow(0, 0, 25, 11, 0.12);
    // the folded paper: a stack of sheets, the fold along the near (+y) edge, sheet edges cut into its walls
    p.box(-W, -D, 0, W * 2, D * 2, ZT, { top: 0.24, left: 0.13, right: 0.065 });
    p.line([[-W + 0.3, D + 0.03, ZT * 0.5], [W, D + 0.03, ZT * 0.5], [W + 0.03, -D + 0.3, ZT * 0.5]], SH.edge, 0.45);
    // the inside page under the front page: blank columns on a dense page
    p.face([[-W + 0.4, -D + 0.4, ZT + 0.01], [W - 0.4, -D + 0.4, ZT + 0.01], [W - 0.4, D - 0.4, ZT + 0.01], [-W + 0.4, D - 0.4, ZT + 0.01]], 0.1, 0);
    columns(p, ZT + 0.03);

    // the front page: hinged on the far edge, its near edge lifts and flutters while hovered
    const a = k * (0.42 + Math.sin(t * 3) * 0.05);
    const z = ZT + 0.06;
    p.push();
    p.rotate("x", a, [0, -D, z]);
    p.face([[-W, -D, z], [W, -D, z], [W, D, z], [-W, D, z]], 0.24, 0);
    if (a > 0.02) p.face([[-W, D, z - 0.5], [W, D, z - 0.5], [W, D, z], [-W, D, z]], 0.13, 0); // its edge
    const f = (pts: [number, number][], fill: number) => {
      const q = pts.map(([x, y]) => [x, y, z + 0.02] as V3);
      if (fill > 0) p.face(q, fill, 0); else p.clear(q);
    };
    // the masthead, the headline in two bold bars, a picture, a few lines of text
    f([[-W + 1.8, -D + 1.6], [W - 1.8, -D + 1.6], [W - 1.8, -D + 4.2], [-W + 1.8, -D + 4.2]], 0);
    p.line([[-W + 2.2, -D + 7.2, z + 0.03], [W - 2.2, -D + 7.2, z + 0.03]], SH.edge, 1.6);
    p.line([[-W + 2.2, -D + 9.8, z + 0.03], [2, -D + 9.8, z + 0.03]], SH.edge, 1.6);
    f([[3, -D + 12], [W - 1.8, -D + 12], [W - 1.8, D - 1.6], [3, D - 1.6]], 0);
    f([[3.6, D - 2.2], [7.4, D - 6.6], [10, D - 4.2], [W - 2.4, D - 6.2], [W - 2.4, D - 2.2]], 0.3);
    for (let i = 0; i < 4; i++) p.line([[-W + 2.2, -D + 12.6 + i * 2.4, z + 0.03], [(i === 3 ? -4.5 : 0.8), -D + 12.6 + i * 2.4, z + 0.03]], SH.edge, 0.7);
    p.pop();
  },
};
