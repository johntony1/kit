// No cards added: three bank cards lying in a neat stack. Hover and the top cards fan out round one corner like a hand of cards, and a plus badge pops in.
import { SH, type Illustration, type Pen } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const W = 13.5, D = 8.5, T = 1.2; // half length, half width, thickness of a card

/** one card, centred on the origin, lying flat at height z */
function card(p: Pen, z: number, face: number, top: boolean) {
  p.box(-W, -D, z, W * 2, D * 2, T, { top: face, left: 0.12, right: 0.065, edge: 0 });
  const Z = z + T + 0.03;
  p.line([[-W, -D, Z], [W, -D, Z], [W, D, Z], [-W, D, Z], [-W, -D, Z]], SH.edge, 0.6);
  if (!top) return;
  // the chip: a bright square with its contact cuts
  p.face([[-W + 3, -4.6, Z], [-W + 9, -4.6, Z], [-W + 9, 0.4, Z], [-W + 3, 0.4, Z]], 0.07, 0);
  p.line([[-W + 6, -4.6, Z + 0.02], [-W + 6, 0.4, Z + 0.02]], 0.4, 0.5);
  p.line([[-W + 3, -2.1, Z + 0.02], [-W + 9, -2.1, Z + 0.02]], 0.4, 0.5);
  // the number, as four short cut groups
  for (let i = 0; i < 4; i++) p.line([[-W + 3 + i * 5.8, 4.6, Z + 0.02], [-W + 7.2 + i * 5.8, 4.6, Z + 0.02]], SH.edge, 1.1);
}

export const cardstack: Illustration = {
  k: "cardstack", name: "Card stack", title: "No cards added", body: "Add a debit or credit card and your cards will be kept together here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -6);
    p.shadow(0, 0, 30, 15, 0.12);
    const f = ease(clamp(h / 0.7)), w = h * Math.sin(t * 2.6) * 0.03;
    // the pivot: the near left corner of the stack
    const pv: [number, number, number] = [-W + 2, D - 2, 0];
    for (let i = 0; i < 3; i++) {
      p.push();
      p.rotate("z", (-0.32 * i) * f + (i ? w : 0), pv);
      card(p, i * (T + 0.9), i === 2 ? 0.24 : 0.14, i === 2);
      p.pop();
    }
    const b = clamp((h - 0.7) / 0.3);
    if (b > 0) {
      const r = (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)) * 4.4;
      const [x, y] = p.pt([W - 1, -D - 1, 9]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      });
    }
  },
};
