// No takeaways: a paper takeaway bag, its top rolled over and sealed with a sticker. Hover and it hops, and steam from the hot food inside curls up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const W = 8.6, D = 5.4, H = 15, TOP = 19.6, RD = 1.4; // half width, half depth, shoulder, top, half depth of the roll

/** a stroke drawn flat to the screen, so it stays a bright mark in every style */
function stroke(p: Pen, pts: V3[], shade: number, lw: number) {
  const q = pts.map((v) => p.pt(v)), n = Math.round(255 * Math.max(0, Math.min(1, shade)));
  p.screen((c) => {
    c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

export const takeaway: Illustration = {
  k: "takeaway", name: "Takeaway bag", title: "No takeaways", body: "Order a takeaway and you can follow it here from the kitchen to your door.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const hop = Math.sin(Math.PI * seg(h, 0, 0.55)), sq = 1 - 0.06 * Math.sin(Math.PI * seg(h, 0.5, 0.75));
    p.translate(0, 0, -12);
    p.scale(1.15, [0, 0, 10]);
    p.shadow(0, 0, 22 - 5 * hop, 11 - 2.5 * hop, 0.12 - 0.04 * hop);
    p.push();
    p.translate(0, 0, 5 * hop);
    const Z = (z: number) => z * sq;
    // the side, with its gusset fold
    p.face([[W, -D, 0], [W, D, 0], [W, D, Z(H)], [W, RD, Z(TOP)], [W, -RD, Z(TOP)], [W, -D, Z(H)]], SH.right, SH.edge, 0.6);
    p.line([[W + 0.03, 0, Z(TOP)], [W + 0.03, 0, Z(5)], [W + 0.03, D, 0]], 0.7, 0.5);
    p.line([[W + 0.03, 0, Z(5)], [W + 0.03, -D, 0]], 0.7, 0.5);
    // the front, the slope up to the roll, and the roll itself
    p.face([[-W, D, 0], [W, D, 0], [W, D, Z(H)], [-W, D, Z(H)]], 0.13, SH.edge, 0.6);
    p.face([[-W, D, Z(H)], [W, D, Z(H)], [W, RD, Z(TOP)], [-W, RD, Z(TOP)]], 0.24, SH.edge, 0.6);
    p.face([[-W, -RD, Z(TOP)], [W, -RD, Z(TOP)], [W, RD, Z(TOP)], [-W, RD, Z(TOP)]], 0.3, SH.edge, 0.6);
    const sl = (x: number, f: number): V3 => [x, D + (RD - D) * f + 0.04, Z(H + (TOP - H) * f)];
    p.line([sl(-W, 0.55), sl(W, 0.55)], SH.edge, 0.5);
    // the sticker that seals it
    p.dot(sl(0, 0.3), 2.5, 1);
    p.dot(sl(0, 0.3), 1, 0);
    // a fork and a knife on the front
    const y = D + 0.04, f = (x: number, z: number): V3 => [x, y, Z(z)];
    p.line([f(-2, 3.2), f(-2, 11)], SH.edge, 0.8);
    p.line([f(-3.2, 11), f(-3.2, 8.4), f(-0.8, 8.4), f(-0.8, 11)], SH.edge, 0.7);
    p.line([f(2.2, 3.2), f(2.2, 11), f(3.5, 9.6), f(3.5, 7.2), f(2.2, 6.6)], SH.edge, 0.8);
    p.pop();
    // steam off the top once it has landed
    const s = seg(h, 0.55, 1);
    if (s > 0) for (let i = 0; i < 3; i++) {
      const o = (i - 1) * 5, ph = t * 2.2 + i * 2;
      for (let j = 0; j < 7; j++) {
        const z0 = TOP + 2.5 + j * 1.6, q = (z: number): V3 => { const w = Math.sin(z * 0.6 - ph) * 1.2; return [(o + w) * 0.707, -(o + w) * 0.707, z]; };
        stroke(p, [q(z0), q(z0 + 0.8), q(z0 + 1.65)], s * Math.sin(((j + 0.5) / 7) * Math.PI) * 0.9, 0.9);
      }
    }
  },
};
