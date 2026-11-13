// No releases yet: a thick version tag standing up, a hole at its point and 1.0 on its face. Hover and the tag lifts and swings on its point; a star pops in.
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
const T = 3.4, Y = T / 2;
// the tag: a point on the left, a long body to the right
const TAG: [number, number][] = [[-21, 15], [-11, 26], [19, 26], [19, 4], [-11, 4]];

export const release: Illustration = {
  k: "release", name: "Release", title: "No releases yet", body: "Publish your first release and its notes and downloads will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 30, 12, 0.11);
    p.rotate("z", -0.42);
    // lift, then swing about the point while hovered
    const k = ease(Math.min(1, h / 0.6));
    const sw = k * (0.13 + 0.05 * Math.sin(t * 2.6));
    p.push();
    p.translate(0, 0, 3 * k);
    p.rotate("y", sw, [-11, 0, 15]);
    ext(p, TAG.map(([x, z]) => [x, Y, z] as V3), [0, -T, 0], 0.22);
    const f = Y + 0.04;
    p.line([...TAG.map(([x, z]) => [x, f, z] as V3), [TAG[0][0], f, TAG[0][1]]], SH.edge, 0.6);
    // the hole: a dark eyelet with a bright rim
    p.ringV("y", [-12.5, f, 15], 3.1, 0.34, 0);
    p.ringV("y", [-12.5, f + 0.02, 15], 1.9, 0, 0);
    p.clear(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [-12.5 + Math.cos(a) * 1.9, f + 0.03, 15 + Math.sin(a) * 1.9] as V3; }));
    // 1.0 cut into the face
    const lw = 1.25;
    p.line([[-2.5, f, 18.5], [0, f, 21], [0, f, 9]], SH.edge, lw);
    p.dot([4, f, 9.6], 1.05, 0);
    const o: V3[] = Array.from({ length: 29 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [11 + Math.cos(a) * 3.2, f, 15 + Math.sin(a) * 5.6] as V3; });
    p.line(o, SH.edge, lw);
    p.pop();
    // a star pops in above the tag
    const b = Math.max(0, (h - 0.62) / 0.38);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const [x, y] = p.pt([16, Y, 31]);
      const r = 4.8 * pop;
      p.screen((g) => {
        g.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        g.closePath(); g.fillStyle = "#fff"; g.fill();
      });
    }
  },
};
