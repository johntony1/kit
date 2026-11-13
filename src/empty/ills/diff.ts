// No changes: a thick page standing up with a big plus over a minus cut into its face. Hover and the plus swells, then the minus; a tick pops in.
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
const T = 3, Y = T / 2 + 0.04;
const W = 14, H = 34, C = 6; // half width, height, folded corner

export const diff: Illustration = {
  k: "diff", name: "Diff", title: "No changes", body: "Edit a file and the lines you added or removed will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 11, 0.11);
    p.rotate("z", -0.42);
    const page: V3[] = [[-W, T / 2, 0], [W, T / 2, 0], [W, T / 2, H - C], [W - C, T / 2, H], [-W, T / 2, H]];
    ext(p, page, [0, -T, 0], 0.22);
    p.line([...page.map(([x, , z]) => [x, Y, z] as V3), [-W, Y, 0]], SH.edge, 0.55);
    // the folded corner
    p.face([[W, Y, H - C], [W - C, Y, H - C], [W - C, Y, H]], 0.09, SH.edge, 0.55);
    // a big plus over a big minus, cut dark into the lit page; on hover each swells in turn
    const hop = (x: number) => (x <= 0 || x >= 1 ? 0 : Math.sin(x * Math.PI));
    const y = Y + 0.02, G = 2.1; // half thickness of a glyph bar
    const bar = (cx: number, cz: number, hw: number, hh: number, k: number) => {
      const s = 1 + 0.22 * k;
      p.face([[cx - hw * s, y, cz - hh * s], [cx + hw * s, y, cz - hh * s], [cx + hw * s, y, cz + hh * s], [cx - hw * s, y, cz + hh * s]], 0.02, 0);
    };
    const k1 = hop(h / 0.5), k2 = hop((h - 0.3) / 0.5);
    bar(0, 22, 8, G, k1);
    bar(0, 22, G, 8, k1);
    bar(0, 7.5, 8, G, k2);
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const [x, yy] = p.pt([-W + 1, T / 2, H + 1]);
      const r = 4.6 * popK(b);
      p.screen((g) => {
        g.beginPath(); g.arc(x, yy, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(x - r * 0.45, yy + r * 0.02); g.lineTo(x - r * 0.1, yy + r * 0.38); g.lineTo(x + r * 0.48, yy - r * 0.32); g.stroke();
      });
    }
  },
};
