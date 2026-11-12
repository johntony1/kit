// Empty tray: two letter trays, one stacked above and a step behind the other, both empty. Hover and a tick badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 13, D = 10, HT = 5, GAP = 7.5, STEP = 3; // half width, half depth, wall height, the clear space between the trays, half the step back

// one tray, open at the top and at the front: a lit floor, walls on three sides, bright rims
function tray(p: Pen, z: number, y0: number, lit: number) {
  const a = y0 - D, b = y0 + D, F = z + 1, T = z + HT;
  // the floor: in shade at the back (under the tray above), lit from `lit` forward
  p.face([[-W, a, F], [W, a, F], [W, b, F], [-W, b, F]], 0.045, 0);
  p.face([[-W, lit, F], [W, lit, F], [W, b, F], [-W, b, F]], 0.2, 0);
  // the back wall and the far side wall, seen from inside, with their rims
  p.face([[-W, a, F], [W, a, F], [W, a, T], [-W, a, T]], 0.12, 0);
  p.face([[-W, a, F], [-W, b, F], [-W, b, T], [-W, a, T]], 0.065, 0);
  p.face([[-W, a, T], [W, a, T], [W, a + 1.1, T], [-W, a + 1.1, T]], 0.3, 0);
  p.face([[-W, a, T], [-W + 1.1, a, T], [-W + 1.1, b, T], [-W, b, T]], 0.3, 0);
  // the near side wall from outside, its rim, and the low lip across the open front
  p.face([[W, a, z], [W, b, z], [W, b, T], [W, a, T]], 0.085, 0);
  p.face([[W - 1.1, a, T], [W, a, T], [W, b, T], [W - 1.1, b, T]], 0.3, 0);
  p.face([[-W, b, z], [W, b, z], [W, b, z + 2], [-W, b, z + 2]], 0.13, 0);
  p.line([[-W, b + 0.03, z + 2], [W, b + 0.03, z + 2]], 1, 0.7);
}

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.36); g.stroke();
  });
}

export const trayempty: Illustration = {
  k: "trayempty", name: "Empty tray", title: "Your tray is clear", body: "Nothing is waiting on you. New items will land here when they arrive.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -8);
    p.scale(1.08);
    p.shadow(0, 0, 26, 13, 0.11);
    // the lower tray, a step forward: its floor is lit where the upper tray does not cover it
    tray(p, 0, STEP, STEP + 4);
    // four posts hold the upper tray clear of it
    const post = (x: number, y: number) => p.box(x, y, HT, 1.4, 1.4, GAP, { top: 0.2, left: 0.22, right: 0.1, edge: 0 });
    post(-W, STEP - D); post(W - 1.4, STEP - D); post(-W, D - STEP - 1.4); post(W - 1.4, D - STEP - 1.4);
    // the upper tray, a step back, empty and fully lit
    tray(p, HT + GAP, -STEP, -STEP - D);
    // the tick badge pops in
    const b = Math.max(0, (h - 0.45) / 0.55);
    if (b > 0) tick(p, [W + 3, -D - STEP - 3, HT + GAP + 10], 4.8 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
