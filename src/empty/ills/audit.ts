// No audit events: a ledger with a trail of entries down a rail. A magnifying glass moves down the trail and stops on each entry in turn, then goes back to the top.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const P = 3.6;
const X = 13, Y = 16, T = 2.4;
const ROWS = [-10.5, -4.5, 1.5, 7.5];
const LEN = [11, 8, 11.5, 6.5];

export const audit: Illustration = {
  k: "audit", name: "Audit trail", title: "No audit events", body: "Every change made in this workspace will be recorded here, with who made it and when.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = ((t / P) % 1) * 4, i = Math.floor(u), f = u - i;
    // hold on a row, then glide to the next (and from the last back to the first)
    const g = easeInOut(Math.max(0, (f - 0.55) / 0.45));
    const ys = ROWS[i] + (ROWS[(i + 1) % 4] - ROWS[i]) * g;
    p.translate(1, -1, -5);
    p.shadow(0, 0, 40, 20, 0.11);
    p.box(-X, -Y, 0, X * 2, Y * 2, T, { top: 0.21, left: 0.13, right: 0.065, lw: 0.6 });
    const z = T + 0.03;
    // the rail and its entries: a node, what happened, and when
    p.line([[-8, ROWS[0], z], [-8, ROWS[3], z]], SH.edge, 0.6);
    ROWS.forEach((y, r) => {
      p.dot([-8, y, z], 1.25, 0);
      p.line([[-4.6, y - 0.6, z], [-4.6 + LEN[r], y - 0.6, z]], SH.edge, 1);
      p.line([[-4.6, y + 1.8, z], [-0.6, y + 1.8, z]], SH.edge, 0.55);
    });
    // the glass, flat to the screen: a dark lens with the entry under it shown large
    const [cx, cy] = p.pt([-1.5, ys, z + 5]);
    const R = 8.2, ink = !!p.ink;
    p.guide([[-1.5, ys, z + 5], [-1.5, ys, z]], true);
    p.screen((c) => {
      c.lineCap = "round";
      c.strokeStyle = "#fff"; c.lineWidth = 3;
      c.beginPath(); c.moveTo(cx + R * 0.74, cy + R * 0.74); c.lineTo(cx + R * 1.55, cy + R * 1.55); c.stroke();
      c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2);
      if (!ink) { c.fillStyle = "#000"; c.fill(); }
      c.lineWidth = 1.7; c.stroke();
      // the entry under the lens: brightest while the glass rests on it
      const k = 1 - Math.sin(g * Math.PI);
      c.fillStyle = "#fff";
      c.beginPath(); c.arc(cx - 3.9, cy - 0.4, 1.7 * k + 0.3, 0, Math.PI * 2); c.fill();
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(cx - 0.6, cy - 0.4); c.lineTo(cx - 0.6 + 5 * k, cy - 0.4 + 2.9 * k); c.stroke();
    });
  },
};
