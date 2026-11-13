// Nothing to predict yet: a crystal ball on a round stand, a bright shine on its glass and a swirl of mist inside. Hover and the mist swirls and a star sparkles at its heart.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
const B = ([u, v]: P2, d = 0): V3 => [u * K + d, -u * K + d, v];
const circle = (cu: number, cv: number, r: number, n = 48): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r]; });

export const crystalball: Illustration = {
  k: "crystalball", name: "Crystal ball", title: "Nothing to predict yet", body: "Add a little more data and your forecast will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = easeInOut(h);
    p.translate(0, 0, -21);
    p.shadow(0, 0, 22, 10, 0.12);
    // the stand: a wide foot, a narrower collar
    p.cylinder(0, 0, 0, 12, 3, { side: 0.14, top: 0.2, edge: 0 });
    p.cylinder(0, 0, 3, 8.6, 3.6, { side: 0.22, top: 0.2, edge: 0 });
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(a) * 8.65, Math.sin(a) * 8.65, 4.8] as V3; }), SH.edge, 0.6);
    // the ball: dark glass that lights up, a bright rim
    const C: P2 = [0, 21], R = 15;
    p.face(circle(C[0], C[1], R).map((q) => B(q, 2)), 0.035, 0);
    // the swirl of mist inside
    const sw = h * t * 0.8;
    for (const [r0, a0] of [[9, 0.4], [5.5, 2.6]] as P2[]) {
      const q: P2[] = Array.from({ length: 22 }, (_, i) => { const s = i / 21, a = a0 + sw + s * 3.4; return [C[0] + Math.cos(a) * r0 * (1 - 0.35 * s), C[1] - 2 + Math.sin(a) * r0 * 0.55 * (1 - 0.35 * s)]; });
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.lineCap = "round"; g.beginPath(); q.map((v) => p.pt(B(v, 2))).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
    }
    // the shine: a bright crescent on the upper left
    const sh: P2[] = [];
    for (let i = 0; i <= 16; i++) { const a = 1.75 + (i / 16) * 1.5; sh.push([C[0] + Math.cos(a) * (R - 1.6), C[1] + Math.sin(a) * (R - 1.6)]); }
    for (let i = 16; i >= 0; i--) { const a = 1.75 + (i / 16) * 1.5, f = Math.sin((i / 16) * Math.PI); sh.push([C[0] + Math.cos(a) * (R - 1.6 - 3.4 * f), C[1] + Math.sin(a) * (R - 1.6 - 3.4 * f)]); }
    p.face(sh.map((q) => B(q, 2.2)), 0.45, 0);
    const rim = circle(C[0], C[1], R);
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.beginPath(); rim.map((v) => p.pt(B(v, 2))).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke(); });
    // the star at its heart
    const k = Math.max(0, (h - 0.35) / 0.65);
    if (k > 0) {
      const r = 7.5 * easeInOut(k) * (1 + 0.12 * Math.sin(t * 5));
      const star: P2[] = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, q = i % 2 ? r * 0.3 : r; return [C[0] + 1 + Math.cos(a) * q, C[1] + 1 + Math.sin(a) * q]; });
      p.face(star.map((q) => B(q, 2.4)), 0.45, SH.edge, 0.6);
      for (const [dx, dy, s] of [[-7, -5, 1.3], [6, 6, 1.1], [6, -6, 0.9]]) p.dot(B([C[0] + 1 + dx, C[1] + 1 + dy], 2.4), s * k, 1);
    }
  },
};
