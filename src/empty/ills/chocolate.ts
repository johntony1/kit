// No sweets yet: a chocolate bar standing up, half out of its paper wrapper, four big squares on top. Hover and the top corner square snaps off and lifts away, tipping, a crumb falling.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const back = (x: number) => { const v = Math.min(1, Math.max(0, x)); return 1 + 2.2 * Math.pow(v - 1, 3) + 1.2 * Math.pow(v - 1, 2); };
const T = 1.6, G = 0.9, SQ = 1.6; // half the slab's thickness, half a groove, how far a square stands out
const Z0 = 20, ROW = 9, COL = 10; // where the chocolate leaves the wrapper, a row's height, a column's width
const SLAB = { top: 0.2, left: 0.035, right: 0.065, edge: 0 };

/** one square: a block standing out of the slab's face, lit, with a cut inset like a moulded bar */
function square(p: Pen, x: number, z: number) {
  p.box(x + G, T, z + G, COL - 2 * G, SQ, ROW - 2 * G, { top: 0.32, left: 0.22, right: 0.08, edge: 0 });
  const a = x + G + 1.6, b = x + COL - G - 1.6, c = z + G + 1.5, d = z + ROW - G - 1.5, y = T + SQ + 0.03;
  p.line([[a, y, c], [b, y, c], [b, y, d], [a, y, d], [a, y, c]], SH.edge, 0.65);
}

export const chocolate: Illustration = {
  k: "chocolate", name: "Chocolate bar", title: "No sweets yet", body: "Treats you add to your order will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-2, 2, -20);
    p.shadow(0, 0, 22, 10, 0.12);
    p.rotate("z", -0.5); // turned so its face looks at us
    p.rotate("x", 0.12); // leaning back a little
    const WW = 10.8, WF = T + SQ + 0.5, WB = -T - 0.6; // the wrapper's half width, its front and back
    // the wrapper's open mouth, dark, then the chocolate rising out of it
    p.face([[-WW, WB, Z0], [WW, WB, Z0], [WW, WF, Z0], [-WW, WF, Z0]], 0.03, 0);
    p.box(-COL, -T, Z0 - 1, COL * 2, T * 2, ROW + 1, SLAB);
    p.box(-COL, -T, Z0 + ROW, COL, T * 2, ROW, SLAB);
    square(p, -COL, Z0 + ROW);
    square(p, -COL, Z0);
    square(p, 0, Z0);
    // a strip of foil peeking out of the wrapper
    p.box(-WW + 0.4, WB + 0.4, Z0 - 2, WW * 2 - 0.8, WF - WB - 0.6, 3.2, { top: 0.5, left: 0.45, right: 0.3, edge: 0 });
    // the paper wrapper: a torn top edge, a cut label on its face, the end in shade
    p.face([[WW, WB, 0], [WW, WF, 0], [WW, WF, Z0 + 0.4], [WW, WB, Z0 - 0.4]], 0.065, 0);
    const torn: V3[] = Array.from({ length: 13 }, (_, i) => [WW - (i / 12) * WW * 2, WF, Z0 + (i % 2 ? -0.8 : 0.4)]);
    p.face([[-WW, WF, 0], [WW, WF, 0], ...torn], 0.22, 0);
    p.line([[-WW + 2.2, WF + 0.03, 5], [WW - 2.2, WF + 0.03, 5], [WW - 2.2, WF + 0.03, 13], [-WW + 2.2, WF + 0.03, 13], [-WW + 2.2, WF + 0.03, 5]], SH.edge, 0.75);
    // the top corner square snaps off, lifts up and away and tips, then bobs while hovered
    const k = back(h / 0.7), bob = h > 0.7 ? Math.sin(t * 2.6) * 0.5 * (h - 0.7) / 0.3 : 0;
    p.push();
    p.translate(6 * k, 2 * k, Z0 + ROW + 5 * k + bob);
    p.rotate("y", 0.45 * k, [COL / 2, 0, ROW / 2]);
    p.box(0, -T, 0, COL, T * 2, ROW, SLAB);
    square(p, 0, 0);
    p.pop();
    // a crumb falls from the break
    if (h > 0.15) { const c = ease((h - 0.15) / 0.6); p.dot([3, WF, Z0 + ROW - 2 - 6 * c], 0.8, 0.6); }
  },
};
