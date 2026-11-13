// No issues found: the accessibility sign on a thick round token standing up, a figure with arms spread inside a ring. Hover and it hops with a little turn; a tick pops in.
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
const T = 4.5, ZC = 16, R = 15.5;

export const accessibility: Illustration = {
  k: "accessibility", name: "Accessibility", title: "No issues found", body: "Every page passed the check. Any accessibility issue we find will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 24, 10, 0.11);
    p.rotate("z", -0.42);
    const k = Math.min(1, h / 0.6);
    const lift = 5 * Math.sin(k * Math.PI);
    p.box(-6, -4, 0, 12, 8, 1.6, { edge: 0 });
    p.push();
    p.translate(0, 0, lift);
    p.rotate("z", 0.35 * Math.sin(k * Math.PI), [0, 0, 0]);
    ext(p, circle(0, ZC, R, T / 2, 48), [0, -T, 0], 0.24);
    const y = T / 2 + 0.03;
    p.line([...circle(0, ZC, R - 2, y, 48), [R - 2, y, ZC]], SH.edge, 0.8);
    // the figure, dark on the lit face: head, arms spread, body, legs apart
    p.face(circle(0, ZC + 7.2, 2.4, y, 20), 0.02, 0);
    const poly = (q: [number, number][]) => p.face(q.map(([x, z]) => [x, y, ZC + z] as V3), 0.02, 0);
    poly([[-9, 3.8], [9, 3.8], [9, 1.6], [2.2, 1.2], [-2.2, 1.2], [-9, 1.6]]); // arms
    poly([[-2.2, 1.6], [2.2, 1.6], [2.2, -2.5], [-2.2, -2.5]]); // body
    poly([[-2.2, -2], [0, -2], [-3.6, -9.5], [-6.2, -8.6]]); // left leg
    poly([[0, -2], [2.2, -2], [6.2, -8.6], [3.6, -9.5]]); // right leg
    p.pop();
    const b = Math.max(0, (h - 0.66) / 0.34);
    if (b > 0) {
      const [x, yy] = p.pt([-R + 2, T / 2, ZC + R + 1]);
      const r = 4.8 * popK(b);
      p.screen((g) => {
        g.beginPath(); g.arc(x, yy, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(x - r * 0.45, yy + r * 0.02); g.lineTo(x - r * 0.1, yy + r * 0.38); g.lineTo(x + r * 0.48, yy - r * 0.32); g.stroke();
      });
    }
  },
};
