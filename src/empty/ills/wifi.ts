// Wifi signal: the wifi mark, big and chunky, as a solid dot under three thick bands. The dot and the bands light up one after another, hold, then dim.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const DX = 2.4, DY = 2.1; // how far the back of each slab sits, up and to the right
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
const P = 3.2, C = -15.5; // seconds per loop, height of the dot's centre
const band = (r0: number, r1: number, n = 30): P2[] => {
  const ang = (i: number) => Math.PI * (0.228 + (0.544 * i) / n), out: P2[] = [];
  for (let i = 0; i <= n; i++) out.push([Math.cos(ang(i)) * r1, C + Math.sin(ang(i)) * r1]);
  for (let i = n; i >= 0; i--) out.push([Math.cos(ang(i)) * r0, C + Math.sin(ang(i)) * r0]);
  return out;
};
const DOT: P2[] = Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2; return [Math.cos(a) * 4.4, C + Math.sin(a) * 4.4] as P2; });
const PARTS: P2[][] = [band(25.4, 30.4), band(16.6, 21.6), band(7.8, 12.8), DOT];

export const wifi: Illustration = {
  k: "wifi", name: "Wifi signal", title: "No signal here", body: "Move closer to your router or check your connection, then try again.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P + 0.42) % 1, off = 1 - cl((u - 0.88) / 0.1);
    p.push(); p.translate(0, 0, -22); p.shadow(0, 0, 24, 10, 0.12); p.pop();
    // far band first; the dot is part 0 in the lighting order
    PARTS.forEach((prof, j) => {
      const i = 3 - j, on = cl((u * 5.2 - (i + 0.5)) * 4) * off > 0.5;
      slab(p, prof, on ? 0.28 : 0.1, on ? 0.12 : 0.062, on ? 0.065 : 0.045);
    });
  },
};
