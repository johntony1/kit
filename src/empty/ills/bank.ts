// Add a bank account: a bank. Hover and a coin drops onto the steps with a bounce; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

// height of the coin's bottom above the step: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 40;
  if (k < 0.45) return 40 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 4.5 * 4 * v * (1 - v); }
  if (k < 0.85) { const v = (k - 0.7) / 0.15; return 1.3 * 4 * v * (1 - v); }
  return 0;
}

export const bank: Illustration = {
  k: "bank", name: "Add bank", title: "No bank account linked", body: "Link a bank account to get paid and move money in and out.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -12);
    p.scale(0.86);
    p.shadow(0, 2, 28, 14, 0.08);
    // two steps, the front reaching out toward us
    p.box(-16, -5, 0, 32, 15, 1.7, { top: 0.1, left: 0.09, right: 0.05, edge: 0.6 });
    p.box(-14.5, -4, 1.7, 29, 12, 1.7, { top: 0.13, left: 0.1, right: 0.06, edge: 0.8 });
    // the wall behind the columns, with a dark door
    p.box(-11, -2.5, 3.4, 22, 5, 12.6, { top: 0.1, left: 0.07, right: 0.05, edge: 0.7 });
    p.face([[-2.4, 2.53, 3.4], [2.4, 2.53, 3.4], [2.4, 2.53, 10.5], [-2.4, 2.53, 10.5]], 0.0, 0.7, 0.45);
    // four columns along the front
    for (const cx of [-9.4, -3.1, 3.1, 9.4]) {
      p.cylinder(cx, 5.4, 3.4, 1.75, 12.6, { side: 0.18, top: 0.2, lw: 0.6 });
    }
    // the beam
    p.box(-13, -3.5, 16, 26, 11, 2.8);
    // the pediment: right slope, then the front triangle with an inset
    const R = 29, F = 7.5, B = -3.5, Zb = 18.8;
    p.face([[0, B, R], [0, F, R], [13, F, Zb], [13, B, Zb]], 0.04, 0.85, 0.55);
    p.face([[-13, F, Zb], [13, F, Zb], [0, F, R]], 0.34, SH.edge, 0.75);
    p.face([[-8.5, F + 0.03, Zb + 1.5], [8.5, F + 0.03, Zb + 1.5], [0, F + 0.03, R - 2.6]], 0.03, 0.75, 0.45);
    // the coin: bright, drops onto the front step and bounces
    const k = Math.min(1, h * 1.3);
    if (k > 0.01) {
      const cr = 3.8;
      const [x, y] = p.pt([14, 9.5, 1.7 + cr + drop(k)]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, cr, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = 0.6;
        g.beginPath(); g.arc(x, y, cr * 0.62, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y - cr * 0.32); g.lineTo(x, y + cr * 0.32); g.stroke();
      });
    }
    // the plus badge pops in once the coin lands
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [15, -8, 29], 5 * pop);
    }
  },
};
