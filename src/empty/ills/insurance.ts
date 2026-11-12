// Umbrella: an open umbrella with striped panels and a hooked handle. Rain falls all around and the drops that land on it burst on the canopy.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.6; // seconds per loop
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a point on the plane that faces us through c: u to the right, v up */
const bb = (c: V3, u: number, v: number): V3 => [c[0] + u * 0.7071 - v * 0.4082, c[1] - u * 0.7071 - v * 0.4082, c[2] + v * 0.8165];
const ZA = 38, ZM = 35, ZR = 27.5, RM = 9.5, RR = 16.5; // the canopy: its peak, its shoulder and its rim
const ring = (i: number, r: number, z: number): V3 => { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; return [Math.cos(a) * r, Math.sin(a) * r, z]; };
/** the canopy's height under a point r from the shaft */
const roof = (r: number) => (r < RM ? ZA - ((ZA - ZM) * r) / RM : ZM - ((ZM - ZR) * (r - RM)) / (RR - RM));
// the rain: where each drop falls, and when in the loop
const RAIN: [number, number, number][] = [[-20, -8, 0], [-9, -19, 0.37], [6, -22, 0.71], [-21, 12, 0.55], [-5, -6, 0.2], [7, 4, 0.62], [-6, 9, 0.86], [22, -10, 0.13], [10, 21, 0.45], [-12, 22, 0.05], [24, 6, 0.8], [3, -9, 0.4]];

export const insurance: Illustration = {
  k: "insurance", name: "Umbrella", title: "No policies yet", body: "Take out cover and your policies will be kept here, ready when you need them.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -21);
    p.shadow(0, 0, 20, 10, 0.1);
    // a drop: a short bright streak, or a little burst where it lands on the canopy
    const drop = ([x, y, off]: [number, number, number]) => {
      const r = Math.hypot(x, y), end = r < RR - 0.5 ? roof(r) + 0.6 : 0, k = (u + off) % 1, z = 42 - 55 * k;
      if (z > end) { p.dot([x, y, z], 0.62, 1); p.dot([x, y, z + 1.5], 0.5, 1); p.dot([x, y, z + 2.8], 0.34, 1); return; }
      const s = (end - z) / 9;
      if (end > 0 && s < 1) for (const d of [-1, 1]) p.dot(bb([x, y, end], d * (0.8 + 2.4 * s), 1.6 * Math.sin(s * Math.PI)), 0.5 * (1 - s) + 0.15, 1);
    };
    const out = RAIN.filter(([x, y]) => Math.hypot(x, y) >= RR - 0.5);
    out.filter(([x, y]) => x + y < 0).forEach(drop);
    // the panels: the far ones show their underside
    const gores = Array.from({ length: 8 }, (_, i) => {
      const a = ((i + 0.5) / 8) * Math.PI * 2 + Math.PI / 8;
      const sag: V3 = [Math.cos(a) * (RR - 1.6), Math.sin(a) * (RR - 1.6), ZR + 1.5];
      const pts: V3[] = [[0, 0, ZA], ring(i, RM, ZM), ring(i, RR, ZR), sag, ring(i + 1, RR, ZR), ring(i + 1, RM, ZM)];
      return { i, pts, d: Math.cos(a) + Math.sin(a), low: [ring(i, RM, ZM), ring(i, RR, ZR), sag, ring(i + 1, RR, ZR), ring(i + 1, RM, ZM)] as V3[] };
    }).sort((a, b) => a.d - b.d);
    const panel = (g: (typeof gores)[number]) => {
      const seen = facing(p, g.low) > 0;
      p.face(g.pts, seen ? (g.i % 2 ? 0.2 : 0.09) : 0.03, 0);
      p.line([[0, 0, ZA], g.pts[1], g.pts[2]], SH.edge, 0.5);
      p.line([[0, 0, ZA], g.pts[5], g.pts[4]], SH.edge, 0.5);
      if (seen) p.line([g.pts[2], g.pts[3], g.pts[4]], SH.edge, 0.4);
    };
    gores.filter((g) => g.d < 0).forEach(panel);
    // the shaft and its hooked handle
    p.box(-0.7, -0.7, 5, 1.4, 1.4, ZM - 5, { top: 0.2, left: 0.2, right: 0.1 });
    const hook: V3[] = [], HC: V3 = [0, 0, 5];
    for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI; hook.push(bb(HC, 2.2 + Math.cos(a) * 3, Math.sin(a) * 3)); }
    hook.push(bb(HC, 5.2, 2), bb(HC, 3.6, 2));
    for (let i = 14; i >= 0; i--) { const a = Math.PI + (i / 14) * Math.PI; hook.push(bb(HC, 2.2 + Math.cos(a) * 1.4, Math.sin(a) * 1.4)); }
    p.face(hook, 0.2, 0);
    gores.filter((g) => g.d >= 0).forEach(panel);
    p.box(-0.6, -0.6, ZA - 0.4, 1.2, 1.2, 3, { top: 0.2, left: 0.2, right: 0.1 }); // the tip
    RAIN.filter(([x, y]) => Math.hypot(x, y) < RR - 0.5).forEach(drop);
    out.filter(([x, y]) => x + y >= 0).forEach(drop);
  },
};
