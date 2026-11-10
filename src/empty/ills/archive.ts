// Nothing archived: a zip case. Hover and the pull slides along the top, the zipper parts and a file peeks out.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const W = 14, D = 9, H = 11; // half width (x), half depth (y), height
const X0 = -W + 3, X1 = W - 7.5; // where the zipper starts and ends

export const archive: Illustration = {
  k: "archive", name: "Zip archive", title: "Nothing archived", body: "Archived items are tucked away here, safe until you need them again.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -10);
    p.shadow(0, 0, 30, 14, 0.12);
    // the case, a lit lid on a slightly darker base
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.21 });
    p.line([[-W, D + 0.03, 3], [W, D + 0.03, 3], [W + 0.03, -D, 3]], SH.edge, 0.6);
    // a label card on the front
    p.face([[-10, D + 0.03, 5], [-2, D + 0.03, 5], [-2, D + 0.03, 9], [-10, D + 0.03, 9]], 0.24, SH.edge, 0.5);
    p.line([[-8.8, D + 0.06, 7.6], [-3.4, D + 0.06, 7.6]], SH.edge, 0.6);
    p.line([[-8.8, D + 0.06, 6.2], [-5.6, D + 0.06, 6.2]], SH.edge, 0.6);
    // a handle slot on the side
    p.face([[W + 0.03, -4, 6.5], [W + 0.03, 4, 6.5], [W + 0.03, 4, 8.5], [W + 0.03, -4, 8.5]], 0.02, SH.edge, 0.5);

    // the pull's travel, eased, and the gap it leaves behind
    const s = easeInOut(Math.min(1, h / 0.8));
    const px = X0 + (X1 - X0) * s;
    // the zipper track, a raised band down the middle
    const Z = H + 0.05;
    p.face([[X0 - 1, -1.4, Z], [X1 + 1.2, -1.4, Z], [X1 + 1.2, 1.4, Z], [X0 - 1, 1.4, Z]], 0.13, SH.edge, 0.5);
    // the guide: where the pull will run
    p.guide([[X0, 0, Z + 0.1], [X1, 0, Z + 0.1]], true);
    // the open part: a dark lens, widest at the start, closing up at the pull
    const open = px - X0;
    if (open > 0.6) {
      const N = 14, up: V3[] = [], dn: V3[] = [];
      for (let i = 0; i <= N; i++) {
        const x = X0 + (open * i) / N, w = 3.4 * Math.pow(1 - i / N, 0.7) + 0.2;
        up.push([x, -w, Z + 0.08]); dn.push([x, w, Z + 0.08]);
      }
      p.face([...up, ...dn.reverse()], 0.02, SH.edge, 0.55);
      // a file inside, rising out of the gap
      const lift = Math.max(0, (h - 0.45) / 0.55) * 8;
      if (lift > 0.3) {
        const a = X0 + 1.5, b = Math.min(px - 3, X0 + 9);
        if (b > a + 2) {
          const z0 = Z - 1, z1 = Z + lift;
          p.face([[a, 0, z0], [b, 0, z0], [b, 0, z1], [a, 0, z1]], 0.22, SH.edge, 0.5);
          p.face([[b, 0, z0], [b, -0.8, z0], [b, -0.8, z1], [b, 0, z1]], SH.right, SH.edge, 0.4);
          p.face([[a, 0, z1], [b, 0, z1], [b, -0.8, z1], [a, -0.8, z1]], 0.3, SH.edge, 0.4);
          if (lift > 3) p.line([[a + 1.2, 0.05, z1 - 2], [b - 1.2, 0.05, z1 - 2]], SH.edge, 0.6);
          if (lift > 5) p.line([[a + 1.2, 0.05, z1 - 3.8], [b - 3, 0.05, z1 - 3.8]], SH.edge, 0.6);
          p.guide([[a, 0, Z], [a, 0, z0]]);
        }
      }
    }
    // teeth on the closed part
    for (let x = px + 2.2; x < X1 + 0.6; x += 1.8) p.line([[x, -0.9, Z + 0.1], [x, 0.9, Z + 0.1]], SH.edge, 0.55);
    // the slider and its pull tab, lying back along the track
    // a dark cast shadow round it so it stands off the lit lid in the dot styles
    if (!p.ink) p.face([[px - 2.6, -2.8, Z + 0.12], [px + 7.2, -2.8, Z + 0.12], [px + 7.2, 3, Z + 0.12], [px - 2.6, 3, Z + 0.12]], 0.03, 0);
    p.box(px - 2, -2.2, Z, 4, 4.4, 2.2, { top: 0.32, left: 0.16, right: 0.08 });
    p.face([[px + 2, -1.3, Z + 1.4], [px + 6.4, -1.3, Z + 0.8], [px + 6.4, 1.3, Z + 0.8], [px + 2, 1.3, Z + 1.4]], 0.32, SH.edge, 0.5);
    p.line([[px + 4.8, -0.5, Z + 1.02], [px + 4.8, 0.5, Z + 1.02]], SH.edge, 0.7);
  },
};
