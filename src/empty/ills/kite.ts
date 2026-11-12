// Nothing in the air: a diamond kite with a string tail tied with two bows. It sways in the wind while the tail ripples behind it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const P = 3.2; // seconds per loop

export const kite: Illustration = {
  k: "kite", name: "Kite", title: "Nothing in the air", body: "Nothing is on its way right now. Anything you send will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p: Pen, t) {
    const w = ((t / P) % 1) * Math.PI * 2;
    p.push(); p.translate(0, 0, -24); p.shadow(0, 0, 20 + Math.sin(w), 9, 0.09); p.pop();
    const a = 0.45 + Math.sin(w) * 0.06, ca = Math.cos(a), sa = Math.sin(a);
    const ox = 1.5 + Math.sin(w) * 1.2, oy = 6.5 + Math.cos(w) * 0.9;
    const R = (u: number, v: number): P2 => [ox + u * ca + v * sa, oy - u * sa + v * ca];
    const T = R(0, 19), Bo = R(0, -19), L = R(-15, 5), Rt = R(15, 5), C = R(0, 5);
    // the tail: one clear string from the bottom corner, rippling, with two bows tied on it
    const tail = (s: number): P2 => [Bo[0] + s * 19 + Math.sin(s * 5 - w) * 1.7 * s, Bo[1] - s * 14.5 + s * s * 3];
    const pts = Array.from({ length: 29 }, (_, i) => p.pt(B(tail(i / 28))));
    p.screen((c) => {
      c.strokeStyle = "#fff"; c.lineWidth = 1.6; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.stroke();
    });
    for (const s of [0.42, 0.9]) {
      const [x, y] = tail(s), [x1, y1] = tail(s + 0.03), [x0, y0] = tail(s - 0.03);
      const l = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / l, ny = (x1 - x0) / l, tx = (x1 - x0) / l, ty = (y1 - y0) / l;
      for (const d of [-1, 1]) p.face([B([x, y]), B([x + d * nx * 4.8 + tx * 2.7, y + d * ny * 4.8 + ty * 2.7]), B([x + d * nx * 4.8 - tx * 2.7, y + d * ny * 4.8 - ty * 2.7])], 0.3, 0);
    }
    // four panels, each in its own tone, parted by the two spars
    p.face([T, Rt, C].map(B), 0.085, 0);
    p.face([T, L, C].map(B), 0.3, 0);
    p.face([Bo, L, C].map(B), 0.12, 0);
    p.face([Bo, Rt, C].map(B), 0.055, 0);
    p.line([T, Bo].map(B), SH.edge, 0.9);
    p.line([L, Rt].map(B), SH.edge, 0.9);
    p.line([T, Rt, Bo, L, T].map(B), SH.edge, 0.6);
  },
};
