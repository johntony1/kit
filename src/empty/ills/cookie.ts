// No snacks yet: a chocolate chip cookie with a bite out of it. Hover and a second bite is taken; crumbs fly off.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 12.5, TH = 3.2, D = R * 0.98; // radius, thickness, how far out the bites are centred
const CHIPS: [number, number, number][] = [[-5.5, -5, 1.7], [1.5, -2.5, 1.5], [-7, 2.5, 1.4], [-0.5, 5.5, 1.8], [5.5, 6.5, 1.3], [-2, -9, 1.3], [4.6, 1.6, 1.2]];
/** screen winding: > 0 when a face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** the cookie's outline, counter clockwise, with round bites [angle, radius] taken out of its rim */
function outline(bites: P2[]): P2[] {
  const bs = bites.filter(([, r]) => r > R - D + 0.5).sort((a, b) => a[0] - b[0]);
  if (!bs.length) return Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * R, Math.sin(a) * R] as P2; });
  const half = (r: number) => Math.acos((R * R + D * D - r * r) / (2 * R * D));
  const o: P2[] = [];
  bs.forEach(([th, r], i) => {
    const be = Math.acos((D * D + r * r - R * R) / (2 * D * r));
    for (let j = 0; j <= 8; j++) { const a = th + Math.PI + be - (2 * be * j) / 8; o.push([D * Math.cos(th) + r * Math.cos(a), D * Math.sin(th) + r * Math.sin(a)]); }
    const [tn, rn] = bs[(i + 1) % bs.length];
    const a0 = th + half(r), a1 = tn - half(rn) + (i === bs.length - 1 ? Math.PI * 2 : 0), n = Math.max(2, Math.round((a1 - a0) * 7));
    for (let j = 1; j < n; j++) { const a = a0 + ((a1 - a0) * j) / n; o.push([Math.cos(a) * R, Math.sin(a) * R]); }
  });
  return o;
}

export const cookie: Illustration = {
  k: "cookie", name: "Cookie", title: "No snacks yet", body: "Add a snack to your list and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = clamp((h - 0.1) / 0.5), bite = 4.6 * ease(k);
    p.translate(0, 0, -9);
    p.shadow(0, 3, 24, 9, 0.11);
    p.push();
    // turned to face us and leaned back, standing on its near edge
    p.translate(0, 0, 7.6 + h * Math.sin(t * 2.6) * 0.5);
    p.rotate("z", -Math.PI / 4);
    p.rotate("x", -0.62 - 0.08 * ease(clamp(h * 2)) * Math.cos(k * Math.PI));
    const o = outline([[-0.95, 5.2], [0.12, bite]]);
    // the rim: the walls that look at us
    for (let i = 0; i < o.length; i++) {
      const a = o[i], b = o[(i + 1) % o.length];
      const f: V3[] = [[a[0], a[1], TH], [a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], TH]];
      if (facing(p, f) > 0) p.face(f, (a[1] + b[1]) / 2 > 2 ? SH.left : SH.right, 0);
    }
    p.face(o.map(([x, y]) => [x, y, TH] as V3), 0.24, SH.edge, 0.6);
    // chocolate chips: dark cuts in the lit top
    for (const [x, y, r] of CHIPS) p.face(Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2 + x; return [x + Math.cos(a) * r, y + Math.sin(a) * r * 0.9, TH + 0.04] as V3; }), 0.02, 0);
    // crumbs off the new bite
    if (k > 0 && k < 1) for (let i = 0; i < 5; i++) {
      const a = 0.12 + (i - 2) * 0.5, d = 4 + i * 1.3;
      p.dot([D * Math.cos(0.12) + Math.cos(a) * d * k, D * Math.sin(0.12) + Math.sin(a) * d * k + 9 * k * k, TH + 5 * k - 4 * k * k], 0.95 - 0.1 * i, 1 - k * k);
    }
    p.pop();
  },
};
