// Nothing to reveal yet: a pair of pleated curtains drawn shut under a curtain rod with round ends. Hover and they part to the sides, gathering into folds, and a bright window shows behind them.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 12, Z0 = 1, Z1 = 28, Y = 1; // half width of the opening, bottom, top, the curtains' plane
const N = 5; // pleats per curtain

// one curtain from its outer edge xo to its inner edge xi: pleats as alternating lit and shaded strips
function curtain(p: Pen, xo: number, xi: number, sway: number) {
  for (let i = 0; i < N * 2; i++) {
    const a = xo + ((xi - xo) * i) / (N * 2), b = xo + ((xi - xo) * (i + 1)) / (N * 2);
    const hem = (x: number) => Z0 + 1.2 * Math.sin(((x - xo) / (xi - xo)) * Math.PI * N * 2);
    const sw = (sway * i) / (N * 2);
    const strip: V3[] = [[a, Y, Z1], [b, Y, Z1], [b + sw, Y, hem(b)], [a + sw, Y, hem(a)]];
    p.face(strip, i % 2 ? 0.08 : 0.28, 0);
  }
  p.line([[xi, Y + 0.03, Z1], [xi + sway, Y + 0.03, Z0 + 0.2]], SH.edge, 0.7);
}

function pane(p: Pen) {
  // the frame, then four bright panes split by a cross
  p.box(-W, -1.2, Z0 + 2, W * 2, 1.2, Z1 - Z0 - 4, { top: 0.2, left: 0.05, right: 0.065, edge: 0 });
  const g = (x0: number, x1: number, z0: number, z1: number) => p.face([[x0, 0.03, z0], [x1, 0.03, z0], [x1, 0.03, z1], [x0, 0.03, z1]], 0.32, 0);
  const zm = (Z0 + Z1) / 2;
  g(-W + 1.6, -0.9, Z0 + 3.6, zm - 0.9); g(0.9, W - 1.6, Z0 + 3.6, zm - 0.9);
  g(-W + 1.6, -0.9, zm + 0.9, Z1 - 3.6); g(0.9, W - 1.6, zm + 0.9, Z1 - 3.6);
}

export const curtains: Illustration = {
  k: "curtains", name: "Curtains", title: "Nothing to reveal yet", body: "When there is something new, it will be unveiled right here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p: Pen, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 2, 26, 9, 0.1);
    p.rotate("z", -0.6);
    pane(p);
    // the curtains part: each one bunches toward its side
    const e = ease(Math.min(1, h * 1.15));
    const w = (W + 1.5) * (1 - 0.68 * e), sway = h * Math.sin(t * 2.2) * 0.5;
    curtain(p, -W - 1.5, -W - 1.5 + w, sway);
    curtain(p, W + 1.5, W + 1.5 - w, -sway);
    // the rod with round finials, over everything
    p.box(-W - 3, Y - 0.2, Z1, (W + 3) * 2, 1.4, 1.4, { top: 0.32, left: 0.26, right: 0.1, edge: 0 });
    p.ringV("y", [-W - 3.6, Y + 1.25, Z1 + 0.7], 1.6, 0.34, 0);
    p.ringV("y", [W + 3.6, Y + 1.25, Z1 + 0.7], 1.6, 0.34, 0);
  },
};
