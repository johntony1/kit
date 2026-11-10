// No connection: a wifi router. Its signal pulses out arc by arc, then flickers, fails and fades.
import { easeInOut, SH, type Illustration } from "../dots";

const W = 15, D = 8, H = 4.5; // half width, half depth, height
const PERIOD = 4.4;
const ramp = (u: number, a: number, b: number) => Math.max(0, Math.min(1, (u - a) / (b - a)));

export const router: Illustration = {
  k: "router", name: "Router", title: "No connection", body: "We can't reach the network right now. Check your connection and try again.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -7);
    p.shadow(0, 0, 28, 13, 0.12);
    // feet
    for (const [x, y] of [[-W + 2, D - 2], [W - 3, D - 2]]) p.box(x, y, -1, 1.5, 1.5, 1, { top: 0.2 });
    // the body, with vents cut into its lit top
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.12, right: 0.065 });
    for (let i = 0; i < 5; i++) { const x = -9 + i * 2.6; p.line([[x, -D + 2.4, H + 0.02], [x, D - 2.4, H + 0.02]], SH.edge, 0.7); }
    // a lit badge on the right of the top
    p.face([[6, -3, H + 0.02], [11.5, -3, H + 0.02], [11.5, 3, H + 0.02], [6, 3, H + 0.02]], 0.3, 0);
    p.line([[7.5, -1, H + 0.05], [10, -1, H + 0.05]], SH.edge, 0.6);
    p.line([[7.5, 1, H + 0.05], [9, 1, H + 0.05]], SH.edge, 0.6);
    // status lights on the front: power stays on, the link light blinks while it tries, then goes out
    const fy = D + 0.05;
    const trying = u > 0.42 && u < 0.62 ? (Math.sin(u * 140) > 0 ? 1 : 0) : u < 0.42 ? 1 : 0;
    p.face([[-12, fy, 1.2], [8, fy, 1.2], [8, fy, 3.3], [-12, fy, 3.3]], 0.03, 0);
    p.dot([-10, fy, 2.25], 0.75, 1);
    p.dot([-7, fy, 2.25], 0.75, trying ? 1 : 0.3);
    p.dot([-4, fy, 2.25], 0.75, u < 0.62 ? 1 : 0.3);
    // antennas at the back corners, leaning out a little
    for (const [x, a] of [[-W + 2.2, -0.16], [W - 2.2, 0.16]] as const) {
      p.push(); p.rotate("y", a, [x, -D + 2, H]);
      p.box(x - 0.9, -D + 1.1, H, 1.8, 1.8, 2, { top: 0.2, left: 0.12, right: 0.065 });
      p.box(x - 0.6, -D + 1.4, H + 2, 1.2, 1.2, 13, { top: 0.3, left: 0.16, right: 0.065 });
      p.pop();
    }

    // the signal: a dot and three arcs between the antennas
    const [cx, cy] = p.pt([0, -D + 2, H + 5]);
    p.screen((c) => {
      c.lineCap = "round";
      for (let i = 0; i < 4; i++) {
        // each arc comes on in turn, then the outer ones flicker and drop first, then the rest fade
        let k = ramp(u, 0.04 + i * 0.09, 0.1 + i * 0.09);
        if (u > 0.42) {
          const fail = 0.42 + (3 - i) * 0.05;
          if (u > fail && u < fail + 0.12) k *= Math.sin(u * 180 + i) > -0.2 ? 1 : 0.15;
          k *= 1 - easeInOut(ramp(u, fail + 0.1, fail + 0.2));
        }
        if (k < 0.02) continue;
        const n = Math.round(255 * k);
        c.strokeStyle = c.fillStyle = `rgb(${n},${n},${n})`;
        if (i === 0) { c.beginPath(); c.arc(cx, cy, 2.1, 0, Math.PI * 2); c.fill(); continue; }
        c.lineWidth = 2.3;
        c.beginPath(); c.arc(cx, cy, 1.2 + i * 4.4, -Math.PI / 2 - 0.72, -Math.PI / 2 + 0.72); c.stroke();
      }
    });
  },
};
