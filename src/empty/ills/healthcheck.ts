// All systems normal: a patient monitor on a short stand, its dark screen showing a heartbeat trace. The trace sweeps across in a steady rhythm, a plus glowing in the corner.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.6; // seconds per loop
const W = 17, D = 7, H = 24, Z0 = 4; // half width, depth, height, height of its bottom

/** the trace: flat, a small bump, a sharp spike, a dip, flat again; s from 0 to 1 */
function beat(s: number) {
  const c = (a: number, w: number) => Math.max(0, 1 - Math.abs(s - a) / w);
  return 1.6 * c(0.3, 0.05) + 8.5 * c(0.5, 0.035) - 4 * c(0.56, 0.035) + 2.2 * c(0.72, 0.06);
}

export const healthcheck: Illustration = {
  k: "healthcheck", name: "Health check", title: "All systems normal", body: "Every service is responding. Any check that fails will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 28, 12, 0.11);
    p.rotate("z", -0.42);
    // the stand: a foot and a neck
    p.box(-9, -5, 0, 18, 10, 1.8, { edge: 0 });
    p.box(-2.5, -2, 1.8, 5, 3, Z0 - 1.8, { edge: 0 });
    // the body: lit top, a bezel round the screen on its front
    p.box(-W, -D / 2, Z0, 2 * W, D, H, { top: 0.2, left: 0.2, right: 0.065, edge: 0 });
    const y = D / 2 + 0.03, x0 = -W + 2.2, x1 = W - 2.2, za = Z0 + 2.2, zb = Z0 + H - 2.2;
    p.clear([[x0, y, za], [x1, y, za], [x1, y, zb], [x0, y, zb]]);
    p.line([[-W, y, Z0 + H], [W, y, Z0 + H]], SH.edge, 0.5);
    // the trace: bright behind its head, fading towards its tail
    const base = Z0 + H / 2 - 1, n = 70, head = u * 1.25;
    const pts = Array.from({ length: n + 1 }, (_, i) => { const s = i / n; return [x0 + 1.5 + (x1 - x0 - 3) * s, y + 0.02, base + beat(s)] as V3; }).map((v) => p.pt(v));
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = 1.9;
      for (let i = 0; i < n; i++) {
        const s = i / n, age = head - s;
        if (age < 0 || age > 0.9) continue;
        g.strokeStyle = `rgba(255,255,255,${Math.max(0, 1 - age / 0.9)})`;
        g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); g.stroke();
      }
    });
    if (head < 1) p.dot([x0 + 1.5 + (x1 - x0 - 3) * head, y + 0.03, base + beat(head)], 1.7, 1);
    // a plus in the top left corner of the screen
    const c = p.pt([x0 + 3.5, y + 0.03, zb - 3.5]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.4; g.lineCap = "round";
      g.beginPath(); g.moveTo(c[0] - 2.2, c[1]); g.lineTo(c[0] + 2.2, c[1]); g.moveTo(c[0], c[1] - 2.2); g.lineTo(c[0], c[1] + 2.2); g.stroke();
    });
  },
};
