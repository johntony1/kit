// No trips planned: an upright suitcase on its wheels. Hover and the telescopic handle slides up out of it, and the luggage tag swings.
import { SH, type Illustration, type V3 } from "../dots";

const W = 8, D = 4, Z0 = 2.4, H = 19; // half width (x), half depth (y), floor of the shell, shell height

export const suitcase: Illustration = {
  k: "suitcase", name: "Suitcase", title: "No trips planned", body: "Plan a trip and your bookings, tickets and plans will be packed in here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 21, 10.5, 0.12);
    const ZT = Z0 + H; // the top of the shell
    const ext = 1.4 + h * 10.5; // how far the handle is out
    // the dashed travel of the handle, where it will slide to
    for (const x of [-5, 5]) p.guide([[x, -3, ZT], [x, -3, ZT + 12.5]]);
    // back wheels, peeking out behind
    p.box(5.6, -3.6, 0.6, 1.6, 1.6, Z0 - 0.6, { top: 0.12, left: 0.1, right: SH.right });
    p.ringV("x", [7.4, -2.8, 1.2], 1.15, 0.2, SH.edge, 0.5);
    // the shell
    p.box(-W, -D, Z0, W * 2, D * 2, H, { top: SH.top, left: 0.12, right: SH.right });
    // the zip seam around the middle of its depth, across the top and down the right side
    p.line([[-W + 0.6, 0.6, ZT + 0.02], [W - 0.02, 0.6, ZT + 0.02]], SH.edge, 0.55);
    p.line([[W + 0.02, 0.6, ZT - 0.2], [W + 0.02, 0.6, Z0 + 0.4]], SH.edge, 0.55);
    // ribs down the front
    for (const x of [-5.4, 5.4]) p.line([[x, D + 0.03, Z0 + 1.6], [x, D + 0.03, ZT - 1.6]], SH.edge, 0.7);
    // corner guards
    p.face([[-W, D + 0.04, Z0], [-W + 2.2, D + 0.04, Z0], [-W + 2.2, D + 0.04, Z0 + 1.2], [-W, D + 0.04, Z0 + 1.2]], 0.24, SH.edge, 0.4);
    p.face([[W - 2.2, D + 0.04, Z0], [W, D + 0.04, Z0], [W, D + 0.04, Z0 + 1.2], [W - 2.2, D + 0.04, Z0 + 1.2]], 0.24, SH.edge, 0.4);
    // two stickers on the front: a round one and a label
    p.ringV("y", [-1.6, D + 0.05, 13.2], 2.3, 0.24, SH.edge, 0.5);
    p.line([[-2.8, D + 0.08, 13.2], [-0.4, D + 0.08, 13.2]], SH.edge, 0.6);
    p.face([[-3.8, D + 0.05, 5.4], [3.4, D + 0.05, 5.4], [3.4, D + 0.05, 9], [-3.8, D + 0.05, 9]], 0.24, SH.edge, 0.5);
    p.line([[-2.8, D + 0.08, 7.9], [2.2, D + 0.08, 7.9]], SH.edge, 0.6);
    p.line([[-2.8, D + 0.08, 6.6], [0, D + 0.08, 6.6]], SH.edge, 0.6);
    // front wheels on little housings
    for (const x of [-6.4, 6.4]) {
      p.box(x - 0.8, 2.2, 0.6, 1.6, 1.6, Z0 - 0.6, { top: 0.12, left: 0.12, right: SH.right });
      p.ringV("y", [x, 3.9, 1.2], 1.15, 0.2, SH.edge, 0.5);
      p.dot([x, 3.95, 1.2], 0.3, 0.05);
    }
    // the telescopic handle: two sleeves on the top, rods sliding out, a grip across
    for (const x of [-5, 5]) {
      p.box(x - 0.9, -3.9, ZT, 1.8, 1.8, 0.8, { top: 0.12, left: 0.16, right: 0.1 });
      p.box(x - 0.5, -3.5, ZT + 0.8, 1, 1, ext, { top: 0.2, left: 0.2, right: 0.1 });
    }
    p.box(-5.8, -3.9, ZT + 0.8 + ext, 11.6, 1.8, 1.6, { top: 0.3, left: 0.2, right: SH.right });
    // the carry handle on top
    p.box(-2.8, 0.8, ZT, 0.9, 1.4, 1.6, { top: 0.2, left: 0.14, right: SH.right });
    p.box(1.9, 0.8, ZT, 0.9, 1.4, 1.6, { top: 0.2, left: 0.14, right: SH.right });
    p.box(-2.8, 0.8, ZT + 1.6, 5.6, 1.4, 1, { top: SH.top, left: 0.16, right: SH.right });
    // the luggage tag, hanging from the carry handle over the front edge; it swings on hover
    const sw = h * 0.22 * Math.sin(t * 4.2);
    const pv: V3 = [2.3, D + 0.2, ZT + 1.2];
    p.push();
    p.rotate("y", sw, pv);
    p.line([pv, [3.2, D + 0.2, ZT - 2.2]], SH.edge, 0.55);
    p.face([[2.2, D + 0.2, ZT - 2], [4.8, D + 0.2, ZT - 2], [4.8, D + 0.2, ZT - 6.4], [2.2, D + 0.2, ZT - 6.4]], 0.26, SH.edge, 0.5);
    p.line([[2.9, D + 0.24, ZT - 4], [4.1, D + 0.24, ZT - 4]], SH.edge, 0.5);
    p.line([[2.9, D + 0.24, ZT - 5.2], [3.8, D + 0.24, ZT - 5.2]], SH.edge, 0.5);
    p.pop();
  },
};
