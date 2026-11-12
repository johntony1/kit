// No rates yet: a thick tag with a big percent sign, a ring through its eyelet. It stands leaning back and turns gently from side to side.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 3.4; // seconds per loop
const TH = 1.8; // thickness of the tag
// the tag, point up: x across, y running down toward us
const TAG: P2[] = [[0, -15], [9, -7], [9, 12], [-9, 12], [-9, -7]];
const ring = (cx: number, cy: number, r: number, z: number, n = 22): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });
/** screen winding: > 0 when a face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};

export const rate: Illustration = {
  k: "rate", name: "Percent tag", title: "No rates yet", body: "Rates will show here as soon as they are set.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = ((t / P) % 1) * Math.PI * 2, Z = TH + 0.04;
    p.translate(0, 0, -11);
    p.shadow(0, 3, 22, 9, 0.11);
    p.translate(0, 0, 11 + 0.7 * Math.sin(w * 2));
    p.rotate("z", -Math.PI / 4);
    p.rotate("x", -0.66);
    p.rotate("y", 0.42 * Math.sin(w)); // turning from side to side
    p.rotate("z", 0.3 + 0.05 * Math.sin(w + 1));
    // the rim: the walls that look at us, then the lit face
    const up = TAG.map(([x, y]) => [x, y, TH] as V3), o = facing(p, up) > 0 ? TAG : TAG.slice().reverse();
    for (let i = 0; i < o.length; i++) {
      const a = o[i], b = o[(i + 1) % o.length];
      const f: V3[] = [[a[0], a[1], TH], [a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], TH]];
      if (facing(p, f) > 0) p.face(f, (a[1] + b[1]) / 2 > 5 ? 0.12 : 0.07, SH.edge, 0.45);
    }
    p.face(up, 0.22, SH.edge, 0.6);
    p.line([[0, -12.6, Z], [7.4, -6.2, Z], [7.4, 10.4, Z], [-7.4, 10.4, Z], [-7.4, -6.2, Z], [0, -12.6, Z]], SH.edge, 0.45);
    // the eyelet
    p.face(ring(0, -9, 1.7, Z), 0.01, 0);
    // a bold percent sign, cut dark into the face
    for (const [cx, cy] of [[-3.5, -2.2], [3.5, 6.2]] as P2[]) { p.face(ring(cx, cy, 2.9, Z), 0.015, 0); p.face(ring(cx, cy, 1.15, Z + 0.02), 0.3, 0); }
    p.face([[4.3, -4.6, Z], [5.8, -3.6, Z], [-4.3, 8.6, Z], [-5.8, 7.6, Z]], 0.015, 0);
    // the ring through the eyelet, drawn bright
    const loop = ring(0, -13.2, 4.3, TH / 2, 26).map((v) => p.pt(v));
    p.screen((c) => {
      c.strokeStyle = "#fff"; c.lineWidth = 1.3;
      c.beginPath(); loop.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.stroke();
    });
  },
};
