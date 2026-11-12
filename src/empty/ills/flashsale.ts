// No sales right now: a big solid lightning bolt with a percent badge at its foot. Hover and the bolt strikes down with a bounce, sparks fly and the badge pops.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const BOLT: P2[] = [[2, 38], [-12, 16], [-3, 16], [-7.5, 0], [12.5, 24], [3, 24], [10, 38]];

// a flat shape standing in the plane y = yF, pushed back to yB: lit top edges, dark sides, an outlined front
function slab(p: Pen, s: P2[], yF: number, yB: number, front: number) {
  let a = 0;
  for (let i = 0; i < s.length; i++) { const [x0, z0] = s[i], [x1, z1] = s[(i + 1) % s.length]; a += x0 * z1 - x1 * z0; }
  const o = a > 0 ? 1 : -1;
  for (let i = 0; i < s.length; i++) {
    const [x0, z0] = s[i], [x1, z1] = s[(i + 1) % s.length];
    const l = Math.hypot(x1 - x0, z1 - z0) || 1, nx = (o * (z1 - z0)) / l, nz = (-o * (x1 - x0)) / l;
    if (nx * 0.45 + nz <= 0) continue;
    p.face([[x0, yB, z0], [x1, yB, z1], [x1, yF, z1], [x0, yF, z0]], nz > 0.3 ? 0.045 + 0.2 * nz : 0.045, 0);
  }
  const f = s.map(([x, z]) => [x, yF, z] as V3);
  p.face(f, front, 0);
  p.line([...f, f[0]], SH.edge, 0.5);
}

// the strike: falls from above, bounces once, rests
function drop(k: number) {
  if (k <= 0 || k >= 1) return 0;
  if (k < 0.2) return 6 * ease(k / 0.2);
  if (k < 0.55) return 6 * (1 - Math.pow((k - 0.2) / 0.35, 2));
  const v = (k - 0.55) / 0.45; return 2 * 4 * v * (1 - v) * (1 - v);
}

export const flashsale: Illustration = {
  k: "flashsale", name: "Flash sale", title: "No sales right now", body: "The next flash sale will show here as soon as it starts.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -18);
    p.shadow(0, 0, 24, 11, 0.12);
    p.push();
    p.rotate("z", -0.5);
    p.translate(0, 0, drop(h));
    slab(p, BOLT, 3.5, -3.5, 0.24);
    p.pop();
    // sparks from the foot once it lands
    const k = Math.max(0, (h - 0.5) / 0.5);
    if (k > 0) for (let i = 0; i < 7; i++) {
      const u = (t * 0.6 + i / 7) % 1, a = i * 0.9 + 0.3;
      p.dot([-5 + Math.cos(a) * (5 + u * 6), 3 + Math.sin(a) * (5 + u * 6), 1 + u * 6], 1.2 - u * 0.5, k * Math.sin(u * Math.PI));
    }
    // the percent badge: bright disc, dark mark, flat to the screen
    const b = Math.max(0, (h - 0.55) / 0.45);
    const r = 7 * (1 + 0.22 * Math.sin(b * Math.PI));
    const [x, y] = p.pt([13, 3, 9]);
    p.screen((g) => {
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
      g.strokeStyle = "#000"; g.lineCap = "round"; g.lineWidth = r * 0.2;
      g.beginPath(); g.moveTo(x + r * 0.38, y - r * 0.48); g.lineTo(x - r * 0.38, y + r * 0.48); g.stroke();
      g.fillStyle = "#000";
      g.beginPath(); g.arc(x - r * 0.38, y - r * 0.3, r * 0.2, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x + r * 0.38, y + r * 0.3, r * 0.2, 0, Math.PI * 2); g.fill();
    });
  },
};
