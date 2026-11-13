// No flows yet: a flowchart standing on its edge, a start pill over a decision diamond that branches to two boxes. A pulse runs down from the start, through the diamond and out to one box, then the other; each shape pops forward as the pulse reaches it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 3.6;
const on = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
const rect = (u0: number, v0: number, u1: number, v1: number): P2[] => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
function pill(u0: number, u1: number, vc: number, r: number): P2[] {
  const out: P2[] = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; out.push([u1 - r + Math.cos(a) * r, vc + Math.sin(a) * r]); }
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; out.push([u0 + r + Math.cos(a) * r, vc + Math.sin(a) * r]); }
  return out;
}
// a flat shape standing in the x z plane, extruded back along y; `pop` brings it forward
function slab(p: Pen, pts: P2[], d: number, front: number, pop = 0) {
  for (let y = -d; y < pop; y += 0.6) p.face(on(pts, y), y < -d / 2 ? SH.right : 0.1, 0);
  p.face(on(pts, pop), front, 0);
}
// the pulse's path: start, down to the diamond, out along a branch, down into a box
const pathTo = (s: 1 | -1): P2[] => [[0, 33], [0, 19], [s * 14, 19], [s * 14, 8]];
function along(pts: P2[], k: number): P2 {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let d = k * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) { const f = d / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; }
    d -= seg[i];
  }
  return pts[pts.length - 1];
}

export const flowchart: Illustration = {
  k: "flowchart", name: "Flowchart", title: "No flows yet", body: "Sketch your first flow, one step and one decision at a time.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, side: 1 | -1 = u < 0.5 ? -1 : 1, k = (u % 0.5) / 0.5;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 28, 9, 0.1);
    p.rotate("z", -0.62);
    // how far forward a shape pops when the pulse is at it (a short bump around moment m)
    const bump = (m: number) => Math.max(0, 1 - Math.abs(k - m) / 0.12) * 1.8;
    // the connectors
    const c = 0.2, w = 0.9;
    slab(p, rect(-w, 22, w, 31), 1.6, c);
    slab(p, rect(-14 - w, 19 - w, 14 + w, 19 + w), 1.6, c);
    for (const s of [-14, 14]) slab(p, rect(s - w, 10, s + w, 19), 1.6, c);
    // the start pill, the diamond, the two boxes
    slab(p, pill(-7, 7, 33, 3.6), 3, 0.26, bump(0.04));
    slab(p, [[0, 26], [8.5, 19], [0, 12], [-8.5, 19]], 3, 0.26, bump(0.4));
    p.line(on([[-2.6, 19], [2.6, 19]], 0.05 + bump(0.4)), SH.edge, 1);
    for (const s of [-1, 1] as const) {
      const pop = s === side ? bump(0.96) + (k > 0.96 ? 1.8 * (1 - (k - 0.96) / 0.04) : 0) : 0;
      slab(p, rect(s * 14 - 7, 1, s * 14 + 7, 10), 3, 0.26, pop);
      p.clear(on(rect(s * 14 - 4.5, 6.2, s * 14 + 3.5, 7.4), 0.05 + pop));
      p.clear(on(rect(s * 14 - 4.5, 3.4, s * 14 + 1, 4.6), 0.05 + pop));
    }
    // the pulse: a bright dot ringed in black
    const [pu, pv] = along(pathTo(side), Math.min(1, k * 1.08));
    const [x, y] = p.pt([pu, 2.2, pv]), r = 2.6 * Math.min(1, Math.min(k, 1 - k) * 14);
    if (r > 0.2) p.screen((g) => {
      g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    });
  },
};
