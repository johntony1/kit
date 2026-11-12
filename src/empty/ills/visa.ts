// No visas: an open passport with a blank page and a rubber stamp held over it. Hover and the stamp comes down, lifts away and leaves its mark.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const circle = (cx: number, cy: number, z: number, r: number, n = 28): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

export const visa: Illustration = {
  k: "visa", name: "Visa stamp", title: "No visas", body: "Visas you apply for or upload will be kept here with their dates.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, 0, -6);
    p.scale(1.3);
    p.shadow(0, 0, 26, 12, 0.12);
    // the cover, then the open pages with a fold down the middle
    p.box(-14.6, -10.6, 0, 29.2, 21.2, 0.7, { top: 0.1, left: 0.1, right: 0.06 });
    p.box(-14, -10, 0.7, 28, 20, 1, { top: 0.22, left: 0.15, right: 0.075, lw: 0.6 });
    const z = 1.73;
    p.line([[0, -10, z], [0, 10, z]], SH.edge, 0.7);
    // the left page: a photo and lines of details
    p.clear([[-11.5, -7.5, z], [-6, -7.5, z], [-6, -1, z], [-11.5, -1, z]]);
    for (const y of [1.6, 4.2, 6.8]) p.line([[-11.5, y, z], [y > 6 ? -6 : -2.6, y, z]], SH.edge, 0.8);
    // the right page: the stamp's mark, once it has landed
    const CX = 7, CY = 0;
    if (h > 0.42) {
      p.line(circle(CX, CY, z, 4.3), SH.edge, 0.9);
      p.line(circle(CX, CY, z, 3.1), SH.edge, 0.45);
      p.line([[CX + 0.2, CY - 1.7, z], [CX + 1.6, CY - 0.4, z], [CX - 1.4, CY + 1.9, z]], SH.edge, 0.9);
      p.line([[2.6, 6.4, z], [11.4, 6.4, z]], SH.edge, 0.8);
    }
    // the stamp: down to the page, then up and back out of the way
    const dn = ease(Math.min(1, h / 0.36)), up = ease(Math.min(1, Math.max(0, (h - 0.48) / 0.52)));
    const zs = z + 9 * (1 - dn) + 12 * up, back = 7.5 * up;
    if (zs - z < 9) p.disc(CX, CY, z + 0.01, 4.4 * (1 - (zs - z) / 14), 0.07, 0);
    p.push();
    p.translate(CX - back * 0.3, CY - back, zs);
    p.cylinder(0, 0, 0, 4.6, 1.7, { side: 0.2, top: 0.24, lw: 0.6 });
    p.line(circle(0, 0, 1.72, 4.6), SH.edge, 0.6);
    p.cylinder(0, 0, 1.7, 1.7, 4.6, { side: 0.12, top: 0.2, lw: 0.5 });
    p.cylinder(0, 0, 6.3, 3, 2.8, { side: 0.2, top: 0.26, lw: 0.6 });
    p.line(circle(0, 0, 9.12, 3), SH.edge, 0.6);
    p.pop();
  },
};
