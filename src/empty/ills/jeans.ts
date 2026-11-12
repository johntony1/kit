// Jeans: a pair of jeans held up flat, with a waistband, pockets and a fly. Hover and the legs step in place; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
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

export const jeans: Illustration = {
  k: "jeans", name: "Jeans", title: "No clothes in your bag", body: "Add something you like and it will be folded up here, ready for checkout.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.4));
    p.translate(0, 0, -16 + k * 1.5);
    p.shadow(0, 0, 20 - k * 2, 8, 0.1);
    p.rotate("z", -0.6); // turned to face us
    const sw = h * Math.sin(t * 3.4);
    // one leg: s is its side, zb the height of its hem
    const leg = (s: number, zb: number): P2[] => [[s * 8.2, 31], [0, 31], [0, 19.5], [s * (2.4 + 1.3 * k), zb], [s * (10.4 + 1.3 * k), zb], [s * 9.8, 23.5]];
    const zl = 2 + Math.max(0, sw) * 2.6, zr = 2 + Math.max(0, -sw) * 2.6;
    const L = leg(-1, zl), R = leg(1, zr);
    const at = (o: P2[], y: number) => o.map(([x, z]) => [x, y, z] as V3);
    // the back of the jeans, a step behind, then the lit front
    p.face(at(L, -1.6), SH.right, SH.edge, 0.5); p.face(at(R, -1.6), SH.right, SH.edge, 0.5);
    p.face(at(L, 0), 0.2, SH.edge, 0.6); p.face(at(R, 0), 0.22, SH.edge, 0.6);
    const Y = 0.04;
    // the waistband with its belt loops and button
    p.line([[-8.8, Y, 28], [8.8, Y, 28]], SH.edge, 0.7);
    for (const x of [-5.6, 5.6]) p.line([[x, Y, 28], [x, Y, 31]], SH.edge, 0.8);
    p.dot([0, Y, 29.5], 0.7, 0);
    // the fly and the seam between the legs
    p.line([[0, Y, 28], [0, Y, 19.5]], SH.edge, 0.6);
    p.line([[2.1, Y, 28], [2.1, Y, 23.4], [0, Y, 21.4]], SH.edge, 0.55);
    // the pockets and the hems
    for (const s of [-1, 1]) {
      p.line([[s * 3.8, Y, 28], [s * 5, Y, 25], [s * 9.5, Y, 24.4]], SH.edge, 0.6);
      const zb = s < 0 ? zl : zr, xi = s * (2.4 + 1.3 * k), xo = s * (10.4 + 1.3 * k);
      p.line([[xi * (1 - 2 / (19.5 - zb)), Y, zb + 2], [xo + (s * 9.8 - xo) * (2 / (23.5 - zb)), Y, zb + 2]], SH.edge, 0.55);
    }
    // the plus badge pops in at the end
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [14.5, 2, 31], 4.6 * pop);
    }
  },
};
