// No emoji yet: a thick smiley token standing upright. Hover and it hops, tips its head, winks and breaks into a wide grin, with a few sparkles.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const circ = (cu: number, cv: number, r: number, n = 28): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r] as P2; });
/** a flat shape standing in the plane y = y0 (facing +y), thickness T going back: rim then front */
function slabY(p: Pen, pts: P2[], y0: number, T: number, front: number) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const nx = (z1 - z0) * sg, nz = -(x1 - x0) * sg;
    if (nx + nz <= 0.001) continue;
    p.face([[x0, y0, z0], [x1, y0, z1], [x1, y0 - T, z1], [x0, y0 - T, z0]], nz > Math.abs(nx) ? SH.top : SH.right, 0);
  }
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, SH.edge, 0.6);
}

export const emoji: Illustration = {
  k: "emoji", name: "Emoji", title: "No emoji yet", body: "Add a custom emoji and it will show up here for everyone to use.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(seg(h, 0.1, 0.7));
    const k = seg(h, 0, 0.55), hop = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 5 : 0;
    p.translate(0, 0, -14);
    p.shadow(0, 1, 24 - hop, 10, 0.12);
    p.rotate("z", -0.5);
    const zc = 13.5 + hop, R = 13.5, f = 0.05;
    p.rotate("y", -0.16 * e + h * Math.sin(t * 2.4) * 0.03, [0, 0, zc]);
    slabY(p, circ(0, zc, R, 52), 0, 4.2, 0.2);
    // the left eye stays open, the right one winks
    p.dot([-4.6, f, zc + 3.6], 2, 0);
    if (e < 0.5) p.dot([4.6, f, zc + 3.6], 2, 0);
    else p.line(Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (0.15 + (0.7 * i) / 8); return [4.6 + Math.cos(a) * 2.6, f, zc + 2.6 + Math.sin(a) * 2.2] as V3; }), SH.edge, 1.3);
    // the mouth: a smile that opens into a grin
    const arc = Array.from({ length: 17 }, (_, i) => { const a = Math.PI * (1.12 + (0.76 * i) / 16); return [Math.cos(a) * 7.4, zc + 0.6 + Math.sin(a) * (6.2 + 1.6 * e)] as P2; });
    if (e > 0.3) p.clear(arc.map(([u, v]) => [u, f, v] as V3));
    p.line(arc.map(([u, v]) => [u, f + 0.01, v] as V3), SH.edge, 1.4);
    if (e > 0.3) p.line([arc[0], arc[16]].map(([u, v]) => [u, f + 0.01, v] as V3), SH.edge, 1.2);
    const s = seg(h, 0.55, 1);
    if (s > 0) ([[-17, 3, zc + 12], [16, -4, zc + 15], [18, 2, zc + 2]] as V3[]).forEach((q, i) => p.dot(q, (0.9 + 0.35 * Math.sin(t * 3 + i * 2)) * s, 1));
  },
};
