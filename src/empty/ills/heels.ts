// No shoes yet: a high heeled pump seen from the side, a pointed toe and a slim stiletto heel. Hover and it lifts and turns a little toward you; a heart badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a side profile in [x, z] pushed through from y0 to y1: the strips that face us, then the near side */
function prism(p: Pen, prof: [number, number][], y0: number, y1: number, front: number) {
  const F = prof.map(([x, z]) => [x, y1, z] as V3), s = Math.sign(facing(p, F));
  prof.forEach((a, i) => {
    const b = prof[(i + 1) % prof.length];
    const q: V3[] = [[b[0], y1, b[1]], [a[0], y1, a[1]], [a[0], y0, a[1]], [b[0], y0, b[1]]];
    if (facing(p, q) * s <= 0) return;
    const dx = Math.abs(b[0] - a[0]), dz = Math.abs(b[1] - a[1]);
    p.face(q, SH.right + (SH.top - SH.right) * (dx / (dx + dz || 1)), 0);
  });
  p.face(F, front, 0);
}
function heart(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    const s = r * 0.42;
    g.beginPath();
    g.moveTo(x, y + s * 1.05);
    g.bezierCurveTo(x - s * 1.7, y - s * 0.1, x - s * 0.9, y - s * 1.4, x, y - s * 0.5);
    g.bezierCurveTo(x + s * 0.9, y - s * 1.4, x + s * 1.7, y - s * 0.1, x, y + s * 1.05);
    g.fillStyle = "#000"; g.fill();
  });
}

// the shoe: heel cup at the back (x < 0), pointed toe at the front
const SHOE: [number, number][] = [[-13, 9.6], [-12.6, 15], [-10.4, 14.6], [-7.4, 11.4], [-3, 8.2], [2, 6.4], [7, 5.4], [11.4, 3.8], [14.6, 1.6], [15.2, 0.4], [12, 0], [5, 0.2], [0, 1.8], [-4.6, 5.6], [-9, 9]];
const HEEL: [number, number][] = [[-13, 9.8], [-10.2, 9.4], [-11, 0], [-12, 0]];

export const heels: Illustration = {
  k: "heels", name: "Heels", title: "No shoes yet", body: "Shoes you save or buy will be lined up here, ready to wear.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h / 0.7));
    p.translate(0, 0, -9);
    p.scale(1.05);
    p.shadow(0, 0, 27, 10, 0.11);
    p.rotate("z", -0.68 + 0.22 * k); // turned so its side faces us, swinging toward us on hover
    p.translate(0, 0, 3 * k + k * 0.5 * Math.sin(t * 3));
    const W = 3.6;
    // the stiletto under the heel cup, then the shoe over it
    prism(p, HEEL, -1.3, 1.3, 0.42);
    // the opening: the dark inside seen over the far side wall
    prism(p, SHOE, -W, W, 0.24);
    p.face([[-12.4, -W + 0.6, 14.6], [-12.4, W - 0.6, 14.6], [-3, W - 0.6, 8.4], [2, W - 0.6, 6.6], [2, -W + 0.6, 6.6], [-3, -W + 0.6, 8.4]], 0.03, 0);
    // the sole edge, cut along the bottom
    p.line([[-9, W + 0.05, 8.4], [-4.6, W + 0.05, 5], [0, W + 0.05, 1.3], [5, W + 0.05, 0.6], [12, W + 0.05, 0.5], [15, W + 0.05, 0.7]], SH.edge, 0.7);
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      heart(p, [-4, 2, 17], 4.4 * pop);
    }
  },
};
