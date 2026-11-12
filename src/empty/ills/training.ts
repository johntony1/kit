// No training runs: a board on a stand showing a loss curve. The curve draws itself falling, epoch by epoch, the bar under it fills, and the run starts over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 4; // seconds per loop
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const X0 = -16, X1 = 16, Z0 = 1.6, Z1 = 27, DY = 2.2;
const CX0 = -11.5, CX1 = 12.5, CZ0 = 10.5, CZ1 = 23.5; // the plot area
// the loss at s (0..1): a steep fall that flattens, with a little noise
const loss = (s: number) => CZ0 + 1.2 + (CZ1 - CZ0 - 2) * Math.exp(-3.4 * s) + 0.7 * Math.sin(s * 19) * (1 - s * 0.6);

export const training: Illustration = {
  k: "training", name: "Training", title: "No training runs", body: "Start a training run and its progress will be charted here as it learns.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -14);
    p.shadow(0, 0, 26, 11, 0.12);
    p.rotate("z", -0.5);
    p.box(-9, -5, 0, 18, 9, Z0);
    p.box(X0, -DY, Z0, X1 - X0, DY, Z1 - Z0, { top: 0.22 });
    const f = 0.03;
    const q = (x0: number, z0: number, x1: number, z1: number, fill: number) => {
      const pts: V3[] = [[x0, f, z0], [x1, f, z0], [x1, f, z1], [x0, f, z1]];
      if (fill > 0) p.face(pts, fill, 0); else p.clear(pts);
    };
    q(X0 + 1.2, Z0 + 1.2, X1 - 1.2, Z1 - 1.2, 0);
    // the run: draws until 0.72, holds, then wipes away from the left
    const end = clamp((u - 0.04) / 0.68), start = clamp((u - 0.9) / 0.1);
    const at = (s: number): V3 => [CX0 + (CX1 - CX0) * s, f + 0.02, loss(s)];
    const [a0x, a0y] = p.pt([CX0 - 1.2, f, CZ1 + 0.8]), [a1x, a1y] = p.pt([CX0 - 1.2, f, CZ0 - 0.6]), [a2x, a2y] = p.pt([CX1 + 1, f, CZ0 - 0.6]);
    const pts = Array.from({ length: 41 }, (_, i) => start + ((end - start) * i) / 40).map((s) => p.pt(at(s)));
    p.screen((c) => {
      c.lineCap = "round"; c.lineJoin = "round";
      // the axes, dim, with a tick per epoch
      c.strokeStyle = "rgb(120,120,120)"; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(a0x, a0y); c.lineTo(a1x, a1y); c.lineTo(a2x, a2y); c.stroke();
      if (end > start) {
        c.strokeStyle = "#fff"; c.lineWidth = 1.25;
        c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      }
    });
    for (let i = 1; i <= 4; i++) p.dot([CX0 + ((CX1 - CX0) * i) / 4, f, CZ0 - 0.6], 0.45, 0.6);
    if (end > start && end < 1) p.dot(at(end), 1.3, 1);
    // the progress bar under the plot
    p.face([[CX0 - 1.2, f, 4.6], [CX1 + 1, f, 4.6], [CX1 + 1, f, 7], [CX0 - 1.2, f, 7]], 0.045, SH.edge, 0.45);
    const w = (CX1 + 1 - (CX0 - 1.2)) * end * (1 - start);
    if (w > 0.4) q(CX0 - 1.2, 4.6, CX0 - 1.2 + w, 7, 0.36);
  },
};
