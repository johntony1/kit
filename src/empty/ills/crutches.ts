// No injuries logged: a pair of crutches leaning on each other in a cross. Hover and they swing upright side by side, ready, and a plus badge pops in between them.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a flat outline pushed back by `off`: the visible walls (toned by where they point), then the face */
function ext(p: Pen, f: V3[], off: V3, front: number, edge = 1) {
  const n = f.length;
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < n; i++) { const a = f[i], b = f[(i + 1) % n]; nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]); }
  if (nx * off[0] + ny * off[1] + nz * off[2] > 0) f = f.slice().reverse();
  const g = f.map(([x, y, z]) => [x + off[0], y + off[1], z + off[2]] as V3);
  const back = g.slice().reverse();
  if (facing(p, back) > 0) p.face(back, front * 0.5, 0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = f[i], b = f[j], q: V3[] = [g[i], g[j], b, a];
    if (facing(p, q) <= 0) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const wx = dz * off[1] - dy * off[2], wy = dx * off[2] - dz * off[0], wz = dy * off[0] - dx * off[1];
    p.face(q, wz / (Math.hypot(wx, wy, wz) || 1) > 0.5 ? 0.22 : wy > wx ? 0.12 : 0.065, 0);
  }
  if (facing(p, f) > 0) p.face(f, front, edge, 0.6);
}
const cl = (x: number) => Math.min(1, Math.max(0, x));
const io = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pop = (x: number) => (x <= 0 ? 0 : x < 0.65 ? (1 - Math.pow(1 - x / 0.65, 3)) * 1.18 : 1.18 - 0.18 * (1 - Math.pow(1 - (x - 0.65) / 0.35, 3)));
const T = 2.6;
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 3): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI * 0.5]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
const bar = (a: P2, b: P2, w: number): P2[] => {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = (-dz / L) * w / 2, nz = (dx / L) * w / 2;
  return [[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]];
};

/** one crutch with its foot at (fx, 0), leaning by `lean`, its face at depth y */
function crutch(p: Pen, fx: number, lean: number, y: number, tone: number) {
  const c = Math.cos(lean), s = Math.sin(lean);
  const put = (pts: P2[]): V3[] => pts.map(([u, v]) => [fx + u * c + v * s, y, -u * s + v * c] as V3);
  const off: V3 = [0, -T, 0];
  ext(p, put(bar([0, 2], [0, 17], 1.8)), off, tone); // the leg
  ext(p, put(bar([-0.4, 16], [-3.2, 25], 1.7)), off, tone); // the two rails
  ext(p, put(bar([0.4, 16], [3.2, 25], 1.7)), off, tone);
  ext(p, put(bar([-3.2, 24.5], [-3.2, 38], 1.7)), off, tone);
  ext(p, put(bar([3.2, 24.5], [3.2, 38], 1.7)), off, tone);
  ext(p, put(rr(-3.6, 25.6, 3.6, 28.2, 1)), off, 0.34); // the grip
  ext(p, put(rr(-1.9, 14.6, 1.9, 17.4, 0.8)), off, tone); // the collar
  ext(p, put(rr(-5.6, 37.4, 5.6, 41.2, 1.8)), off, 0.34); // the pad
  ext(p, put(rr(-1.7, 0, 1.7, 3.2, 0.9)), off, 0.12); // the rubber foot
}

export const crutches: Illustration = {
  k: "crutches", name: "Crutches", title: "No injuries logged", body: "Log an injury and your recovery plan will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = io(cl(h / 0.7)), lean = 0.3 * (1 - k), gap = 7.5 + 0.5 * k;
    p.translate(0, 0, -20.5);
    p.shadow(0, 0, 22, 9, 0.11);
    p.rotate("z", -0.42);
    // the far one leans right, the near one left, so they cross
    crutch(p, -gap, lean, -2, 0.18);
    crutch(p, gap, -lean, 3, 0.26);
    const b = pop(cl((h - 0.7) / 0.3));
    if (b > 0) {
      const [x, y] = p.pt([0, 3, 33]), r = 4.4 * b;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 1.2, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      });
    }
  },
};
