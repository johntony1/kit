// Nothing to adjust: one big combination spanner lying on a diagonal, an open jaw at the top gripping a hex nut and a ring at the bottom. It rocks the nut a little turn and back, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop
type P2 = [number, number];
const VX = 0.233;

/** a flat outline in the x z plane between y0 and y1: its lit tops and sparse ends */
function sides(p: Pen, pts: P2[], y0: number, y1: number, top = 0.26, side = 0.065) {
  let a = 0;
  pts.forEach(([u0, v0], i) => { const [u1, v1] = pts[(i + 1) % pts.length]; a += u0 * v1 - u1 * v0; });
  const s = a > 0 ? 1 : -1;
  pts.map((q, i) => [q, pts[(i + 1) % pts.length]] as [P2, P2]).sort((A, B) => A[0][1] + A[1][1] - B[0][1] - B[1][1]).forEach(([[u0, v0], [u1, v1]]) => {
    const nx = (v1 - v0) * s, nz = (u0 - u1) * s;
    if (nx * VX + nz <= 0) return;
    p.face([[u0, y0, v0], [u1, y0, v1], [u1, y1, v1], [u0, y1, v0]], nz > Math.abs(nx) ? top : side, 0);
  });
}
const front = (p: Pen, pts: P2[], y: number, f: number) => p.face(pts.map(([u, v]) => [u, y, v] as V3), f, 0);

// the spanner in its own plane: s along the handle, w across it
const JC = 21, JR = 8, SL = 3.1; // jaw centre, jaw radius, half width of the slot
const RC = -21, RR = 6.2; // ring centre and radius
function shapes(): P2[][] {
  const handle: P2[] = [[RC + 2, -3.2], [JC - 3, -3.6], [JC - 3, 3.6], [RC + 2, 3.2]];
  const a0 = Math.asin(SL / JR);
  const jaw: P2[] = [];
  for (let i = 0; i <= 30; i++) { const a = a0 + (i / 30) * (Math.PI * 2 - a0 * 2); jaw.push([JC + Math.cos(a) * JR, Math.sin(a) * JR]); }
  jaw.push([JC - 1, -SL], [JC - 1, SL]);
  const ring: P2[] = Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2; return [RC + Math.cos(a) * RR, Math.sin(a) * RR]; });
  return [handle, jaw, ring];
}
const hex = (c: P2, r: number, rot: number): P2[] => Array.from({ length: 6 }, (_, i) => { const a = rot + (i / 6) * Math.PI * 2; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]; });

export const wrench: Illustration = {
  k: "wrench", name: "Wrench", title: "Nothing to adjust", body: "Your settings are as they should be. Anything to change will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P, turn = Math.sin(u * Math.PI * 2) * 0.16;
    p.translate(0, 0, 2);
    p.rotate("z", -0.62);
    const tilt = 0.62 + turn; // the spanner's angle in its plane, rocking round the nut
    const nc: P2 = [JC + 1.6, 0];
    const place = (q: P2): P2 => {
      const c = Math.cos(tilt), s = Math.sin(tilt), x = q[0] - nc[0], y = q[1] - nc[1];
      const N: P2 = [Math.cos(0.62) * nc[0], Math.sin(0.62) * nc[0]]; // the nut stays put
      return [N[0] + x * c - y * s, N[1] + x * s + y * c];
    };
    const parts = shapes().map((sh) => sh.map(place));
    const Y0 = -1.6, Y1 = 1.6;
    parts.forEach((sh) => sides(p, sh, Y0, Y1));
    front(p, parts[0], Y1, 0.22);
    p.line([place([RC + 5, 0]), place([JC - 4, 0])].map(([a, b]) => [a, Y1 + 0.02, b] as V3), 1, 0.8); // the handle's groove
    front(p, parts[1], Y1, 0.26);
    front(p, parts[2], Y1, 0.26);
    p.clear(hex(place([RC, 0]), 3.4, tilt).map(([a, b]) => [a, Y1 + 0.03, b] as V3));
    // the nut in the jaw: a thicker hex block, its flats held by the slot, a round hole
    const N = place(nc), nut = hex(N, SL / Math.cos(Math.PI / 6), tilt + Math.PI / 6);
    sides(p, nut, -2.6, 2.6, 0.3, 0.065);
    front(p, nut, 2.6, 0.1);
    p.clear(Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [N[0] + Math.cos(a) * 1.3, 2.63, N[1] + Math.sin(a) * 1.3] as V3; }));
  },
};
