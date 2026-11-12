// No gains yet: three short up arrows standing in a row. Hover and they grow, each taller than the last, with a spark over the tallest.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
/** screen winding: > 0 when a face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** an up arrow of height hh, standing in the plane that looks left, y thick: lit front, lit shoulders, a sparse side */
function arrow(p: Pen, x: number, hh: number, th: number) {
  const o: P2[] = [[-2.3, 0], [2.3, 0], [2.3, hh - 6.5], [5.2, hh - 6.5], [0, hh], [-5.2, hh - 6.5], [-2.3, hh - 6.5]];
  const P = ([u, z]: P2, y: number): V3 => [x + u, y, z];
  for (let i = 0; i < o.length; i++) {
    const a = o[i], b = o[(i + 1) % o.length];
    const f: V3[] = [P(b, th), P(b, -th), P(a, -th), P(a, th)];
    if (facing(p, f) > 0) p.face(f, b[1] > a[1] && b[0] < a[0] ? 0.34 : b[0] === a[0] ? SH.right : 0.1, 0);
  }
  p.face(o.map((q) => P(q, th)), 0.22, SH.edge, 0.6);
}

export const growth: Illustration = {
  k: "growth", name: "Growth arrow", title: "No gains yet", body: "When your money starts to grow, the gains will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 28, 12, 0.13);
    p.rotate("z", -0.3);
    const rise = [1.5, 9, 17.5];
    [-10.6, 0, 10.6].forEach((x, i) => {
      const k = clamp((h - i * 0.14) / 0.6);
      arrow(p, x, 13.5 + rise[i] * (k > 0 ? back(k) : 0) + (i === 2 ? h * Math.sin(t * 2.6) * 0.5 : 0), 1.9);
    });
    // a spark over the tallest
    const s = clamp((h - 0.7) / 0.3);
    if (s > 0) ([[10.6, 0, 36.5], [15.5, 0, 33], [5.8, 0, 34]] as V3[]).forEach((q, i) => p.dot(q, (1.1 - i * 0.2) * s + 0.25 * Math.sin(t * 3.4 + i * 2), s));
  },
};
