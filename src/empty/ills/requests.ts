// No requests: a request card standing upright, an avatar, a name and two round buttons on it, another card waiting behind. Hover and the accept button comes forward and the next card rises.
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

export const requests: Illustration = {
  k: "requests", name: "Friend requests", title: "No requests", body: "When someone asks to connect with you, their request will wait for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 1, 26, 11, 0.1);
    p.rotate("z", -0.5);
    const on = (pts: P2[], y: number) => pts.map(([u, v]) => [u, y, v] as V3);
    // the card behind: rises a little on hover
    const up = 4 * ease(seg(h, 0.4, 1));
    slabY(p, rr(-10, 3 + up, 16, 30.5 + up, 2.6), -3.6, 2, 0.08);
    // the front card
    slabY(p, rr(-13, 0, 13, 28, 2.6), 0, 2.4, 0.2);
    const f = 0.04;
    // the avatar: a dark round window with a head and shoulders
    const az = 19.4, R = 5.6;
    p.face(on(circ(0, az, R, 32), f), 0.04, SH.edge, 0.6);
    p.face(on(circ(0, az + 1.5, 1.9, 18), f + 0.02), 0.32, 0);
    p.face(Array.from({ length: 13 }, (_, i) => { const a = (Math.PI * i) / 12; return [Math.cos(a) * 3.5, f + 0.02, az - 4 + Math.sin(a) * 3.1] as V3; }), 0.32, 0);
    p.line([[-5, f, 11.2], [5, f, 11.2]], SH.edge, 1.2);
    // decline: a dark button with a cross
    p.face(on(circ(-5.6, 5.2, 3.3, 24), f), 0.04, SH.edge, 0.6);
    for (const s of [-1, 1]) p.line([[-5.6 - 1.3, f + 0.02, 5.2 - 1.3 * s], [-5.6 + 1.3, f + 0.02, 5.2 + 1.3 * s]], 0.5, 0.8);
    // accept: a lit button with a tick, coming forward on hover
    const k = pop(seg(h, 0.05, 0.55)), y = 0.4 + 3.2 * k + h * Math.sin(t * 2.6) * 0.3, r = 3.3 + 0.9 * k;
    p.clear(on(circ(5.6, 5.2, r + 0.9, 28), y - 0.02));
    slabY(p, circ(5.6, 5.2, r, 28), y, Math.min(y, 1.2), 0.32);
    p.line([[5.6 - r * 0.45, y + 0.04, 5.2], [5.6 - r * 0.1, y + 0.04, 5.2 - r * 0.38], [5.6 + r * 0.5, y + 0.04, 5.2 + r * 0.38]], SH.edge, 1);
    const s = seg(h, 0.55, 1);
    if (s > 0) ([[13, 6, 9], [15, 5, 2], [-1, 7, 1]] as V3[]).forEach((q, i) => p.dot(q, (0.8 + 0.3 * Math.sin(t * 3 + i * 2)) * s, 1));
  },
};
