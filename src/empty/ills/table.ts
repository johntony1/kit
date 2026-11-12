// No reservations: a round restaurant table laid for two, a chair either side. Hover and the chairs draw back, the candle lights and a reserved card stands up on the table.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ZS = 7.6, ZT = 14.5; // seat height, table top height

function chair(p: Pen, cx: number, sgn: number) {
  const s = 3.4;
  for (const [x, y] of [[-s, -s], [s, -s], [-s, s], [s, s]]) p.line([[cx + x * 0.86, y * 0.86, 0], [cx + x * 0.86, y * 0.86, ZS]], 0.75, 0.8);
  p.box(cx - s, -s, ZS, 2 * s, 2 * s, 1.3, { top: 0.24, left: 0.14, right: 0.07, lw: 0.6 });
  // the back, on the side away from the table: two posts, a top rail and a slat
  const bx = sgn > 0 ? cx + s - 0.9 : cx - s;
  p.box(bx, -s, ZS + 1.3, 0.9, 0.9, 10, { top: 0.24, left: 0.16, right: 0.09 });
  p.box(bx, s - 0.9, ZS + 1.3, 0.9, 0.9, 10, { top: 0.24, left: 0.16, right: 0.09 });
  p.box(bx, -s, ZS + 8.6, 0.9, 2 * s, 2.7, { top: 0.26, left: 0.16, right: sgn > 0 ? 0.1 : 0.2, lw: 0.6 });
  p.box(bx, -s, ZS + 4.6, 0.9, 2 * s, 1.5, { top: 0.24, left: 0.16, right: sgn > 0 ? 0.1 : 0.2 });
}

export const table: Illustration = {
  k: "table", name: "Restaurant table", title: "No reservations", body: "Book a table and the time, place and party size will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(seg(h, 0, 0.55)), out = 14.2 + 3.2 * k;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 32, 14, 0.11);
    chair(p, -out, -1);
    // the table: a foot, a stem and a round top with a cloth edge
    p.cylinder(0, 0, 0, 5.4, 1.1, { side: 0.1, top: 0.18 });
    p.cylinder(0, 0, 1.1, 1.4, ZT - 1.1, { side: 0.2, top: 0.2 });
    p.cylinder(0, 0, ZT, 11.4, 1.5, { side: 0.13, top: 0.22, lw: 0.65 });
    const Z = ZT + 1.52;
    // two plates
    for (const x of [-6.2, 6.2]) { p.disc(x, 0, Z, 3.1, 0.34, SH.edge); p.disc(x, 0, Z + 0.01, 1.8, 0.2, SH.edge); }
    // the candle, lit on hover
    p.cylinder(0, -4.2, Z, 1, 3, { side: 0.3, top: 0.3 });
    const f = seg(h, 0.3, 0.6);
    if (f > 0) p.dot([0, -4.2, Z + 4.6 + 0.2 * Math.sin(t * 9)], (1.25 + 0.2 * Math.sin(t * 13)) * f, 1);
    // the reserved card: a little tent that stands up
    const c = ease(seg(h, 0.5, 0.9));
    if (c > 0) {
      const hh = 4.6 * c, y0 = 5, y1 = 2.2, ym = (y0 + y1) / 2;
      p.face([[3, y1, Z], [3, y0, Z], [3, ym, Z + hh]], 0.1, SH.edge, 0.5);
      p.face([[-3, y0, Z], [3, y0, Z], [3, ym, Z + hh], [-3, ym, Z + hh]], 0.9, SH.edge, 0.6);
      p.line([[-1.5, y0 - 0.7 + 0.04, Z + hh * 0.5], [1.5, y0 - 0.7 + 0.04, Z + hh * 0.5]], 0.02, 0.7);
    }
    chair(p, out, 1);
  },
};
