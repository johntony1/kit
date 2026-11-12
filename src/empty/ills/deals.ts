// No deals yet: three pipeline stages, arrow shaped steps that climb from left to right. A coin drops onto the first, hops from stage to stage and leaves at the end.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6, ROT = -0.5;
const L = 7.6, A = 4.4, W = 7.5, PITCH = 12.6;
const X0 = [-18.6, -18.6 + PITCH, -18.6 + PITCH * 2];
const H = [3.4, 6.2, 9];
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

/** one stage: an arrow shaped block, only the walls that face us */
function stage(p: Pen, x0: number, h: number, top: number) {
  const q: [number, number][] = [[x0, -W], [x0 + L, -W], [x0 + L + A, 0], [x0 + L, W], [x0, W], [x0 + A, 0]];
  const c = Math.cos(ROT), s = Math.sin(ROT);
  for (let i = 0; i < 6; i++) {
    const [ax, ay] = q[i], [bx, by] = q[(i + 1) % 6];
    const nx = by - ay, ny = -(bx - ax);
    const wx = nx * c - ny * s, wy = nx * s + ny * c; // the wall's normal once the row is turned
    if (wx + wy <= 0.001) continue;
    p.face([[ax, ay, 0], [bx, by, 0], [bx, by, h], [ax, ay, h]], wy > wx ? 0.045 : 0.03, SH.edge, 0.55);
  }
  p.face(q.map(([x, y]) => [x, y, h] as V3), top, SH.edge, 0.6);
}

export const deals: Illustration = {
  k: "deals", name: "Deals pipeline", title: "No deals yet", body: "Add a deal and follow it through each stage until it closes.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = ((t / P) % 1) * 4, seg = Math.floor(u), f = u - seg;
    p.translate(0, 0, -7);
    p.shadow(0, 0, 40, 18, 0.11);
    p.rotate("z", ROT);
    // where the coin is: stops -1 (above the start), 0, 1, 2, then 3 (off the end)
    const stop = (i: number): V3 => i < 0 ? [X0[0] + 6, 0, H[0] + 16] : i > 2 ? [X0[2] + 21, 0, H[2] + 1] : [X0[i] + 6, 0, H[i]];
    const a = stop(seg - 1), b = stop(seg);
    const g = ease(Math.min(1, f / 0.62));
    const arc = seg === 0 ? 0 : Math.sin(g * Math.PI) * 5.5;
    const land = seg === 0 ? g * g : g;
    const at: V3 = [a[0] + (b[0] - a[0]) * land, 0, a[2] + (b[2] - a[2]) * land + arc];
    const on = g >= 1 ? seg : -1; // the stage it rests on lights up
    X0.forEach((x0, i) => stage(p, x0, H[i] - (on === i ? 0.5 * Math.sin(Math.min(1, (f - 0.62) / 0.2) * Math.PI) : 0), on === i ? 0.34 : 0.2));
    // the coin, flat to the screen
    const size = seg === 0 ? Math.min(1, f * 4) : seg === 3 ? 1 - g : 1;
    if (size > 0.05) {
      const r = 3.5 * size, [x, y] = p.pt([at[0], at[1], at[2] + r]);
      p.screen((c) => {
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
        c.strokeStyle = "#000"; c.lineWidth = 0.6;
        c.beginPath(); c.arc(x, y, r * 0.62, 0, Math.PI * 2); c.stroke();
      });
    }
  },
};
