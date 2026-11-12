// No channels yet: a channel list standing upright, four rows that each start with a hash. Hover and one row lifts out of the list toward you and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
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
/** a hash sign and the channel's name as a bar */
function row(p: Pen, y: number, z: number, len: number, lw: number) {
  const u = -7.6, s = 1.9;
  const q = (a: number, b: number): V3 => [u + a * s, y, z + b * s];
  p.line([q(-0.9, -1.9), q(-0.3, 1.9)], SH.edge, lw); p.line([q(0.5, -1.9), q(1.1, 1.9)], SH.edge, lw);
  p.line([q(-1.6, 0.7), q(1.8, 0.7)], SH.edge, lw); p.line([q(-1.8, -0.7), q(1.6, -0.7)], SH.edge, lw);
  p.line([[-1.6, y, z], [-1.6 + len, y, z]], SH.edge, lw * 1.5);
}
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r + 0.9, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const channel: Illustration = {
  k: "channel", name: "Channels", title: "No channels yet", body: "Create a channel to keep a topic in one place. It will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(seg(h, 0.05, 0.6));
    p.translate(0, 0, -16);
    p.shadow(0, 1, 26, 11, 0.1);
    p.rotate("z", -0.5);
    slabY(p, rr(-13, 0, 13, 31, 2.4), 0, 2.6, 0.11);
    const f = 0.04;
    row(p, f, 25, 9, 0.75);
    row(p, f, 6, 7, 0.75);
    // the chosen row: a lit bar that comes forward
    const y = 0.5 + 4.2 * k + h * Math.sin(t * 2.4) * 0.3;
    if (k > 0.1) for (const u of [-12, 12]) p.guide([[u, y, 11.5], [u, 0, 11.5]]);
    slabY(p, rr(-12, 11.5, 12 + 2 * k, 19.5, 1.8), y, y, 0.24);
    row(p, y + 0.04, 15.5, 10, 0.9);
    const b = seg(h, 0.62, 1);
    if (b > 0) badge(p, [14, y + 0.5, 20], 4.2 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
