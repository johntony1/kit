// Nothing shared with you: a drive with a share mark floating over it, three points joined by two links. Hover and the mark opens out and signals run along the links.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

// a bright stroke: lines turn dark in the dot styles, so marks on a dark ground are stroked on the screen
function bright(p: Pen, pts: V3[], lw: number) {
  if (p.ink) { p.line(pts, SH.edge, lw); return; }
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

const cl = (x: number) => Math.max(0, Math.min(1, x));
const mix = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];

export const shared: Illustration = {
  k: "shared", name: "Shared drive", title: "Nothing shared with you", body: "Files and folders that people share with you will be collected here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(cl(h / 0.7));
    p.translate(0, 0, -13);
    p.shadow(0, 0, 28, 14, 0.12);
    p.rotate("z", -0.3);
    // the drive: a low slab, a slot and a light on its front, a label on top
    p.box(-14, -9, 0, 28, 18, 7.5, { top: 0.2, left: 0.12, right: 0.065 });
    const fy = 9.03;
    p.line([[-11, fy, 3.7], [3, fy, 3.7]], SH.edge, 0.8);
    p.dot([10, fy, 3.7], 0.9 + 0.5 * k, 0.6 + 0.4 * k);
    p.line([[-10.5, -5.5, 7.53], [10.5, -5.5, 7.53], [10.5, 5.5, 7.53], [-10.5, 5.5, 7.53], [-10.5, -5.5, 7.53]], 0.5, 0.4);
    // the share mark: one point on the left, two on the right
    const s = 0.82 + 0.3 * k, zc = 19.5 + k * 2.5 + (h > 0.9 ? Math.sin(t * 2.2) * 0.4 : 0);
    const A: V3 = [-6.5 * s, 0, zc], B: V3 = [6.5 * s, 0, zc + 6.6 * s], C: V3 = [6.5 * s, 0, zc - 6.6 * s];
    if (k > 0.05) p.guide([[0, 0, zc - 7 * s], [0, 0, 7.5]], true);
    bright(p, [B, A, C], 1.1);
    if (h > 0.5) for (const [q, o] of [[B, 0], [C, 0.5]] as [V3, number][]) p.dot(mix(A, q, (t * 0.9 + o) % 1), 0.85, cl((h - 0.5) / 0.3));
    p.dot(A, 2.9 * s, 1); p.dot(B, 2.5 * s, 1); p.dot(C, 2.5 * s, 1);
  },
};
