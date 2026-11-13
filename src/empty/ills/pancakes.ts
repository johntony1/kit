// No breakfast yet: a stack of pancakes on a plate, a pat of butter on top. Hover and syrup pours over the top and runs down the sides while the butter slides.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const R = 12.5, TH = 3.2, N = 5; // pancake radius, thickness, how many
const front = (r: number, z: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
// the syrup pool on top: a wobbly blob that grows
const blob = (r: number, z: number): V3[] => Array.from({ length: 40 }, (_, i) => {
  const a = (i / 40) * Math.PI * 2, w = r * (1 + 0.12 * Math.sin(a * 3 + 1) + 0.07 * Math.sin(a * 5));
  return [Math.cos(a) * w, Math.sin(a) * w, z] as V3;
});
// drips down the side, at these angles (radians round the stack), with their full lengths
const DRIPS: [number, number][] = [[0.15, 9], [0.85, 13], [1.5, 7], [2.2, 10.5], [-0.6, 6]];

export const pancakes: Illustration = {
  k: "pancakes", name: "Pancakes", title: "No breakfast yet", body: "Plan your first breakfast and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const pour = ease(seg(h, 0, 0.55)), run = ease(seg(h, 0.3, 1));
    p.translate(0, 0, -10);
    p.scale(1.05);
    p.shadow(0, 0, 28, 14, 0.1);
    // the plate: a thin lit disc with a rim cut
    p.cylinder(0, 0, 0, 16, 1.4, { side: 0.05, top: 0.065, edge: 0 });
    // the stack: each pancake a little off centre, a dark seam between them
    const top = 1.4 + N * TH;
    for (let i = 0; i < N; i++) {
      const ox = Math.sin(i * 2.3) * 0.7, oy = Math.cos(i * 1.7) * 0.7, z = 1.4 + i * TH;
      p.cylinder(ox, oy, z, R, TH, { side: 0.26, top: 0.2, edge: 0 });
      p.line(front(R, z + 0.1).map(([x, y, zz]) => [x + ox, y + oy, zz] as V3), SH.edge, 0.65);
    }
    const ox = Math.sin((N - 1) * 2.3) * 0.7, oy = Math.cos((N - 1) * 1.7) * 0.7;
    // the syrup: a dark pool on top, and drips running down the side
    p.push();
    p.translate(ox, oy, 0);
    p.face(blob(5 + 4.2 * pour, top + 0.03), 0.075, SH.edge, 0.6);
    if (run > 0) for (const [a, L] of DRIPS) {
      const len = L * run, w = 0.3, r = R + 0.06;
      const pts: V3[] = [];
      for (let j = 0; j <= 6; j++) { const u = j / 6; pts.push([Math.cos(a - w) * r, Math.sin(a - w) * r, top - len * u]); }
      for (let j = 0; j <= 8; j++) { const b = a - w + (2 * w * j) / 8, dip = Math.sin((Math.PI * j) / 8) * 1.2; pts.push([Math.cos(b) * r, Math.sin(b) * r, top - len - dip]); }
      for (let j = 6; j >= 0; j--) { const u = j / 6; pts.push([Math.cos(a + w) * r, Math.sin(a + w) * r, top - len * u]); }
      p.face(pts, 0.05, 0);
    }
    // the butter: a pat that slides off centre as the syrup comes
    const bx = -1.5 + 3.5 * run, by = -1 + 2.5 * run;
    p.push();
    p.rotate("z", 0.35 + 0.3 * run, [bx + 3, by + 3, 0]);
    p.box(bx, by, top, 6, 6, 2.4, { top: 0.4, left: 0.3, right: 0.14, edge: 0 });
    p.pop();
    p.pop();
  },
};
