// Nothing tucked away: a simple chest of three wide drawers on short legs, each drawer a lit front with two round knobs. Hover and the middle drawer slides out, empty.
import { easeInOut, SH, type Illustration, type Pen } from "../dots";

const W = 14; // half width
const FY = 7; // the chest's front
const BY = -7; // the chest's back

// one drawer front with its two knobs, at height z0..z1
function front(p: Pen, z0: number, z1: number, y: number) {
  p.face([[-W + 1.1, y, z0], [W - 1.1, y, z0], [W - 1.1, y, z1], [-W + 1.1, y, z1]], 0.24, 0);
  const zm = (z0 + z1) / 2;
  for (const x of [-6.5, 6.5]) p.dot([x, y + 0.05, zm], 1.5, 0);
}

export const drawers: Illustration = {
  k: "drawers", name: "Chest of drawers", title: "Nothing tucked away", body: "Things you put away will be kept here, out of sight.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, -1, -15);
    p.shadow(0, 0, 30, 14, 0.12);
    p.rotate("z", -0.55);
    // four short legs
    for (const [x, y] of [[-W + 0.5, BY + 0.5], [W - 2.5, BY + 0.5], [-W + 0.5, FY - 2.5], [W - 2.5, FY - 2.5]]) p.box(x, y, 0, 2, 2, 3, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    // the carcass: its front is dark, so the gaps between the drawers read as cuts
    p.box(-W, BY, 3, W * 2, FY - BY, 24, { top: 0.2, left: 0.03, right: 0.065, edge: 0 });
    // the bottom and top drawers, shut
    front(p, 4, 10.8, FY + 0.03);
    front(p, 19.2, 26, FY + 0.03);
    // the middle drawer slides out: the dark empty inside shows over it, its side in shade, then its front
    const s = 5.5 * easeInOut(Math.min(1, h * 1.2)) + h * Math.sin(t * 3) * 0.25;
    if (s > 0.3) {
      p.face([[-W + 1.1, FY, 18.4], [W - 1.1, FY, 18.4], [W - 1.1, FY + s, 18.4], [-W + 1.1, FY + s, 18.4]], 0.03, 0);
      p.face([[W - 1.1, FY, 11.6], [W - 1.1, FY + s, 11.6], [W - 1.1, FY + s, 18.4], [W - 1.1, FY, 18.4]], 0.065, 0);
    }
    front(p, 11.6, 18.4, FY + s + 0.03);
    if (s > 0.3) p.line([[-W + 1.1, FY + s + 0.05, 11.3], [W - 1.1, FY + s + 0.05, 11.3]], SH.edge, 1.4);
    // the top: a slab that overhangs a little, its front edge dark so it parts from the drawers
    p.box(-W - 1, BY - 1, 27, W * 2 + 2, FY - BY + 2, 2.2, { top: 0.26, left: 0.065, right: 0.05, edge: 0 });
  },
};
