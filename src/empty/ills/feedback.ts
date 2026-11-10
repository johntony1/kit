// No feedback yet: a speech bubble with five empty stars. Hover and the stars fill one by one, each with a little pop.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
/** a flat shape standing in the plane y = y0 (facing +y), thickness T going back: rim then front */
function slabY(p: Pen, pts: P2[], y0: number, T: number, front: number, top = SH.top, right = SH.right) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const nx = (z1 - z0) * sg, nz = -(x1 - x0) * sg;
    if (nx + nz <= 0.001) continue;
    p.face([[x0, y0, z0], [x1, y0, z1], [x1, y0 - T, z1], [x0, y0 - T, z0]], nz > Math.abs(nx) ? top : right, 0);
  }
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, SH.edge, 0.65);
}

/** the bubble's outline: a rounded rectangle with a tail off its bottom left, counter clockwise */
function bubble(w: number, z0: number, z1: number, r: number): P2[] {
  const out: P2[] = [];
  const arc = (cu: number, cv: number, a0: number) => { for (let i = 0; i <= 5; i++) { const a = a0 + (i / 5) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); } };
  arc(-w + r, z0 + r, Math.PI);
  out.push([-w + 5, z0], [-w + 2.5, z0 - 5.5], [-w + 11, z0]);
  arc(w - r, z0 + r, Math.PI * 1.5);
  arc(w - r, z1 - r, 0);
  arc(-w + r, z1 - r, Math.PI * 0.5);
  return out;
}
const star = (cx: number, cz: number, y: number, R: number, r: number): V3[] =>
  Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R; return [cx + Math.cos(a) * q, y, cz + Math.sin(a) * q] as V3; });

export const feedback: Illustration = {
  k: "feedback", name: "Feedback", title: "No feedback yet", body: "When people rate their experience, their reviews will collect here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.scale(1.08, [0, 0, 14]);
    p.shadow(-7, 0, 14, 8, 0.1); p.shadow(7, 0, 14, 8, 0.1);
    const W = 14.5, z0 = 9 + h * Math.sin(t * 2.2) * 0.8, z1 = z0 + 18;
    // dashed drops to the floor from the bubble's bottom corners
    p.guide([[-W + 3.5, 0.5, z0 - 4], [-W + 3.5, 0.5, 0]]);
    p.guide([[W - 1, 0.5, z0], [W - 1, 0.5, 0]]);
    slabY(p, bubble(W, z0, z1, 3.2), 0.5, 3, 0.14);
    const y = 0.53;
    // a title line above the stars
    p.line([[-9, y, z1 - 4.2], [9, y, z1 - 4.2]], SH.edge, 1.1);
    // five stars: dark and empty at rest, filling in turn on hover
    for (let i = 0; i < 5; i++) {
      const cx = (i - 2) * 5.6, cz = z0 + 7.2;
      const k = Math.min(1, Math.max(0, (h - 0.08 - i * 0.15) / 0.18));
      const pop = 1 + 0.35 * Math.sin(k * Math.PI);
      const R = 2.5 * pop, r = 1.05 * pop;
      if (k > 0.5) {
        // a dark halo, then the lit star inside it, so it reads in the dot styles too
        p.face(star(cx, cz, y + 0.02, R + 0.9, r + 0.5), 0.03, 0);
        p.face(star(cx, cz, y + 0.04, R - 0.15, r - 0.1), 0.32, SH.edge, 0.6);
      }
      else p.face(star(cx, cz, y + 0.02, R, r), 0.03, SH.edge, 0.6);
    }
    // a line of text under the stars
    p.line([[-7, y, z0 + 2.6], [4, y, z0 + 2.6]], SH.edge, 0.7);
    // sparkles once all five are lit
    const s = Math.max(0, (h - 0.85) / 0.15);
    if (s > 0) ([[-18, 2, z1 + 3], [17, -4, z1 + 5], [19, 4, z0 + 4]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.35 * Math.sin(t * 3 + i * 2), s));
  },
};
