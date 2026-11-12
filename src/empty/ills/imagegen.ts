// No images generated: four blank tiles in a grid, a big sparkle floating over them. Hover and the tiles pop and fill with pictures one by one while the sparkle rises and twinkles.
import { SH, type Illustration, type V3 } from "../dots";

const S = 10, G = 3.6, TH = 2.6; // tile size, gap, thickness
const Q = Math.SQRT1_2;
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

export const imagegen: Illustration = {
  k: "imagegen", name: "Image generation", title: "No images generated", body: "Describe what you want to see and your images will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -8);
    p.shadow(0, 0, 32, 16, 0.1);
    const tiles: [number, number][] = [[-S - G / 2, -S - G / 2], [G / 2, -S - G / 2], [-S - G / 2, G / 2], [G / 2, G / 2]];
    tiles.forEach(([x, y], i) => {
      const k = seg(h, 0.05 + i * 0.16, 0.4 + i * 0.16), e = ease(k);
      const z = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 3 : 0;
      p.box(x, y, z, S, S, TH, { top: 0.16 + 0.14 * e, left: 0.13, right: 0.07, lw: 0.6 });
      const cx = x + S / 2, cy = y + S / 2, zt = z + TH + 0.03;
      // glyph space on the tile: u to screen right, v to screen up
      const g = (u: number, v: number): V3 => [cx + (u - v) * Q, cy + (-u - v) * Q, zt];
      if (e > 0.4) {
        // a tiny landscape: two peaks and a sun
        p.line([g(-4, -2.6), g(-1.5, 1.4), g(0.2, -1), g(1.7, 0.8), g(4, -2.6), g(-4, -2.6)], SH.edge, 0.9);
        p.dot(g(2.5, 3), 0.9, 0);
      } else {
        // an empty slot
        p.line([g(-1.6, 0), g(1.6, 0)], SH.edge, 0.8); p.line([g(0, -1.6), g(0, 1.6)], SH.edge, 0.8);
      }
    });
    // the sparkle: a four point star facing us, rising and pulsing on hover
    const e = ease(h);
    const star = (at: V3, R: number, rot: number, shade: number) => {
      const [x, y] = p.pt(at);
      p.screen((c) => {
        c.beginPath();
        for (let i = 0; i < 8; i++) { const a = rot + (i * Math.PI) / 4, r = i % 2 ? R * 0.36 : R; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
        c.closePath();
        const n = Math.round(255 * shade); c.fillStyle = `rgb(${n},${n},${n})`; c.fill();
        c.strokeStyle = "#000"; c.lineWidth = 0.5; c.stroke();
      });
    };
    const zs = 19 + 4 * e + h * Math.sin(t * 2.4) * 0.8;
    if (h > 0.05) p.guide([[0, 0, zs - 6], [0, 0, TH]], true);
    star([0, 0, zs], 6 + 1.6 * e + h * Math.sin(t * 5) * 0.5, 0, 1);
    const k2 = seg(h, 0.5, 0.9);
    if (k2 > 0) {
      star([9, -9, zs + 3], 2.6 * k2 * (1 + 0.2 * Math.sin(t * 4)), 0, 1);
      star([-11, 6, zs + 1], 2 * k2 * (1 + 0.2 * Math.sin(t * 4 + 2)), 0, 1);
    }
  },
};
