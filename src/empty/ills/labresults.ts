// No results yet: three test tubes standing in a rack. Hover and the samples rise to their levels one by one, bubbling, and a tick pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const XS = [-10, 0, 10], LEVEL = [22, 15.5, 19];
const ZS = 8.4, ZT = 27, R = 3.5; // the shelf's height, the tubes' tops, their radius

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.35); g.stroke();
  });
}

export const labresults: Illustration = {
  k: "labresults", name: "Lab results", title: "No results yet", body: "When your lab sends results back, you will find them here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 1, 32, 13, 0.11);
    p.rotate("z", -0.32);
    p.box(-17.5, -5, 0, 35, 10, 2, { top: 0.2, left: 0.12, right: 0.065 });
    // the tubes' round ends under the shelf, full of sample
    for (const x of XS) p.cylinder(x, 0, 2, R - 0.3, ZS - 2, { side: 0.3, top: 0.3, edge: 0.8, lw: 0.45 });
    for (const x of [-17.5, 15.3]) p.box(x, -3.6, 2, 2.2, 7.2, ZS - 2, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the shelf with its holes
    p.box(-17.5, -4.4, ZS, 35, 8.8, 1.6, { top: 0.2, left: 0.13, right: 0.07, lw: 0.6 });
    const z0 = ZS + 1.62;
    XS.forEach((x, i) => {
      const k = ease(clamp((h - 0.04 - i * 0.17) / 0.46));
      const lv = 12.6 + (LEVEL[i] - 12.6) * k;
      // the glass, then the sample standing in it
      p.cylinder(x, 0, z0, R, ZT - z0, { side: 0.055, top: 0.02, lw: 0.6 });
      p.cylinder(x, 0, z0, R - 0.3, lv - z0, { side: 0.34, top: 0.5, edge: 1, lw: 0.5 });
      if (h > 0.3) for (let j = 0; j < 2; j++) {
        const q = (t * 0.8 + i * 0.37 + j * 0.5) % 1;
        p.dot([x + 1.4 + (j ? 0.8 : -0.5), 2, z0 + 0.5 + q * (lv - z0 - 1.5)], 0.55, 0);
      }
    });
    const b = clamp((h - 0.7) / 0.3);
    if (b > 0) tick(p, [19, -3, 27], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
