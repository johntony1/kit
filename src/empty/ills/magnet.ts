// Magnet: a big horseshoe magnet leaning to one side, its two pole tips cut off from the body in a lighter tone. Small leads fly in from above and snap onto the poles, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const DX = 3, DY = 2.4; // how far the back of the slab sits, up and to the right
/** an outline cut from a thick slab: the walls we can see, then its front with a cut round it */
function slab(p: Pen, pts: P2[], front: number, top: number, side: number) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; }
  const sg = a > 0 ? 1 : -1;
  // walls in runs of one tone, so each reads as one surface
  let run: P2[] = [], tone = 0;
  const flush = () => { if (run.length > 1) p.face([...run.map(B), ...run.slice().reverse().map(([x, y]) => B([x + DX, y + DY]))], tone, 0); run = []; };
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = ((y1 - y0) * sg) / L, ny = (-(x1 - x0) * sg) / L;
    if (nx * DX + ny * DY <= 0.001) { flush(); continue; }
    const tn = ny > 0.45 ? top : side;
    if (run.length && tn !== tone) flush();
    if (!run.length) { run.push([x0, y0]); tone = tn; }
    run.push([x1, y1]);
  }
  flush();
  p.face(pts.map(B), front, 0);
  p.line([...pts, pts[0]].map(B), SH.edge, 0.7);
}

const P = 2.4; // seconds per loop
const R = 16, r = 7, CV = -6, ARM = 5.5, GAP = 1.4, TOP = 15.5; // outer and inner radius, the bend's centre, where the arms end, the cut, the tips' ends
const A = 0.36; // the lean
const rot = ([u, v]: P2): P2 => [u * Math.cos(A) + v * Math.sin(A) - 3.5, -u * Math.sin(A) + v * Math.cos(A) + 1];
const BODY: P2[] = ([
  [-R, ARM], [-r, ARM],
  ...Array.from({ length: 21 }, (_, i) => { const a = Math.PI + (i / 20) * Math.PI; return [Math.cos(a) * r, CV + Math.sin(a) * r] as P2; }),
  [r, ARM], [R, ARM],
  ...Array.from({ length: 33 }, (_, i) => { const a = -(i / 32) * Math.PI; return [Math.cos(a) * R, CV + Math.sin(a) * R] as P2; }),
] as P2[]).map(rot);
const TIPS: P2[][] = ([[[-R, ARM + GAP], [-R, TOP], [-r, TOP], [-r, ARM + GAP]], [[r, ARM + GAP], [r, TOP], [R, TOP], [R, ARM + GAP]]] as P2[][]).map((q) => q.map(rot));
const M = (R + r) / 2;

export const magnet: Illustration = {
  k: "magnet", name: "Magnet", title: "No leads attracted yet", body: "Share your page or run a campaign. New leads will collect here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.push(); p.translate(0, 0, -22); p.shadow(0, 0, 24, 10, 0.12); p.pop();
    slab(p, TIPS[0], 0.1, 0.3, 0.05);
    slab(p, BODY, 0.26, 0.1, 0.055);
    slab(p, TIPS[1], 0.1, 0.3, 0.05);
    // the leads: each falls faster as it nears its pole, then is gone
    for (let i = 0; i < 4; i++) {
      const u = (ph + i / 4) % 1, k = u * u, s = i % 2 ? 1 : -1;
      const from: P2 = [s * M + (i > 1 ? 5 : -4), TOP + 10 + (i > 1 ? 0 : 2)], to: P2 = [s * M, TOP + 1.8];
      p.dot(B(rot([from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k])), 1.7 - 0.3 * k, Math.min(1, u * 5));
    }
  },
};
