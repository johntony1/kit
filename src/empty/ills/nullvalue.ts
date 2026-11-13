// Nothing returned: the null sign, a thick ring with a bar slashed through it, standing up. It rocks from side to side like a coin settling, and a glint runs along the bar.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a flat outline pushed back by `off`: the visible walls, toned by where they point, then the face */
function ext(p: Pen, f: V3[], off: V3, front: number) {
  const n = f.length;
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < n; i++) { const a = f[i], b = f[(i + 1) % n]; nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]); }
  if (nx * off[0] + ny * off[1] + nz * off[2] > 0) f = f.slice().reverse();
  const g = f.map(([x, y, z]) => [x + off[0], y + off[1], z + off[2]] as V3);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = f[i], b = f[j], q: V3[] = [g[i], g[j], b, a];
    if (facing(p, q) <= 0) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const wx = dz * off[1] - dy * off[2], wy = dx * off[2] - dz * off[0], wz = dy * off[0] - dx * off[1];
    p.face(q, wz / (Math.hypot(wx, wy, wz) || 1) > 0.5 ? 0.2 : wy > wx ? 0.12 : 0.065, 0);
  }
  if (facing(p, f) > 0) p.face(f, front, 0);
}
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const popK = (b: number) => (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
/** a circle in the upright plane y, centred on (cx, cz) */
const circle = (cx: number, cz: number, r: number, y: number, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });
const P = 3.2; // seconds per loop
const T = 4.5, ZC = 15, R1 = 14, R0 = 8.5; // thickness, centre height, outer and inner radius

/** a ring as one outline: the outer circle, then the inner one the other way round, joined at the right */
const ringShape = (y: number): V3[] => {
  const n = 40, o: V3[] = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; o.push([Math.cos(a) * R1, y, ZC + Math.sin(a) * R1]); }
  for (let i = n; i >= 0; i--) { const a = (i / n) * Math.PI * 2; o.push([Math.cos(a) * R0, y, ZC + Math.sin(a) * R0]); }
  return o;
};

export const nullvalue: Illustration = {
  k: "nullvalue", name: "Null", title: "Nothing returned", body: "Run the query again or change its inputs. Any result it returns will show here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 24, 10, 0.11);
    p.rotate("z", -0.42);
    // rocks on its bottom point, swinging less each way, then still
    const rock = 0.2 * Math.sin(u * Math.PI * 4) * Math.pow(1 - u, 1.5) * Math.min(1, u * 8);
    p.rotate("y", rock, [0, 0, ZC - R1]);
    const y = T / 2;
    ext(p, ringShape(y), [0, -T, 0], 0.24);
    // seal the join, and the inner wall seen through the hole
    p.line([...circle(0, ZC, R1, y + 0.03), [R1, y + 0.03, ZC]], SH.edge, 0.6);
    p.line([...circle(0, ZC, R0, y + 0.03), [R0, y + 0.03, ZC]], SH.edge, 0.6);
    // the slash: a bar from the lower left to the upper right, standing proud
    const a = Math.PI / 4, c = Math.cos(a), s = Math.sin(a), L = R1 + 4, w = 2.6;
    const bar: V3[] = [[-L * c + w * s, y + 1.4, ZC - L * s - w * c], [L * c + w * s, y + 1.4, ZC + L * s - w * c], [L * c - w * s, y + 1.4, ZC + L * s + w * c], [-L * c - w * s, y + 1.4, ZC - L * s + w * c]];
    ext(p, bar, [0, -T - 2.8, 0], 0.3);
    p.line([...bar.map(([x, yy, z]) => [x, yy + 0.03, z] as V3), [bar[0][0], bar[0][1] + 0.03, bar[0][2]]], SH.edge, 0.6);
    // a glint running up the bar
    const g = ((u * 1.6) % 1.6) - 0.3;
    if (g > -0.2 && g < 1.2) {
      const d = -L + 2 * L * Math.min(1, Math.max(0, g));
      p.dot([d * c, y + 1.5, ZC + d * s], 1.3, 0.02);
    }
  },
};
