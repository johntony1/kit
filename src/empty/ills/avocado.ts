// No produce yet: half an avocado lying cut side up, its big round pit in the broad end. Hover and the pit hops out of its hollow, bounces back in and catches the light.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
function lathe(p: Pen, prof: [number, number][], z0: number, f: [number, number, number] = [0.26, 0.17, 0.065], N = 40) {
  const strips: { d: number; pts: V3[]; f: number }[] = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const [zs, rs] = prof[i], [ze, re] = prof[i + 1];
    const L = Math.hypot(ze - zs, re - rs) || 1, nr = (ze - zs) / L, nz = -(re - rs) / L, M = Math.max(1, Math.ceil(L / 1.3));
    for (let m = 0; m < M; m++) {
      const za = zs + ((ze - zs) * m) / M, zb = zs + ((ze - zs) * (m + 1)) / M, ra = rs + ((re - rs) * m) / M, rb = rs + ((re - rs) * (m + 1)) / M;
      for (let j = 0; j < N; j++) {
        const a0 = (j / N) * Math.PI * 2 - 0.01, a1 = ((j + 1) / N) * Math.PI * 2 + 0.01, c = (a0 + a1) / 2;
        const nx = Math.cos(c) * nr, ny = Math.sin(c) * nr;
        if (nx + ny + nz <= 0.02) continue;
        const q = (a: number, r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z0 + z];
        strips.push({ d: ((Math.cos(c) + Math.sin(c)) * (ra + rb)) / 2 + (za + zb) / 2, pts: [q(a0, ra, za), q(a1, ra, za), q(a1, rb, zb), q(a0, rb, zb)], f: nz > 0.6 ? f[0] : ny > nx ? f[1] : f[2] });
      }
    }
  }
  strips.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.pts, s.f, 0));
}
// the pear outline: the hull of a big circle (the broad end) and a small one (the neck)
function pear(k: number): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    pts.push([Math.cos(a) * 11 * k, 5 + Math.sin(a) * 11 * k], [Math.cos(a) * 6.6 * k, -9.5 + Math.sin(a) * 6.6 * k]);
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P2[] = [], hi: P2[] = [];
  for (const q of pts) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of pts.slice().reverse()) { while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
}
// the pit's height: one big hop, two small bounces, then rest
function hop(k: number) {
  if (k <= 0 || k >= 0.85) return 0;
  if (k < 0.45) { const v = k / 0.45; return 12 * 4 * v * (1 - v); }
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 2.6 * 4 * v * (1 - v); }
  const v = (k - 0.7) / 0.15; return 0.8 * 4 * v * (1 - v);
}
const OUT = pear(1), MID = pear(0.92), IN = pear(0.7), PIT: [number, number][] = [[0, 0], [0.4, 3.4], [1.6, 4.6], [3.4, 5.2], [5.2, 4.9], [6.8, 3.9], [7.8, 2.2], [8.2, 0]];

export const avocado: Illustration = {
  k: "avocado", name: "Avocado", title: "No produce yet", body: "Add fresh produce and it will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(seg(h, 0, 0.85)), up = hop(seg(h, 0, 0.85));
    p.translate(1, 0, -4);
    p.scale(1.15);
    p.shadow(0, 0, 26, 13, 0.1);
    p.rotate("z", -0.95);
    p.rotate("y", 0.32);
    p.rotate("x", -0.2);
    const Z = 5;
    // the skin: the walls round the outline, dark
    for (let i = 0; i < OUT.length; i++) {
      const a = OUT[i], b = OUT[(i + 1) % OUT.length];
      p.face([[a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], Z], [a[0], a[1], Z]], 0.05, 0);
    }
    // the cut face: a pale rim by the skin, the flesh inside it
    p.face(OUT.map(([x, y]) => [x, y, Z] as V3), 0.05, 0);
    p.face(MID.map(([x, y]) => [x, y + 0.3, Z + 0.02] as V3), 0.32, 0);
    p.face(IN.map(([x, y]) => [x, y + 1.4, Z + 0.03] as V3), 0.085, 0);
    // the hollow the pit sits in, and the pit
    p.disc(0, 5.6, Z + 0.04, 6.6, 0.02, 0);
    p.push();
    p.translate(0, 5.6, Z - 3.4 + up);
    p.rotate("z", 1.2 * k);
    lathe(p, PIT, 0, [0.34, 0.24, 0.1]);
    p.pop();
    // once it lands, a glint on the pit
    const g = seg(h, 0.8, 1);
    if (g > 0) {
      const [sx, sy] = p.pt([-1.4, 4.2, Z + 6.4]), L = (2.2 + 0.8 * Math.sin(t * 4)) * g;
      p.screen((c) => {
        c.strokeStyle = "#000"; c.lineWidth = 1; c.lineCap = "round";
        c.beginPath(); c.moveTo(sx - L, sy); c.lineTo(sx + L, sy); c.moveTo(sx, sy - L); c.lineTo(sx, sy + L); c.stroke();
      });
    }
  },
};
