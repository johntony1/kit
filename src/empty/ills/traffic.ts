// No traffic data: a traffic light on its pole. It runs through its cycle, stop, go, wait, one lamp glowing at a time.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const YF = 3.2; // the front of the housing

export const traffic: Illustration = {
  k: "traffic", name: "Traffic light", title: "No traffic data", body: "Live traffic for your routes will show here once there is something to report.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const lit = u < 0.4 ? 0 : u < 0.85 ? 2 : 1; // top, bottom, then the middle
    const since = u < 0.4 ? u : u < 0.85 ? u - 0.4 : u - 0.85;
    p.translate(0, 0, -21);
    p.scale(1.12);
    p.shadow(0, 0, 17, 9, 0.12);
    // the foot and the pole
    p.box(-4, -4, 0, 8, 8, 1.6, { top: 0.22, left: 0.14, right: 0.07 });
    p.box(-1.1, -1.1, 1.6, 2.2, 2.2, 14, { top: 0.2, left: 0.22, right: 0.09 });
    // the housing: dark, so the lamps stand out
    const Z0 = 15.6, ZT = 38;
    p.box(-5.2, -YF, Z0, 10.4, YF * 2, ZT - Z0, { top: 0.24, left: 0.13, right: 0.05, lw: 0.6 });
    // three lamps under their hoods
    [34, 26.8, 19.6].forEach((z, i) => {
      const on = i === lit;
      p.ringV("y", [0, YF + 0.03, z], 2.9, on ? 1 : 0.02, SH.edge, 0.6);
      p.box(-3.3, YF, z + 3, 6.6, 1.6, 0.4, { top: 0.24, left: 0.2, right: 0.1 });
      if (on) {
        // a glow that blooms as the lamp comes on
        const k = Math.min(1, since / 0.08);
        const [x, y] = p.pt([0, YF + 2, z]);
        p.screen((g) => {
          g.strokeStyle = "#fff"; g.lineWidth = 0.7; g.lineCap = "round";
          for (let j = 0; j < 5; j++) {
            const a = Math.PI * (0.15 + 0.7 * (j / 4)) + Math.PI * 0.42, c = Math.cos(a), s = Math.sin(a);
            g.beginPath(); g.moveTo(x + c * 5.2, y + s * 4.2); g.lineTo(x + c * (5.2 + 2.6 * k), y + s * (4.2 + 2.2 * k)); g.stroke();
          }
        });
      }
    });
    const cap: V3[] = [[-5.2, YF + 0.03, ZT], [5.2, YF + 0.03, ZT]];
    p.line(cap, SH.edge, 0.6);
  },
};
