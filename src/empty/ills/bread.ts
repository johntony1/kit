// Bread loaf: a tin loaf with a domed top and three scores, one slice already cut at the front. Hover and the slice tips forward and lands flat with a little bounce.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
// the loaf's cross section in [x, z], running over the top from the left foot to the right foot
const PROF: P2[] = [[-8, 0], [-8, 7], ...Array.from({ length: 15 }, (_, i) => { const a = Math.PI - (i / 14) * Math.PI; return [9 * Math.cos(a), 7.6 + 5.8 * Math.sin(a)] as P2; }), [8, 7], [8, 0]];

/** a length of loaf from y0 (back) to y1 (front) */
function loaf(p: Pen, y0: number, y1: number) {
  // the crust, in runs of one shade so each run is a single face
  let run: P2[] = [], shade = 0;
  const flush = () => {
    if (run.length > 1) p.face([...run.map(([x, z]) => [x, y1, z] as V3), ...run.slice().reverse().map(([x, z]) => [x, y0, z] as V3)], shade, 0);
    run = [];
  };
  for (let i = 0; i < PROF.length - 1; i++) {
    const [xa, za] = PROF[i], [xb, zb] = PROF[i + 1];
    const l = Math.hypot(xb - xa, zb - za) || 1, nx = -(zb - za) / l, nz = (xb - xa) / l;
    const f = nz > 0.5 ? 0.2 : nx > 0 ? SH.right : SH.left;
    const seen = facing(p, [[xa, y1, za], [xa, y0, za], [xb, y0, zb], [xb, y1, zb]]) > 0;
    if (!seen || f !== shade) flush();
    if (!seen) continue;
    if (!run.length) run.push(PROF[i]);
    run.push(PROF[i + 1]); shade = f;
  }
  flush();
  const front = PROF.map(([x, z]) => [x, y1, z] as V3), back = PROF.map(([x, z]) => [x, y0, z] as V3).reverse();
  for (const cap of [back, front]) {
    if (facing(p, cap) <= 0) continue;
    p.face(cap, 0.26, SH.edge, 0.6);
    // the crust: a cut line just inside the edge of the crumb
    const y = cap[0][1] + (cap === front ? 0.04 : -0.04);
    p.line(PROF.slice(1, -1).map(([x, z]) => [x * 0.86, y, 0.9 + z * 0.87] as V3), SH.edge, 0.5);
  }
}

export const bread: Illustration = {
  k: "bread", name: "Bread loaf", title: "No bakery items", body: "Fresh bread and pastries you add will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    // the slice falls, overshoots a touch and settles
    const k = Math.min(1, h * 1.15);
    const fall = k < 0.7 ? Math.pow(k / 0.7, 2) : 1 - 0.07 * Math.sin(((k - 0.7) / 0.3) * Math.PI);
    p.translate(0, 0, -8);
    p.shadow(0, 0, 27, 13, 0.11);
    p.rotate("z", -0.5); // turned so its cut end faces us
    p.scale(1.15);
    p.translate(0, -5.5 - 2 * fall, 0);
    loaf(p, -11, 5);
    // the scores across the top: dark slashes
    for (const yc of [-7, -1.5]) {
      p.line(Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (0.74 - 0.48 * (i / 8)); return [9 * Math.cos(a), yc + (i / 8 - 0.5) * 2.4, 7.65 + 5.8 * Math.sin(a)] as V3; }), SH.edge, 0.8);
    }
    // the slice
    p.push();
    p.rotate("x", -(0.1 + 1.47 * fall), [0, 8.4, 0]);
    loaf(p, 6.2, 8.4);
    p.pop();
  },
};
