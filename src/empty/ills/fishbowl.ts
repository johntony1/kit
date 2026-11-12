// Nothing swimming by: a round glass fish bowl drawn as a bright outline, a clear water line, and one bold fish swimming to and fro inside while bubbles rise.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const P = 4, R = 21, CY = -0.5, MOUTH = 15.5, FLOOR = -19.6, WATER = 7; // seconds per loop; the bowl's radius and centre; mouth, floor and water heights from the centre
const half = (v: number) => Math.sqrt(Math.max(0, R * R - v * v));
// the glass: from the right of the mouth, down round the flat floor, up to the left of the mouth
const GLASS: P2[] = (() => {
  const a0 = Math.asin(MOUTH / R), out: P2[] = [];
  for (let i = 0; i <= 64; i++) { const a = a0 - (i / 64) * (Math.PI + 2 * a0); out.push([Math.cos(a) * R, CY + Math.max(FLOOR, Math.sin(a) * R)]); }
  return out;
})();
// a bright stroke, flat to the screen
const glow = (p: Pen, pts: P2[], lw: number, close = false) => {
  const q = pts.map((a) => p.pt(B(a)));
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath(); g.stroke(); });
};
const oval = (cx: number, cy: number, rx: number, ry: number, n = 36): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as P2; });

export const fishbowl: Illustration = {
  k: "fishbowl", name: "Fish bowl", title: "Nothing swimming by", body: "Nothing lives here yet. Add something and it will appear here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    p.push(); p.translate(0, 0, CY + FLOOR - 1); p.shadow(0, 0, 25, 10, 0.12); p.pop();
    // the water: a sparse body under a lighter surface
    p.face(GLASS.filter(([, v]) => v <= CY + WATER).map(B), 0.062, 0);
    const ws = oval(0, CY + WATER, half(WATER) - 0.4, 2.7);
    p.face(ws.map(B), 0.12, 0);
    glow(p, ws, 1.2, true);
    // the glass: one bright outline, a lip round the mouth, a shine
    glow(p, GLASS, 1.7);
    glow(p, oval(0, CY + MOUTH, half(MOUTH) + 0.5, 2.4), 1.7, true);
    glow(p, Array.from({ length: 9 }, (_, i) => { const a = 2.5 + (i / 8) * 0.42; return [Math.cos(a) * (R - 3.6), CY + Math.sin(a) * (R - 3.6)] as P2; }), 1.3);
    // the fish: swims across, turns, swims back
    const d = Math.max(-1, Math.min(1, Math.cos(w) * 4)), fx = Math.sin(w) * 6.5, fy = CY - 6.5 + Math.sin(w * 2) * 1.2, wag = Math.sin(w * 6) * 1.3;
    const F = (a: number, b: number): V3 => B([fx + a * d, fy + b]);
    const tail = (k: number) => [F(-5.5, 0), F(-11.5 - k, 4.6 + k + wag), F(-10, 0), F(-11.5 - k, -4.6 - k + wag)];
    const body = (k: number) => Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2; return F(Math.cos(a) * (7.8 + k), Math.sin(a) * (4.9 + k)); });
    // clear water round it first, so it stands out
    p.face(tail(1.5), 0.02, 0); p.face(body(1.7), 0.02, 0);
    p.face(tail(0), 0.3, 0); p.face(body(0), 0.3, 0);
    p.face([F(-2.5, 4.2), F(1.5, 7.4), F(2.5, 4.2)], 0.3, 0);
    p.dot(F(4.2, 1.2), 1, 0);
    // bubbles rising to the surface
    for (let i = 0; i < 3; i++) {
      const f = (u * 2 + i / 3) % 1, v = cl(f * 6) * cl((1 - f) * 6);
      p.dot(B([10.5 + i * 2.3 + Math.sin(f * 9 + i * 2) * 0.7, CY - 11 + f * (WATER + 8.5)]), (0.9 + 0.5 * f) * v, 1);
    }
  },
};
