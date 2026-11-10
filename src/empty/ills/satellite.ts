// Searching for signal: a satellite dish on its mount turns slowly from side to side and nods, sending out a ping as it looks.
import { SH, type Illustration, type V3 } from "../dots";

const PERIOD = 5.6, R = 10.5; // dish radius
const ZP = 15; // the pivot's height

/** a thick stroke between two 3D points, painted straight onto the canvas (tone: how lit) */
function rod(p: Parameters<Illustration["draw"]>[0], a: V3, b: V3, w: number, tone: number) {
  const A = p.pt(a), Bp = p.pt(b);
  p.screen((c) => {
    const n = Math.round(255 * tone);
    c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = w; c.lineCap = "round";
    c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(Bp[0], Bp[1]); c.stroke();
  });
}

export const satellite: Illustration = {
  k: "satellite", name: "Satellite dish", title: "Searching for signal", body: "Hang tight while we look for a connection. This can take a moment.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    const yaw = 0.25 + 0.45 * Math.sin(u * Math.PI * 2);
    const tilt = 0.75 + 0.1 * Math.sin(u * Math.PI * 4 + 0.6);
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 11, 0.12);
    // the base: a heavy plinth, then a turntable and the post
    p.box(-8, -8, 0, 16, 16, 3.5, { top: 0.2 });
    p.line([[-6, 6, 3.52], [6, 6, 3.52]], SH.edge, 0.6);
    p.cylinder(0, 0, 3.5, 5, 1.6, { top: 0.24, side: 0.12 });
    p.box(-1.4, -1.4, 5.1, 2.8, 2.8, ZP - 7, { top: 0.24, left: 0.13, right: 0.065 });

    p.push();
    p.translate(0, 0, ZP);
    p.rotate("z", yaw);
    // the yoke: a turning head on the post
    p.box(-3, -2.2, -2.6, 6, 4.4, 2.4, { top: 0.22 });
    p.rotate("x", tilt);
    // the dish faces +y; first its back shell, then the lit rim and the shaded bowl inside it
    p.ringV("y", [0, -2.6, 0], R * 0.5, 0.07, 0);
    p.ringV("y", [0, -1.2, 0], R * 0.85, 0.1, 0);
    p.ringV("y", [0, 0, 0], R, 0.26, 0);
    p.ringV("y", [0, 0.05, 0], R - 1.6, 0.11, SH.edge, 0.7);
    p.ringV("y", [0, 0.08, 0], R * 0.42, 0.16, 0);
    // the feed: three struts from the rim to a small horn in front of the bowl, cut as gaps
    const F: V3 = [0, 8.5, 0];
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i * Math.PI * 2) / 3;
      p.line([[Math.cos(a) * (R - 0.8), 0.2, Math.sin(a) * (R - 0.8)], F], SH.edge, 0.9);
      rod(p, [Math.cos(a) * (R - 0.8), 0.2, Math.sin(a) * (R - 0.8)], F, 0.45, 0.62);
    }
    p.dot(F, 2.6, 0);
    p.box(-1.2, 7.4, -1.2, 2.4, 2.6, 2.4, { top: 0.32, left: 0.2, right: 0.1 });
    // a ping out of the feed, twice a loop: a few specks that fly out along the dish's aim and fade, unanswered
    const from = p.pt([0, 10, 0]), to = p.pt([0, 30, 0]);
    p.pop();
    for (let i = 0; i < 2; i++) {
      const s = (u * 2 + i * 0.5) % 1;
      const a = Math.sin(Math.min(1, s * 1.4) * Math.PI);
      if (a < 0.05) continue;
      p.screen((c) => {
        for (let j = 0; j < 3; j++) {
          const k = Math.max(0, s - j * 0.08);
          const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k;
          const n = Math.round(255 * a * (1 - j * 0.25));
          c.fillStyle = `rgb(${n},${n},${n})`;
          c.beginPath(); c.arc(x, y, 0.9 - j * 0.15, 0, Math.PI * 2); c.fill();
        }
      });
    }
  },
};
