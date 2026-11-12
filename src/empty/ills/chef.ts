// No chefs yet: a tall pleated chef hat. Hover and it lifts off the counter and tips, a sparkle twinkling beside it.
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
const BAND: [number, number][] = [[0, 8.2], [7.4, 8.6]];
const PUFF: [number, number][] = [[0, 8.6], [1.2, 10.8], [3.4, 12.6], [6.6, 13.4], [9.6, 12.6], [12, 10.2], [13.6, 6.4], [14.3, 0]];

export const chef: Illustration = {
  k: "chef", name: "Chef hat", title: "No chefs yet", body: "Invite the people who cook with you and they will join the kitchen here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h);
    p.translate(0, 0, -12);
    p.scale(1.04, [0, 0, 11]);
    p.shadow(0, 0, 24 - 5 * k, 12 - 2.5 * k, 0.12 - 0.04 * k);
    const [ax, ay] = p.pt([0, 0, 0]);
    p.screen((c) => {
      // lift, and tip a little in the plane of the screen
      c.translate(ax, ay); c.rotate(0.16 * k + 0.03 * h * Math.sin(t * 2)); c.translate(-ax, -ay);
      p.push();
      p.translate(0, 0, 6.5 * k + 0.6 * h * Math.sin(t * 2.4));
      // the band, pressed with fine pleats
      lathe(p, BAND, 0, [0.3, 0.2, 0.09]); outline(p, BAND, 0);
      p.line(front(8.2, 0), SH.edge, 0.6);
      for (let i = 1; i < 12; i++) { const a = -Math.PI / 4 + (Math.PI * i) / 12; p.line([[Math.cos(a) * 8.25, Math.sin(a) * 8.25, 0.6], [Math.cos(a) * 8.6, Math.sin(a) * 8.6, 6.8]], 0.5, 0.4); }
      // the crown: a wide soft puff, creased from the band up over the top
      lathe(p, PUFF, 7.4); outline(p, PUFF, 7.4);
      p.line(front(8.65, 7.4), SH.edge, 0.65);
      for (let i = 0; i < 7; i++) {
        const a = -0.45 + i * 0.42;
        p.line(PUFF.slice(0, 7).map(([z, r]) => [Math.cos(a) * (r + 0.04), Math.sin(a) * (r + 0.04), 7.4 + z] as V3), i % 2 ? 0.75 : 0.5, 0.5);
      }
      p.pop();
    });
    // a sparkle beside it
    const s = seg(h, 0.6, 1) * (0.8 + 0.2 * Math.sin(t * 4));
    if (s > 0.02) {
      const [x, y] = p.pt([13 * S + 6, -13 * S - 6, 30]);
      p.screen((c) => {
        const Lg = 4.2 * s, w = 0.85 * s;
        c.fillStyle = "#fff"; c.beginPath();
        c.moveTo(x, y - Lg); c.lineTo(x + w, y - w); c.lineTo(x + Lg, y); c.lineTo(x + w, y + w); c.lineTo(x, y + Lg); c.lineTo(x - w, y + w); c.lineTo(x - Lg, y); c.lineTo(x - w, y - w); c.closePath(); c.fill();
      });
    }
  },
};
