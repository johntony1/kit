// No dishes yet: an empty bowl with a pair of chopsticks resting across its rim. Hover and it fills, noodles curl into view and steam rises.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S = Math.SQRT1_2;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
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
const BOWL: [number, number][] = [[0, 5.4], [1.6, 5.4], [2, 6.8], [3.4, 9.4], [5.4, 11.4], [8, 12.8], [11, 13.4]];

/** a stroke drawn flat to the screen, so it stays a bright mark in every style */
function stroke(p: Pen, pts: V3[], shade: number, lw: number) {
  const q = pts.map((v) => p.pt(v)), n = Math.round(255 * Math.max(0, Math.min(1, shade)));
  p.screen((c) => {
    c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

export const bowl: Illustration = {
  k: "bowl", name: "Bowl", title: "No dishes yet", body: "Add a dish to your menu and it will be served up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(seg(h, 0, 0.6));
    p.translate(0, 0, -9);
    p.scale(1.12, [0, 0, 7]);
    p.shadow(0, 0, 25, 12, 0.1);
    lathe(p, BOWL, 0); outline(p, BOWL, 0);
    p.line(front(5.4, 1.6), 0.6, 0.45);
    // a band round the outside
    p.line(front(12.3, 7), SH.edge, 0.5);
    // the mouth: a lit rim round the inside, dark when empty, lit when full
    const Z = 11;
    p.disc(0, 0, Z, 13.4, 0.3, 0);
    p.disc(0, 0, Z + 0.01, 12.2, 0.1 + 0.16 * k, SH.edge);
    p.line(front(13.4, Z), SH.edge, 0.6);
    // the far inside wall catching light while it is empty
    if (k < 0.95) {
      const arc = (r: number, z: number) => Array.from({ length: 21 }, (_, i) => { const a = Math.PI * 0.8 + (Math.PI * 0.9 * i) / 20; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
      p.face([...arc(12.2, Z + 0.02), ...arc(8.4, Z - 3.4).reverse()], 0.1 + 0.14 * (1 - k), 0);
    }
    // noodles: a few curls on the surface
    if (k > 0.3) for (let i = 0; i < 3; i++) {
      const r = 3 + i * 2.6, a0 = i * 2.1 + 0.4;
      p.line(Array.from({ length: 15 }, (_, j) => { const a = a0 + (j / 14) * 4.2; return [-1 + Math.cos(a) * r, 1 + Math.sin(a) * r * 0.9, Z + 0.03] as V3; }), (k - 0.3) / 0.7, 0.6);
    }
    // the chopsticks, resting across the rim
    stroke(p, [[-6, -16.5, Z + 0.6], [11, 12.5, Z + 0.6]], 1, 1.4);
    stroke(p, [[-2.4, -17.6, Z + 0.6], [13.2, 10.6, Z + 0.6]], 1, 1.4);
    // steam: three wisps rising off the bowl, brightest in the middle of their climb
    const s = seg(h, 0.45, 1);
    if (s > 0) for (let i = 0; i < 3; i++) {
      const o = (i - 1) * 5.2, ph = t * 2.2 + i * 2;
      for (let j = 0; j < 8; j++) {
        const z0 = Z + 3 + j * 1.7, z1 = z0 + 1.75;
        const q = (z: number): V3 => { const f = Math.sin(z * 0.55 - ph) * 1.3; return [(-o + f) * S - 2, (o - f) * S - 2, z]; };
        stroke(p, [q(z0), q((z0 + z1) / 2), q(z1)], s * Math.sin(((j + 0.5) / 8) * Math.PI) * 0.9, 0.9);
      }
    }
  },
};
