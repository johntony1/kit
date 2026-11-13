// Nothing painted yet: a paint roller held upright against a wall, a fat roller on a bent wire frame and a thick handle below, a fresh stripe of paint on the wall under it. Hover and it rolls up the wall, laying the stripe out behind it.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
type P2 = [number, number];
const VX = 0.233;

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

// the roller: a cylinder lying along x, shaded by which way each strip faces, then its right end cap
function roller(p: Pen, x0: number, x1: number, cz: number, r: number) {
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a0 = -Math.PI * 0.75 + (i / N) * Math.PI * 1.5, a1 = a0 + (Math.PI * 1.5) / N, m = (a0 + a1) / 2;
    const P = (a: number, x: number): V3 => [x, Math.cos(a) * r, cz + Math.sin(a) * r];
    const up = Math.sin(m), out = Math.cos(m);
    p.face([P(a0, x0), P(a1, x0), P(a1, x1), P(a0, x1)], up > 0.3 ? 0.3 : out > 0.3 && up > -0.45 ? 0.22 : 0.035, 0);
  }
  p.face(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [x1, Math.cos(a) * r, cz + Math.sin(a) * r] as V3; }), 0.2, 0);
}

export const paintroller: Illustration = {
  k: "paintroller", name: "Paint roller", title: "Nothing painted yet", body: "Start your first project and it will take shape here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -2);
    p.rotate("z", -0.62);
    const lift = ease(h) * 9, cz = 4 + lift, R = 5.2, X0 = -14, X1 = 8;
    // the fresh stripe on the wall behind: from the bottom up to the roller
    slab(p, [[X0, -12], [X1, -12], [X1, cz], [X0, cz]], -6.6, -5.4, 0.1, 0.12);
    roller(p, X0, X1, cz, R);
    // the frame: out of the roller's end, down and back in under it to the handle's top
    const pts = ([[X1 + 0.4, cz], [X1 + 3.6, cz], [X1 + 3.6, cz - 9], [-2, cz - 11.5], [-2, cz - 13]] as P2[]).map(([u, v]) => p.pt([u, 1.2, v]));
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.strokeStyle = "#000"; g.lineWidth = 3.2; g.stroke();
      g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.stroke();
    });
    // the handle: a thick lit grip with a dark ferrule ring, and its rounded end
    slab(p, [[-4.4, cz - 32], [0.4, cz - 32], [0.8, cz - 15], [-4.8, cz - 15]], 0, 3.4, 0.3, 0.3);
    slab(p, [[-4.6, cz - 15.1], [0.6, cz - 15.1], [-0.4, cz - 12.4], [-3.6, cz - 12.4]], 0.4, 3.2, 0.04, 0.12);
    p.line([[-4.4, 3.45, cz - 28], [0.4, 3.45, cz - 28]], 1, 0.8);
  },
};
