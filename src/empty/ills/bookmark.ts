// No saved items: a closed book with a ribbon bookmark hanging out. Hover and the cover opens a little and the ribbon waves.
import { SH, type Illustration, type V3 } from "../dots";

const X = 11, Y = 8; // half length (x), half width (y) of the covers
const B = 0.9, PZ = 4.4; // board thickness, top of the page block
const RY0 = 1.4, RY1 = 3.6; // the ribbon runs between these y

export const bookmark: Illustration = {
  k: "bookmark", name: "Bookmark", title: "No saved items", body: "Bookmark anything you want to come back to and it will wait for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-1.5, 0.5, -3);
    p.scale(1.04, [0, 0, 3]);
    p.shadow(1, 0, 26, 12, 0.12);
    // back board
    p.box(-X, -Y, 0, X * 2, Y * 2, B, { top: 0.2, left: 0.13, right: 0.07 });
    // the page block, set in a little from the boards, with page edges cut along its sides
    const px0 = -X + 0.3, px1 = X - 0.7, py = Y - 0.7;
    p.box(px0, -py, B, px1 - px0, py * 2, PZ - B, { top: 0.26, left: 0.17, right: 0.11 });
    for (let i = 1; i <= 3; i++) {
      const z = B + ((PZ - B) * i) / 4;
      p.line([[px0 + 0.8, py + 0.03, z], [px1, py + 0.03, z]], SH.edge, 0.55);
      p.line([[px1 + 0.03, py, z], [px1 + 0.03, -py + 0.8, z]], SH.edge, 0.55);
    }
    // text on the first page, seen once the cover lifts
    if (h > 0.05) {
      for (let i = 0; i < 5; i++) {
        const y = -py + 2.4 + i * 2.2;
        p.line([[-X + 4, y, PZ + 0.02], [X - 3 - (i % 2) * 4, y, PZ + 0.02]], SH.edge, 0.6);
      }
    }

    // the ribbon: along the first page, out between the pages, down the front and onto the floor
    const wave = (u: number) => h * Math.sin(t * 5.5 - u * 1.4) * (0.35 + u * 0.22);
    const rib = (pts: V3[]) => p.face(pts, 0.34, SH.edge, 0.5);
    if (h > 0.05) rib([[2, RY0, PZ + 0.04], [px1, RY0, PZ + 0.04], [px1, RY1, PZ + 0.04], [2, RY1, PZ + 0.04]]);
    rib([[px1 + 0.05, RY0, PZ], [px1 + 0.05, RY1, PZ], [px1 + 0.05, RY1, B], [px1 + 0.05, RY0, B]]);
    // over the edge of the back board and down to the floor
    rib([[X + 0.05, RY0, B], [X + 0.05, RY1, B], [X + 0.4, RY1 + 0.2, 0.1], [X + 0.4, RY0 + 0.2, 0.1]]);
    // the tail on the floor, in segments that lift and ripple while hovered, ending in a notch
    const N = 7, len = 7.5;
    const at = (k: number, side: number): V3 => {
      const u = k / N, x = X + 0.4 + u * len, sway = Math.sin(t * 3.2 - u * 2) * 0.6 * h * u;
      return [x, (side ? RY1 : RY0) + 0.2 + u * 1.2 + sway, 0.1 + Math.max(0, wave(u * 3)) * 2.2 + h * u * 1.2];
    };
    for (let k = 0; k < N; k++) {
      if (k < N - 1) rib([at(k, 0), at(k + 1, 0), at(k + 1, 1), at(k, 1)]);
      else {
        const a = at(k, 0), b = at(k, 1), c = at(k + 1, 0), d = at(k + 1, 1);
        const m: V3 = [(c[0] + d[0]) / 2 - 1.3, (c[1] + d[1]) / 2, (c[2] + d[2]) / 2];
        rib([a, c, m, d, b]);
      }
    }

    // the cover, hinged along the spine at the back, lifting its front edge
    const ang = h * 0.5;
    p.push();
    p.rotate("y", -ang, [-X, 0, PZ]);
    p.box(-X, -Y, PZ, X * 2, Y * 2, B, { top: 0.2, left: 0.13, right: 0.07 });
    // the spine's rounded edge along the back, a line across the cover
    p.line([[-X + 2.4, -Y + 0.3, PZ + B + 0.02], [-X + 2.4, Y - 0.3, PZ + B + 0.02]], SH.edge, 0.6);
    // a title label: a framed panel with two lines of text cut out of it
    const lz = PZ + B + 0.03;
    p.face([[-4, -4, lz], [6, -4, lz], [6, 4, lz], [-4, 4, lz]], 0.3, SH.edge, 0.9);
    p.line([[-2.2, -1.4, lz + 0.01], [4.2, -1.4, lz + 0.01]], SH.edge, 0.75);
    p.line([[-2.2, 1.4, lz + 0.01], [1.6, 1.4, lz + 0.01]], SH.edge, 0.75);
    p.pop();
  },
};
