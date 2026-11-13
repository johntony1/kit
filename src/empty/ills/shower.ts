// Nothing in the queue: a wall shower head on an L shaped pipe, its big round rose tipped toward us with a grid of dark nozzles. Water falls from it in bright streaks, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop
type P2 = [number, number];
const VX = 0.233; // how much a face turned to +x still shows, in the turned frame

/** a flat outline in the x z plane, pushed out between y0 and y1: lit tops and sparse ends, then its front */
function slab(p: Pen, pts: P2[], y0: number, y1: number, front: number, top = 0.24, side = 0.065) {
  let a = 0;
  pts.forEach(([u0, v0], i) => { const [u1, v1] = pts[(i + 1) % pts.length]; a += u0 * v1 - u1 * v0; });
  const s = a > 0 ? 1 : -1;
  pts.map((q, i) => [q, pts[(i + 1) % pts.length]] as [P2, P2]).sort((A, B) => A[0][1] + A[1][1] - B[0][1] - B[1][1]).forEach(([[u0, v0], [u1, v1]]) => {
    const nx = (v1 - v0) * s, nz = (u0 - u1) * s;
    if (nx * VX + nz <= 0) return;
    p.face([[u0, y0, v0], [u1, y0, v1], [u1, y1, v1], [u0, y1, v0]], nz > Math.abs(nx) ? top : side, 0);
  });
  p.face(pts.map(([u, v]) => [u, y1, v] as V3), front, 0);
}

// the rose: a disc in the plane of x and W, tipped so its nozzle face looks down at us
const W: V3 = [0, -0.3, -0.95];
const C: V3 = [3, 2, 0], R = 12.5;
const on = (c: V3, a: number, b: number): V3 => [c[0] + a, c[1] + W[1] * b, c[2] + W[2] * b];
const ring = (c: V3, r: number) => Array.from({ length: 44 }, (_, i) => { const g = (i / 44) * Math.PI * 2; return on(c, Math.cos(g) * r, Math.sin(g) * r); });

export const shower: Illustration = {
  k: "shower", name: "Shower", title: "Nothing in the queue", body: "New items will flow in here as soon as they are ready.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, 4);
    p.rotate("z", -0.62);
    // the wall plate and the L pipe: out from the wall, then down into the rose
    slab(p, [[-22, 12], [-17, 12], [-17, 22], [-22, 22]], -3, 1.6, 0.12);
    slab(p, [[-17, 15.2], [1.6, 15.2], [1.6, 10.5], [4.4, 10.5], [4.4, 16.4], [3.4, 17.8], [1.6, 18.4], [-17, 18.4]], -1.6, 1.6, 0.24, 0.3);
    // the bell behind the rose, in shade, and the rose's rim
    slab(p, [[0.4, 11], [5.6, 11], [12, 6], [-6, 6]], -3, 3, 0.1);
    p.face(ring([C[0], C[1] - 2.5, C[2] + 3], R + 0.4), 0.065, 0);
    // the nozzle face: lit, a dark ring and a grid of holes cut into it
    p.face(ring(C, R), 0.26, 0);
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
      const a = i * 3.6, b = j * 3.4;
      if (a * a + b * b > (R - 3) * (R - 3)) continue;
      p.dot(on(C, a, b), 0.95, 0);
    }
    // the water: bright streaks falling from under the rose, moving down over the loop
    const cols = [-10, -7, -4, -1, 2, 5, 8, 11].map((a) => a - 0.5);
    const lo = p.pt([0, 0, -30])[1];
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round";
      cols.forEach((a, i) => {
        const b = Math.sqrt(Math.max(0, R * R - a * a)) * 0.92;
        const [x0, y0] = p.pt(on(C, a, b));
        const spread = a * 0.18, gap = 8, len = 5.5;
        for (let k = -1; k < 7; k++) {
          const s0 = (k + u + (i % 2) * 0.5) * gap, s1 = s0 + len;
          const ya = Math.max(y0 + 2, y0 + 2 + s0), yb = Math.min(lo, y0 + 2 + s1);
          if (yb <= ya) continue;
          g.beginPath(); g.moveTo(x0 + spread * (ya - y0) / 10, ya); g.lineTo(x0 + spread * (yb - y0) / 10, yb); g.stroke();
        }
      });
    });
  },
};
