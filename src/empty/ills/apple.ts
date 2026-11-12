// Apple: a round apple with a stem and a leaf. Hover and it lifts off the floor and bobs, the leaf flutters and a shine twinkles on its shoulder.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const S = Math.SQRT1_2;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
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
const APPLE: [number, number][] = [[0, 3], [0.5, 6], [2.4, 9.2], [5.6, 11.4], [9.6, 12.2], [13.4, 11.6], [16, 9.6], [17.6, 6.6], [18, 3.6], [17, 1.2]];

export const apple: Illustration = {
  k: "apple", name: "Apple", title: "No fruit in your basket", body: "Add some fresh fruit and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h), lift = 5 * k + h * Math.sin(t * 2.6) * 1.2;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 22 - 4 * k, 11 - 2 * k, 0.12 - 0.03 * k);
    p.translate(0, 0, lift);
    p.scale(1.22);
    lathe(p, APPLE, 0, [0.26, 0.17, 0.09]);
    for (const s of [-1, 1]) p.line(APPLE.slice(0, 9).map(([z, r]) => [s * r * S, -s * r * S, z] as V3), SH.edge, 0.55);
    // the dimple the stem grows from
    p.disc(0, 0, 17.3, 2.2, 0.05, 0);
    // stem and leaf, in a plane that looks at us: u runs right, v runs up
    const f = (u: number, v: number): V3 => [u * S * 0.816, -u * S * 0.816, 17 + v];
    const st = [f(0, 0), f(-0.4, 3.4), f(0.8, 7.4)].map((v) => p.pt(v));
    p.screen((c) => {
      c.strokeStyle = "#fff"; c.lineWidth = 1.7; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); st.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    });
    const wag = 0.62 + h * Math.sin(t * 5) * 0.16, ca = Math.cos(wag), sa = Math.sin(wag);
    const leaf = (w: number) => Array.from({ length: 13 }, (_, i) => { const s = i / 12, b = w * Math.sin(Math.PI * s) * 3; return f(0.2 + ca * 12 * s - sa * b * 1.2, 4.4 + sa * 12 * s + ca * b * 1.2); });
    const edge = [...leaf(1), ...leaf(-0.75).reverse()];
    p.face(edge, 0.4, SH.edge, 0.6);
    p.line(leaf(0.1).slice(1, 11), SH.edge, 0.5);
    // a shine on the left shoulder, and sparkles
    const e = Math.max(0, (h - 0.5) / 0.5);
    if (e > 0) {
      const [sx, sy] = p.pt([-7.4, 7.4, 14.6]), L = 2 + 1.2 * Math.sin(t * 4);
      p.screen((c) => {
        const n = Math.round(255 * e);
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 0.9; c.lineCap = "round";
        c.beginPath(); c.moveTo(sx - L, sy); c.lineTo(sx + L, sy); c.moveTo(sx, sy - L); c.lineTo(sx, sy + L); c.stroke();
      });
      ([[13, -9, 20], [-12, 10, 4]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.35 * Math.sin(t * 3 + i * 2), e));
    }
  },
};
