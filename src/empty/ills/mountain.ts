// No hikes yet: two snow capped peaks with pines at their feet. Hover and the sun rises between them while a trail dots its way up to the summit.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
// world point from screen axes: u runs right, v runs towards us
const W = (u: number, v: number, z = 0): V3 => [(v + u) * 0.7071, (v - u) * 0.7071, z];
const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// one slope of a peak with a jagged snow line across it
function slope(p: Pen, A: V3, B1: V3, B2: V3, rock: number, snow: number) {
  p.face([A, B1, B2], rock, SH.edge, 0.55);
  const cap = [A, mix(A, B1, 0.36), ...[1, 2, 3].map((j) => mix(A, mix(B1, B2, j / 4), j % 2 ? 0.46 : 0.28)), mix(A, B2, 0.36)];
  p.face(cap, snow, SH.edge, 0.5);
}
function peak(p: Pen, A: V3, L: V3, F: V3, Rt: V3) {
  slope(p, A, L, F, 0.1, 0.3);
  slope(p, A, F, Rt, 0.03, 0.2);
  p.line([A, F], SH.edge, 0.5);
}
function pine(p: Pen, u: number, v: number, s: number) {
  p.face([W(u - 0.35 * s, v, 0), W(u + 0.35 * s, v, 0), W(u + 0.35 * s, v, 1.6 * s), W(u - 0.35 * s, v, 1.6 * s)], 0.12, SH.edge, 0.4);
  for (const [z0, hw, z1] of [[1.2, 2.2, 4.4], [3.2, 1.7, 6.2]]) p.face([W(u - hw * s, v, z0 * s), W(u + hw * s, v, z0 * s), W(u, v, z1 * s)], 0.26, SH.edge, 0.45);
}

export const mountain: Illustration = {
  k: "mountain", name: "Mountain", title: "No hikes yet", body: "Record a hike or plan a route and it will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(1, 0, -13);
    p.scale(0.9);
    p.shadow(0, 0, 34, 13, 0.1);
    // the sun: hidden behind the saddle, rising on hover
    const k = ease(h);
    const [sx, sy] = p.pt(W(-7, -12, 1 + 30 * k));
    if (k > 0.02) p.screen((g) => {
      g.beginPath(); g.arc(sx, sy, 4.6, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
      const r = Math.max(0, (k - 0.6) / 0.4);
      if (r > 0) for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t * 0.4, c = Math.cos(a), s = Math.sin(a);
        g.strokeStyle = "#fff"; g.lineWidth = 0.8; g.lineCap = "round";
        g.beginPath(); g.moveTo(sx + c * 6.2, sy + s * 6.2); g.lineTo(sx + c * (6.2 + 2.4 * r), sy + s * (6.2 + 2.4 * r)); g.stroke();
      }
    });
    // the far peak, then the near one
    peak(p, W(-15, -6, 22), W(-30, -4), W(-11, 2), W(3, -5));
    const A = W(5, 0, 32), L = W(-17, 2), F = W(9, 10), Rt = W(27, 0);
    peak(p, A, L, F, Rt);
    // the trail: dots climbing the near slope in a zigzag
    const path: V3[] = [mix(L, F, 0.55), mix(A, mix(L, F, 0.8), 0.78), mix(A, mix(L, F, 0.35), 0.6), mix(A, mix(L, F, 0.75), 0.42), mix(A, mix(L, F, 0.45), 0.2), A];
    const n = 16, upTo = ease((h - 0.15) / 0.8) * n;
    for (let i = 0; i < n && i < upTo; i++) {
      const q = (i / (n - 1)) * (path.length - 1), j = Math.min(path.length - 2, Math.floor(q));
      const at = mix(path[j], path[j + 1], q - j);
      p.dot([at[0] + 0.05, at[1] + 0.05, at[2]], i === n - 1 ? 1.3 : 0.7, p.ink ? 1 : i === n - 1 ? 1 : 0);
    }
    // pines at the foot
    pine(p, -24, 8, 1.25); pine(p, -18.5, 11.5, 1); pine(p, 22, 7.5, 1.15);
  },
};
