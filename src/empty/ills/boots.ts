// No footwear yet: a pair of tall rain boots seen from the side. Hover and the near boot hops and lands with a bounce; a plus badge pops in.
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
  p.face(F, front, 0);
}
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

const UPPER: [number, number][] = [[-7.6, 2], [-7.9, 12], [-7.4, 23], [2.4, 23], [2.6, 9.4], [6.6, 7.6], [10.6, 5.8], [12, 3.8], [11.6, 2]];
const HEEL: [number, number][] = [[-7.8, 0], [-2.6, 0], [-2.6, 2.2], [-7.8, 2.2]];
const TREAD: [number, number][] = [[1, 0], [11.4, 0], [12.4, 1.2], [11.8, 2.2], [1, 2.2]];

function boot(p: Pen, side: number, sole: number) {
  const W = 3.6, Y = W + 0.04;
  prism(p, HEEL, -W - 0.3, W + 0.3, sole, sole);
  prism(p, TREAD, -W - 0.3, W + 0.3, sole, sole);
  prism(p, UPPER, -W, W, side, side);
  p.line([[-7.8, Y + 0.3, 2.2], [11.6, Y + 0.3, 2.2]], SH.edge, 0.7);
  // the opening at the top, dark
  p.face([[-6.8, -W + 0.6, 23.03], [1.8, -W + 0.6, 23.03], [1.8, W - 0.6, 23.03], [-6.8, W - 0.6, 23.03]], 0.03, 0);
  // the band round the top
  p.line([[-7.5, Y, 19.6], [2.5, Y, 19.6]], SH.edge, 0.8);
}

// height off the floor of the near boot: a hop, a bounce, rest
function hop(k: number) {
  if (k <= 0 || k >= 1) return 0;
  if (k < 0.6) { const v = k / 0.6; return 7 * 4 * v * (1 - v); }
  const v = (k - 0.6) / 0.4; return 1.6 * 4 * v * (1 - v);
}

export const boots: Illustration = {
  k: "boots", name: "Boots", title: "No footwear yet", body: "Boots and shoes you save or buy will line up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = Math.min(1, h * 1.25);
    p.translate(0, 0, -13);
    p.scale(0.98);
    p.shadow(-1, 0, 26, 12, 0.12);
    p.rotate("z", -0.62); // turned so their sides face us
    // the far boot, set back and to the right, in shade
    p.push(); p.translate(11, -6, 0); boot(p, 0.2, 0.34); p.pop();
    // the near boot: hops, tipping forward a little in the air
    const z = hop(k);
    p.push();
    p.translate(-7, 3, z);
    p.rotate("y", 0.07 * z / 7, [11, 0, 0]);
    boot(p, 0.2, 0.34);
    p.pop();
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [-14, 4, 24], 4.4 * pop);
    }
  },
};
