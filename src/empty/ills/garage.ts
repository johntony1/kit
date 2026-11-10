// No vehicles yet: a garage with a roller door. Hover and the door rolls up into its drum on an empty bay, and the wall lamp comes on.
import { SH, type Illustration, type V3 } from "../dots";

const W = 10, D = 6.5, H = 13.5; // half width (x), half depth (y), wall height
const DX = 6.5, DH = 9.6; // door half width, door height

export const garage: Illustration = {
  k: "garage", name: "Garage", title: "No vehicles yet", body: "Add a vehicle and it will be parked here, ready when you need it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, -2, -9);
    p.shadow(0, 2, 26, 13, 0.12);
    // the building
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.12, right: SH.right });
    // a flat roof slab with a lip, lit on top
    p.box(-W - 0.8, -D - 0.8, H, W * 2 + 1.6, D * 2 + 1.8, 1.1, { top: SH.top, left: 0.15, right: 0.1 });
    p.box(-W + 1, -D + 1, H + 1.1, W * 2 - 2, D * 2 - 2, 0.7, { top: SH.top, left: 0.14, right: SH.right });
    // a window on the right wall
    p.face([[W + 0.03, -5, 5], [W + 0.03, 1, 5], [W + 0.03, 1, 9.5], [W + 0.03, -5, 9.5]], 0.03, SH.edge, 0.6);
    p.line([[W + 0.05, -2, 5], [W + 0.05, -2, 9.5]], SH.edge, 0.55);
    p.face([[W + 0.03, -5.4, 4.4], [W + 0.03, 1.4, 4.4], [W + 0.7, 1.4, 4.4], [W + 0.7, -5.4, 4.4]], 0.22, SH.edge, 0.4);
    // the opening and the empty bay behind it
    const y = D + 0.03, zb = h * (DH - 1.2); // the door's bottom edge rises as it rolls up
    p.face([[-DX, y, 0], [DX, y, 0], [DX, y, DH], [-DX, y, DH]], 0.02, SH.edge, 0.6);
    if (zb > 0.5) {
      // the far corner of the bay, faint
      p.line([[-DX + 1.4, y, Math.min(zb, 2.2)], [DX - 1.4, y, Math.min(zb, 2.2)]], 0.3, 0.4);
      p.guide([[-DX + 1.5, y + 0.02, 0.3], [-DX + 1.5, y + 0.02, Math.min(zb, DH) - 0.3]]);
      p.guide([[DX - 1.5, y + 0.02, 0.3], [DX - 1.5, y + 0.02, Math.min(zb, DH) - 0.3]]);
    }
    // the roller door: lit slats from its bottom edge up to the drum
    const d = (x: number, z: number): V3 => [x, y + 0.02, z];
    p.face([d(-DX, zb), d(DX, zb), d(DX, DH), d(-DX, DH)], SH.top, SH.edge, 0.6);
    for (let z = zb + 1.6; z < DH - 0.3; z += 1.6) p.line([d(-DX + 0.3, z), d(DX - 0.3, z)], SH.edge, 0.55);
    // the handle on its bottom slat
    if (DH - zb > 1.2) p.line([d(-1.6, zb + 0.7), d(1.6, zb + 0.7)], SH.edge, 0.9);
    // the drum housing over the door
    p.box(-DX - 0.6, D, DH, DX * 2 + 1.2, 1.2, 1.8, { top: 0.24, left: 0.14, right: SH.right });
    // the wall lamp above the housing
    p.box(DX + 1.2, D, 10.2, 1.2, 0.9, 1.6, { top: 0.22, left: h > 0.5 ? 0.32 : 0.1, right: SH.right });
    // the driveway: a lit apron in front of the door, a dashed bay marked on it
    p.face([[-DX - 1, D, 0.02], [DX + 1, D, 0.02], [DX + 1, D + 6.5, 0.02], [-DX - 1, D + 6.5, 0.02]], 0.2, SH.edge, 0.55);
    p.guide([[-DX + 0.5, D + 0.6, 0.05], [DX - 0.5, D + 0.6, 0.05], [DX - 0.5, D + 5.9, 0.05], [-DX + 0.5, D + 5.9, 0.05], [-DX + 0.5, D + 0.6, 0.05]], true);
  },
};
