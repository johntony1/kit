// No coffee orders: a paper cup to go, with a lid and a sleeve. Steam drifts up from the sip hole and fades, over and over.
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
const R = (z: number) => 5.6 + (2.3 * z) / 17; // the cup's radius at a height
const CUP: [number, number][] = [[0, R(0)], [17, R(17)]];
const SLEEVE: [number, number][] = [[5.4, R(5.4) + 0.5], [12, R(12) + 0.5]];
const LID: [number, number][] = [[0, 8.7], [1.5, 8.7], [1.9, 7.7], [3.3, 7.3]];

/** a stroke drawn flat to the screen, so it stays a bright mark in every style */
function stroke(p: Pen, pts: V3[], shade: number, lw: number) {
  const q = pts.map((v) => p.pt(v)), n = Math.round(255 * Math.max(0, Math.min(1, shade)));
  p.screen((c) => {
    c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

export const coffee: Illustration = {
  k: "coffee", name: "Coffee cup", title: "No coffee orders", body: "Order a coffee ahead and it will be waiting for you here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -16);
    p.scale(1.32, [0, 0, 12]);
    p.shadow(0, 0, 17, 8.5, 0.11);
    lathe(p, CUP, 0); outline(p, CUP, 0);
    p.line(front(R(0), 0), SH.edge, 0.5);
    // the sleeve: a lit band round the middle
    lathe(p, SLEEVE, 0, [0.4, 0.34, 0.2]); outline(p, SLEEVE, 0);
    p.line(front(R(5.4) + 0.5, 5.4), SH.edge, 0.55);
    p.line(front(R(12) + 0.5, 12), SH.edge, 0.55);
    // the lid: a rim, a step in and a flat top with a sip hole
    lathe(p, LID, 17, [0.3, 0.22, 0.1]); outline(p, LID, 17);
    p.line(front(8.7, 17), SH.edge, 0.55);
    p.line(front(8.7, 18.5), SH.edge, 0.55);
    p.disc(0, 0, 20.3, 7.3, 0.24, SH.edge);
    p.disc(2.9, 2.9, 20.32, 1.25, 0.02, 0);
    // steam: three wisps climbing through a fixed wave, fading in and out
    for (let i = 0; i < 3; i++) {
      const u = (ph + i / 3) % 1, o = (i - 1) * 3.2, base = 21.2 + u * 9;
      const q = (z: number): V3 => { const f = Math.sin(z * 0.8 + i * 2.1) * 1.1; return [1 + (o + f) * S, 1 - (o + f) * S, z]; };
      stroke(p, Array.from({ length: 9 }, (_, j) => q(base + j * 0.6)), Math.sin(u * Math.PI) * 0.95, 0.9);
    }
  },
};
