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
    p.translate(0, 0, -13);
    p.scale(0.95);
    p.shadow(0, 2, 28, 14, 0.1);
    p.rotate("z", -0.5); // turned so its columns face us
    // two steps, the front reaching out toward us: lit tops, dense fronts, sparse ends
    p.box(-16, -6, 0, 32, 16, 2, { edge: 0 });
    p.box(-14.5, -5, 2, 29, 13, 1.6, { edge: 0 });
    p.line([[-16, 10.03, 2], [16, 10.03, 2], [16.03, -6, 2]], SH.edge, 0.5);
    // the wall behind the columns, in shade, with a dark door
    p.box(-11, -3, 3.6, 22, 5, 12.6, { top: 0.2, left: 0.035, right: 0.05, edge: 0 });
    p.clear([[-2.6, 2.03, 3.6], [2.6, 2.03, 3.6], [2.6, 2.03, 11], [-2.6, 2.03, 11]]);
    // four bold columns along the front: lit, standing out from the shaded wall
    for (const cx of [-9.2, -3.1, 3.1, 9.2]) {
      p.box(cx - 1.9, 4.2, 3.6, 3.8, 3.8, 0.9, { edge: 0 }); // base
      p.cylinder(cx, 6.1, 4.5, 1.7, 11.2, { side: 0.24, top: 0.2, edge: 0 });
    }
    // the beam: a lit top, a dense front with a cut line, a sparse end
    p.box(-13.5, -4, 15.7, 27, 12.5, 2.8, { edge: 0 });
    p.line([[-13.5, 8.53, 17.1], [13.5, 8.53, 17.1]], SH.edge, 0.6);
    // the roof: two slopes and the front triangle, a cut inset in it
    const R = 27.5, F = 8.5, B = -4, Zb = 18.5;
    p.face([[-13.5, B, Zb], [0, B, R], [0, F, R], [-13.5, F, Zb]], 0.2, 0); // left slope, lit
    p.face([[0, B, R], [0, F, R], [13.5, F, Zb], [13.5, B, Zb]], 0.065, 0); // right slope, in shade
    p.face([[-13.5, F, Zb], [13.5, F, Zb], [0, F, R]], 0.14, 0);
    p.line([[-13.5, F + 0.03, Zb], [13.5, F + 0.03, Zb], [0, F + 0.03, R], [-13.5, F + 0.03, Zb]], SH.edge, 0.6);
    p.line([[-8.5, F + 0.03, Zb + 1.6], [8.5, F + 0.03, Zb + 1.6], [0, F + 0.03, R - 2.6], [-8.5, F + 0.03, Zb + 1.6]], SH.edge, 0.7);
    p.dot([0, F + 0.05, Zb + 3.6], 1.3, 0); // a round window
    // the coin: bright, drops onto the front step and bounces
    const k = Math.min(1, h * 1.3);
    if (k > 0.01) {
      const cr = 3.8;
      const [x, y] = p.pt([14, 8.5, 3.6 + cr + drop(k)]);
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
      badge(p, [13, -3, 24], 4.6 * pop);
    }
  },
};
