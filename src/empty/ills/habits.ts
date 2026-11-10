// No habits tracked: a week grid on a dark tray. Hover and the days fill in turn, each tile popping up; today's lands last.
import { SH, type Illustration } from "../dots";

const C = 7, R = 4; // days across, habits down
const Q = 3.6, PITCH = 4.6; // tile size, tile spacing
const X0 = -(C * PITCH - (PITCH - Q)) / 2, Y0 = -(R * PITCH - (PITCH - Q)) / 2 + 2;
const T = 2.4; // tray thickness
// which days are done for each habit, and the order they fill in
const DONE = ["1101110", "0111011", "1110100", "1011111"];
const ORDER: [number, number][] = [];
for (let c = 0; c < C; c++) for (let r = 0; r < R; r++) if (DONE[r][c] === "1") ORDER.push([r, c]);
const TODAY: [number, number] = [3, 6];
const HEIGHT = [1.2, 1.8, 1.4, 2];

export const habits: Illustration = {
  k: "habits", name: "Habit grid", title: "No habits tracked", body: "Add a habit and fill in your week, one day at a time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    // seconds since the hover began, read back from the eased hover value
    const since = -Math.log(Math.max(1e-4, 1 - h)) / 7;
    p.translate(0, -1, -5);
    p.shadow(0, 1, 42, 21, 0.11);
    const xa = X0 - 2.6, xb = -X0 + 2.6, ya = Y0 - 6.2, yb = Y0 + R * PITCH + 1.6;
    p.box(xa, ya, 0, xb - xa, yb - ya, T, { top: 0.035, left: 0.14, right: SH.right });
    const z = T + 0.02;
    // the weekday markers along the top
    for (let c = 0; c < C; c++) {
      const x = X0 + c * PITCH + Q / 2;
      p.face([[x - 1, Y0 - 3.6, z], [x + 1, Y0 - 3.6, z], [x + 1, Y0 - 1.6, z], [x - 1, Y0 - 1.6, z]], c === 6 ? 0.32 : 0.24, SH.edge, 0.4);
    }
    // today's column, outlined
    const tx = X0 + 6 * PITCH;
    p.guide([[tx - 0.6, Y0 - 0.6, z], [tx + Q + 0.6, Y0 - 0.6, z], [tx + Q + 0.6, Y0 + R * PITCH - 0.4, z], [tx - 0.6, Y0 + R * PITCH - 0.4, z], [tx - 0.6, Y0 - 0.6, z]], true);
    // tiles, back to front
    const cells: [number, number][] = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) cells.push([r, c]);
    cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    for (const [r, c] of cells) {
      const x = X0 + c * PITCH, y = Y0 + r * PITCH;
      const i = ORDER.findIndex(([rr, cc]) => rr === r && cc === c);
      const k = i < 0 ? 0 : Math.max(0, Math.min(1, (since - 0.05 - (i / ORDER.length) * 0.95) / 0.25));
      if (k <= 0) { p.face([[x, y, z], [x + Q, y, z], [x + Q, y + Q, z], [x, y + Q, z]], 0.12, SH.edge, 0.45); continue; }
      const today = r === TODAY[0] && c === TODAY[1];
      const pop = Math.sin(Math.min(1, k * 1.3) * Math.PI) * 1.2;
      const ht = HEIGHT[r] * k + pop + 0.3;
      p.box(x, y, z, Q, Q, ht, { top: today ? 0.32 : 0.24, left: 0.13, right: SH.right });
    }
  },
};
