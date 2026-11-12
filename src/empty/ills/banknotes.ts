// No cash yet: a neat stack of banknotes. Hover and the top notes lift and fan out; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 13.5, D = 7.5; // half length and half width of a note

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
/** a note (or a wad of them) with the printed face on top: a border, a round seal, a mark at each end */
function note(p: Pen, z: number, th: number, top: number) {
  p.box(-W, -D, z, W * 2, D * 2, th, { top, left: 0.13, right: 0.07, lw: 0.55 });
  const Z = z + th + 0.03;
  p.line([[-W + 1.6, -D + 1.6, Z], [W - 1.6, -D + 1.6, Z], [W - 1.6, D - 1.6, Z], [-W + 1.6, D - 1.6, Z], [-W + 1.6, -D + 1.6, Z]], SH.edge, 0.5);
  p.disc(0, 0, Z, 4, 0.02);
  p.disc(0, 0, Z + 0.02, 2.3, 0.42);
  p.disc(-9.2, 0, Z, 1.3, 0.02); p.disc(9.2, 0, Z, 1.3, 0.02);
}

export const banknotes: Illustration = {
  k: "banknotes", name: "Banknotes", title: "No cash yet", body: "Money you receive in cash will be counted here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(clamp(h / 0.75)), bob = h * Math.sin(t * 2.6) * 0.5;
    p.translate(0, 0, -5);
    p.scale(1.08);
    p.shadow(0, 0, 28, 14, 0.12);
    p.rotate("z", -0.16);
    // the wad at the bottom, its sheets showing on the sides
    note(p, 0, 4.2, 0.2);
    for (const z of [1.4, 2.8]) p.line([[-W, D + 0.03, z], [W, D + 0.03, z], [W + 0.03, -D, z]], SH.edge, 0.4);
    // two loose notes on top: they lift and turn apart
    p.push();
    p.rotate("z", -0.3 * k);
    note(p, 4.2 + 3.2 * k + bob * 0.6, 0.9, 0.2);
    p.pop();
    p.push();
    p.rotate("z", 0.26 * k);
    note(p, 5.1 + 7.4 * k + bob, 0.9, 0.22);
    p.pop();
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) badge(p, [13, -13, 16], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
