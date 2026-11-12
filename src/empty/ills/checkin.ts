// No check ins yet: a reception desk bell. Its button dips and the bell rings, arcs of sound spreading from both sides, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.6; // seconds per loop
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
// the dome: a squat half ball
const DOME: [number, number][] = Array.from({ length: 10 }, (_, i) => { const a = (i / 9) * 1.44; return [Math.sin(a) * 9.4, Math.cos(a) * 11] as [number, number]; });

export const checkin: Illustration = {
  k: "checkin", name: "Reception bell", title: "No check ins yet", body: "Guests will show here as they arrive and check in.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // one press at the start of the loop, then the ring dies away
    const press = u < 0.06 ? u / 0.06 : u < 0.2 ? 1 - (u - 0.06) / 0.14 : 0;
    const ring = u < 0.04 ? 0 : Math.exp(-2 * (u - 0.04)) * Math.min(1, (1 - u) * 4);
    p.translate(0, 0, -9);
    p.scale(1.12, [0, 0, 6]);
    p.shadow(0, 0, 25, 12, 0.1);
    // the base
    p.cylinder(0, 0, 0, 13, 2, { side: 0.1, top: 0.18, lw: 0.6 });
    p.disc(0, 0, 2.02, 11.3, 0.03, 0);
    // the dome, with a highlight down its shoulder
    lathe(p, DOME, 2);
    for (const s of [-1, 1]) p.line(DOME.map(([z, r]) => [s * r * S, -s * r * S, 2 + z] as V3), SH.edge, 0.6);
    p.line(Array.from({ length: 25 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 24; return [Math.cos(a) * 11, Math.sin(a) * 11, 2.05] as V3; }), SH.edge, 0.6);
    const band = (a: number) => DOME.slice(1, 8).map(([z, r]) => [Math.cos(a) * r, Math.sin(a) * r, 2 + z] as V3);
    p.face([...band(1.25), ...band(1.6).reverse()], 0.28, 0);
    // the button: a stem and a cap that dips when pressed
    const zt = 2 + 9.3, d = 1.7 * press;
    p.cylinder(0, 0, zt, 1.1, 2.8 - d, { side: 0.2, top: 0.2 });
    p.cylinder(0, 0, zt + 2.8 - d, 2.6, 1.3, { side: 0.3, top: 0.36, lw: 0.6 });
    // sound: arcs either side, widening as they fade
    if (ring > 0.04) {
      const [bx, by] = p.pt([0, 0, 8]);
      p.screen((c) => {
        c.lineCap = "round"; c.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          const a = ring * (1 - i * 0.2);
          if (a < 0.06) continue;
          const r = 19 + i * 4.4 + (1 - ring) * 3, n = Math.round(255 * Math.min(1, a * 2.2));
          c.strokeStyle = `rgb(${n},${n},${n})`;
          c.beginPath(); c.arc(bx, by, r, -0.75, 0.05); c.stroke();
          c.beginPath(); c.arc(bx, by, r, Math.PI - 0.05, Math.PI + 0.75); c.stroke();
        }
      });
    }
  },
};
