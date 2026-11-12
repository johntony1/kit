// No journal entries: a closed journal with a strap and a ribbon, a pen beside it. Hover and the cover swings open and lines write themselves on the first page.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 10.5, L = 14, TH = 4.6; // half width, half length, thickness of the pages
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a slab that may be turned any way: only the faces looking at us are drawn */
function rbox(p: Pen, x: number, y: number, z: number, w: number, d: number, hh: number, under: number) {
  const X = x + w, Y = y + d, Z = z + hh;
  const fs: [V3[], number][] = [
    [[[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], 0.2],
    [[[x, Y, z], [X, Y, z], [X, y, z], [x, y, z]], under],
    [[[x, Y, Z], [X, Y, Z], [X, Y, z], [x, Y, z]], 0.13],
    [[[x, y, z], [X, y, z], [X, y, Z], [x, y, Z]], 0.06],
    [[[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]], 0.065],
    [[[x, y, Z], [x, Y, Z], [x, Y, z], [x, y, z]], 0.06],
  ];
  for (const [f, fill] of fs) if (facing(p, f) > 0) p.face(f, fill, SH.edge, 0.55);
}

export const journal: Illustration = {
  k: "journal", name: "Journal", title: "No journal entries", body: "Write a few lines about your day and your entries will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const e = ease(clamp(h / 0.6)), a = -2.2 * e;
    p.translate(-1 + 4 * e, -1, -4);
    p.shadow(0, 0, 32, 16, 0.11);
    // the back cover, the ribbon's tail, the block of pages
    p.box(-W - 0.5, -L - 0.5, 0, 2 * W + 1, 2 * L + 1, 0.8, { top: 0.2, left: 0.13, right: 0.065, lw: 0.5 });
    p.face([[-3.4, L + 0.5, 0.05], [-0.8, L + 0.5, 0.05], [-0.8, L + 5.6, 0.05], [-2.1, L + 4.2, 0.05], [-3.4, L + 5.6, 0.05]], 0.32, SH.edge, 0.5);
    p.box(-W, -L, 0.8, 2 * W, 2 * L, TH - 0.8, { top: 0.2, left: 0.09, right: 0.055, lw: 0.5 });
    for (const z of [1.9, 2.9, 3.9]) p.line([[-W, L + 0.03, z], [W, L + 0.03, z], [W + 0.03, -L, z]], SH.edge, 0.4);
    // the first page: lines that write themselves once the cover is clear
    const k = clamp((h - 0.4) / 0.55);
    for (let i = 0; i < 6; i++) {
      const q = clamp(k * 6.5 - i), y = -L + 4 + i * 3.6, len = (i === 5 ? 9 : i % 2 ? 14 : 16) * q;
      if (q > 0) p.line([[-W + 2.6, y, TH + 0.03], [-W + 2.6 + len, y, TH + 0.03]], SH.edge, 0.9);
    }
    // the cover: turns about the spine, strap and label on it
    p.push();
    p.rotate("y", a, [-W - 0.5, 0, TH]);
    rbox(p, -W - 0.5, -L - 0.5, TH, 2 * W + 1, 2 * L + 1, 0.8, 0.12);
    if (e < 0.35) {
      const z = TH + 0.84;
      p.line([[W - 3.2, -L - 0.5, z], [W - 3.2, L + 0.5, z]], SH.edge, 1.4);
      p.line([[-5.4, -9, z], [2.2, -9, z], [2.2, -3.6, z], [-5.4, -3.6, z], [-5.4, -9, z]], SH.edge, 0.7);
      p.line([[-3.6, -6.3, z], [0.4, -6.3, z]], SH.edge, 0.7);
    }
    p.pop();
    // the pen beside it: a barrel, a cap band, a point
    const px = W + 4.2;
    p.box(px, -8, 0, 2.2, 15, 2.2, { top: 0.22, left: 0.13, right: 0.065, lw: 0.5 });
    p.line([[px, -3.6, 2.23], [px + 2.2, -3.6, 2.23], [px + 2.23, -3.6, 0]], SH.edge, 0.8);
    p.face([[px, 7, 2.2], [px + 2.2, 7, 2.2], [px + 1.1, 10.4, 0.4]], 0.24, SH.edge, 0.5);
    p.face([[px + 2.2, 7, 0], [px + 2.2, 7, 2.2], [px + 1.1, 10.4, 0.4]], 0.065, SH.edge, 0.5);
  },
};
