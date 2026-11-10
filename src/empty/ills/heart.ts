// No favorites: a puffy heart standing on the floor. It beats, lub dub, and sends out a soft ring each time.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 1.6; // seconds per beat
const S = Math.SQRT1_2, K = 1 / 1.2247;
type P2 = [number, number];

// the heart's outline in screen units (u right, v up), from the cleft round the right lobe to the tip and back
const OUT: P2[] = Array.from({ length: 64 }, (_, i) => {
  const a = (i / 64) * Math.PI * 2;
  return [16 * Math.pow(Math.sin(a), 3), 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)] as P2;
});

/** a flat shape cut from a slab, standing so its face looks at the viewer, turned by yaw. w runs toward the viewer */
const at = (yaw: number) => {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const e1: V3 = [S * c + S * s, -S * c + S * s, 0], e3: V3 = [S * c - S * s, S * c + S * s, 0];
  return (u: number, v: number, w: number): V3 => [e1[0] * u * K + e3[0] * w, e1[1] * u * K + e3[1] * w, v];
};
function slab(p: Pen, pts: P2[], D: number, f: (u: number, v: number, w: number) => V3, front: number) {
  const cross = (a: V3, b: V3, c: V3): V3 => {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    return [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
  };
  const sides: { q: V3[]; d: number; fill: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const q: V3[] = [f(a[0], a[1], 0), f(b[0], b[1], 0), f(b[0], b[1], -D), f(a[0], a[1], -D)];
    const n = cross(q[0], q[1], q[2]), l = Math.hypot(n[0], n[1], n[2]) || 1;
    const nx = -n[0] / l, ny = -n[1] / l, nz = -n[2] / l;
    if (nx + ny + nz <= 0.02) continue;
    const fill = nz > 0.45 ? 0.24 : ny > nx ? SH.left : SH.right;
    sides.push({ q, d: q.reduce((s, v) => s + v[0] + v[1] + v[2], 0), fill });
  }
  sides.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.q, s.fill, 0));
  p.face(pts.map(([u, v]) => f(u, v, 0)), front, 0);
}

/** two quick beats then a rest: 0..1 */
const beat = (u: number) => {
  const b = (c: number, w: number, k: number) => k * Math.exp(-Math.pow((u - c) / w, 2));
  return b(0.1, 0.055, 1) + b(0.3, 0.06, 0.7);
};

export const heart: Illustration = {
  k: "heart", name: "Heart", title: "No favorites", body: "Tap the heart on anything you love and it will be saved here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P, k = beat(u);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 20 - k * 2, 8, 0.12);
    const sc = 1.02 + 0.09 * k;
    const f0 = at(-0.42);
    const lift = 16;
    const f = (a: number, b: number, w: number) => f0(a * sc, lift + b * sc, w * sc);
    // a ring that leaves with each beat
    const ring = (r0: number) => {
      const r = (u - r0) / 0.5;
      if (r <= 0 || r >= 1) return;
      const g = 1 + r * 0.45, a = (1 - r) * 0.9;
      p.screen((c) => {
        const pts = OUT.map(([x, y]) => p.pt(f(x * g, y * g - 1, -3)));
        c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
        const n = Math.round(255 * a); c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 0.9; c.stroke();
      });
    };
    ring(0.12); ring(0.32);
    // the body: a thick puffy slab, the rim lit along its top
    slab(p, OUT, 7, f, SH.right);
    // the puff: rounder, brighter layers toward the upper left
    const layer = (g: number, du: number, dv: number, fill: number) =>
      p.face(OUT.map(([x, y]) => f(x * g + du, y * g + dv, 0.01)), fill, 0);
    layer(0.84, -0.6, 0.8, 0.13);
    layer(0.6, -1.6, 1.8, 0.24);
    // the front edge, cut, so the face reads apart from the rim
    p.line([...OUT, OUT[0]].map(([x, y]) => f(x, y, 0.02)), SH.edge, 0.7);
    // a shine on the left lobe, cut in
    p.line(Array.from({ length: 9 }, (_, i) => { const a = 2.2 + i * 0.12; return f(-7.6 + Math.cos(a) * 4.6, 6.4 + Math.sin(a) * 4.6, 0.03); }), SH.edge, 1.1);
    p.line([f(-11.6, 3.2, 0.03), f(-11.6, 3.2, 0.03)], SH.edge, 1.2);
    // little sparks at the first beat
    if (k > 0.2) [[-15, 5, 31], [11, -10, 35], [14, 3, 27]].forEach((q, i) => p.dot(q as V3, 0.9 + 0.2 * i, Math.min(1, k * 1.4)));
  },
};
