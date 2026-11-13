// Nothing to roll back: a thick hook arrow standing up, its head pointing back to the left. Hover and it slides back with a little overshoot; a tick pops in.
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
const T = 4; // thickness

/** the hook arrow in its upright plane: a head pointing left, a shaft running right, curling down and back */
function arrow(): V3[] {
  const pts: [number, number][] = [[-18, 21], [-7, 31], [-7, 25], [5, 25]];
  for (let i = 0; i <= 20; i++) { const a = Math.PI / 2 - (i / 20) * Math.PI; pts.push([5 + Math.cos(a) * 10, 15 + Math.sin(a) * 10]); }
  pts.push([-6, 5], [-6, 11.5], [5, 11.5]);
  for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (i / 14) * Math.PI; pts.push([5 + Math.cos(a) * 3.5, 15 + Math.sin(a) * 3.5]); }
  pts.push([-7, 18.5], [-7, 11]);
  return pts.map(([u, v]) => [u + 1, T / 2, v] as V3);
}

export const rollback: Illustration = {
  k: "rollback", name: "Rollback", title: "Nothing to roll back", body: "Once you have shipped more than one version, you can return to an earlier one from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 28, 11, 0.11);
    p.rotate("z", -0.42);
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const k = back(Math.min(1, h / 0.7));
    // it slides back to the left, past its mark, and settles
    p.translate(-3.5 * k, 3.5 * k, 0);
    const f = arrow();
    ext(p, f, [0, -T, 0], 0.24);
    p.line([...f.map(([x, , z]) => [x, T / 2 + 0.04, z] as V3), [f[0][0], T / 2 + 0.04, f[0][2]]], SH.edge, 0.55);
    const b = Math.max(0, (h - 0.66) / 0.34);
    if (b > 0) {
      const [x, y] = p.pt([13, T / 2, 30]);
      const r = 5 * popK(b);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.48, y - r * 0.32); g.stroke();
      });
    }
  },
};
