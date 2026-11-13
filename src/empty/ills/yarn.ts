// Nothing knitted yet: a big ball of yarn wound in bands, two knitting needles pushed through it and a loose end curling away on the floor. It rolls gently to and fro, its bands turning and the loose end swaying, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const R = 15; // the ball's radius, on screen

export const yarn: Illustration = {
  k: "yarn", name: "Yarn ball", title: "Nothing knitted yet", body: "Start your first project and it will grow here, row by row.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, roll = Math.sin(u * Math.PI * 2);
    p.translate(0, 0, -13);
    p.shadow(0, 0, 24, 10, 0.12);
    const [cx, cy] = p.pt([roll * 1.2, -roll * 1.2, R]);
    // the ball's disc as world points facing us: x - y runs across the screen, z up
    const S = (sx: number, sy: number): V3 => { const k = sx / 1.732; return [roll * 1.2 + k, -roll * 1.2 - k, R - sy]; };
    const disc = (r: number, ox = 0, oy = 0): V3[] => Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return S(ox + Math.cos(a) * r, oy + Math.sin(a) * r); });
    // the loose end, curling away along the floor to the left
    const [fx, fy] = p.pt([5, 13, 0]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round";
      g.beginPath(); g.moveTo(cx - 9, cy + 9.5);
      g.bezierCurveTo(cx - 13, cy + 15 + roll, fx + 8, fy - 4 - roll * 2, fx, fy);
      g.bezierCurveTo(fx - 5, fy + 2, fx - 9, fy - 1 + roll, fx - 12, fy + 1);
      g.stroke();
    });
    // the ball: a shaded body, a lit cap upper left
    p.face(disc(R), 0.11, 0);
    p.face(disc(R * 0.8, -2.4, -2.4), 0.22, 0);
    // the wound bands: one family of arcs across it, one across the other way, turning as it rolls
    const a0 = roll * 0.45;
    p.screen((g) => {
      g.save(); g.beginPath(); g.arc(cx, cy, R - 0.4, 0, Math.PI * 2); g.clip();
      g.strokeStyle = "#000"; g.lineWidth = 0.85; g.lineCap = "round";
      for (const [rot, offs] of [[a0 + 0.6, [-5, 0, 5]], [a0 - 1, [-3.5, 3.5]]] as [number, number[]][]) {
        for (const off of offs) {
          g.save(); g.translate(cx, cy); g.rotate(rot);
          g.beginPath(); g.ellipse(off, 0, R * 0.35 + Math.abs(off) * 0.5, R * 1.05, 0, 0, Math.PI * 2); g.stroke();
          g.restore();
        }
      }
      g.restore();
    });
    // two knitting needles pushed through it, both leaning right and crossing, each with a round knob
    for (const [a, l] of [[-0.62, 21], [-1.02, 19]] as [number, number][]) {
      const dx = Math.cos(a), dy = Math.sin(a), sx = cx - dx * 6, sy = cy - dy * 6;
      const ex = cx + dx * l, ey = cy + dy * l;
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.8; g.lineCap = "round"; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
        g.fillStyle = "#fff"; g.beginPath(); g.arc(ex, ey, 2.3, 0, Math.PI * 2); g.fill();
      });
    }
  },
};
