// No experiments yet: two variants side by side, A and B, each with a result bar. Hover and B pulls ahead: its plinth rises, its bar fills and a tick pops on its corner.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const GLYPH: Record<string, [number, number][][]> = {
  A: [[[-1.7, -2.3], [0, 2.3], [1.7, -2.3]], [[-1, -0.8], [1, -0.8]]],
  B: [[[-1.3, -2.3], [-1.3, 2.3], [0.5, 2.3], [1.3, 1.7], [1.3, 0.7], [0.5, 0.1], [-1.3, 0.1]], [[0.5, 0.1], [1.6, -0.5], [1.6, -1.6], [0.7, -2.3], [-1.3, -2.3]]],
};

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}
/** a variant: a card on a plinth, its letter, and a result bar filled to `score` */
function variant(p: Pen, x0: number, rise: number, n: string, score: number) {
  p.box(x0 - 0.9, -3.4, 0, 14.8, 6.8, rise, { top: 0.2, left: 0.12, right: 0.065 });
  p.box(x0, -1, rise, 13, 2, 18, { top: 0.22, left: 0.2, right: 0.065, lw: 0.6 });
  const y = 1.04, cx = x0 + 6.5;
  for (const s of GLYPH[n]) p.line(s.map(([u, v]) => [cx + u * 1.55, y, rise + 11.2 + v * 1.55] as V3), SH.edge, 1.5);
  p.face([[x0 + 1.6, y, rise + 2.2], [x0 + 11.4, y, rise + 2.2], [x0 + 11.4, y, rise + 4.4], [x0 + 1.6, y, rise + 4.4]], 0.03, SH.edge, 0.5);
  p.face([[x0 + 1.6, y + 0.02, rise + 2.2], [x0 + 1.6 + 9.8 * score, y + 0.02, rise + 2.2], [x0 + 1.6 + 9.8 * score, y + 0.02, rise + 4.4], [x0 + 1.6, y + 0.02, rise + 4.4]], 0.34, SH.edge, 0.5);
}

export const experiment: Illustration = {
  k: "experiment", name: "A/B test", title: "No experiments yet", body: "Set up two versions and split your traffic to find out which one does better.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(Math.min(1, h / 0.7));
    p.translate(0, 0, -13);
    p.shadow(0, 1, 30, 13, 0.11);
    p.rotate("z", -0.42);
    variant(p, -15.2, 2.2, "A", 0.4);
    variant(p, 2.2, 2.2 + 6.5 * k, "B", 0.4 + 0.5 * k);
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) tick(p, [15.2, 1, 22.2 + 6.5 * k], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
