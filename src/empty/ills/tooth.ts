// No dental visits: a clean molar standing on its roots. Hover and it hops with a little bounce while sparkles twinkle round it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const S = Math.SQRT1_2, K = 1 / 1.2247;
const HALF: P2[] = [[0, 10.8], [3.6, 13], [7.6, 13], [10.6, 10.4], [11.4, 6], [10.6, 1], [9.4, -4], [8.6, -9], [7.2, -13], [5.2, -14], [3.7, -11.5], [2.9, -6.5], [1.7, -3], [0, -2]];
const RAW: P2[] = [...HALF, ...HALF.slice(1, -1).reverse().map(([a, b]) => [-a, b] as P2)];
/** round the corners off a closed outline */
const smooth = (pts: P2[]): P2[] => pts.flatMap((a, i) => { const b = pts[(i + 1) % pts.length]; return [[a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]] as P2[]; });
const OUT = smooth(smooth(RAW));

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
    sides.push({ q, d: q.reduce((s, v) => s + v[0] + v[1] + v[2], 0), fill: nz > 0.45 ? 0.26 : ny > nx ? SH.left : SH.right });
  }
  sides.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.q, s.fill, 0));
  p.face(pts.map(([u, v]) => f(u, v, 0)), front, 0);
}
function sparkle(p: Pen, at3: V3, r: number, k: number) {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at3);
  p.screen((g) => {
    const n = Math.round(255 * Math.min(1, k));
    g.fillStyle = `rgb(${n},${n},${n})`;
    g.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, q = i % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    g.closePath(); g.fill();
  });
}

export const tooth: Illustration = {
  k: "tooth", name: "Tooth", title: "No dental visits", body: "Log a check up or a cleaning and your dental history will build up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = Math.min(1, h * 1.2);
    const hop = k < 0.6 ? 7 * Math.sin((k / 0.6) * Math.PI) : 2 * Math.sin(((k - 0.6) / 0.4) * Math.PI);
    p.translate(0, 0, -16);
    p.shadow(0, 0, 19 - hop * 0.6, 8, 0.12);
    const f0 = at(-0.38), lift = 15.6 + hop;
    const f = (a: number, b: number, w: number) => f0(a, lift + b, w + 2.5);
    slab(p, OUT, 6.5, f, 0.11);
    // the enamel: brighter toward the upper left
    p.face(OUT.map(([a, b]) => f(a * 0.84 - 0.5, (b - 2) * 0.84 + 2.8, 0.01)), 0.19, 0);
    p.face(OUT.filter(([, b]) => b > 1).map(([a, b]) => f(a * 0.58 - 1.6, (b - 7) * 0.62 + 8, 0.02)), 0.26, 0);
    p.line([...OUT, OUT[0]].map(([a, b]) => f(a, b, 0.03)), SH.edge, 0.7);
    // a shine on the crown
    p.line(Array.from({ length: 8 }, (_, i) => { const a = 2 + i * 0.13; return f(-4.6 + Math.cos(a) * 4.4, 5.6 + Math.sin(a) * 4.4, 0.04); }), SH.edge, 1.1);
    // sparkles once it has hopped
    const s = Math.max(0, (h - 0.45) / 0.55);
    ([[14.5, 12, 3.4, 0], [-15, 6, 2.4, 1.7], [12, -8, 2, 3.1]] as const).forEach(([a, b, r, ph]) => sparkle(p, f(a, b, 0), r * s * (0.75 + 0.25 * Math.sin(t * 4 + ph)), s));
  },
};
