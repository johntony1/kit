// No comments: two speech bubbles lying in a stack. Hover and the top one lifts off, a reply typing itself in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];

/** a rounded rectangle in the floor plane, counter clockwise, with a tail on its +y edge near x0 */
function bubble(x0: number, y0: number, x1: number, y1: number, r: number): P2[] {
  const pts: P2[] = [];
  const corner = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= 5; i++) { const a = a0 + (Math.PI / 2) * (i / 5); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  pts.push([x0 + r + 3.5, y1], [x0 + 1.2, y1 + 3.6], [x0 + r + 0.3, y1]);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  return pts;
}

/** a flat shape extruded up from z by th: the walls that face us, then a lit top */
function slab(p: Pen, pts: P2[], z: number, th: number, top = SH.top) {
  const n = pts.length;
  let a = 0;
  for (let i = 0; i < n; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n]; a += x0 * y1 - x1 * y0; }
  const s = a > 0 ? 1 : -1;
  const walls: { d: number; f: V3[]; k: number; e: number }[] = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n];
    const L = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = ((y1 - y0) * s) / L, ny = (-(x1 - x0) * s) / L;
    if (nx + ny <= 0) continue;
    const k = SH.right + (SH.left - SH.right) * Math.max(0, Math.min(1, (ny - nx + 1) / 2));
    walls.push({ d: x0 + x1 + y0 + y1, f: [[x0, y0, z], [x1, y1, z], [x1, y1, z + th], [x0, y0, z + th]], k, e: L > 2.5 ? SH.edge : 0 });
  }
  walls.sort((u, v) => u.d - v.d);
  for (const w of walls) p.face(w.f, w.k, w.e, 0.5);
  p.face(pts.map(([x, y]) => [x, y, z + th] as V3), top, SH.edge, 0.6);
}

const ring = (cx: number, cy: number, z: number, r: number): V3[] => Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

export const comments: Illustration = {
  k: "comments", name: "Comments", title: "No comments yet", body: "Start the conversation and the replies will gather here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(1, 0, -9);
    p.shadow(0, 0, 32, 16, 0.1);
    // the bottom bubble: an older comment
    const B = bubble(-15, -11, 13, 9, 4.5);
    slab(p, B, 0, 3);
    p.face(ring(-10, 0, 3.02, 2.4), SH.right, SH.edge, 0.55);
    p.line([[-5.5, -1, 3.05], [9, -1, 3.05]], SH.edge, 0.9);
    p.line([[-5.5, 2, 3.05], [3, 2, 3.05]], SH.edge, 0.9);
    p.line([[-11, 5.5, 3.05], [9, 5.5, 3.05]], SH.edge, 0.9);

    // the top bubble: rests above the first, lifts on hover
    const z = 9 + 8 * h;
    const T = bubble(-7, -17, 14, -1, 4);
    // dashed drops from its corners to where it sat
    p.guide([[-7, -11, z], [-7, -11, 3]]);
    p.guide([[13, -11, z], [13, -11, 3]]);
    p.guide([[13, -1, z], [13, -1, 3]]);
    p.push();
    p.translate(0, 0, z);
    slab(p, T, 0, 2.6);
    // the avatar: the one accent
    p.face(ring(-2, -12.5, 2.62, 2.2), 0.32, SH.edge, 0.55);
    p.line([[2, -13.5, 2.66], [11, -13.5, 2.66]], SH.edge, 0.9);
    p.line([[2, -10.6, 2.66], [7, -10.6, 2.66]], SH.edge, 0.9);
    // a reply typing itself in, then three dots waiting
    const L = Math.min(1, h * 1.3) * 15;
    if (L > 0.4) p.line([[-3.5, -6.6, 2.66], [-3.5 + L, -6.6, 2.66]], SH.edge, 0.9);
    if (h > 0.95) for (let i = 0; i < 3; i++) {
      const u = (t * 1.4 - i * 0.18 + 3) % 1, k = u < 0.4 ? Math.sin((u / 0.4) * Math.PI) : 0;
      p.dot([-3.5 + i * 2.6, -3.6, 2.7 + k * 1.2], 0.75, 0);
    }
    p.pop();
  },
};
