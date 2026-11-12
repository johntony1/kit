// No backups yet: a single drive with a restore mark on its lid. Hover and two copies lift out of it, one after the other, into a stack, and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const X = 12.5, Y = 8.5, H = 6.4, STEP = 9.4; // the drive: half width, half depth, height; the gap between copies

function badge(p: Pen, at: V3, r: number) {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.36); g.lineTo(x + r * 0.48, y - r * 0.34); g.stroke();
  });
}

function drive(p: Pen, z: number, mark: boolean) {
  p.box(-X, -Y, z, X * 2, Y * 2, H, { top: 0.21, left: 0.12, right: 0.065, lw: 0.6 });
  const fy = Y + 0.03;
  p.line([[-X + 2, fy, z + 2.2], [X - 7, fy, z + 2.2]], SH.edge, 0.6);
  p.dot([X - 3, fy, z + 3.2], 0.9, 1);
  for (const dy of [-4, -1.5, 1, 3.5]) p.line([[X + 0.03, dy, z + 1.6], [X + 0.03, dy, z + H - 1.6]], 0.6, 0.45);
  if (!mark) return;
  // the restore mark: an arrow going round, and two clock hands
  const zt = z + H + 0.03, r = 4.6;
  const arc: V3[] = Array.from({ length: 24 }, (_, i) => { const a = 0.5 + (i / 23) * 5.1; return [Math.cos(a) * r, Math.sin(a) * r, zt] as V3; });
  p.line(arc, SH.edge, 0.9);
  const [ex, ey] = [Math.cos(0.5) * r, Math.sin(0.5) * r];
  p.line([[ex - 2.6, ey + 0.4, zt], [ex, ey, zt], [ex + 1.1, ey + 2.5, zt]], SH.edge, 0.9);
  p.line([[0, -2.6, zt], [0, 0, zt], [-1.9, 0, zt]], SH.edge, 0.8);
}

export const backup: Illustration = {
  k: "backup", name: "Backups", title: "No backups yet", body: "Take a backup, or set a schedule, and each copy will be kept here ready to restore.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k1 = ease(cl(h / 0.48)), k2 = ease(cl((h - 0.3) / 0.48));
    p.translate(0, 0, -5 - 6 * ease(h));
    p.shadow(0, 0, 27, 13.5, 0.12);
    p.rotate("z", -0.3);
    drive(p, 0, k1 < 0.05);
    if (k1 > 0.01) {
      const z1 = STEP * k1, z2 = z1 + STEP * k2;
      for (const [x, y] of [[-X, Y], [X, Y], [X, -Y]]) p.guide([[x, y, H], [x, y, z2]]);
      drive(p, z1, k2 < 0.05);
      if (k2 > 0.01) drive(p, z2, true);
    }
    const b = cl((h - 0.74) / 0.26);
    if (b > 0) badge(p, [X + 2, -Y - 2, STEP * 2 + H + 5], 4.3 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
