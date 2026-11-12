// No reports yet: a single bold page standing up, its corner folded, a heading and three bars on it. Hover and the bars grow and a tick pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 14, H = 37, F = 8, D = 1.8; // half width, height, fold size, depth
const PAGE: P2[] = [[-W, 0], [W, 0], [W, H - F], [W - F, H], [-W, H]];
const at = (pts: P2[], y: number): V3[] => pts.map(([x, z]) => [x, y, z]);
const rect = (x0: number, x1: number, z0: number, z1: number, y: number): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];

function tick(p: Pen, pos: V3, r: number) {
  const [x, y] = p.pt(pos);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.36); g.lineTo(x + r * 0.46, y - r * 0.32); g.stroke();
  });
}

export const report: Illustration = {
  k: "report", name: "Report", title: "No reports yet", body: "Run your first report and the results will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const side = p.ink ? 0.065 : 0.045;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 21, 9, 0.12);
    p.rotate("z", -0.45); // turned to face us
    p.translate(0, 1, 0);
    // the page: its depth, then the bright front
    const step = p.ink ? D : 0.4;
    for (let y = -D; y < -0.05; y += step) p.face(at(PAGE, y), side, 0);
    p.face(at(PAGE, 0), 0.3, 0);
    // the folded corner, in shade
    p.face([[W - F, 0.03, H], [W, 0.03, H - F], [W - F, 0.03, H - F]], 0.1, 0);
    p.line([[W - F, 0.05, H], [W - F, 0.05, H - F], [W, 0.05, H - F]], 1, 0.8);
    // a heading and a short line under it
    p.clear(rect(-W + 3.4, 1, H - 6.4, H - 3.8, 0.04));
    p.clear(rect(-W + 3.4, -3.5, H - 10.6, H - 8.6, 0.04));
    // three bars standing on a base line; they grow on hover
    p.clear(rect(-W + 3, W - 3, 3.4, 4.6, 0.04));
    const tops = [7.5, 12.5, 18];
    tops.forEach((top, i) => {
      const k = ease(clamp(h * 1.7 - i * 0.25));
      const x = -W + 4.4 + i * 6.8;
      p.clear(rect(x, x + 5, 4.6, 4.6 + top * (0.6 + 0.4 * k), 0.04));
    });
    const q = clamp((h - 0.66) / 0.34);
    if (q > 0) {
      const pop = q < 0.65 ? ease(q / 0.65) * 1.18 : 1.18 - 0.18 * ease((q - 0.65) / 0.35);
      tick(p, [W + 4, 1, 30], 5 * pop);
    }
  },
};
