// No time zone set: a desk globe on its stand with a small round clock pinned in front of it. The globe turns while the clock's minute hand sweeps round.
import { SH, type Illustration, type V3 } from "../dots";

const P = 4, R = 20, ZC = 30; // seconds per loop, globe radius, height of its centre
const TILT = 0.41, PITCH = 0.32; // the globe's axial tilt, and how far we look down on it
const S3 = 1 / 1.732;
// a point in the plane that faces the viewer: x across the screen, z up, d toward the viewer
const S = (x: number, z: number, d = 0): V3 => [x * S3 + d, -x * S3 + d, z];

// a point on the globe at latitude la, longitude lo: returns the screen plane point and whether it faces us
function globe(la: number, lo: number): [number, number, boolean] {
  let x = R * Math.cos(la) * Math.sin(lo), y = R * Math.cos(la) * Math.cos(lo), z = R * Math.sin(la);
  // look down a little, then lean the axis
  [y, z] = [y * Math.cos(PITCH) - z * Math.sin(PITCH), y * Math.sin(PITCH) + z * Math.cos(PITCH)];
  [x, z] = [x * Math.cos(TILT) - z * Math.sin(TILT), x * Math.sin(TILT) + z * Math.cos(TILT)];
  return [x, z, y > 0];
}

export const timezone: Illustration = {
  k: "timezone", name: "Time zone", title: "No time zone set", body: "Choose your time zone so times and reminders show at the right hour.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -26);
    p.shadow(0, 0, 22, 11, 0.12);
    // the base and the neck
    p.cylinder(0, 0, 0, 8, 2.6, { side: 0.12, top: 0.22, edge: 0 });
    p.cylinder(0, 0, 2.6, 1.6, 6, { side: 0.12, top: 0.22, edge: 0 });
    const circ = (r: number, cx: number, cz: number, d = 0) => Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return S(cx + Math.cos(a) * r, cz + Math.sin(a) * r, d); });
    // the half ring of the stand behind the globe, then the globe: lit, with a shaded crescent on its right
    const arcPts = (r: number, a0: number, a1: number) => Array.from({ length: 25 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 24; return S(Math.cos(a) * r, ZC + Math.sin(a) * r); });
    const a0 = -Math.PI / 2 + TILT - 0.25, a1 = Math.PI / 2 + TILT + 0.25;
    p.face([...arcPts(R + 3.4, a0, a1), ...arcPts(R + 1.4, a1, a0)], 0.22, 0);
    p.face(circ(R, 0, ZC), 0.22, 0);
    p.face([...Array.from({ length: 25 }, (_, i) => { const a = -Math.PI / 2 + (i / 24) * Math.PI; return S(Math.cos(a) * R, ZC + Math.sin(a) * R, 0.02); }),
      ...Array.from({ length: 25 }, (_, i) => { const a = Math.PI / 2 - (i / 24) * Math.PI; return S(Math.cos(a) * R * 0.45 + R * 0.12, ZC + Math.sin(a) * R, 0.02); })], 0.09, 0);
    // meridians that slide round as it turns, and three parallels: dark cuts
    const cut = (pts: [number, number, boolean][], lw: number) => {
      let run: V3[] = [];
      const flush = () => { if (run.length > 1) p.line(run, SH.edge, lw); run = []; };
      for (const [x, z, vis] of pts) { if (vis) run.push(S(x, ZC + z, 0.05)); else flush(); }
      flush();
    };
    for (let k = 0; k < 6; k++) {
      const lo = ((k + u) / 6) * Math.PI * 2;
      cut(Array.from({ length: 25 }, (_, i) => globe(-Math.PI / 2 + (i / 24) * Math.PI, lo)), 0.75);
    }
    for (const la of [-0.6, 0, 0.6]) cut(Array.from({ length: 49 }, (_, i) => globe(la, (i / 48) * Math.PI * 2)), la === 0 ? 0.95 : 0.75);
    // the pins of the stand at the poles
    const [nx, nz] = globe(Math.PI / 2, 0), [sx, sz] = globe(-Math.PI / 2, 0);
    p.dot(S(nx * 1.12, ZC + nz * 1.12, 0.1), 1.4, 0.3);
    p.dot(S(sx * 1.12, ZC + sz * 1.12, 0.1), 1.4, 0.3);
    // the clock pinned in front, lower left: a dark rim, a bright face, four marks and two hands
    const cx = -R * 0.7, cz = ZC - R * 0.62, cr = 9.5, d = 0.2;
    p.face(circ(cr + 2.6, cx, cz, d), 0.02, 0);
    p.face(circ(cr, cx, cz, d + 0.02), 0.45, 0);
    const cp = (a: number, r: number) => S(cx + Math.cos(a) * r, cz + Math.sin(a) * r, d + 0.05);
    for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2; p.line([cp(a, cr - 0.8), cp(a, cr - 2.4)], SH.edge, 1.1); }
    const ha = Math.PI / 2 + (Math.PI / 6) * 2, ma = Math.PI / 2 - u * Math.PI * 2;
    p.line([cp(0, 0), cp(ha, cr * 0.48)], SH.edge, 1.6);
    p.line([cp(0, 0), cp(ma, cr * 0.75)], SH.edge, 1.2);
    p.dot(cp(0, 0), 1.2, 0);
  },
};
