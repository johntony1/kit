// Noodle bowl: a deep bowl of noodles with half an egg, and a pair of chopsticks lifting a tangle of noodles out of it. The chopsticks rise and dip, the noodles stretching and swaying.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop
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
/** a stroke drawn flat to the screen, so it stays a bright mark in every style */
function stroke(p: Pen, pts: V3[], shade: number, lw: number) {
  const q = pts.map((v) => p.pt(v)), n = Math.round(255 * Math.max(0, Math.min(1, shade)));
  p.screen((c) => {
    c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}
const BOWL: [number, number][] = [[0, 5.6], [1.8, 5.6], [2.2, 7], [4, 10], [7, 12.2], [10.5, 13]];
const Z = 10.5;

export const noodles: Illustration = {
  k: "noodles", name: "Noodle bowl", title: "No meals ordered", body: "Order a meal and you can follow it here until it reaches you.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, w = ph * Math.PI * 2, lift = 11 + 3.5 * Math.sin(w);
    p.translate(0, 0, -15);
    p.scale(1.08);
    p.shadow(0, 0, 24, 12, 0.11);
    lathe(p, BOWL, 0); outline(p, BOWL, 0);
    p.line(front(5.6, 1.8), 0.6, 0.45);
    p.line(front(12.4, 7.6), SH.edge, 0.5);
    p.line(front(12.7, 8.8), SH.edge, 0.5);
    // the mouth: a lit rim, then the noodles filling it
    p.disc(0, 0, Z, 13, 0.32, 0);
    p.disc(0, 0, Z + 0.01, 11.8, 0.22, SH.edge);
    p.line(front(13, Z), SH.edge, 0.6);
    for (let i = 0; i < 4; i++) {
      const r = 2.6 + i * 2.3, a0 = i * 2.1 + 0.4;
      p.line(Array.from({ length: 17 }, (_, j) => { const a = a0 + (j / 16) * 4.4; return [Math.cos(a) * r, Math.sin(a) * r * 0.92, Z + 0.03] as V3; }), SH.edge, 0.6);
    }
    // half an egg, floating at the back
    p.disc(-5.4, -5.4, Z + 0.04, 3.4, 0.45, SH.edge);
    p.disc(-5.4, -5.4, Z + 0.06, 1.5, 0.08, 0);
    // the noodles in the air: strands from the bowl up to the chopsticks, swaying
    const tipz = Z + lift;
    for (let i = 0; i < 5; i++) {
      const o = (i - 2) * 1.5;
      stroke(p, Array.from({ length: 11 }, (_, j) => {
        const s = j / 10, sway = Math.sin(s * Math.PI) * (Math.sin(w + i * 1.3) * 1 + Math.sin(s * 7 + i * 2) * 0.7);
        const u = o * (1.5 - 0.9 * s) + sway;
        return [1 + u * S, 1 - u * S, Z + 0.4 + (tipz - Z - 0.2) * s] as V3;
      }), 1, 1.15);
    }
    // the chopsticks, pinching the top of the tangle
    stroke(p, [[4.4, -1.6, tipz - 1.4], [-9.4, -15.6, tipz + 8.6]], 1, 1.7);
    stroke(p, [[4.4, -2.4, tipz + 0.8], [0.6, -19.4, tipz + 13.4]], 1, 1.7);
  },
};
