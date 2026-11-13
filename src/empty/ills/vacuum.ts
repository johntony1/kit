// All tidied up: a canister vacuum seen from the side, a round body on a big wheel, a ribbed hose arcing up to a wand that runs down to the floor head. Hover and it sucks up the last crumbs in front of the head and a sparkle pops.
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
const disc = (cu: number, cv: number, r: number, n = 32): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r]; });
// a thick bar from a to b, as an outline
const bar = (a: P2, b: P2, w: number): P2[] => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), nx = (-dz / l) * w, nz = (dx / l) * w; return [[a[0] + nx, a[1] + nz], [a[0] - nx, a[1] - nz], [b[0] - nx, b[1] - nz], [b[0] + nx, b[1] + nz]]; };

export const vacuum: Illustration = {
  k: "vacuum", name: "Vacuum", title: "All tidied up", body: "Nothing left to clean. New items will appear here when they need attention.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -2);
    p.shadow(-2, 2, 30, 10, 0.12);
    p.rotate("z", -0.62);
    const F = -16; // the floor
    // the body: a round capsule, lit on top, with a dark band and a bright button
    const body: P2[] = [];
    for (let i = 0; i <= 20; i++) { const a = -Math.PI / 2 + (i / 20) * Math.PI; body.push([-4 + Math.cos(a) * 8, F + 9 + Math.sin(a) * 8.5]); }
    for (let i = 0; i <= 20; i++) { const a = Math.PI / 2 + (i / 20) * Math.PI; body.push([-14 + Math.cos(a) * 8, F + 9 + Math.sin(a) * 8.5]); }
    slab(p, body, -5, 5, 0.13, 0.28);
    p.dot([-6, 5.1, F + 13], 1.6, 1); // a bright button on its back
    // the big rear wheel: a dark tyre with a lit hub
    slab(p, disc(-13, F + 6.5, 6.5), 5, 6.4, 0.3, 0.3, 0.1);
    slab(p, disc(-13, F + 6.5, 4.6), 6.4, 6.6, 0.03);
    slab(p, disc(-13, F + 6.5, 2, 20), 6.6, 7.2, 0.3);
    // the wand from the handle grip down to the floor head, and the head on the floor
    const top: P2 = [14, 12], foot: P2 = [21, F + 3];
    slab(p, bar(top, foot, 1.1), -1, 1, 0.26, 0.3);
    slab(p, bar([12.6, 14.6], [15.2, 10], 2), -1.6, 1.6, 0.13, 0.26); // the grip
    slab(p, [[14, F], [28, F], [28, F + 2.6], [26.5, F + 4], [17, F + 4], [14, F + 2]], -5, 5, 0.2, 0.28);
    p.line([[14.5, 5.05, F + 1.2], [27.5, 5.05, F + 1.2]], 1, 0.7);
    // the hose: a fat bright arc from the body's nose up and over into the grip, its ribs cut across it
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const k = i / 24, a: P2 = [3, F + 12], c: P2 = [2, 17], b: P2 = [12.4, 14.8], m = 1 - k;
      pts.push(p.pt([m * m * a[0] + 2 * m * k * c[0] + k * k * b[0], 4, m * m * a[1] + 2 * m * k * c[1] + k * k * b[1]]));
    }
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round";
      g.strokeStyle = "#fff"; g.lineWidth = 3.8; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      g.strokeStyle = "#000"; g.lineWidth = 0.7;
      for (let i = 2; i < pts.length - 1; i += 2) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i + 1], [x, y] = pts[i], dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1;
        g.beginPath(); g.moveTo(x - (dy / l) * 1.8, y + (dx / l) * 1.8); g.lineTo(x + (dy / l) * 1.8, y - (dx / l) * 1.8); g.stroke();
      }
    });
    // crumbs in front of the head: sucked in on hover
    const k = ease(Math.min(1, h * 1.3));
    [[30, 3, 1.1], [32.5, 1, 0.9], [31, -2, 1]].forEach(([u, y, r], i) => {
      const q = Math.min(1, Math.max(0, k * 1.6 - i * 0.25));
      if (q >= 1) return;
      p.dot([u - (u - 27) * q, y * (1 - q), F + 0.8 + Math.sin(q * Math.PI) * 1.5], r * (1 - q * 0.6), 1);
    });
    const b = Math.max(0, (h - 0.65) / 0.35);
    if (b > 0) {
      const r = 3.6 * (b < 0.6 ? ease(b / 0.6) * 1.15 : 1.15 - 0.15 * ease((b - 0.6) / 0.4)) * (1 + Math.sin(t * 4) * 0.05);
      const [x, y] = p.pt([31, 0, F + 6]);
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round"; g.beginPath();
        g.moveTo(x, y - r); g.lineTo(x, y + r); g.moveTo(x - r, y); g.lineTo(x + r, y); g.stroke();
      });
    }
  },
};
