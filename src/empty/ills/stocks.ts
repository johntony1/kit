// No holdings yet: a thick rising price arrow standing on a plinth. Hover and it lifts off with a little bounce; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// a zigzag that climbs to an arrow head
const ARROW: P2[] = [[-17, 10], [-6.5, 20.5], [0, 14], [7.4, 24.6], [3.6, 27.6], [17, 31.5], [16.4, 17.6], [12.6, 20.6], [0.6, 5.4], [-6.5, 12.5], [-17, 2]];

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

export const stocks: Illustration = {
  k: "stocks", name: "Stock ticker", title: "No holdings yet", body: "Buy your first share and its price will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 2, 32, 13, 0.11);
    p.rotate("z", -0.5);
    // the plinth
    p.box(-20, -5.5, 0, 40, 11, 2.4, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.line([[-20, 5.53, 2.4], [20, 5.53, 2.4], [20.03, -5.5, 2.4]], SH.edge, 0.5);
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    p.translate(0, 0, 2.6 + 4 * back(h) * (h > 0 ? 1 : 0) + h * Math.sin(t * 3) * 0.6);
    slab(p, ARROW, 3, -3, 0.2);
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const [x, y] = p.pt([-10, 0, 30]);
      const r = 5 * pop;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      });
    }
  },
};
