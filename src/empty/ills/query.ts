// No query results: a database with a magnifier leaning on it. Hover and the lens sweeps across the disks and comes up with a question mark.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 12, H = 8, GAP = 1.4;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const arc = (z: number, a0: number, a1: number, n = 14): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * R, Math.sin(a) * R, z] as V3; });

// one disk of the database: a shaded right half, a denser left half, a seam and a status light
function disk(p: Pen, z: number) {
  const side = (a0: number, a1: number, fill: number) => p.face([...arc(z, a0, a1), ...arc(z + H, a0, a1).reverse()], fill, 0);
  side(-Math.PI / 4, Math.PI / 4, SH.right);
  side(Math.PI / 4, (3 * Math.PI) / 4, SH.left);
  p.disc(0, 0, z + H, R, SH.top, SH.edge);
  p.line(arc(z, -Math.PI / 4, (3 * Math.PI) / 4, 24), SH.edge, 0.55);
  p.line(arc(z + 2.2, -Math.PI / 4, (3 * Math.PI) / 4, 24), SH.edge, 0.5);
  p.dot([Math.cos(2.25) * R + 0.2, Math.sin(2.25) * R + 0.2, z + 5.2], 0.8, 1);
}

export const query: Illustration = {
  k: "query", name: "Query", title: "No query results", body: "Nothing matched this query. Loosen a filter or check the table name, then run it again.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-2, 2, -10);
    p.shadow(1, 1, 28, 14, 0.12);
    disk(p, 0);
    disk(p, H + GAP);
    // the magnifier: rests low on the right, sweeps left across the disks, settles on the front
    const s = ease(clamp(h / 0.75)), sw = Math.sin(Math.PI * s);
    const at: V3 = [14 - 8 * s - 5 * sw, 3 + 5 * s + 7 * sw, 7 + 4 * s + h * Math.sin(t * 2.2) * 0.5];
    const [sx, sy] = p.pt(at), SR = 7.2;
    const q = clamp((h - 0.72) / 0.28), pop = q < 0.65 ? ease(q / 0.65) * 1.15 : 1.15 - 0.15 * ease((q - 0.65) / 0.35);
    p.screen((c) => {
      const hx = sx + SR * 0.72, hy = sy + SR * 0.72, ex = hx + 7.5, ey = hy + 7.5;
      c.lineCap = "round";
      c.beginPath(); c.arc(sx, sy, SR, 0, Math.PI * 2); c.fillStyle = "rgb(12,12,12)"; c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = 3.6; c.beginPath(); c.moveTo(hx, hy); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = "rgb(40,40,40)"; c.lineWidth = 2.1; c.beginPath(); c.moveTo(hx + 0.8, hy + 0.8); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = "#fff"; c.lineWidth = 1.4; c.beginPath(); c.arc(sx, sy, SR, 0, Math.PI * 2); c.stroke();
      if (pop > 0) {
        // nothing found: a question mark in the glass
        const k = pop;
        c.strokeStyle = "#fff"; c.lineWidth = 1.3; c.lineJoin = "round";
        c.beginPath(); c.arc(sx, sy - 1.5 * k, 1.9 * k, Math.PI, Math.PI * 0.5); c.lineTo(sx, sy + 1.6 * k); c.stroke();
        c.fillStyle = "#fff"; c.beginPath(); c.arc(sx, sy + 3.6 * k, 0.8 * k, 0, Math.PI * 2); c.fill();
      } else {
        c.strokeStyle = "rgb(150,150,150)"; c.lineWidth = 0.7; c.beginPath(); c.arc(sx, sy, SR - 2.2, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
      }
    });
  },
};
