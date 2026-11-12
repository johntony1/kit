// No screens nearby: a flat screen on its stand, showing only the cast mark. The mark's waves light up one after another, searching.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop

export const cast: Illustration = {
  k: "cast", name: "Cast screen", title: "No screens nearby", body: "Turn on a TV or speaker on the same network and it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 1, -15);
    p.shadow(0, 0, 27, 12, 0.1);
    p.rotate("z", -0.38);
    const X = 18.5, Y = 1.1, Z0 = 6.5, Z1 = 30;
    // the foot and the neck
    p.box(-7, -4, 0, 14, 8, 1.1, { lw: 0.55 });
    p.box(-1.6, -1, 1.1, 3.2, 2, Z0 - 1.1, { lw: 0.5 });
    // the screen: a lit bezel around dark glass
    p.box(-X, -Y, Z0, X * 2, Y * 2, Z1 - Z0, { top: 0.24, left: 0.2, right: 0.07, lw: 0.65 });
    const y = Y + 0.03;
    p.face([[-X + 1.5, y, Z0 + 1.5], [X - 1.5, y, Z0 + 1.5], [X - 1.5, y, Z1 - 1.5], [-X + 1.5, y, Z1 - 1.5]], 0.03, SH.edge, 0.5);
    // the cast mark: a screen outline with a corner dot and three waves
    const cx = -7.5, cz = Z0 + 5.5, yy = y + 0.03;
    const band = (r: number, w: number): V3[] => {
      const o: V3[] = [], n = 12;
      for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2; o.push([cx + Math.cos(a) * (r + w), yy, cz + Math.sin(a) * (r + w)]); }
      for (let i = n; i >= 0; i--) { const a = (i / n) * Math.PI / 2; o.push([cx + Math.cos(a) * (r - w), yy, cz + Math.sin(a) * (r - w)]); }
      return o;
    };
    // the outline, open at the corner where the waves sit
    const fr = (a: V3, b: V3) => { const h = a[0] === b[0]; p.face(h ? [[a[0] - 0.5, yy, a[2]], [a[0] + 0.5, yy, a[2]], [b[0] + 0.5, yy, b[2]], [b[0] - 0.5, yy, b[2]]] : [[a[0], yy, a[2] - 0.5], [b[0], yy, b[2] - 0.5], [b[0], yy, b[2] + 0.5], [a[0], yy, a[2] + 0.5]], 0.5, 0); };
    fr([cx, yy, cz + 9.5], [cx, yy, cz + 13.5]); fr([cx - 0.5, yy, cz + 13.5], [cx + 15.5, yy, cz + 13.5]); fr([cx + 15, yy, cz], [cx + 15, yy, cz + 13.5]); fr([cx + 9.5, yy, cz], [cx + 15.5, yy, cz]);
    p.face(band(0.9, 0.9), 0.95, 0);
    for (let i = 0; i < 3; i++) {
      const on = Math.min(1, Math.max(0, ph * 5 - 0.6 - i)) * Math.min(1, (1 - ph) * 6);
      p.face(band(3.3 + i * 2.5, 0.65), 0.06 + 0.89 * on, 0);
    }
  },
};
