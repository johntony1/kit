// Nothing rolling through: a big round tumbleweed, a ball of crossing twig arcs with spurs sticking out, on a ground line. It rolls on the spot with a small hop.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const P = 3.6, R = 19, M = 40; // seconds per loop, the ball's radius, points per arc
// the twigs: bowed arcs across the ball in every direction, their tips poking out past the rim. [u, v] per point
const ARCS: P2[][] = ([[0.2, 0.34, 1], [1.25, -0.5, 1], [2.2, 0.66, 1], [2.95, -0.16, 1], [0.75, -0.8, 1], [1.75, 0.1, 1], [2.6, 0.4, 0.62], [0.5, -0.3, 0.55], [1.5, 0.45, 0.5]] as V3[]).map(([th, bow, k], n) =>
  Array.from({ length: M + 1 }, (_, j) => {
    const g = (j / M) * Math.PI, e = Math.cos(g), tip = 1 + (n % 2 ? 0.2 : 0.13) * Math.pow(Math.abs(e), 10) * (e > 0 || n % 3 ? 1 : 0);
    const x = e * R * k * tip + (k < 1 ? (n - 7) * 5 : 0), y = Math.sin(g) * R * bow * k + Math.sin(g * 3 + n) * 0.9 + (k < 1 ? (7 - n) * 4 : 0), c = Math.cos(th), s = Math.sin(th);
    return [x * c - y * s, x * s + y * c] as P2;
  }));
// the rim: a rough round, never quite a circle
const RIM: P2[] = Array.from({ length: 61 }, (_, i) => { const a = (i / 60) * Math.PI * 2, r = R * (1 + 0.05 * Math.sin(a * 5 + 0.6) + 0.035 * Math.sin(a * 11)); return [Math.cos(a) * r, Math.sin(a) * r] as P2; });
// short forked spurs round the rim: [angle, length]
const SPURS: P2[] = [[0.55, 4.2], [1.5, 3.4], [2.45, 4.4], [3.7, 3.6], [4.6, 4.4], [5.5, 3.6]];

export const tumbleweed: Illustration = {
  k: "tumbleweed", name: "Tumbleweed", title: "Nothing rolling through", body: "It is quiet here. New activity will show up as it happens.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p: Pen, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2, hop = Math.abs(Math.sin(w)) * 3, cy = 2.5 + hop;
    const c = Math.cos(-w), s = Math.sin(-w);
    p.push(); p.translate(0, 0, -21); p.shadow(0, 0, 24, 10, 0.12); p.pop();
    // its shadow on the ground, smaller while it is in the air
    const sh = 13 - hop * 1.2;
    p.face(Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return B([Math.cos(a) * sh, -19.6 + Math.sin(a) * 1.6]); }), 0.065, 0);
    const at = ([x, y]: P2) => p.pt(B([x * c - y * s, cy + x * s + y * c]));
    const [gx0, gy] = p.pt(B([-25, -17.4])), [gx1] = p.pt(B([25, -17.4]));
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#fff";
      // the ground line, broken, and two dashes of dust drifting behind
      g.lineWidth = 1.3; g.beginPath();
      g.moveTo(gx0, gy); g.lineTo(gx0 + 9, gy); g.moveTo(gx0 + 13, gy); g.lineTo(gx1 - 12, gy); g.moveTo(gx1 - 8, gy); g.lineTo(gx1, gy);
      for (let i = 0; i < 2; i++) { const f = (u * 2 + i / 2) % 1, x = gx0 + 8 - f * 7, y = gy - 4 - i * 4; g.moveTo(x, y); g.lineTo(x + 5 * (1 - f), y); }
      g.stroke();
      // the rim, the arcs and the spurs
      g.lineWidth = 2; g.beginPath();
      for (const arc of [RIM, ...ARCS]) arc.forEach((q, j) => { const [x, y] = at(q); if (j) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
      g.lineWidth = 1.4; g.beginPath();
      for (const [a, l] of SPURS) {
        const [x0, y0] = at([Math.cos(a) * R, Math.sin(a) * R]), [x1, y1] = at([Math.cos(a + 0.1) * (R + l), Math.sin(a + 0.1) * (R + l)]), [x2, y2] = at([Math.cos(a - 0.12) * (R + l * 0.6), Math.sin(a - 0.12) * (R + l * 0.6)]);
        g.moveTo(x0, y0); g.lineTo(x1, y1); g.moveTo(x0, y0); g.lineTo(x2, y2);
      }
      g.stroke();
    });
  },
};
