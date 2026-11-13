// No images to enhance: a framed picture standing up, a sun over two mountains, blocky and low resolution. Hover and a bright scan line sweeps up the picture, leaving it sharp behind it, and a sparkle pops in at the corner.
import { type Illustration, type V3 } from "../dots";

type Q = [number, number][];
const A0 = -12.5, A1 = 12.5, V0 = 2.5, V1 = 21.5; // the picture inside its frame
const SUN = { a: 5.5, v: 15.5, r: 3.4 };
const M1: Q = [[A0, V0], [-3, 16.5], [7.5, V0]];
const M2: Q = [[0.5, V0], [7.5, 11], [A1, 6], [A1, V0]];
const inTri = (q: Q, a: number, v: number) => {
  let s = 0;
  for (let i = 0; i < q.length; i++) { const [x0, y0] = q[i], [x1, y1] = q[(i + 1) % q.length]; if ((y0 > v) !== (y1 > v) && a < x0 + ((v - y0) * (x1 - x0)) / (y1 - y0)) s ^= 1; }
  return s === 1;
};
const circ = (ca: number, cv: number, r: number, n = 28): Q => Array.from({ length: n }, (_, i) => { const s = (i / n) * Math.PI * 2; return [ca + Math.cos(s) * r, cv + Math.sin(s) * r]; });
const star = (ca: number, cv: number, R: number, r: number): Q =>
  Array.from({ length: 8 }, (_, i) => { const s = Math.PI / 2 + (i * Math.PI) / 4, q = i % 2 ? r : R; return [ca + Math.cos(s) * q, cv + Math.sin(s) * q]; });
// the blocky version: one tone per cell
const CELL = 3.125;
const BLOCKS: [Q, number][] = [];
for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) {
  const a = A0 + i * CELL, v = V0 + j * (19 / 6), ca = a + CELL / 2, cv = v + 19 / 12;
  const f = Math.hypot(ca - SUN.a, cv - SUN.v) < SUN.r + 0.6 ? 0.42 : inTri(M1, ca, cv) || inTri(M2, ca, cv) ? 0.22 : 0;
  if (f) BLOCKS.push([[[a, v], [a + CELL, v], [a + CELL, v + 19 / 6], [a, v + 19 / 6]], f]);
}
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const upscale: Illustration = {
  k: "upscale", name: "Upscale", title: "No images to enhance", body: "Add a picture and it will come back sharper and larger.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 26, 10, 0.12);
    p.rotate("z", -0.62);
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a, y, v] as V3);
    // the frame: depth, the lit face, then the dark sky
    const frame: Q = [[-15, 0], [15, 0], [15, 24], [-15, 24]];
    for (let y = -3; y < 0; y += 0.5) p.face(put(frame, y), 0.065, 0);
    p.face(put(frame, 0), 0.2, 0);
    p.face(put([[A0, V0], [A1, V0], [A1, V1], [A0, V1]], 0.05), 0.03, 0);
    // the scan line rises; below it the picture is sharp, above it still blocky
    const vs = V0 + (V1 - V0) * ease(Math.min(1, Math.max(0, (h - 0.05) / 0.7)));
    const region = (lo: number, hi: number) => put([[A0, lo], [A1, lo], [A1, hi], [A0, hi]], 0.1).map((v) => p.pt(v));
    p.screen((c) => {
      const r = region(V0, vs);
      c.beginPath(); r.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      p.face(put(M1, 0.1), 0.22, 0);
      p.face(put(M2, 0.12), 0.16, 0);
      p.face(put(circ(SUN.a, SUN.v, SUN.r), 0.1), 0.42, 0);
    });
    p.screen((c) => {
      const r = region(vs, V1);
      c.beginPath(); r.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      BLOCKS.forEach(([q, f]) => p.face(put(q, 0.1), f, 0));
      p.line(put([[A0, 2.5 + 19 / 6 * 3], [A1, 2.5 + 19 / 6 * 3]], 0.15), 0.03, 0.3);
    });
    if (vs > V0 + 0.3 && vs < V1 - 0.3) {
      const [l, r] = [p.pt(put([[A0 - 1.5, vs]], 0.3)[0]), p.pt(put([[A1 + 1.5, vs]], 0.3)[0])];
      p.screen((c) => { c.strokeStyle = "#fff"; c.lineWidth = 1.3; c.lineCap = "round"; c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(r[0], r[1]); c.stroke(); });
    }
    // the sparkle pops in at the top left corner once it is sharp
    const b = Math.max(0, (h - 0.72) / 0.28);
    if (b > 0) {
      const k = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      p.face(put(star(-14.5, 23.5, 6.4 * k, 1.9 * k), 0.4), 0.03, 0);
      p.face(put(star(-14.5, 23.5, 5.2 * k, 1.3 * k), 0.6), 0.45, 0);
    }
  },
};
