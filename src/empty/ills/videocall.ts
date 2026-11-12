// No calls scheduled: a call screen on a small stand, one caller on it. Hover and your own picture pops into the corner, the caller nods and a camera badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const pop = (b: number) => (b <= 0 ? 0 : b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
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
/** a head and shoulders */
function person(p: Pen, u: number, z: number, s: number, y: number, fill: number, nod = 0) {
  p.face(Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [u + Math.cos(a) * 3.3 * s, y, z + (9.6 + nod) * s + Math.sin(a) * 3.3 * s] as V3; }), fill, 0);
  p.face(Array.from({ length: 15 }, (_, i) => { const a = (Math.PI * i) / 14; return [u + Math.cos(a) * 6.6 * s, y, z + Math.sin(a) * 5.2 * s] as V3; }), fill, 0);
}

export const videocall: Illustration = {
  k: "videocall", name: "Video call", title: "No calls scheduled", body: "Schedule a call or start one now. Your upcoming calls will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 1, 28, 12, 0.1);
    p.rotate("z", -0.5);
    const st = { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 };
    // the stand
    p.box(-7, -4.5, 0, 14, 8, 1.5, st);
    p.box(-1.8, -3, 1.5, 3.6, 2, 3.5, st);
    // the screen
    slabY(p, rr(-16.5, 4.5, 16.5, 27.5, 2.2), 0, 2.2, 0.2);
    const f = 0.04;
    p.clear(rr(-14.6, 6.4, 14.6, 25.6, 1.2).map(([u, v]) => [u, f, v] as V3));
    // the caller
    person(p, -1, 6.4, 1, f + 0.02, 0.2, h * Math.sin(t * 3) * 0.5);
    // your own picture, popping into the corner
    const k = pop(seg(h, 0.1, 0.55));
    if (k > 0.02) {
      const cu = 9.6, cz = 10.6, w = 3.6 * k, hh = 3.2 * k;
      p.face(rr(cu - w, cz - hh, cu + w, cz + hh, 0.9 * k).map(([u, v]) => [u, f + 0.6, v] as V3), 0.32, SH.edge, 0.6);
      p.push(); p.translate(0, 0.02, 0);
      p.clear(rr(cu - w + 0.7, cz - hh + 0.7, cu + w - 0.7, cz + hh - 0.7, 0.5 * k).map(([u, v]) => [u, f + 0.62, v] as V3));
      person(p, cu, cz - hh + 0.7, 0.3 * k, f + 0.64, 0.26);
      p.pop();
    }
    // the camera badge
    const b = pop(seg(h, 0.6, 1));
    if (b > 0) {
      const r = 4.6 * b, [x, y] = p.pt([17, 0.5, 28]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 0.9, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.fillStyle = "#000";
        g.fillRect(x - r * 0.55, y - r * 0.32, r * 0.68, r * 0.64);
        g.beginPath(); g.moveTo(x + r * 0.2, y); g.lineTo(x + r * 0.6, y - r * 0.34); g.lineTo(x + r * 0.6, y + r * 0.34); g.closePath(); g.fill();
      });
    }
  },
};
