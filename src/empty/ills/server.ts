// Something went wrong on our end: a server rack, rows of drive bays, one status light blinking an alarm.
import { SH, type Illustration } from "../dots";

const X = 8, Y = 6, Z = 34; // half width, half depth, height (the front faces +y)
const PERIOD = 1.8;
const UNITS = 5, U = 5.2, UG = 0.9, Z0 = 4.4; // units, unit height, gap, first unit
const BAD = 1; // the unit with the alarm

export const server: Illustration = {
  k: "server", name: "Server rack", title: "Something went wrong on our end", body: "Our servers hit a problem. We are on it, so please try again in a few minutes.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    // two quick blinks, then a pause
    const on = (u < 0.14 || (u > 0.28 && u < 0.42)) ? 1 : 0;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22, 11, 0.12);
    // feet
    for (const [x, y] of [[-X + 0.6, Y - 2.4], [X - 2.4, Y - 2.4], [X - 2.4, -Y + 0.6]]) p.box(x, y, 0, 1.8, 1.8, 1.6, { top: 0.2 });
    // the cabinet
    p.box(-X, -Y, 1.6, X * 2, Y * 2, Z, { top: 0.2, left: 0.12, right: 0.065 });
    // vents on the lit top
    const zt = 1.6 + Z + 0.02;
    for (let i = 0; i < 5; i++) { const x = -5 + i * 2.5; p.line([[x, -Y + 2.2, zt], [x, Y - 2.2, zt]], SH.edge, 0.7); }
    // vents down the right wall
    for (let i = 0; i < 6; i++) { const z = 8 + i * 3.8; p.line([[X + 0.02, -Y + 2.5, z], [X + 0.02, Y - 2.5, z]], SH.edge, 0.6); }

    const fy = Y + 0.03;
    for (let k = 0; k < UNITS; k++) {
      const z0 = Z0 + k * (U + UG), z1 = z0 + U;
      // a lit faceplate
      p.face([[-X + 1, fy, z0], [X - 1, fy, z0], [X - 1, fy, z1], [-X + 1, fy, z1]], 0.24, 0);
      // drive bays: the seams between them
      for (let i = 1; i < 4; i++) { const x = -X + 1 + i * 2.9; p.line([[x, fy + 0.02, z0 + 1], [x, fy + 0.02, z1 - 1]], SH.edge, 0.6); }
      // the status strip: a dark window with its lights
      p.clear([[2.4, fy + 0.02, z0 + 1.1], [X - 1.7, fy + 0.02, z0 + 1.1], [X - 1.7, fy + 0.02, z1 - 1.1], [2.4, fy + 0.02, z1 - 1.1]]);
      const mid = (z0 + z1) / 2;
      if (k === BAD) {
        p.dot([3.8, fy + 0.05, mid], 0.5, 0.45);
        if (on) p.dot([X - 3.1, fy + 0.05, mid], 1.45, 1);
      } else {
        p.dot([3.8, fy + 0.05, mid], 0.5, 0.6);
        p.dot([X - 3.1, fy + 0.05, mid], 0.5, 0.6);
      }
    }
    // the alarm's glow spills past the cabinet while it is lit
    if (on) {
      const mid = Z0 + BAD * (U + UG) + U / 2;
      const [cx, cy] = p.pt([X - 3.1, fy, mid]);
      p.screen((c) => {
        c.fillStyle = "#fff"; c.beginPath(); c.arc(cx, cy, 1.5, 0, Math.PI * 2); c.fill();
        c.lineCap = "round"; c.strokeStyle = "#fff"; c.lineWidth = 1.1;
        for (const r of [3.6, 6, 8.4]) {
          c.beginPath(); c.arc(cx, cy, r, -0.9, 0.9); c.stroke();
        }
      });
    }
  },
};
