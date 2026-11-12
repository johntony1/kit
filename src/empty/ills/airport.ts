// No departures: an airport control tower with a glazed cab. The radar on its roof turns round and round while the beacon blinks.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const S = Math.SQRT1_2;

/** a surface of revolution in crisp bands: up lit, left dense, right sparse */
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
/** the half of a ring that faces us */
const front = (r: number, z: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
/** both silhouette lines of a profile */
function outline(p: Pen, prof: [number, number][], z0: number) {
  for (const s of [-1, 1]) p.line(prof.map(([z, r]) => [s * r * S, -s * r * S, z0 + z] as V3), SH.edge, 0.55);
}

export const airport: Illustration = {
  k: "airport", name: "Control tower", title: "No departures", body: "There are no flights leaving in this window. Pick another date to see the board.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -20);
    p.scale(0.96, [0, 0, 20]);
    p.shadow(0, 0, 20, 10, 0.1);
    p.cylinder(0, 0, 0, 8, 1.8, { side: 0.1, top: 0.2 });
    // the shaft, tapering up, with a slit window
    const SHAFT: [number, number][] = [[0, 5.4], [19, 3.6]];
    lathe(p, SHAFT, 1.8); outline(p, SHAFT, 1.8);
    p.line([[3.5, 3.5, 6], [3, 3, 15]], SH.edge, 0.7);
    // the collar under the cab
    const COLLAR: [number, number][] = [[0, 3.6], [2, 7], [3.2, 7]];
    lathe(p, COLLAR, 20.8); outline(p, COLLAR, 20.8);
    // the cab: a ring of lit glass leaning outward, with dark mullions
    const GLASS: [number, number][] = [[0, 7], [6.4, 9.4]];
    lathe(p, GLASS, 24, [0.36, 0.36, 0.3]); outline(p, GLASS, 24);
    for (let i = 1; i < 8; i++) { const a = -Math.PI / 4 + (Math.PI * i) / 8; p.line([[Math.cos(a) * 7.03, Math.sin(a) * 7.03, 24], [Math.cos(a) * 9.43, Math.sin(a) * 9.43, 30.4]], 0.02, 0.6); }
    p.line(front(7, 24), SH.edge, 0.6);
    // the roof
    p.cylinder(0, 0, 30.4, 10, 1.3, { side: 0.07, top: 0.11, lw: 0.6 });
    p.cylinder(0, 0, 31.7, 1, 2.6, { side: 0.2, top: 0.3 });
    // the radar: a bar turning about the mast (half a turn per loop looks the same as a whole one)
    p.push();
    p.rotate("z", u * Math.PI + 0.4);
    p.face([[-6, 0, 34.3], [6, 0, 34.3], [6, 0, 37.4], [-6, 0, 37.4]], 0.32, SH.edge, 0.7);
    p.line([[-6, 0, 35.85], [6, 0, 35.85]], 0.02, 0.4);
    p.pop();
    // the beacon blinks twice a loop
    const b = Math.pow(Math.max(0, Math.sin(u * Math.PI * 4)), 2);
    p.line([[0, 0, 37.4], [0, 0, 39.8]], SH.edge, 0.6);
    p.dot([0, 0, 40.4], 0.9 + 0.7 * b, 0.35 + 0.65 * b);
  },
};
