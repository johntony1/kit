// No connections open: a wall socket standing up, a round well with two holes and two screws on its plate. Hover and the holes glow and a lightning badge pops in.
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
const T = 4, W = 15, ZC = 16, RC = 4; // thickness, half width, centre height, corner radius

export const socket: Illustration = {
  k: "socket", name: "Socket", title: "No connections open", body: "Open a connection and it will be listed here while it stays live.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 11, 0.11);
    p.rotate("z", -0.42);
    // the plate: a thick rounded square
    const plate: V3[] = [];
    for (const [cx, cz, q] of [[W - RC, ZC + W - RC, 0], [-W + RC, ZC + W - RC, 1], [-W + RC, ZC - W + RC, 2], [W - RC, ZC - W + RC, 3]] as [number, number, number][])
      for (let i = 0; i <= 6; i++) { const a = (q + i / 6) * (Math.PI / 2); plate.push([cx + Math.cos(a) * RC, T / 2, cz + Math.sin(a) * RC]); }
    ext(p, plate, [0, -T, 0], 0.22);
    const y = T / 2 + 0.03;
    p.line([...plate.map(([x, , z]) => [x, y, z] as V3), [plate[0][0], y, plate[0][2]]], SH.edge, 0.55);
    // the round well: a dark ring of wall, then its floor, lit
    const k = ease(Math.min(1, h / 0.55));
    p.face(circle(0, ZC, 10.5, y), 0.05, 0);
    p.face(circle(-0.9, ZC - 0.9, 9.2, y + 0.02), 0.2, 0);
    p.line([...circle(0, ZC, 10.5, y + 0.04), [10.5, y + 0.04, ZC]], SH.edge, 0.7);
    // two holes: dark, then lit from inside on hover
    for (const dx of [-4.6, 4.6]) {
      p.clear(circle(dx - 0.9, ZC - 0.9, 2.7, y + 0.05, 24));
      if (k > 0.02) p.dot([dx - 0.9, y + 0.06, ZC - 0.9], 1.5 * k, 1);
    }
    // two screws on the plate
    for (const z of [ZC + W - 2.4, ZC - W + 2.4]) { p.dot([0, y + 0.05, z], 1.1, 0); }
    // a lightning badge, tight to the top left corner
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const [x, yy] = p.pt([-W + 1, T / 2, ZC + W + 1]);
      const r = 5 * popK(b);
      p.screen((g) => {
        g.beginPath(); g.arc(x, yy, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.beginPath(); g.moveTo(x + r * 0.12, y - r * 0.62 + (yy - y)); g.lineTo(x - r * 0.34, yy + r * 0.08); g.lineTo(x - r * 0.02, yy + r * 0.08); g.lineTo(x - r * 0.14, yy + r * 0.62); g.lineTo(x + r * 0.34, yy - r * 0.1); g.lineTo(x + r * 0.02, yy - r * 0.1); g.closePath();
        g.fillStyle = "#000"; g.fill();
      });
    }
  },
};
