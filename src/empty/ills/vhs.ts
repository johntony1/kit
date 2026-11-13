// No tapes yet: a video tape in its sleeve, a play mark on the sleeve. Hover and the tape slides up out of the sleeve, showing its two reels.
import { SH, type Illustration, type V3 } from "../dots";

const SW = 12, SD = 3, SH_ = 16; // sleeve half width, half depth, height
const TW = 11, TD = 2.2, TH = 13; // tape half width, half depth, height

const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);

export const vhs: Illustration = {
  k: "vhs", name: "Video tape", title: "No tapes yet", body: "Add a video and it will be kept here, ready to play.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 28, 10, 0.12);
    p.rotate("z", -0.5); // its face towards us
    // the sleeve, open at the top
    p.box(-SW, -SD, 0, SW * 2, SD * 2, SH_, { open: true });
    // the tape: dark, rising out of the sleeve
    const rise = 10 * back(Math.min(1, h * 1.2));
    const z0 = SH_ - TH + 4 + rise, y = TD + 0.03;
    p.box(-TW, -TD, z0, TW * 2, TD * 2, TH, { top: 0.2, left: 0.075, right: 0.065, edge: 0 });
    // its face: a lit label strip along the top, two bright reels in a dark window
    p.face([[-TW + 1.5, y, z0 + TH - 4], [TW - 1.5, y, z0 + TH - 4], [TW - 1.5, y, z0 + TH - 1.2], [-TW + 1.5, y, z0 + TH - 1.2]], 0.28, 0);
    p.face([[-7.5, y, z0 + 2], [7.5, y, z0 + 2], [7.5, y, z0 + 7.6], [-7.5, y, z0 + 7.6]], 0.02, 0);
    for (const s of [-1, 1]) {
      p.ringV("y", [s * 4.2, y + 0.02, z0 + 4.8], 2.4, 0.3, 0);
      p.ringV("y", [s * 4.2, y + 0.04, z0 + 4.8], 0.9, 0.02, 0);
    }
    // the sleeve's front and end over the tape: a lit front with a play mark cut out
    p.face([[-SW, SD, 0], [SW, SD, 0], [SW, SD, SH_], [-SW, SD, SH_]], 0.22, 0);
    p.face([[SW, -SD, 0], [SW, SD, 0], [SW, SD, SH_], [SW, -SD, SH_]], SH.right, 0);
    const pz = 7.6, ys = SD + 0.04;
    p.clear([[-3, ys, pz - 4], [-3, ys, pz + 4], [4.2, ys, pz]] as V3[]);
    p.line([[-SW + 1.5, ys, SH_ - 1.6], [SW - 1.5, ys, SH_ - 1.6]], SH.edge, 0.7);
  },
};
