// No picks yet: a pair of cherries hanging from their joined stems, a leaf at the top. They swing gently, one a beat behind the other, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop
const CR = 8; // cherry radius
function lathe(p: Pen, prof: [number, number][], z0: number, f: [number, number, number], N = 40) {
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
// a round cherry, a little wider than tall, with a dip at the top where the stem goes in
const BALL: [number, number][] = Array.from({ length: 15 }, (_, i) => {
  const a = -Math.PI / 2 + (Math.PI * i) / 14, r = Math.cos(a) * CR * 1.05;
  return [CR + Math.sin(a) * CR - (i === 14 ? 0.8 : 0), Math.max(0, r)] as [number, number];
});
const S = Math.SQRT1_2;
/** a point in the plane facing us: u to the right on screen, v up */
const fp = (u: number, v: number, w = 0): V3 => [u * S + w * S, -u * S + w * S, v];

export const cherries: Illustration = {
  k: "cherries", name: "Cherries", title: "No picks yet", body: "Pick your favourites and they will be kept here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -20);
    p.shadow(0, 0, 24, 10, 0.1);
    const J = [1, 39]; // where the stems meet, (u, v)
    // each cherry hangs from J on its stem and swings in the plane facing us
    const hang = [{ u: -9, v: 5, lag: 0 }, { u: 9.5, v: 4, lag: 0.7 }].map(({ u, v, lag }) => {
      const sw = 0.16 * Math.sin(ph - lag), du = u - J[0], dv = v - J[1];
      return { u: J[0] + du * Math.cos(sw) - dv * Math.sin(sw), v: J[1] + du * Math.sin(sw) + dv * Math.cos(sw), sw };
    });
    // the stems: bright arcs from the top of each cherry up to J
    for (const [i, c] of hang.entries()) {
      const top = fp(c.u, c.v + CR * 2 - 0.8), mid = fp((c.u + J[0]) / 2 + (i ? 3.5 : -3.5), (c.v + CR * 2 + J[1]) / 2 + 2);
      const q = [top, mid, fp(J[0], J[1])].map((v) => p.pt(v));
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round";
        g.beginPath(); g.moveTo(q[0][0], q[0][1]); g.quadraticCurveTo(q[1][0], q[1][1], q[2][0], q[2][1]); g.stroke();
      });
    }
    // the leaf at the top, fluttering
    const fl = 0.5 + 0.12 * Math.sin(ph * 2);
    const leaf = Array.from({ length: 25 }, (_, i) => {
      const s = i <= 12 ? i / 12 : (24 - i) / 12, side = i <= 12 ? 1 : -1, w = 3.2 * Math.sin(Math.PI * s) * side;
      const L = 13 * s;
      return fp(J[0] + Math.cos(fl) * L - Math.sin(fl) * w, J[1] + Math.sin(fl) * L + Math.cos(fl) * w, 0.5);
    });
    p.face(leaf, 0.3, 0);
    p.line([fp(J[0], J[1], 0.6), fp(J[0] + Math.cos(fl) * 11, J[1] + Math.sin(fl) * 11, 0.6)], 1, 0.6);
    // the cherries
    for (const c of hang) {
      p.push();
      p.translate(...fp(c.u, c.v));
      lathe(p, BALL, 0, [0.3, 0.2, 0.08]);
      p.pop();
    }
  },
};
