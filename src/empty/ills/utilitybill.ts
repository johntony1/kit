// No bills due: a utility bill, a lightning bolt in the seal at its head. Hover and the seal lights up; a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 10.5, L = 14, TH = 0.9; // half width, half length, thickness of the sheet
const BOLT: P2[] = [[1, -3.6], [-2.1, 0.5], [-0.2, 0.5], [-1, 3.6], [2.1, -0.6], [0.3, -0.6]];
/** screen winding: > 0 when a face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
// a round bright badge with a dark tick, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}

export const utilitybill: Illustration = {
  k: "utilitybill", name: "Utility bill", title: "No bills due", body: "Bills for power, water and internet will show here when they are due.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const lit = ease(clamp((h - 0.1) / 0.4)), Z = TH + 0.04;
    p.translate(0, 0, -10);
    p.shadow(0, 3, 24, 10, 0.11);
    p.push();
    // the sheet, turned a little and leaned back
    p.translate(0, 0, 9.5 + 1.5 * lit + h * Math.sin(t * 2.4) * 0.5);
    p.rotate("z", -Math.PI / 4 + 0.3);
    p.rotate("x", -0.74);
    const o: P2[] = [[-W, -L], [W - 4, -L], [W, -L + 4], [W, L], [-W, L]]; // one corner folded
    const pts = facing(p, o.map(([x, y]) => [x, y, TH] as V3)) > 0 ? o : o.slice().reverse();
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const f: V3[] = [[a[0], a[1], TH], [a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], TH]];
      if (facing(p, f) > 0) p.face(f, 0.1, 0);
    }
    p.face(o.map(([x, y]) => [x, y, TH] as V3), 0.21, SH.edge, 0.6);
    p.face([[W - 4, -L, Z], [W, -L + 4, Z], [W - 4, -L + 4, Z]], 0.1, SH.edge, 0.5);
    // the seal: dark with a lit bolt at rest, lit with a dark bolt once it is on
    const cy = -6.6, R = 4.9;
    p.face(Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2; return [-1 + Math.cos(a) * R, cy + Math.sin(a) * R, Z] as V3; }), lit > 0.5 ? 0.45 : 0.03, SH.edge, 0.6);
    p.face(BOLT.map(([x, y]) => [-1 + x * 1.08, cy + y * 1.08, Z + 0.03] as V3), lit > 0.5 ? 0.02 : 0.42, 0);
    // rows of text and the amount, as dark cuts
    const bar = (x0: number, x1: number, y: number, w: number) => p.face([[x0, y, Z], [x1, y, Z], [x1, y + w, Z], [x0, y + w, Z]], 0.03, 0);
    bar(-7.5, 7.5, 1.2, 1.1); bar(-7.5, 3, 4.4, 1.1); bar(-7.5, 5.5, 7.6, 1.1);
    bar(1.5, 7.5, 10.6, 1.8);
    // sparks off the seal
    if (lit > 0.5) for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4, d = R + 1.6 + 1.2 * Math.sin(t * 4 + i);
      p.dot([-1 + Math.cos(a) * d, cy + Math.sin(a) * d, Z + 0.5], 0.7, 1);
    }
    p.pop();
    const b = clamp((h - 0.62) / 0.38);
    if (b > 0) badge(p, [14, -12, 12], 4.8 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
