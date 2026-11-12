// No breakfast orders: a fresh croissant. Wisps of steam rise off it and fade, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 3.2; // seconds per loop
const RC = 9.5, A0 = -0.42, A1 = Math.PI + 0.42, N = 5; // the arc it follows, and how many rolls
/** screen winding: > 0 when a face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** half the width of the body, u from 0 at one tip to 1 at the other: fat in the middle, with a bulge per roll */
const half = (u: number) => 1.1 + 4.7 * Math.pow(Math.sin(u * Math.PI), 0.7) + 0.75 * Math.abs(Math.sin(u * Math.PI * N));
/** a point of the arch: tips toward us, the crown away from us */
const at = (u: number, w: number): P2 => { const a = A0 + (A1 - A0) * u, r = RC + w; return [-Math.cos(a) * r, 4.5 - Math.sin(a) * r]; };
/** one roll, from u0 to u1, as an outline (counter clockwise) */
const roll = (u0: number, u1: number): P2[] => {
  const n = 8, o: P2[] = [];
  for (let i = 0; i <= n; i++) { const u = u0 + ((u1 - u0) * i) / n; o.push(at(u, half(u))); }
  for (let i = n; i >= 0; i--) { const u = u0 + ((u1 - u0) * i) / n; o.push(at(u, -half(u))); }
  return o;
};

export const croissant: Illustration = {
  k: "croissant", name: "Croissant", title: "No breakfast orders", body: "Breakfast orders will be listed here as they come in.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -10);
    p.shadow(0, 2, 26, 10, 0.11);
    p.push();
    p.translate(0, 0, 8);
    p.rotate("z", -Math.PI / 4);
    p.rotate("x", -0.6);
    // the rolls: the middle one is the thickest, the tips the thinnest
    const order = [0, 4, 1, 3, 2];
    for (const i of order) {
      const o = roll(i / N, (i + 1) / N), th = 3 + 1.6 * (2 - Math.abs(i - 2));
      for (let j = 0; j < o.length; j++) {
        const a = o[j], b = o[(j + 1) % o.length];
        const f: V3[] = [[a[0], a[1], th], [a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], th]];
        if (facing(p, f) > 0) p.face(f, i < 2 ? SH.left : i > 2 ? SH.right : 0.1, 0);
      }
      p.face(o.map(([x, y]) => [x, y, th] as V3), i % 2 ? 0.2 : 0.27, SH.edge, 0.6);
      // a crease along each roll
      const um = (i + 0.5) / N;
      p.line([at(um, half(um) * 0.6), at(um, -half(um) * 0.5)].map(([x, y]) => [x, y, th + 0.04] as V3), SH.edge, 0.5);
    }
    p.pop();
    // steam: three wavy wisps that rise and fade
    for (let i = 0; i < 3; i++) {
      const u = (ph + i / 3) % 1, x0 = (i - 1) * 9, [sx, sy] = p.pt([x0 * 0.577, -x0 * 0.577, 24 + u * 9]);
      const a = Math.sin(u * Math.PI);
      p.screen((c) => {
        c.strokeStyle = `rgba(255,255,255,${(0.9 * a).toFixed(3)})`; c.lineWidth = 1.5; c.lineCap = "round";
        c.beginPath();
        for (let j = 0; j <= 10; j++) { const v = j / 10, x = sx + Math.sin(v * 5 + ph * Math.PI * 2 + i * 2) * 1.6, y = sy - v * 8; if (j) c.lineTo(x, y); else c.moveTo(x, y); }
        c.stroke();
      });
    }
  },
};
