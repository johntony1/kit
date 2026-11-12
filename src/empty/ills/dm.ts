// No conversations yet: one thick speech bubble with an avatar token standing at its corner, three dots waiting inside. Hover and a message writes itself in line by line; a badge with a 1 pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const circ = (cu: number, cv: number, r: number, n = 24): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r] as P2; });
/** a rounded rectangle with a tail at its lower left, as [u, v] */
function bubble(w: number, h: number, r: number): P2[] {
  const pts: P2[] = [[r - 1, 0], [-0.5, -4.5], [r + 5, 0]];
  const corner = (cu: number, cv: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = a0 + (Math.PI / 2) * (i / 6); pts.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); } };
  corner(w - r, r, -Math.PI / 2); corner(w - r, h - r, 0); corner(r, h - r, Math.PI / 2); corner(r, r, Math.PI);
  return pts;
}
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

export const dm: Illustration = {
  k: "dm", name: "Direct messages", title: "No conversations yet", body: "Send someone a message and your conversation will start here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(1, -1, -15);
    p.shadow(-2, 3, 28, 11, 0.1);
    p.rotate("z", -0.5);
    // the bubble
    slabY(p, bubble(26, 18, 5).map(([u, v]) => [u - 8, v + 10] as P2), 0, 3.4, 0.13);
    const f = 0.04, w = seg(h, 0.02, 0.2);
    // waiting dots, then the message
    if (w < 1) for (let i = 0; i < 3; i++) p.dot([0 + i * 5, f, 19], 1.6 * (1 - w), 0);
    const row = (z: number, len: number, a: number, b: number) => { const k = ease(seg(h, a, b)); if (k > 0.03) p.line([[-2.5, f, z], [-2.5 + len * k, f, z]], SH.edge, 1.2); };
    row(23, 15, 0.15, 0.5); row(19, 10, 0.3, 0.65); row(15, 13, 0.45, 0.8);
    // the avatar token, in front
    const ax = -11.5, az = 6.8, R = 6.8;
    slabY(p, circ(ax, az, R, 36), 4, 2.4, 0.2);
    p.line([...circ(ax, az, R - 1.3, 36), circ(ax, az, R - 1.3, 36)[0]].map(([u, v]) => [u, 4.03, v] as V3), SH.edge, 0.6);
    p.face(circ(ax, az + R * 0.22, R * 0.27, 18).map(([u, v]) => [u, 4.04, v] as V3), 0.03, 0);
    p.face(Array.from({ length: 13 }, (_, i) => { const a = (Math.PI * i) / 12; return [ax + Math.cos(a) * R * 0.5, 4.04, az - R * 0.6 + Math.sin(a) * R * 0.45] as V3; }), 0.03, 0);
    // the count badge
    const b = seg(h, 0.7, 1);
    if (b > 0) {
      const r = 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
      const [x, y] = p.pt([18, 0.5, 28]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 0.9, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.26; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(x - r * 0.25, y - r * 0.3); g.lineTo(x + r * 0.05, y - r * 0.52); g.lineTo(x + r * 0.05, y + r * 0.52); g.stroke();
      });
    }
  },
};
