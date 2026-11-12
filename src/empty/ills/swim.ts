// No swims yet: a small pool with lane ropes and a ladder. A swimmer crosses the middle lane, arms turning, a wake trailing behind.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per length
const ZD = 4.4, ZW = 2.4; // the deck's height, the water's
function tube(p: Pen, pts: V3[], w: number) {
  const q = pts.map((v) => p.pt(v));
  p.screen((g) => {
    g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  });
}

export const swim: Illustration = {
  k: "swim", name: "Swimming", title: "No swims yet", body: "Log a swim or connect your watch, and your lengths will be counted here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -3);
    p.scale(0.94);
    p.shadow(0, 0, 40, 20, 0.11);
    // the deck, the pool cut into it, its two far walls
    p.box(-21, -14, 0, 42, 28, ZD, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    const z = ZD + 0.03, d = ZD - ZW;
    p.clear([[-18, -11, z], [18, -11, z], [18, 11, z], [-18, 11, z]]);
    p.face([[-18, -11, ZW], [18 - d, -11, ZW], [18, -11, z], [-18, -11, z]], 0.12, 0);
    p.face([[-18, -11, ZW], [-18, 11 - d, ZW], [-18, 11, z], [-18, -11, z]], 0.065, 0);
    // the water, and ripples sliding over it
    const Y1 = -11 + (22 - d) / 3, Y2 = -11 + ((22 - d) * 2) / 3, YM = (Y1 + Y2) / 2;
    for (let i = 0; i < 4; i++) {
      const x = -15 + ((i * 5.3 + u * 5.3 * 2) % 30), y = [-8.6, 6.4, -9.4, 7.4, -7.6, 5.6, -8.2][i];
      p.face([[x, y, ZW + 0.02], [x + 2.4, y, ZW + 0.02], [x + 2.4, y + 0.7, ZW + 0.02], [x, y + 0.7, ZW + 0.02]], 0.2, 0);
    }
    // the lane ropes: floats in a row
    for (const y of [Y1, Y2]) for (let x = -16.6; x < 16; x += 2.4) p.dot([x, y, ZW + 0.3], 0.5, 0.7);
    // the swimmer: a head, two arms turning, a wake
    const x = -14 + 26 * u, k = Math.min(1, Math.sin(u * Math.PI) * 4), ph = u * Math.PI * 2 * 5;
    for (let i = 1; i <= 4; i++) for (const sy of [-1, 1]) p.dot([x - 1.6 - i * 1.9, YM + sy * (0.5 + i * 0.6), ZW + 0.1], 0.6 - i * 0.08, k * (0.9 - i * 0.17));
    for (const sy of [-1, 1]) {
      const a = ph + (sy > 0 ? Math.PI : 0), up = Math.max(0, Math.sin(a));
      if (up > 0.05) p.dot([x + 1 + 2.2 * Math.cos(a), YM + sy * 1.9, ZW + 0.4 + 2 * up], 0.9, k);
    }
    p.dot([x, YM, ZW + 1], 1.7 * Math.max(0.01, k), k);
    // the ladder over the near edge
    for (const lx of [7, 11]) tube(p, [[lx, 9.2, ZW], [lx, 9.2, ZD + 4.2], ...Array.from({ length: 7 }, (_, i) => { const a = (i / 6) * Math.PI; return [lx, 10.9 - Math.cos(a) * 1.7, ZD + 4.2 + Math.sin(a) * 1.7] as V3; }), [lx, 12.6, z]], 1.1);
    p.line([[7, 9.2, ZD + 1.6], [11, 9.2, ZD + 1.6]], SH.edge, 0.6);
  },
};
