// No GIFs found: a short stack of animation frames standing upright, a ball on the front one and a loop mark at its corner. Hover and the ball bounces across the frame, leaving its earlier positions behind as ghosts.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 5): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI * 0.5]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
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

export const gif: Illustration = {
  k: "gif", name: "GIFs", title: "No GIFs found", body: "Try a different search word. Matching GIFs will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-1, 1, -14);
    p.shadow(1, 0, 28, 12, 0.1);
    p.rotate("z", -0.5);
    // the frames: two behind, stepped up and to the right, then the front one
    slabY(p, rr(-8, 7, 20, 29, 2.4), -7, 1.6, 0.07);
    slabY(p, rr(-11, 3.5, 17, 25.5, 2.4), -3.5, 1.6, 0.12);
    slabY(p, rr(-14, 0, 14, 22, 2.4), 0, 2, 0.2);
    const f = 0.04, G = 4.4, r = 2.5;
    p.line([[-11, f, G], [11, f, G]], SH.edge, 1);
    // the ball: three bounces across the frame, each lower than the last
    const at = (k: number): P2 => { const b = (k * 3) % 1, n = Math.floor(k * 3 - 1e-6); return [-9.5 + 19 * k, G + r + 0.2 + Math.abs(Math.sin(b * Math.PI)) * (11 - n * 3)]; };
    const ring = ([u, v]: P2, rad: number): V3[] => Array.from({ length: 21 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [u + Math.cos(a) * rad, f, v + Math.sin(a) * rad] as V3; });
    const k = Math.min(1, h * 1.02);
    // ghosts of where it has been
    for (const g of [0.17, 0.33, 0.5, 0.67, 0.83]) if (k > g + 0.07) p.line(ring(at(g), r - 0.3), SH.edge, 0.6);
    const [bu, bv] = at(k);
    const sq = bv < G + r + 1 && k > 0 && k < 1 ? 0.8 : 1;
    p.clear(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [bu + Math.cos(a) * r / sq, f + 0.01, bv - r * (1 - sq) + Math.sin(a) * r * sq] as V3; }));
    // the loop mark: an open ring with an arrow head, turning while hovered
    const [x, y] = p.pt([14.5, 0.6, 22.5]), R = 4.6, a0 = h * t * 2.2;
    p.screen((c) => {
      c.beginPath(); c.arc(x, y, R + 0.9, 0, Math.PI * 2); c.fillStyle = "#000"; c.fill();
      c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
      c.strokeStyle = "#000"; c.lineWidth = 1; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.arc(x, y, R * 0.5, a0 + 0.9, a0 + 5.6); c.stroke();
      const ex = x + Math.cos(a0 + 5.6) * R * 0.5, ey = y + Math.sin(a0 + 5.6) * R * 0.5;
      c.beginPath(); c.moveTo(ex + Math.cos(a0 + 4.2) * 1.7, ey + Math.sin(a0 + 4.2) * 1.7); c.lineTo(ex, ey); c.lineTo(ex + Math.cos(a0 + 6.4) * 1.9, ey + Math.sin(a0 + 6.4) * 1.9); c.stroke();
    });
  },
};
