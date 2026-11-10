// No results: a magnifier glides in a slow circle over a grid of dashed, empty tiles.
import { SH, type Illustration, type V3 } from "../dots";

const P = 6;
const S = Math.SQRT1_2;

const circle = (cx: number, cy: number, z: number, r: number, n = 40): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]; });

export const noresults: Illustration = {
  k: "noresults", name: "Magnifier", title: "Nothing matches that search", body: "Try a different word, or check the spelling, and search again.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(-1, 1, -9);
    p.shadow(0, 0, 30, 14, 0.12);
    const W = 12.5;
    p.box(-W, -W, 0, W * 2, W * 2, 2.4, { top: p.ink ? 0.2 : 0.12, left: 0.12, right: 0.065 });
    if (!p.ink) p.line([[-W, W, 2.4], [W, W, 2.4], [W, -W, 2.4]], SH.edge, 0.6);
    const Z = 2.42;
    // the empty tiles: dashed squares
    const T = 2.4;
    for (const x of [-7.5, 0, 7.5]) for (const y of [-7.5, 0, 7.5]) {
      const q: V3[] = [[x - T, y - T, Z], [x + T, y - T, Z], [x + T, y + T, Z], [x - T, y + T, Z]];
      if (p.ink) p.guide([...q, q[0]]);
      else { p.face(q, 0.22, 0); p.line([...q, q[0]], SH.edge, 0.6); }
    }
    // where the lens is looking
    const a = (t / P) * Math.PI * 2;
    const mx = Math.cos(a) * 5, my = Math.sin(a) * 5;
    const r = 4.4, zr = Z + 10 + Math.sin(a * 2) * 0.6;
    // in line art an accent ring; in dots a lit pool with a cut rim
    p.disc(mx, my, Z, r * 0.95, p.ink ? 0.3 : 0.22, p.ink ? 1 : 0);
    if (!p.ink) p.line(circle(mx, my, Z, r * 0.95), SH.edge, 0.7);
    // dashed drops from the rim to the spot
    p.guide([[mx - r * S, my + r * S, Z], [mx - r * S, my + r * S, zr + 0.7]], true);
    p.guide([[mx + r * S, my - r * S, Z], [mx + r * S, my - r * S, zr + 0.7]], true);
    // the magnifier: a rim, the glass, and a handle off to the front right
    p.cylinder(mx, my, zr, r, 1.5, { side: p.ink ? 0.12 : 0.065, top: 0.24 });
    p.disc(mx, my, zr + 1.52, r - 1.1, p.ink ? 0.12 : 0.02, p.ink ? 1 : 0);
    // a glint on the glass
    if (p.ink) p.line(circle(mx, my, zr + 1.54, r - 2, 40).slice(24, 31), SH.edge, 0.7);
    else p.face(circle(mx, my, zr + 1.54, r - 2, 40).slice(23, 32).concat(circle(mx, my, zr + 1.54, r - 2.9, 40).slice(23, 32).reverse()), 0.22, 0);
    p.push();
    p.translate(mx, my, zr);
    p.rotate("z", -0.5);
    p.box(r - 0.2, -0.8, 0.1, 2.6, 1.6, 1.3, { top: 0.2, left: 0.12, right: 0.065 });
    p.box(r + 2.4, -1.15, -0.1, 6, 2.3, 1.7, { top: 0.22, left: 0.12, right: 0.065 });
    p.line([[r + 4, -1.15, 1.62], [r + 4, 1.15, 1.62]], SH.edge, 0.55);
    p.pop();
  },
};
