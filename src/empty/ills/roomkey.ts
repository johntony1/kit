// No rooms booked: an old hotel room key hanging from a big numbered fob on a ring. Hover and the key swings out on the ring and settles, and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
// shapes in a plane facing us: u runs right, v runs up. The fob: a shield with clipped corners
const FOB: P2[] = [[-8, 0], [8, 0], [10, 3], [10, 21], [6.5, 25], [-6.5, 25], [-10, 21], [-10, 3]];
const D = 2.6; // fob thickness

/** an outline in the plane y = 0, extruded back by d: the face looking at us, then the edges we see */
function plate(p: Pen, pts: P2[], d: number, face: number) {
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const nu = b[1] - a[1], nv = -(b[0] - a[0]); // outward, for a clockwise outline in (u, v)
    if (nu + nv <= 0) continue;
    p.face([[a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], -d, b[1]], [a[0], -d, a[1]]], nv > nu ? 0.2 : 0.065, 0);
  }
  p.face(pts.map(([u, v]) => [u, 0, v] as V3), face, 0);
}
const circ = (cu: number, cv: number, r: number, n = 28): P2[] => Array.from({ length: n }, (_, i) => { const a = -(i / n) * Math.PI * 2; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r]; });
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.32); g.stroke();
  });
}

export const roomkey: Illustration = {
  k: "roomkey", name: "Room key", title: "No rooms booked", body: "Book a room and your stay will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    // the key swings out on the ring, back past rest, and settles
    const s = seg(h, 0, 0.8), swing = 0.85 * Math.sin(s * Math.PI * 2.5) * Math.exp(-2.2 * s) + h * Math.sin(t * 2.2) * 0.03;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 10, 0.1);
    p.rotate("z", -0.5);
    // the fob, its border cut, the number
    p.push();
    p.translate(-3, 0, 0);
    p.rotate("y", -0.12, [0, 0, 29]);
    plate(p, FOB, D, 0.24);
    const f = (u: number, v: number): V3 => [u, 0.04, v];
    p.line([f(-6.6, 2), f(6.6, 2), f(8, 4), f(8, 20.2), f(5.6, 23), f(-5.6, 23), f(-8, 20.2), f(-8, 4), f(-6.6, 2)], SH.edge, 0.6);
    p.face(circ(0, 20.5, 1.5).map(([u, v]) => f(u, v)), 0.02, 0);
    p.line([f(-6, 13.5), f(-4.4, 15.4), f(-4.4, 5.4)], SH.edge, 1.5);
    p.line([f(-0.6, 13.6), f(0.6, 15.4), f(4, 15.4), f(5.2, 13.8), f(5.2, 11.8), f(-0.6, 5.4), f(5.6, 5.4)], SH.edge, 1.5);
    p.pop();
    // the ring, bright, through the hole at the top
    const rc = p.pt([-3, 0, 31.5]);
    p.screen((c) => { c.strokeStyle = "#fff"; c.lineWidth = 1.6; c.beginPath(); c.ellipse(rc[0], rc[1], 4.6, 5.2, 0, 0, Math.PI * 2); c.stroke(); });
    // the key, hanging from the ring and swinging
    p.push();
    p.translate(0, 2.6, 0);
    p.rotate("y", 0.95 + swing, [-3, 0, 33]);
    p.translate(-3, 0, 33);
    // bow at the ring, shaft down, bit at the far end (u along the key)
    const bow = circ(0, -5.5, 4.4), hole = circ(0, -5.5, 2);
    plate(p, bow, 1.6, 0.3);
    p.face(hole.map(([u, v]) => [u, 0.04, v] as V3), 0.02, 0);
    plate(p, [[1.3, -9.6], [1.3, -27], [-1.3, -27], [-1.3, -9.6]], 1.6, 0.3);
    plate(p, [[1.2, -21], [5.4, -21], [5.4, -22.6], [3.6, -22.6], [3.6, -24.2], [5.4, -24.2], [5.4, -27], [1.2, -27]], 1.6, 0.3);
    p.pop();
    const b = seg(h, 0.7, 1);
    if (b > 0) badge(p, [8, 0, 30], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
