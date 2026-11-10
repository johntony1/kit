// No PDFs yet: a page with a folded corner and a PDF badge. Hover and it floats up, the corner lifts and the badge pops out.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 10, Y = 13, T = 0.9, F = 7; // half width, half depth, thickness, size of the folded corner

/** the letters P, D, F cut into a face lying at height z, reading along +x, from (x, y) at their foot */
function letters(p: Pen, x: number, y: number, z: number) {
  const hgt = 2.8, w = 1.7, g = 1.1, lw = 0.6;
  const L = (pts: [number, number][]) => p.line(pts.map(([u, v]) => [x + u, y - v, z] as V3), SH.edge, lw);
  // P
  L([[0, 0], [0, hgt], [w, hgt], [w, hgt * 0.5], [0, hgt * 0.5]]);
  // D
  const d = w + g;
  L([[d, 0], [d, hgt], [d + w * 0.6, hgt], [d + w, hgt * 0.75], [d + w, hgt * 0.25], [d + w * 0.6, 0], [d, 0]]);
  // F
  const f = (w + g) * 2;
  L([[f + w, hgt], [f, hgt], [f, 0]]);
  L([[f, hgt * 0.52], [f + w * 0.8, hgt * 0.52]]);
}

export const pdf: Illustration = {
  k: "pdf", name: "PDF document", title: "No PDFs yet", body: "Upload a PDF and it will be ready to read and share from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h / 0.7));
    const pop = Math.max(0, Math.min(1, (h - 0.4) / 0.6));
    const bob = h > 0.95 ? Math.sin(t * 2.4) * 0.5 : 0;
    const z0 = 0.2 + k * 8 + bob, z1 = z0 + T;
    p.translate(0, 0, -8);
    p.shadow(0, 0, 30, 15, 0.12 - 0.04 * k);
    // the spot it lifts from, and dashed drops from its corners
    if (k > 0.05) {
      p.guide([[-X + F, -Y, 0], [X, -Y, 0], [X, Y, 0], [-X, Y, 0], [-X, -Y + F, 0], [-X + F, -Y, 0]], true);
      for (const [x, y] of [[-X, Y], [X, Y], [X, -Y]]) p.guide([[x, y, z0], [x, y, 0]]);
    }
    // the page: a top with one corner cut away, and its two visible edges
    p.face([[-X, Y, z0], [X, Y, z0], [X, Y, z1], [-X, Y, z1]], SH.left, SH.edge, 0.5);
    p.face([[X, -Y, z0], [X, Y, z0], [X, Y, z1], [X, -Y, z1]], SH.right, SH.edge, 0.5);
    p.face([[-X + F, -Y, z1], [X, -Y, z1], [X, Y, z1], [-X, Y, z1], [-X, -Y + F, z1]], 0.22, SH.edge, 0.55);
    // a picture and lines of text
    const Z = z1 + 0.03;
    p.face([[-1.5, -10, Z], [7.5, -10, Z], [7.5, -3.5, Z], [-1.5, -3.5, Z]], p.ink ? 0.13 : 0, SH.edge, 0.6);
    p.line([[0, -5.1, Z + 0.02], [2.6, -7.9, Z + 0.02], [4.4, -6.1, Z + 0.02], [6, -7.3, Z + 0.02]], SH.edge, 0.6);
    for (let i = 0; i < 3; i++) p.line([[-7.5, -0.2 + i * 2.4, Z], [i === 2 ? 1 : 7, -0.2 + i * 2.4, Z]], SH.edge, 0.65);
    // the folded corner: a flap hinged on the cut, lying back over the page and lifting on hover
    const A: V3 = [-X, -Y + F, Z], B: V3 = [-X + F, -Y, Z];
    const M: V3 = [-X + F / 2, -Y + F / 2, Z], phi = 0.1 + k * 0.8, r = F / Math.SQRT2;
    const tip: V3 = [M[0] + (F / 2) * Math.cos(phi), M[1] + (F / 2) * Math.cos(phi), Z + r * Math.sin(phi)];
    if (!p.ink) p.face([A, B, [M[0] + F / 2, M[1] + F / 2, Z]], 0.02, 0); // its shadow on the page
    p.face([A, B, tip], 0.13, SH.edge, 0.55);

    // the badge: a raised tab across the lower left, sliding out past the edge as it pops
    const bx = -X - 2.5 - pop * 3.5, by = 4.6, bz = Z + pop * 2.4, bw = 11, bd = 5.4;
    if (pop > 0.02) p.guide([[bx, by + bd, Z], [bx, by + bd, bz]], true);
    p.box(bx, by, bz, bw, bd, 1.5, { top: 0.34, left: 0.16, right: 0.08 });
    letters(p, bx + 2.1, by + 4.1, bz + 1.53);
  },
};
