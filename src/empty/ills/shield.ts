// Security check failed: a shield with an exclamation mark cut through it. A scan line sweeps down it, then the shield shakes and its mark flashes.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const PERIOD = 3.8;
const D = 1.8; // half thickness (the face looks toward +y)

// the outline, counter clockwise in the x z plane: a point at the bottom, curved sides, a dipped top
const bez = (a: P2, b: P2, c: P2, n: number): P2[] => Array.from({ length: n }, (_, i) => {
  const s = i / n, k = 1 - s;
  return [k * k * a[0] + 2 * k * s * b[0] + s * s * c[0], k * k * a[1] + 2 * k * s * b[1] + s * s * c[1]];
});
const RIGHT: P2[] = [...bez([0, 0], [10, 4], [10.8, 14], 12), [10.8, 14], [10.8, 24]];
const TOP: P2[] = Array.from({ length: 9 }, (_, i) => { const x = 10.8 - (i / 8) * 21.6; return [x, 24 - 1.6 * Math.cos((x / 10.8) * Math.PI / 2)] as P2; });
const OUT: P2[] = [...RIGHT, ...TOP.slice(1, -1), ...RIGHT.slice().reverse().map(([x, z]) => [-x, z] as P2).slice(0, -1)];
const CEN: P2 = [0, 13.5];
const INNER: P2[] = OUT.map(([x, z]) => [CEN[0] + (x - CEN[0]) * 0.78, CEN[1] + (z - CEN[1]) * 0.8]);

/** half width of the shield at height z */
const half = (z: number) => {
  for (let i = 0; i < RIGHT.length - 1; i++) {
    const a = RIGHT[i], b = RIGHT[i + 1];
    if (z >= a[1] && z <= b[1]) return a[0] + ((z - a[1]) / (b[1] - a[1] || 1)) * (b[0] - a[0]);
  }
  return z > 0 ? 10.8 : 0;
};

const wind = (p: Pen, f: V3[]) => {
  const q = f.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return s;
};

export const shield: Illustration = {
  k: "shield", name: "Shield", title: "Security check failed", body: "We could not verify this request. Sign in again or contact your admin.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    const bob = Math.sin(u * Math.PI * 2) * 0.7;
    // the scan: down the face, then it fades
    const scan = u < 0.46 ? easeInOut(u / 0.46) : 1;
    const beam = u < 0.04 ? u / 0.04 : u < 0.46 ? 1 : u < 0.52 ? 1 - (u - 0.46) / 0.06 : 0;
    const bz = 25.5 - scan * 25;
    // the failure: a shake and two flashes of the mark
    const fail = u > 0.52 && u < 0.78 ? Math.sin(((u - 0.52) / 0.26) * Math.PI) : 0;
    const flash = u > 0.53 && u < 0.78 && Math.sin(((u - 0.53) / 0.25) * Math.PI * 4) > 0;

    p.translate(0, 0, -14);
    p.rotate("z", -0.55); // face us a little more
    p.shadow(0, 0, 13 - bob, 6, 0.12);
    p.translate(0, 0, 3.5 + bob);
    p.rotate("y", fail * 0.07 * Math.sin(u * 160), [0, 0, 12]);

    // the walls, the ones that face us
    for (let i = 0; i < OUT.length; i++) {
      const a = OUT[i], b = OUT[(i + 1) % OUT.length];
      const f: V3[] = [[a[0], -D, a[1]], [b[0], -D, b[1]], [b[0], D, b[1]], [a[0], D, a[1]]];
      if (wind(p, f) > -0.01) continue;
      const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
      p.face(f, -dx / L > 0.5 ? 0.2 : dz / L > 0.3 ? SH.right : 0.1, 0);
    }
    // the face: a rim and a raised lit panel, a seam between them
    const fy = D;
    p.face(OUT.map(([x, z]) => [x, fy, z] as V3), 0.13, 0);
    p.face(INNER.map(([x, z]) => [x, fy + 0.02, z] as V3), flash ? 0.05 : 0.24, 0);
    p.line([...INNER, INNER[0]].map(([x, z]) => [x, fy + 0.04, z] as V3), SH.edge, 0.6);
    // the exclamation mark, cut right through (or lit while it flashes)
    const bar: V3[] = [[-1.5, fy + 0.06, 19.6], [1.5, fy + 0.06, 19.6], [1, fy + 0.06, 10.6], [-1, fy + 0.06, 10.6]];
    const dot: V3[] = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [Math.cos(a) * 1.45, fy + 0.06, 7.3 + Math.sin(a) * 1.45] as V3; });
    if (flash) { p.face(bar, 0.3, 0); p.face(dot, 0.3, 0); } else { p.clear(bar); p.clear(dot); }

    // the scan line: a cut across the face, bright where it runs past the edges
    if (beam > 0.02 && bz > 0.4) {
      const w = half(bz);
      p.line([[-w + 0.4, fy + 0.08, bz], [w - 0.4, fy + 0.08, bz]], SH.edge, 0.8);
      const n = Math.round(255 * beam);
      const segs: [V3, V3][] = [[[-17, fy, bz], [-w - 1.2, fy, bz]], [[w + 1.2, fy, bz], [17, fy, bz]]];
      p.screen((c) => {
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.1; c.lineCap = "round";
        for (const [a, b] of segs) { const [ax, ay] = p.pt(a), [bx, by] = p.pt(b); c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
      });
    }
  },
};
