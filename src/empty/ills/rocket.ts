// Coming soon: a rocket on its launch pad. Hover and the engine lights, it lifts a little and puffs of exhaust roll out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

/** a surface of revolution around a vertical axis, shaded strip by strip from its normal.
 *  prof: [z, r] from the bottom up. Faces up are lit, faces to the left dense, faces to the right sparse */
function lathe(p: Pen, prof: [number, number][], cx = 0, cy = 0, z0 = 0, N = 28) {
  const strips: { d: number; pts: V3[]; f: number }[] = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const [za, ra] = prof[i], [zb, rb] = prof[i + 1];
    const dz = zb - za, dr = rb - ra, L = Math.hypot(dz, dr) || 1;
    const nr = dz / L, nz = -dr / L;
    for (let j = 0; j < N; j++) {
      const a0 = (j / N) * Math.PI * 2 - 0.01, a1 = ((j + 1) / N) * Math.PI * 2 + 0.01, m = (a0 + a1) / 2;
      const nx = Math.cos(m) * nr, ny = Math.sin(m) * nr;
      if (nx + ny + nz <= 0.02) continue;
      // crisp bands, like a box: lit where it faces up, dense on the left half, sparse on the right
      const f = nz > 0.62 ? 0.26 : ny > nx ? 0.2 : 0.065;
      const P = (a: number, r: number, z: number): V3 => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z0 + z];
      strips.push({ d: cx + Math.cos(m) * (ra + rb) / 2 + cy + Math.sin(m) * (ra + rb) / 2 + z0 + (za + zb) / 2, pts: [P(a0, ra, za), P(a1, ra, za), P(a1, rb, zb), P(a0, rb, zb)], f });
    }
  }
  strips.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.pts, s.f, 0));
}
/** the front half of a ring around the axis (the half facing us), for seams */
const ring = (r: number, z: number, n = 20): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

const R = 3.8; // body radius
const BODY: [number, number][] = [[0, 2.6], [0.6, 3.4], [1.4, R], [15, R], [17.5, 3.55], [20, 2.9], [22.5, 1.9], [24.3, 0.9], [25.2, 0]];

export const rocket: Illustration = {
  k: "rocket", name: "Rocket", title: "Coming soon", body: "We are putting the finishing touches on this. Check back shortly.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15.5);
    p.scale(1.1, [0, 0, 14]);
    p.shadow(0, 0, 20, 10, 0.12);
    // the launch pad: a low slab with a lit top, a grate and two warning stripes on its front
    p.box(-9, -9, 0, 18, 18, 2.6, { top: 0.22, left: 0.13, right: 0.07 });
    for (let i = -2; i <= 2; i++) p.line([[i * 2.6 - 1, 9.05, 0.7], [i * 2.6 + 0.6, 9.05, 2]], SH.edge, 0.7);
    // the flame trench in the middle of the pad
    p.disc(0, 0, 2.62, 7.2, 0.03, SH.edge);
    p.disc(0, 0, 2.63, 2.6, 0, SH.edge);

    // lift: the rocket rises with the hover, trembling a little while the engine runs
    const lift = h * 5.5, shake = h > 0.05 ? Math.sin(t * 47) * 0.12 * h : 0;
    const zb = 4.6 + lift; // the bottom of the nozzle

    // exhaust: a bright flame under the nozzle and soft puffs rolling out over the pad
    if (h > 0.03) {
      const [fx, fy] = p.pt([0, 0, zb]);
      const fl = 3 + lift * 0.7 + Math.sin(t * 31) * 0.5;
      p.screen((c) => {
        c.fillStyle = `rgba(255,255,255,${Math.min(1, h * 1.5)})`; c.strokeStyle = "#000"; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(fx - 2.1, fy); c.quadraticCurveTo(fx - 1.4, fy + fl * 0.7, fx, fy + fl); c.quadraticCurveTo(fx + 1.4, fy + fl * 0.7, fx + 2.1, fy); c.closePath(); c.stroke(); c.fill();
        c.fillStyle = "#000"; c.beginPath(); c.moveTo(fx - 0.8, fy); c.quadraticCurveTo(fx, fy + fl * 0.75, fx + 0.8, fy); c.closePath(); c.fill();
      });
      for (let i = 0; i < 10; i++) {
        const u = (t * 0.55 + i / 10) % 1, a = i * 2.39 + 0.6;
        const r = 3.5 + u * 10;
        const k = Math.min(1, h * 1.4) * Math.sin(Math.PI * Math.min(1, u * 1.1));
        if (k < 0.05) continue;
        const [sx, sy] = p.pt([Math.cos(a) * r, Math.sin(a) * r, 3.4 + u * 2.5]), rr = (1 + u * 1.9) * k;
        p.screen((c) => { c.fillStyle = "#fff"; c.strokeStyle = "#000"; c.lineWidth = 0.7; c.beginPath(); c.arc(sx, sy, rr, 0, Math.PI * 2); c.stroke(); c.fill(); });
      }
    }

    p.push();
    p.translate(shake, -shake, lift);
    // fins behind the body first (pointing back), then the nozzle and body, then the fins in front
    const fin = (dx: number, dy: number, f: number) => {
      const o = (r: number, z: number): V3 => [dx * r, dy * r, 4.6 + z];
      p.face([o(R - 0.4, 11.5), o(R + 2.6, 6.5), o(R + 5.2, 1), o(R + 5.2, -2), o(R + 2.6, -0.2), o(R - 0.4, 1.2)], f, SH.edge, 0.6);
    };
    fin(-1, 0, 0.12); fin(0, -1, 0.12);
    lathe(p, [[0, 1.6], [1.2, 2.3], [2.6, 2.8], [3, 2.4]], 0, 0, zb - 0.4); // nozzle bell
    lathe(p, BODY, 0, 0, 4.6 + 2.6);
    const Z = 4.6 + 2.6;
    // the seam where the nose cone meets the body
    p.line(ring(R + 0.02, Z + 15), SH.edge, 0.7);
    // the porthole, facing us: a dark ring round a lit glass
    const [wx, wy] = p.pt([R * 0.72, R * 0.72, Z + 10.2]);
    p.screen((c) => {
      c.fillStyle = "#000"; c.beginPath(); c.ellipse(wx, wy, 2.55, 2.75, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#e6e6e6"; c.beginPath(); c.ellipse(wx, wy, 1.65, 1.85, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#000"; c.beginPath(); c.ellipse(wx + 0.5, wy - 0.6, 0.45, 0.5, 0, 0, Math.PI * 2); c.fill();
    });
    // fins in front: one to the right (faces +y, lit), one to the left (faces +x)
    fin(1, 0, 0.24); fin(0, 1, 0.1);
    p.pop();
  },
};
