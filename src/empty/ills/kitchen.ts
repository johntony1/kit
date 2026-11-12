// Nothing cooking: a stock pot on the boil. Its lid rattles as puffs of steam escape from under it, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const S = Math.SQRT1_2;
function lathe(p: Pen, prof: [number, number][], z0: number, f: [number, number, number] = [0.26, 0.17, 0.065], N = 48) {
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
const front = (r: number, z: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
function outline(p: Pen, prof: [number, number][], z0: number) {
  for (const s of [-1, 1]) p.line(prof.map(([z, r]) => [s * r * S, -s * r * S, z0 + z] as V3), SH.edge, 0.55);
}
const R = 11.4, H = 10.5;
const LID: [number, number][] = [[0, R + 0.7], [1, R + 0.7], [2.4, 8.6], [3.4, 4.6], [3.8, 0]];

export const kitchen: Illustration = {
  k: "kitchen", name: "Cooking pot", title: "Nothing cooking", body: "Start an order or a recipe and you can watch it come together here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -10);
    p.scale(1.06, [0, 0, 8]);
    p.shadow(0, 0, 27, 13, 0.11);
    // the handles: a loop on either side, in the plane that faces us
    for (const sgn of [-1, 1]) {
      const q = (r: number, z: number): V3 => [sgn * r * S, -sgn * r * S, z];
      p.face([q(R - 0.5, 5.6), q(R + 4.8, 5.6), q(R + 4.8, 8.8), q(R - 0.5, 8.8)], 0.34, SH.edge, 0.6);
    }
    // the pot
    p.cylinder(0, 0, 0, R, H, { side: 0.12, top: 0.04, lw: 0.65 });
    p.line(front(R, H - 1.7), SH.edge, 0.5);
    p.line([[R * Math.cos(1.9), R * Math.sin(1.9), 2], [R * Math.cos(1.9), R * Math.sin(1.9), H - 3.4]], 0.7, 0.8);
    // steam puffing out from under the lid at the front, and a wisp from the far side
    for (let i = 0; i < 4; i++) {
      const u = (ph + i / 4) % 1, side = i % 2 ? 1 : -1;
      p.dot([side * (8 + u * 5) * S + 5 * S, -side * (8 + u * 5) * S + 5 * S, H + 1 + u * 15], 1 + 2 * u, Math.sin(u * Math.PI) * 0.9);
    }
    // the lid: it rattles, lifting at the front three times a loop
    const lift = Math.pow(Math.max(0, Math.sin(ph * Math.PI * 6)), 1.5);
    p.push();
    p.translate(0, 0, 0.5 * lift);
    p.rotate("x", 0.1 * lift, [0, -R, H]);
    p.rotate("y", -0.1 * lift, [-R, 0, H]);
    lathe(p, LID, H, [0.26, 0.19, 0.08]); outline(p, LID, H);
    p.line(front(R + 0.7, H), SH.edge, 0.6);
    p.line(front(R + 0.7, H + 1), SH.edge, 0.55);
    p.cylinder(0, 0, H + 3.8, 1.9, 2, { side: 0.26, top: 0.36, lw: 0.6 });
    p.pop();
  },
};
