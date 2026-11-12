// No menu yet: a menu standing open, blank but for its heading. Hover and it opens wider while the dishes and their prices write themselves in.
import { SH, type Illustration, type V3 } from "../dots";

const S = Math.SQRT1_2;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const L = 13, H = 25; // width of a page, height

export const menu: Illustration = {
  k: "menu", name: "Menu", title: "No menu yet", body: "Add your first dish and your menu will start to take shape here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(seg(h, 0, 0.5)), phi = 0.72 - 0.34 * k;
    p.translate(0, 0, -14);
    p.scale(1.08, [0, 0, 12]);
    p.shadow(0, 0, 25, 11, 0.11);
    // a point on a page: side +1 is the left page, s runs out from the spine, off lifts it off the card
    const pg = (side: number, s: number, z: number, off = 0): V3 => {
      const c = Math.cos(phi) * s * side, f = Math.sin(phi) * s - 4.5 + off;
      return [(-c + f) * S, (c + f) * S, z];
    };
    const quad = (side: number, s0: number, s1: number, z0: number, z1: number, off = 0): V3[] => [pg(side, s0, z0, off), pg(side, s1, z0, off), pg(side, s1, z1, off), pg(side, s0, z1, off)];
    // the cover, a touch bigger than the pages, then the pages
    for (const side of [1, -1]) p.face(quad(side, 0, L + 0.9, 0, H + 0.9, -0.5), 0.06, SH.edge, 0.5);
    p.face(quad(1, 0.3, L, 0.6, H), 0.12, SH.edge, 0.6);
    p.face(quad(-1, 0.3, L, 0.6, H), 0.2, SH.edge, 0.6);
    const ln = (side: number, s0: number, s1: number, z: number, shade: number, lw = 0.6) => p.line([pg(side, s0, z, 0.05), pg(side, s1, z, 0.05)], shade, lw);
    // left page: a round emblem with a fork in it, and a rule under it
    const cs = L / 2 + 0.2, cz = 16.5;
    p.line(Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return pg(1, cs + Math.cos(a) * 3.6, cz + Math.sin(a) * 3.6, 0.05); }), SH.edge, 0.7);
    p.line([pg(1, cs, cz - 2.2, 0.05), pg(1, cs, cz + 2.2, 0.05)], SH.edge, 0.7);
    p.line([pg(1, cs - 1.1, cz + 2.2, 0.05), pg(1, cs - 1.1, cz + 0.4, 0.05), pg(1, cs + 1.1, cz + 0.4, 0.05), pg(1, cs + 1.1, cz + 2.2, 0.05)], SH.edge, 0.6);
    ln(1, 3.4, L - 3, 9, 0.7); ln(1, 4.6, L - 4.2, 6.6, 0.5);
    // right page: a heading, then dishes and prices, written in one by one
    p.face(quad(-1, 2.2, L - 2.2, 20.2, 22.2, 0.05), 0.5, 0);
    for (let i = 0; i < 5; i++) {
      const w = ease(seg(h, 0.2 + i * 0.13, 0.42 + i * 0.13)), z = 17 - i * 3.1;
      if (w <= 0) continue;
      ln(-1, 2.2, 2.2 + (5.6 - (i % 2) * 1.2) * w, z, SH.edge, 0.75);
      if (w > 0.8) ln(-1, L - 4, L - 2.2, z, SH.edge, 0.75);
    }
    // the spine
    p.line([pg(1, 0, 0, -0.5), pg(1, 0, H + 0.9, -0.5)], SH.edge, 0.6);
  },
};
