// Anchor: a ship's anchor hanging just above the ground. Hover and it drops, lands with a bounce and sends two ripples out across the floor.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
type P2 = [number, number];
const ZC = 12, RO = 12, RI = 9; // the arms: centre height, outer and inner radius
const A0 = Math.PI + 0.28, A1 = 2 * Math.PI - 0.28;
const pol = (r: number, a: number): P2 => [Math.cos(a) * r, ZC + Math.sin(a) * r];
const arc = (r: number, a0: number, a1: number, n = 16): P2[] => Array.from({ length: n + 1 }, (_, i) => pol(r, a0 + ((a1 - a0) * i) / n));
const circ = (r: number): P2[] => Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [Math.cos(a) * r, 33.4 + Math.sin(a) * r] as P2; });
const PARTS: P2[][] = [
  [...arc(RO, A0, A1), ...arc(RI, A1, A0)], // the curved arms
  [pol(RO + 2.4, A0 + 0.1), pol(RI - 2.4, A0 + 0.1), pol((RO + RI) / 2, A0 - 0.66)], // the flukes
  [pol(RI - 2.4, A1 - 0.1), pol(RO + 2.4, A1 - 0.1), pol((RO + RI) / 2, A1 + 0.66)],
  [[-1.5, ZC - RO + 0.6], [1.5, ZC - RO + 0.6], [1.5, 31], [-1.5, 31]], // the shank
  [[-7.8, 24.4], [7.8, 24.4], [7.8, 27], [-7.8, 27]], // the stock
  [...circ(3.5), circ(3.5)[0], circ(1.7)[0], ...circ(1.7).reverse()], // the ring
];
// height above the floor: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 6;
  if (k < 0.4) return 6 * (1 - Math.pow(k / 0.4, 2));
  if (k < 0.7) { const v = (k - 0.4) / 0.3; return 1.8 * 4 * v * (1 - v); }
  if (k < 0.88) { const v = (k - 0.7) / 0.18; return 0.6 * 4 * v * (1 - v); }
  return 0;
}

export const anchor: Illustration = {
  k: "anchor", name: "Anchor", title: "No ports saved", body: "Save a port to see its berths and arrival times here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const dz = drop(Math.min(1, h * 1.5));
    p.translate(0, 0, -19);
    p.scale(1.06);
    p.shadow(0, 0, 22 - dz, 10 - dz * 0.4, 0.11);
    // ripples running out from where it lands
    for (const s of [0, 0.3]) {
      const g = (h - 0.3 - s) / 0.55;
      if (g > 0 && g < 1) glow(p, Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2, r = 8 + 14 * g; return [Math.cos(a) * r, Math.sin(a) * r, 0] as V3; }), 0.8, 1 - g);
    }
    p.rotate("z", -0.42);
    p.translate(0, 0, dz);
    const at = (y: number) => (q: P2): V3 => [q[0], y, q[1]];
    for (const part of PARTS) p.face(part.map(at(-1.7)), 0.07, 0); // its thickness, a step back
    for (const part of PARTS) p.face(part.map(at(0)), 0.3, SH.edge, 0.6);
    // the pin through the stock
    p.dot([0, 0.05, 25.7], 0.6, 0);
  },
};
