// Nothing sharpened: a pencil pushed into the round hole of a box sharpener. Hover and the pencil turns in the blade and a curly shaving grows out of the slot on top.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const BX = 11, BY = 8, BH = 18; // half width, half depth and height of the sharpener
const PZ = 8.5, PR = 3.6; // pencil axis height, pencil radius

/** a six sided rod along +y from y0 to y1 at (0, PZ), facets lit by how much they look up, cut apart */
function rod(p: Pen, y0: number, y1: number, r: number, tones: [number, number, number], spin: number, cuts: boolean, ring = false) {
  for (let i = 0; i < 6; i++) {
    const a0 = spin + (i / 6) * Math.PI * 2, a1 = a0 + Math.PI / 3, m = (a0 + a1) / 2;
    if (Math.cos(m) * 1.3 + Math.sin(m) < 0) continue;
    const pt = (a: number, y: number): V3 => [Math.cos(a) * r, y, PZ + Math.sin(a) * r];
    const s = Math.sin(m), f = s > 0.5 ? tones[0] : s > -0.3 ? tones[1] : tones[2];
    p.face([pt(a0, y0), pt(a1, y0), pt(a1, y1), pt(a0, y1)], f, 0);
    if (cuts && Math.cos(a0) * 1.3 + Math.sin(a0) > 0.4) p.line([pt(a0, y0), pt(a0, y1)], SH.edge, 0.55);
    if (ring) p.line([pt(a0, y1), pt(a1, y1)], SH.edge, 0.7);
  }
}

export const sharpener: Illustration = {
  k: "sharpener", name: "Sharpener", title: "Nothing sharpened", body: "Your sharpened work will be ready here once you start.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(5, -5, -12);
    p.shadow(-2, 8, 34, 12, 0.12);
    p.rotate("z", 0.15); // the hole looks down to the left, the pencil comes out toward us
    // the block: a lit top with the blade and its screw, the hole face, a shaded end
    p.box(-BX, -BY, 0, BX * 2, BY * 2, BH, { top: 0.24, left: 0.14, right: 0.065, edge: 0 });
    p.line([[-BX, BY + 0.05, BH], [BX, BY + 0.05, BH], [BX + 0.05, -BY, BH]], SH.edge, 0.9); // the top's front edges
    p.line([[BX + 0.05, BY + 0.05, 0], [BX + 0.05, BY + 0.05, BH]], SH.edge, 0.8);
    p.line([[-BX + 2.5, BY - 1.2, BH + 0.05], [BX - 2.5, BY - 1.2, BH + 0.05]], SH.edge, 1.3);
    p.dot([0, BY - 4, BH + 0.06], 1.2, 0);
    p.ringV("y", [0, BY + 0.02, PZ], PR + 3.6, 0.02, 0);
    p.ringV("y", [0, BY + 0.03, PZ], PR + 2.6, 0.3, 0);
    p.ringV("y", [0, BY + 0.05, PZ], PR + 1, 0.01, 0);
    // the pencil going into the hole, turning while hovered
    const k = Math.min(1, h * 1.4), Y0 = BY - 2 * k, L = 19;
    const spin = -0.3 + h * 1.6 + h * t * 1.4;
    rod(p, Y0, Y0 + L, PR, [0.3, 0.2, 0.09], spin, true);
    rod(p, Y0 + L, Y0 + L + 3.2, PR + 0.15, [0.34, 0.24, 0.1], spin, false, true); // the ferrule
    rod(p, Y0 + L + 3.2, Y0 + L + 6.5, PR, [0.2, 0.12, 0.065], spin, false); // the eraser
    p.ringV("y", [0, Y0 + L + 6.5, PZ], PR, 0.14, 0);
    // the shaving: a bright ribbon that curls up out of the slot
    const g = Math.max(0, (h - 0.2) / 0.8);
    if (g > 0.02) {
      const [bx, by] = p.pt([2, BY - 2, BH]);
      const n = Math.ceil(30 * g);
      const pts = Array.from({ length: n + 1 }, (_, i) => {
        const s = i / 30, a = s * Math.PI * 3.2, r = 1 + s * 5;
        return [bx + 2 + s * 5 + Math.sin(a) * r, by - 1 - s * 8 - (1 - Math.cos(a)) * r * 0.7] as [number, number];
      });
      p.screen((c) => {
        c.lineCap = "round"; c.lineJoin = "round";
        for (const [col, lw] of [["#000", 4.6], ["#fff", 2.6]] as [string, number][]) {
          c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
        }
      });
    }
  },
};
