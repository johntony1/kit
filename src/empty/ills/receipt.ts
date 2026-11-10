// No orders yet: a receipt printer. Hover and it feeds out a long receipt that curls over, blank but for its total.
import { SH, type Illustration, type V3 } from "../dots";

const PW = 5.6; // half width of the paper
const SY = -1.6, SZ = 10; // the slot on top of the printer: paper leaves it going straight up
const R = 3.4, C = R * Math.PI * 0.62; // the top end keeps a curl from the roll: its radius and length

// a point on the paper: s runs along it from the slot, x across it; L is how much is out
function at(s: number, x: number, L: number): V3 {
  const hs = L - C; // the straight run below the curl
  if (s <= hs) return [x, SY, SZ + s];
  const f = (s - hs) / R;
  return [x, SY - R + R * Math.cos(f), SZ + hs + R * Math.sin(f)];
}
// how much the paper faces us at s: the front faces +y, then the curl turns it up and back
const facing = (s: number, L: number) => { const f = Math.max(0, (s - L + C) / R); return Math.cos(f) + Math.sin(f); };

export const receipt: Illustration = {
  k: "receipt", name: "Receipt", title: "No orders yet", body: "When a customer places an order, the receipt will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 22, 11, 0.12);
    // the printer
    p.box(-9, -7, 0, 18, 14, SZ, { top: 0.2, left: 0.12, right: 0.065 });
    p.line([[-7, SY, SZ + 0.02], [7, SY, SZ + 0.02]], SH.edge, 1.3); // the slot
    p.line([[-7, SY + 1.6, SZ + 0.02], [7, SY + 1.6, SZ + 0.02]], SH.edge, 0.55); // the tear bar
    // the front: a lit display, a button and a light that blinks while it prints
    p.face([[-7, 7.02, 4], [0, 7.02, 4], [0, 7.02, 8], [-7, 7.02, 8]], 0.3, SH.edge, 0.5);
    p.line([[-5.6, 7.05, 6.6], [-2.6, 7.05, 6.6]], SH.edge, 0.7);
    p.line([[-5.6, 7.05, 5.2], [-4, 7.05, 5.2]], SH.edge, 0.7);
    p.ringV("y", [4, 7.04, 6], 1.7, 0.3, SH.edge, 0.5);
    p.line([[2.5, 7.05, 2.2], [5.5, 7.05, 2.2]], SH.edge, 0.6);
    if (h > 0.05 && Math.sin(t * 14) > 0) p.dot([7.4, 7.05, 8.2], 0.8, 1);

    // the paper: longer as it feeds, drawn from its curled end back to the slot
    const L = 19 + 9 * h;
    const P = (s: number, x: number) => at(s, x, L);
    const step = 0.5;
    for (let s1 = L; s1 > 0; s1 -= step) {
      const s0 = Math.max(0, s1 - step);
      const v = facing((s0 + s1) / 2, L);
      const fill = v > 0.5 ? 0.26 : v > 0 ? 0.2 : 0.13;
      if (s1 === L) {
        // the torn end: a zigzag edge
        const teeth: V3[] = [];
        for (let i = 0; i <= 8; i++) teeth.push(P(i % 2 ? L - 0.8 : L, -PW + (2 * PW * i) / 8));
        p.face([P(s0, -PW), P(s0, PW), ...teeth.reverse()], fill, 0);
      } else p.face([P(s0, -PW), P(s0, PW), P(s1, PW), P(s1, -PW)], fill, 0);
    }
    // its two long edges, cut crisp against the printer behind
    const hs = L - C;
    p.line([P(0, -PW), P(hs, -PW)], SH.edge, 0.55);
    p.line([P(0, PW), P(hs, PW)], SH.edge, 0.55);
    // all that is printed, measured down from the top: a dashed rule, then the total and its amount
    const d0 = L - C - 3.4;
    for (let x = -4.8; x < 4.4; x += 1.8) p.line([P(d0, x), P(d0, x + 0.9)], SH.edge, 0.6);
    p.line([P(d0 - 2.6, -4.6), P(d0 - 2.6, -1.4)], SH.edge, 0.95);
    p.line([P(d0 - 2.6, 1.6), P(d0 - 2.6, 4.6)], SH.edge, 0.95);
    p.line([P(d0 - 4.4, 1.6), P(d0 - 4.4, 4.6)], SH.edge, 0.55);
  },
};
