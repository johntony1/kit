// No recently viewed items: a sneaker seen from the side. Hover and it lifts its heel and steps off, speed lines trailing behind.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a side profile in [x, z] pushed through from y0 to y1: the strips that face us, then the near side */
function prism(p: Pen, prof: [number, number][], y0: number, y1: number, front: number, top: number = SH.top) {
  const F = prof.map(([x, z]) => [x, y1, z] as V3), s = Math.sign(facing(p, F));
  prof.forEach((a, i) => {
    const b = prof[(i + 1) % prof.length];
    const q: V3[] = [[b[0], y1, b[1]], [a[0], y1, a[1]], [a[0], y0, a[1]], [b[0], y0, b[1]]];
    if (facing(p, q) * s <= 0) return;
    const dx = Math.abs(b[0] - a[0]), dz = Math.abs(b[1] - a[1]);
    p.face(q, SH.right + (top - SH.right) * (dx / (dx + dz || 1)), 0);
  });
  p.face(F, front, SH.edge, 0.6);
}

const SOLE: [number, number][] = [[-14.4, 0], [13.6, 0], [15.8, 1.3], [15.4, 3.4], [-14.8, 3.4], [-15.1, 1.2]];
const UPPER: [number, number][] = [[-14.2, 3.4], [-15, 7.5], [-14.2, 12], [-11.4, 11.4], [-7.6, 10.4], [-4.4, 13.8], [-2.2, 13], [3.4, 8.4], [8.4, 6.6], [12.6, 5.6], [14.8, 4.6], [15.3, 3.4]];

export const sneaker: Illustration = {
  k: "sneaker", name: "Sneaker", title: "No recently viewed items", body: "Things you look at will be kept here so you can find them again.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h);
    p.translate(0, 0, -8);
    p.shadow(0, 0, 27 - k * 3, 11, 0.11);
    p.rotate("z", -0.68); // turned so its side faces us
    // speed lines behind the heel
    if (k > 0.3) for (let i = 0; i < 3; i++) {
      const u = (t * 1.3 + i / 3) % 1, x = -15 - u * 4;
      p.line([[x, 0, 4 + i * 4.5], [x - 3.5, 0, 4 + i * 4.5]], (k - 0.3) / 0.7 * Math.sin(u * Math.PI), 0.8);
    }
    // the step: the heel lifts round the toe and the whole shoe rises a little
    p.translate(k * 2, 0, k * (1.4 + 0.5 * Math.sin(t * 3)));
    p.rotate("y", k * 0.36, [13, 0, 0]);
    const W = 4.2, Y = W + 0.04;
    prism(p, SOLE, -W - 0.4, W + 0.4, 0.34, 0.3);
    prism(p, UPPER, -W, W, 0.15);
    // the opening at the ankle, dark
    p.face([[-14.2, -W + 0.7, 12], [-14.2, W - 0.7, 12], [-7.6, W - 0.7, 10.4], [-7.6, -W + 0.7, 10.4]], 0.03, SH.edge, 0.5);
    // laces across the top of the foot
    for (let i = 0; i < 4; i++) { const q = 0.14 + i * 0.25, x = -2.2 + q * 5.6, z = 13.05 - q * 4.6; p.line([[x, W - 0.8, z], [x, -W + 1.6, z]], SH.edge, 0.8); }
    // the side: the toe cap, the heel counter and two stripes
    p.line([[9, Y, 3.4], [9.4, Y, 5.4], [8.4, Y, 6.6]], SH.edge, 0.6);
    p.line([[-10.4, Y, 3.4], [-11.2, Y, 7.6], [-11.4, Y, 11.4]], SH.edge, 0.6);
    p.face([[-6.4, Y, 3.4], [-4, Y, 3.4], [0.2, Y, 9.6], [-1.6, Y, 11]], 0.42, 0);
    p.face([[-1.8, Y, 3.4], [0.6, Y, 3.4], [3.6, Y, 7.4], [2, Y, 8.6]], 0.42, 0);
    p.line([[-14.6, Y + 0.4, 1.8], [15.4, Y + 0.4, 1.8]], 0, 0.5);
  },
};
