// No assets yet: a tray holding three building blocks, a pyramid, a cube and a cylinder. Hover and they hop one after the other.
import { SH, type Illustration, type V3 } from "../dots";

const cl = (x: number) => Math.max(0, Math.min(1, x));

export const assets: Illustration = {
  k: "assets", name: "Asset library", title: "No assets yet", body: "Upload logos, icons and other files to reuse them across your work.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -7);
    p.shadow(0, 0, 32, 16, 0.12);
    const T = 1.8;
    p.box(-18, -16, 0, 36, 32, T, { top: 0.045, left: 0.12, right: 0.065 });
    const hop = (a: number) => Math.sin(cl((h - a) / 0.42) * Math.PI) * 6.5;
    // the pyramid, back right
    const zp = T + hop(0.25), x0 = 2, x1 = 14, y0 = -15, y1 = -3, ap: V3 = [8, -9, zp + 13];
    p.face([[x0, y1, zp], [x1, y1, zp], ap], 0.22, SH.edge, 0.6);
    p.face([[x1, y0, zp], [x1, y1, zp], ap], 0.07, SH.edge, 0.6);
    // the cube, left
    const zc = T + hop(0.05);
    p.box(-15, -1, zc, 10.5, 10.5, 10.5, { top: 0.24, left: 0.14, right: 0.07, lw: 0.6 });
    // the cylinder, in front
    const zy = T + hop(0.45);
    p.cylinder(9, 8.5, zy, 4.8, 9, { side: 0.13, top: 0.26, lw: 0.6 });
    const s = cl((h - 0.7) / 0.3);
    if (s > 0) ([[-16, 4, 17], [17, -9, 20], [14, 10, 12]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.4 * Math.sin(t * 3.2 + i * 2.1), s));
  },
};
