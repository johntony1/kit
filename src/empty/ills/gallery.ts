// No albums: a stack of photo prints. Hover and they fan out like a hand of cards, all of them blank but the top one.
import { easeInOut, SH, type Illustration, type Pen } from "../dots";

const CW = 9, CH = 22, Z0 = 6; // half width, height, bottom of the prints

/** one print standing in the x z plane, facing +y: a white border, a picture window */
function print(p: Pen, y: number, pic: boolean, fill: number) {
  p.box(-CW, y - 0.7, Z0, CW * 2, 0.7, CH, { top: 0.24, left: fill, right: 0.07, lw: 0.5 });
  const f = (x0: number, z0: number, x1: number, z1: number, v: number, e = SH.edge) => p.face([[x0, y + 0.02, z0], [x1, y + 0.02, z0], [x1, y + 0.02, z1], [x0, y + 0.02, z1]], v, e, 0.45);
  f(-CW + 1.4, Z0 + 4.4, CW - 1.4, Z0 + CH - 1.4, 0.02);
  if (pic) {
    // a sun and two hills
    p.ringV("y", [2.6, y + 0.04, Z0 + CH - 4.6], 1.6, 0.5, 0);
    p.face([[-CW + 1.4, y + 0.04, Z0 + 4.4], [-CW + 1.4, y + 0.04, Z0 + 7], [-2.4, y + 0.04, Z0 + 11.6], [1.2, y + 0.04, Z0 + 8], [2.8, y + 0.04, Z0 + 9.6], [CW - 1.4, y + 0.04, Z0 + 6.2], [CW - 1.4, y + 0.04, Z0 + 4.4]], 0.28, 0);
  }
  // a caption line on the bottom border
  p.line([[-CW + 1.8, y + 0.04, Z0 + 2.2], [-CW + 6.5, y + 0.04, Z0 + 2.2]], SH.edge, 0.55);
}

export const gallery: Illustration = {
  k: "gallery", name: "Photo prints", title: "No albums", body: "Create an album and your photos will be gathered here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.rotate("z", (-30 * Math.PI) / 180);
    const k = easeInOut(h);
    p.shadow(0, 0, 18 + 8 * k, 9, 0.12);
    // back to front: each print turns about a point below the stack, so the stack fans open
    const cards = [
      { y: -3.6, rest: 0.1, fan: 0.6 },
      { y: -2.4, rest: -0.1, fan: -0.6 },
      { y: -1.2, rest: 0.05, fan: 0.24 },
      { y: 0, rest: -0.03, fan: -0.2 },
    ];
    cards.forEach((c, i) => {
      p.push();
      p.rotate("y", c.rest + (c.fan - c.rest) * k, [0, c.y, Z0 - 8]);
      print(p, c.y, i === cards.length - 1, 0.13 + 0.03 * i);
      p.pop();
    });
  },
};
