// Cupcake: a cupcake in a pleated paper case with a swirl of frosting. Hover and a cherry drops onto the top with a bounce, and sprinkles twinkle around it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

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
const CASE: [number, number][] = [[0, 6.4], [9, 9.8]];
const FROST: [number, number][] = [[9, 10.6], [10.6, 11.2], [12.2, 10.2], [13, 8.4], [14.4, 8.8], [15.8, 7.6], [16.4, 5.8], [17.6, 6.2], [18.8, 5], [19.4, 3.2], [20.4, 3.5], [21.6, 2.2], [22.6, 0.3]];
// height of the cherry above the frosting: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k < 0.45) return 30 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 4 * 4 * v * (1 - v); }
  if (k < 0.85) { const v = (k - 0.7) / 0.15; return 1.2 * 4 * v * (1 - v); }
  return 0;
}

export const cupcake: Illustration = {
  k: "cupcake", name: "Cupcake", title: "No desserts yet", body: "Add something sweet and it will be waiting for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.scale(1.2, [0, 0, 12]);
    p.shadow(0, 0, 18, 9, 0.11);
    // the paper case, with its pleats as dark cuts
    lathe(p, CASE, 0, [0.3, 0.2, 0.09]); outline(p, CASE, 0);
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI / 4 + ((i + 0.5) / 11) * Math.PI;
      p.line([[Math.cos(a) * 6.4, Math.sin(a) * 6.4, 0.3], [Math.cos(a) * 9.8, Math.sin(a) * 9.8, 9]], SH.edge, 0.5);
    }
    p.line(front(6.4, 0), SH.edge, 0.5);
    // the frosting: a swirl of three tiers, a cut in each groove
    lathe(p, FROST, 0, [0.4, 0.3, 0.15]); outline(p, FROST, 0);
    p.line(front(10.6, 9), SH.edge, 0.6);
    p.line(front(8.4, 13), SH.edge, 0.7);
    p.line(front(5.8, 16.4), SH.edge, 0.7);
    p.line(front(3.2, 19.4), SH.edge, 0.6);
    // the cherry
    const k = Math.min(1, h * 1.35);
    if (k > 0.01) {
      const r = 3.3, [x, y] = p.pt([0, 0, 22.4 + drop(k)]);
      p.screen((c) => {
        c.strokeStyle = "#fff"; c.lineWidth = 0.9; c.lineCap = "round";
        c.beginPath(); c.moveTo(x, y - r * 1.7); c.quadraticCurveTo(x + 1, y - r * 3, x + 4, y - r * 3.5); c.stroke();
        c.beginPath(); c.arc(x, y - r * 0.8, r, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
        c.strokeStyle = "#000"; c.lineWidth = 0.6;
        c.beginPath(); c.arc(x, y - r * 0.8, r * 0.55, Math.PI * 1.05, Math.PI * 1.5); c.stroke();
      });
    }
    // sprinkles twinkle once it has landed
    const e = Math.max(0, (h - 0.7) / 0.3);
    if (e > 0) ([[-11, 9, 20], [10, -11, 23], [-13, -3, 12], [13, 4, 14]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.35 * Math.sin(t * 3.2 + i * 1.9), e));
  },
};
