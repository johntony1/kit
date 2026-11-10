// No logs yet: a log sheet on a stand. Lines keep scrolling up, the newest one typing in at the bottom.
import { easeInOut, SH, type Illustration } from "../dots";

const STEP = 0.7, N = 8, PERIOD = STEP * N;
const X0 = -14, X1 = 14, Y = 2, Z0 = 4, Z1 = 34; // the sheet: front faces +y
const RZ0 = Z0 + 2.2, RH = 3.4, ROWS = 7; // first row, row pitch, rows shown
const MSG = [0.7, 0.45, 0.85, 0.55, 0.62, 0.38, 0.78, 0.5]; // message lengths per row
const BAD = 5; // the row that carries an error

export const logs: Illustration = {
  k: "logs", name: "Log sheet", title: "The logs are quiet", body: "Events will stream in here as soon as your app starts writing logs.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const n = Math.floor(t / STEP), u = (t % STEP) / STEP;
    const e = easeInOut(Math.min(1, u / 0.4)), k = Math.max(0, Math.min(1, (u - 0.45) / 0.45)); // shift up, then type
    p.translate(0, -1, -18);
    p.shadow(0, 0, 30, 10, 0.12);
    // feet and the sheet's frame
    p.box(-9, -4, 0, 4, 8, 1.6, { top: SH.top }); p.box(5, -4, 0, 4, 8, 1.6, { top: SH.top });
    p.box(-8, -1, 1.6, 2, 2, Z0 - 1.6); p.box(6, -1, 1.6, 2, 2, Z0 - 1.6);
    p.box(X0, -Y, Z0, X1 - X0, Y * 2, Z1 - Z0);
    const fy = Y + 0.03;
    // the header strip: a dim bar with three window dots
    p.face([[X0 + 1, fy, Z1 - 4], [X1 - 1, fy, Z1 - 4], [X1 - 1, fy, Z1 - 1], [X0 + 1, fy, Z1 - 1]], SH.left, 0);
    for (let i = 0; i < 3; i++) p.dot([X0 + 2.6 + i * 2, fy + 0.03, Z1 - 2.5], 0.55, 0.25);
    p.line([[X1 - 8, fy + 0.03, Z1 - 2.5], [X1 - 2.5, fy + 0.03, Z1 - 2.5]], SH.edge, 0.6);
    // the lit log window
    const wz0 = Z0 + 1, wz1 = Z1 - 5;
    p.face([[X0 + 1, fy, wz0], [X1 - 1, fy, wz0], [X1 - 1, fy, wz1], [X0 + 1, fy, wz1]], 0.24, 0);
    // the rows: row g sits in slot (g - n), slot 0 is the newest, at the bottom
    const ry = fy + 0.04;
    for (let j = -1; j < ROWS; j++) {
      const g = n - j, z = j < 0 ? RZ0 : RZ0 + (j + e) * RH;
      if ((j < 0 && k <= 0) || z > wz1 - 2) continue;
      const id = ((g % N) + N) % N;
      const len = MSG[id] * (j < 0 ? k : 1); // the newest line types in
      const mx = X0 + 9.2;
      if (id === BAD) {
        p.clear([[X0 + 2.2, ry, z - 0.9], [X0 + 4, ry, z - 0.9], [X0 + 4, ry, z + 0.9], [X0 + 2.2, ry, z + 0.9]]);
        p.face([[X0 + 2.6, ry + 0.02, z - 0.5], [X0 + 3.6, ry + 0.02, z - 0.5], [X0 + 3.6, ry + 0.02, z + 0.5], [X0 + 2.6, ry + 0.02, z + 0.5]], 0.32, 0);
      } else p.line([[X0 + 2.4, ry, z], [X0 + 3.8, ry, z]], SH.edge, 0.9);
      p.line([[X0 + 5.2, ry, z], [X0 + 7.8, ry, z]], SH.edge, 0.7); // timestamp
      if (len > 0.02) p.line([[mx, ry, z], [mx + (X1 - 3.5 - mx) * len, ry, z]], SH.edge, 0.7);
    }
    // the scroll bar
    p.line([[X1 - 2.2, ry, wz0 + 1.5], [X1 - 2.2, ry, wz1 - 1.5]], SH.edge, 0.55);
    p.box(X1 - 2.9, Y, wz0 + 1.5 + 4 * (1 - ((t % PERIOD) / PERIOD)) , 1.4, 0.5, 4, { top: SH.top, left: 0.2 });
    // the cursor blinks on the newest line
    if (k > 0 && k < 1) p.dot([X0 + 9.2 + (X1 - 3.5 - X0 - 9.2) * MSG[(n + 1) % N] * k + 0.9, ry, RZ0], 0.65, 1);
    p.guide([[X0, Y + 3, 0], [X1, Y + 3, 0]]);
  },
};
