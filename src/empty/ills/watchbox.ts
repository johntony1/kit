// No watches yet: an open watch box seen from the front, its lid tipped back, one round watch sitting on the cushion with its strap round it. Hover and the lid swings up, the watch lifts a little and its hands sweep round.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 17, D = 7, H = 11; // half width, half depth, height of the box
const LL = 17; // the lid's height
const CR = 6.6; // the watch case radius

export const watchbox: Illustration = {
  k: "watchbox", name: "Watch box", title: "No watches yet", body: "Add watches to your collection and each one will have its own place here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(h);
    p.translate(0, 0, -16);
    p.shadow(0, 0, 24, 10, 0.12);
    p.rotate("z", -0.62); // turned to face us
    // the lid, tipped back on its hinge: a lit frame round a dark lining
    const a = 0.75 - 0.5 * k;
    const top = (x: number, inset: number): V3 => [x, -D - Math.sin(a) * (LL - inset), H + Math.cos(a) * (LL - inset)];
    const base = (x: number, inset: number): V3 => [x, -D - Math.sin(a) * inset, H + Math.cos(a) * inset];
    p.face([base(-W, 0), base(W, 0), top(W, 0), top(-W, 0)], 0.2, 0);
    p.clear([base(-W + 2, 2), base(W - 2, 2), top(W - 2, 2), top(-W + 2, 2)]);
    // the box: the dark inside, then the cushion filling it
    p.box(-W, -D, 0, W * 2, D * 2, H, { open: true, left: 0.2, right: 0.065 });
    const cz = H + 2;
    p.face([[-W + 1.6, -D + 1.6, H], [W - 1.6, -D + 1.6, H], [W - 1.6, -D + 1.6, cz], [W - 3, 0, cz + 2.6], [-W + 3, 0, cz + 2.6], [-W + 1.6, -D + 1.6, cz]], 0.045, 0);
    // the watch on the cushion, lifting a little on hover
    const lift = 2.4 * k, wz = H + 4.5 + lift, F = D - 1.2;
    // its strap: a lit band across the cushion, cut into links
    p.face([[-W + 2.6, F - 0.3, wz - 2.6], [W - 2.6, F - 0.3, wz - 2.6], [W - 2.6, F - 0.3, wz + 2.6], [-W + 2.6, F - 0.3, wz + 2.6]], 0.24, 0);
    for (const x of [-12, -9.5, 9.5, 12]) p.line([[x, F - 0.25, wz - 2.6], [x, F - 0.25, wz + 2.6]], SH.edge, 0.8);
    // the case: a bright ring with a crown, the dial dark
    p.box(CR - 0.6, F - 2.2, wz - 1.3, 2.4, 2, 2.6, { top: 0.3, left: 0.3, right: 0.12, edge: 0 });
    p.ringV("y", [0, F - 0.1, wz], CR + 0.6, 0.03, 0);
    p.ringV("y", [0, F, wz], CR, 0.32, 0);
    p.ringV("y", [0, F + 0.05, wz], CR * 0.74, 0.02, 0);
    for (const d of [0, 90, 180, 270]) { const r = (d * Math.PI) / 180; p.dot([Math.sin(r) * CR * 0.56, F + 0.1, wz + Math.cos(r) * CR * 0.56], 0.6, 1); }
    // the hands: ten past ten, sweeping round on hover
    const hand = (deg: number, len: number, w: number) => {
      const r = (deg * Math.PI) / 180;
      const [x0, y0] = p.pt([0, F + 0.1, wz]), [x1, y1] = p.pt([Math.sin(r) * len, F + 0.1, wz + Math.cos(r) * len]);
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
    };
    hand(300 + 90 * k, 2.8, 1.4);
    hand(60 + 360 * k, 4.2, 1.1);
    // the front wall drawn again over the bottom of the case, with a lit rim
    p.face([[-W, D, 0], [W, D, 0], [W, D, H], [-W, D, H]], 0.2, 0);
    p.face([[W, -D, 0], [W, D, 0], [W, D, H], [W, -D, H]], 0.065, 0);
    p.line([[-W, D + 0.03, H - 1.4], [W, D + 0.03, H - 1.4]], SH.edge, 0.7);
    p.box(-1.6, D, H - 3.4, 3.2, 0.6, 2.2, { top: 0.3, left: 0.03, right: 0.03, edge: 0 }); // the clasp
  },
};
