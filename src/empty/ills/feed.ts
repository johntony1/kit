// Your feed is empty: a phone standing upright, post cards on its screen. The posts scroll up through the screen without end.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
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

export const feed: Illustration = {
  k: "feed", name: "Feed", title: "Your feed is empty", body: "Follow a few people or topics and their posts will start to show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -17);
    p.shadow(0, 1, 20, 10, 0.1);
    p.rotate("z", -0.5);
    // the phone
    slabY(p, rr(-11, 0, 11, 34, 3.2), 0, 2.4, 0.2);
    const f = 0.04, win = rr(-9.2, 1.9, 9.2, 32.1, 1.9).map(([u, v]) => [u, f, v] as V3);
    p.clear(win);
    // the posts, seen only through the screen
    p.screen((c) => {
      c.beginPath();
      win.forEach((v, i) => { const [x, y] = p.pt(v); if (i) c.lineTo(x, y); else c.moveTo(x, y); });
      c.closePath(); c.clip();
      const pitch = 14.5, off = ph * pitch;
      for (let i = -1; i < 4; i++) {
        const top = 30.6 - i * pitch + off, y = f + 0.02;
        p.face(rr(-7.8, top - 13, 7.8, top, 1.4).map(([u, v]) => [u, y, v] as V3), 0.2, 0);
        // who posted, and the picture
        p.dot([-5.3, y + 0.02, top - 2.4], 1.25, 0);
        p.line([[-2.8, y + 0.02, top - 2.4], [4.4, y + 0.02, top - 2.4]], SH.edge, 1);
        p.face(rr(-6.3, top - 11.6, 6.3, top - 4.8, 0.9).map(([u, v]) => [u, y + 0.02, v] as V3), 0.04, 0);
        p.line([[-5.6, y + 0.04, top - 11], [-2, y + 0.04, top - 7.2], [0.6, y + 0.04, top - 9.6], [2.4, y + 0.04, top - 8], [5.6, y + 0.04, top - 11]], 0.5, 0.8);
      }
    });
    p.line([...win, win[0]], SH.edge, 0.5);
  },
};
