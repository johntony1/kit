// Nothing to run yet: a playground swing on an A frame, the seat hanging still. Hover and the seat swings back and forth; a play badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const W = 13, T = 27, F = 9; // half width, height of the bar, how far the feet spread
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.beginPath(); g.moveTo(x - r * 0.3, y - r * 0.48); g.lineTo(x + r * 0.52, y); g.lineTo(x - r * 0.3, y + r * 0.48); g.closePath(); g.fillStyle = "#000"; g.fill();
  });
}

export const playground: Illustration = {
  k: "playground", name: "Playground", title: "Nothing to run yet", body: "Write a prompt and press run. The result will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(0, 0, -14);
    p.shadow(0, 0, 30, 14, 0.1);
    // an A frame at one end: two legs and a brace
    const frame = (x: number) => {
      const leg = (s: number) => p.face([[x, s * F - 1.3, 0], [x, s * F + 1.3, 0], [x, 1.1, T], [x, -1.1, T]], 0.13, SH.edge, 0.6);
      leg(-1); leg(1);
      const zb = 9, yb = F * (1 - zb / T);
      p.face([[x, -yb, zb - 0.5], [x, yb, zb - 0.5], [x, yb, zb + 0.5], [x, -yb, zb + 0.5]], 0.13, 0);
    };
    frame(-W);
    // the swing: two ropes and a seat, turning about the bar
    const a = 0.6 * e * Math.sin(t * 2.6);
    p.push();
    p.rotate("x", a, [0, 0, T]);
    for (const x of [-4.8, 4.8]) p.face([[x - 0.45, 0, T], [x + 0.45, 0, T], [x + 0.45, 0, 7], [x - 0.45, 0, 7]], 0.2, 0);
    p.box(-6.4, -2.4, 5.6, 12.8, 4.8, 1.5, { top: 0.32, left: 0.2, right: 0.1, lw: 0.6 });
    p.pop();
    // the bar across the top, then the near frame
    p.box(-W - 1.2, -1, T - 1, W * 2 + 2.4, 2, 2, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    frame(W);
    const b = seg(h, 0.55, 0.95);
    if (b > 0) badge(p, [W + 3, -6, T + 3], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
