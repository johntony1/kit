// No templates yet: a stack of layout cards. Hover and they fan out from one corner like swatches, each a different layout.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 9, Y = 11.5, T = 1.1; // card half width, half depth, thickness
const PIV: V3 = [-X, -Y, 0]; // the corner they fan round

/** a block on a card's face: a cut outline in the dot styles, a grey panel in the line style */
const block = (p: Pen, x0: number, y0: number, x1: number, y1: number, z: number, f = 0.065) =>
  p.face([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], f > 0.3 || p.ink ? f : 0, SH.edge, 0.6);

function card(p: Pen, z: number, kind: number) {
  p.box(-X, -Y, z, X * 2, Y * 2, T, { top: 0.22, left: 0.13, right: 0.065 });
  const Z = z + T + 0.03;
  // a header bar on every layout
  block(p, -7.4, -9.9, 7.4, -7.3, Z);
  if (kind === 0) {
    // two columns
    block(p, -7.4, -5.6, -0.8, 9.9, Z);
    block(p, 0.8, -5.6, 7.4, 2, Z);
    block(p, 0.8, 3.6, 7.4, 9.9, Z);
  } else if (kind === 1) {
    // a hero and lines of text
    block(p, -7.4, -5.6, 7.4, 1.4, Z);
    for (let i = 0; i < 3; i++) p.line([[-7.4, 4 + i * 2.4, Z], [i === 2 ? 0 : 6.4, 4 + i * 2.4, Z]], SH.edge, 0.7);
  } else {
    // a grid of tiles, one picked
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      const x0 = -7.4 + c * 7.6, y0 = -5.6 + r * 7.9;
      block(p, x0, y0, x0 + 7.2, y0 + 7.1, Z, r === 0 && c === 1 ? 0.34 : 0.065);
    }
  }
}

export const templates: Illustration = {
  k: "templates", name: "Templates", title: "No templates yet", body: "Save a layout as a template and start every new page from it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-3, 1, -8);
    p.shadow(0, 0, 28, 14, 0.12);
    p.shadow(-4, -4, 20, 10, 0.08);
    const gap = 1.6 + 1.8 * h;
    for (let i = 0; i < 3; i++) {
      const z = i * gap;
      if (i === 2 && h > 0.05) p.guide([[-X, -Y, z + T], [X, -Y, z + T], [X, Y, z + T], [-X, Y, z + T], [-X, -Y, z + T]]);
      p.push();
      p.rotate("z", -i * 0.27 * h, PIV);
      card(p, z, i === 2 ? 2 : i === 1 ? 1 : 0);
      p.pop();
    }
    // a pin through the corner they turn on
    p.cylinder(PIV[0] + 1.6, PIV[1] + 1.6, 2 * gap + T, 1.1, 1.4, { top: 0.3, side: 0.12 });
  },
};
