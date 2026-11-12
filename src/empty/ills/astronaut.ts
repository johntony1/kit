// Lost in space: a big friendly astronaut adrift, with a round helmet and a dark visor, waving. It floats up and down and tips from side to side while stars twinkle.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const PD = 4; // seconds per loop
/** a round ended limb from a to b, r thick */
const limb = (a: P2, b: P2, r: number, n = 10): P2[] => {
  const g = Math.atan2(b[1] - a[1], b[0] - a[0]), out: P2[] = [];
  for (let i = 0; i <= n; i++) { const q = g - Math.PI / 2 + (Math.PI * i) / n; out.push([b[0] + Math.cos(q) * r, b[1] + Math.sin(q) * r]); }
  for (let i = 0; i <= n; i++) { const q = g + Math.PI / 2 + (Math.PI * i) / n; out.push([a[0] + Math.cos(q) * r, a[1] + Math.sin(q) * r]); }
  return out;
};
const oval = (cx: number, cy: number, rx: number, ry: number, n = 40): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as P2; });

export const astronaut: Illustration = {
  k: "astronaut", name: "Astronaut", title: "Lost in space", body: "We could not find that page. Head back home and try again from there.",
  kind: "loop", period: PD, cols: 92, rows: 80, zoom: 1.42,
  draw(p: Pen, t) {
    const w = ((t / PD) % 1) * Math.PI * 2;
    p.push(); p.translate(0, 0, -25); p.shadow(0, 0, 20 - Math.sin(w), 9, 0.08); p.pop();
    // stars, each swelling and shrinking in its own time
    ([[-25, 17], [24, 21], [26, -12], [-24, -15]] as P2[]).forEach((q, i) => p.dot(B(q), 1.1 + 0.6 * Math.sin(w + i * 1.7), 0.95));
    // the whole figure floats and tips
    const a = 0.12 + Math.sin(w) * 0.07, ca = Math.cos(a), sa = Math.sin(a), bob = Math.sin(w) * 1.5;
    const T = ([u, v]: P2): V3 => B([u * ca + v * sa, bob - u * sa + v * ca]);
    const part = (pts: P2[], fill: number, lw = 0.8) => { p.face(pts.map(T), fill, 0); if (lw) p.line([...pts, pts[0]].map(T), SH.edge, lw); };
    // the pack on its back, the legs, the arms (the right one up and waving), then the body
    part(limb([-8, -8.5], [8, -8.5], 5.6), 0.065);
    part(limb([-4.4, -12], [-5, -19.5], 3.9), 0.24);
    part(limb([4.4, -12], [5, -19.5], 3.9), 0.24);
    part(limb([-7, -3], [-15.5, -9.5], 3.3), 0.24);
    part(limb([7, -3], [15 + Math.sin(w * 2) * 2, 5.5 + Math.cos(w * 2) * 0.8], 3.3), 0.24);
    part(limb([0, -3.5], [0, -10], 8.6), 0.24);
    part([[-3.6, -9.4], [3.6, -9.4], [3.6, -5.2], [-3.6, -5.2]], 0.065);
    // the helmet: big and round, with a dark visor and one glint
    part(oval(0, 10.5, 12.6, 12.2), 0.26);
    const visor = limb([-3.6, 9.6], [4.6, 9.6], 5.7, 14);
    p.clear(visor.map(T));
    const gl = Array.from({ length: 7 }, (_, i) => { const q = 2.05 + (i / 6) * 0.75; return p.pt(T([0.5 + Math.cos(q) * 6.6, 9.6 + Math.sin(q) * 3.6])); });
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.lineCap = "round"; g.beginPath(); gl.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
  },
};
