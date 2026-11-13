// No gains yet: a bull's head face on, two big bright horns curving up and out, ears out to the sides, a long face with a lit muzzle and a ring through its nose. Hover and the head tosses up and an up arrow badge pops in by its horn.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
type P2 = [number, number];
const VX = 0.12;

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
const bez = (a: P2, c: P2, b: P2, n: number): P2[] => Array.from({ length: n + 1 }, (_, i) => { const k = i / n, m = 1 - k; return [m * m * a[0] + 2 * m * k * c[0] + k * k * b[0], m * m * a[1] + 2 * m * k * c[1] + k * k * b[1]]; });
const mirror = (pts: P2[]): P2[] => pts.map(([u, v]) => [-u, v] as P2).reverse();
const oval = (cu: number, cv: number, ru: number, rv: number, y: number, tilt = 0): V3[] => Array.from({ length: 20 }, (_, i) => {
  const a = (i / 20) * Math.PI * 2, x = Math.cos(a) * ru, z = Math.sin(a) * rv;
  return [cu + x * Math.cos(tilt) - z * Math.sin(tilt), y, cv + x * Math.sin(tilt) + z * Math.cos(tilt)] as V3;
});

// the right horn: out along its lower edge to the tip, back along its upper edge
const HORN: P2[] = [...bez([7.5, 12.5], [22, 11], [20, 27], 14), ...bez([20, 27], [17.5, 15.5], [7, 17.5], 14)];
const EAR: P2[] = [[8.5, 10.5], [13, 12.4], [17.5, 10.8], [13.5, 7.6], [9, 7.6]];
const HEAD: P2[] = [[-8.6, 16.5], [8.6, 16.5], [9.6, 9], [7.6, 0], [6.8, -9], [-6.8, -9], [-7.6, 0], [-9.6, 9]];

export const bull: Illustration = {
  k: "bull", name: "Bull", title: "No gains yet", body: "Make your first investment and your gains will start to show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = clamp(h / 0.6), toss = Math.sin(Math.PI * k) * 0.14 + 0.04 * ease(k) + h * Math.sin(t * 2.6) * 0.015;
    p.push();
    p.rotate("z", -0.7);
    p.rotate("x", -toss, [0, 0, -4]);
    // horns behind, ears, then the head
    slab(p, HORN, -1.2, 1.2, 0.32, 0.32);
    slab(p, mirror(HORN), -1.2, 1.2, 0.32, 0.32);
    slab(p, EAR, -0.6, 1, 0.12);
    slab(p, mirror(EAR), -0.6, 1, 0.12);
    slab(p, HEAD, -2, 2, 0.13);
    const y = 2.04;
    // a lit forelock and two dark slanted eyes
    p.face([[-4.6, y, 16.5], [4.6, y, 16.5], [2.4, y, 12.5], [0, y, 13.8], [-2.4, y, 12.5]], 0.26, 0);
    p.clear(oval(-4.6, 5.4, 1.9, 0.9, y + 0.01, -0.35));
    p.clear(oval(4.6, 5.4, 1.9, 0.9, y + 0.01, 0.35));
    // the muzzle: a broad lit pad standing out, two narrow nostrils
    slab(p, [[-7.6, -17], [7.6, -17], [8.4, -13], [7.4, -7.5], [-7.4, -7.5], [-8.4, -13]], 2, 3.4, 0.28, 0.3);
    p.clear(oval(-3.6, -12, 0.9, 1.7, 3.45, -0.3));
    p.clear(oval(3.6, -12, 0.9, 1.7, 3.45, 0.3));
    // the nose ring hanging below the muzzle
    const ring = Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return p.pt([Math.cos(a) * 3.4 * 0.577, 3.5 - Math.cos(a) * 3.4 * 0.577, -17.5 + Math.sin(a) * 3.4]); });
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); ring.forEach(([x, yy], i) => (i ? g.lineTo(x, yy) : g.moveTo(x, yy)));
      g.strokeStyle = "#000"; g.lineWidth = 3.4; g.stroke();
      g.strokeStyle = "#fff"; g.lineWidth = 1.7; g.stroke();
    });
    p.pop();
    // the up arrow badge, tight under the right horn's tip
    const b = clamp((h - 0.6) / 0.4);
    if (b > 0) {
      const r = (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)) * 4.4;
      p.push();
      p.rotate("z", -0.7);
      const [x, yy] = p.pt([19, 0, 2]);
      p.pop();
      p.screen((g) => {
        g.beginPath(); g.arc(x, yy, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(x, yy + r * 0.55); g.lineTo(x, yy - r * 0.5); g.moveTo(x - r * 0.42, yy - r * 0.1); g.lineTo(x, yy - r * 0.52); g.lineTo(x + r * 0.42, yy - r * 0.1); g.stroke();
      });
    }
  },
};
