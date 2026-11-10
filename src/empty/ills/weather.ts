// No forecast yet: a chunky cloud floating over the floor while the sun rises from behind it, peeks out with its rays turning, and sinks back.
import { SH, pulse, type Illustration, type V3 } from "../dots";

const P = 6; // seconds per loop
const DEPTH = 4.6; // how far the cloud runs back
// the cloud's outline in its own plane (facing us), as puffs touching a flat base
const PUFFS: [number, number, number][] = [[-7.5, 3.4, 3.4], [-2.2, 5.6, 5.4], [4.2, 4.4, 4.4], [8, 2.9, 2.9]];
const X0 = -10.9, X1 = 10.9;
function outline(): [number, number][] {
  const out: [number, number][] = [];
  const [lx, lz, lr] = PUFFS[0], [rx, rz, rr] = PUFFS[PUFFS.length - 1];
  // up the left end
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 - (Math.PI / 2) * (i / 6); out.push([lx + Math.cos(a) * lr, lz + Math.sin(a) * lr]); }
  // along the top: the highest puff at each x
  for (let x = X0 + 0.5; x < X1 - 0.4; x += 0.5) {
    let z = 0;
    for (const [cx, cz, r] of PUFFS) if (Math.abs(x - cx) < r) z = Math.max(z, cz + Math.sqrt(r * r - (x - cx) * (x - cx)));
    out.push([x, z]);
  }
  // down the right end
  for (let i = 0; i <= 6; i++) { const a = -(Math.PI / 2) * (i / 6); out.push([rx + Math.cos(a) * rr, rz + Math.sin(a) * rr]); }
  return out;
}
const OUT = outline();

export const weather: Illustration = {
  k: "weather", name: "Weather", title: "No forecast yet", body: "Add a location and its weather will show up here, day by day.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    const rise = pulse(t, P, 0.4); // the sun peeks out and sinks back
    const bob = Math.sin(u * Math.PI * 2) * 0.6;
    // the cloud faces us: E runs right on screen, UP runs up, K runs back (up and right on screen)
    const E: V3 = [Math.SQRT1_2, -Math.SQRT1_2, 0], UP: V3 = [-0.408, -0.408, 0.816], K: V3 = [0, -1, 0];
    const O: V3 = [-1, 1, 7.5 + bob];
    const at = (x: number, z: number, d: number, o: V3 = O): V3 => [o[0] + E[0] * x + UP[0] * z + K[0] * d, o[1] + E[1] * x + UP[1] * z + K[1] * d, o[2] + E[2] * x + UP[2] * z + K[2] * d];
    p.translate(0, 0, -12);
    p.shadow(-1, 1, 27, 9, 0.08);
    // dashed drop lines from the cloud's base to the floor
    for (const x of [-7, 7]) { const b = at(x, 0, 0); p.guide([b, [b[0], b[1], 0]]); }
    // the sun behind: a disc facing us, with rays that turn slowly
    const so = at(5.5, 3.5 + rise * 8.5, DEPTH + 3);
    const disc = (r: number, a: number) => at(Math.cos(a) * r, Math.sin(a) * r, 0, so);
    p.guide(Array.from({ length: 41 }, (_, i) => disc(8.4, (i / 40) * Math.PI * 2)));
    const turn = u * (Math.PI / 4) * 2; // two ray steps per loop
    for (let i = 0; i < 8; i++) {
      const a = turn + (i / 8) * Math.PI * 2, w = 0.09;
      p.face([disc(5.9, a - w), disc(8, a - w * 0.8), disc(8, a + w * 0.8), disc(5.9, a + w)], 0.3, SH.edge, 0.45);
    }
    p.face(Array.from({ length: 40 }, (_, i) => disc(4.4, (i / 40) * Math.PI * 2)), 0.3, SH.edge, 0.6);
    // the cloud: its outline pushed back. Sides grouped by which way they face, then its front
    const side = (i: number) => {
      const [a, b] = [OUT[i], OUT[i + 1]];
      const nx = -(b[1] - a[1]), nz = b[0] - a[0], l = Math.hypot(nx, nz) || 1; // outward, for a clockwise outline
      if (0.866 * nx / l + 0.5 * nz / l <= 0.02) return -1;
      return nz / l > 0.5 ? SH.top : nx / l > 0.5 ? SH.right : 0.12;
    };
    let i = 0;
    while (i < OUT.length - 1) {
      const f = side(i);
      let j = i;
      while (j < OUT.length - 1 && side(j) === f) j++;
      if (f > 0) {
        const run = OUT.slice(i, j + 1);
        p.face([...run.map((q) => at(q[0], q[1], 0)), ...run.slice().reverse().map((q) => at(q[0], q[1], DEPTH))], f, 0);
      }
      i = j;
    }
    p.face(OUT.map((q) => at(q[0], q[1], 0)), 0.13, SH.edge, 0.6);
    // soft seams between the puffs on its face
    for (const [cx, cz, r] of PUFFS.slice(1, 3)) {
      const arc: V3[] = [];
      for (let k = 0; k <= 8; k++) { const a = Math.PI * 1.08 + (Math.PI * 0.4 * k) / 8; arc.push(at(cx + Math.cos(a) * r * 0.85, cz + Math.sin(a) * r * 0.85 + r * 0.2, -0.02)); }
      p.line(arc, SH.edge, 0.6);
    }
  },
};
