// Nothing to check out: a checkout counter with a belt, a divider bar and a till. Hover and a parcel lands on the belt and rides up to the till; a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// a round bright badge with a dark tick, flat to the screen
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.36); g.stroke();
  });
}

export const checkout: Illustration = {
  k: "checkout", name: "Checkout counter", title: "Nothing to check out", body: "Add something to your basket and you can pay for it here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const Z = 8.5;
    p.translate(0, 0, -10);
    p.shadow(0, 1, 32, 14, 0.1);
    // the counter, with a kick strip and a seam where the till end starts
    p.box(-17, -5.5, 0, 34, 11, Z, { lw: 0.6 });
    p.line([[-17, 5.53, 1.4], [17, 5.53, 1.4]], 0.5, 0.45);
    p.line([[6.5, 5.53, 1.4], [6.5, 5.53, Z]], 0.5, 0.45);
    // the belt: a dark strip whose ribs run toward the till while the parcel rides
    const ride = ease(clamp((h - 0.3) / 0.5));
    p.face([[-16, -4, Z + 0.02], [5.4, -4, Z + 0.02], [5.4, 4, Z + 0.02], [-16, 4, Z + 0.02]], 0.035, SH.edge, 0.5);
    const off = (ride * 12) % 3;
    for (let x = -15 + off; x < 5; x += 3) p.line([[x, -4, Z + 0.03], [x, 4, Z + 0.03]], 0.32, 0.45);
    // the parcel: lands on the belt, then rides along it
    if (h > 0.01) {
      const fall = clamp(h / 0.3);
      const px = -12.6 + ride * 11, pz = Z + 0.05 + 15 * (1 - fall * fall);
      p.box(px - 2.7, -2.9, pz, 5.4, 5.8, 4.4, { top: 0.32, left: 0.22, right: 0.1 });
      p.line([[px, -2.9, pz + 4.42], [px, 2.9, pz + 4.42]], SH.edge, 0.6);
      p.line([[px, 2.93, pz + 4.4], [px, 2.93, pz + 2.6]], SH.edge, 0.6);
    }
    // the divider bar lying across the belt
    p.box(2.6, -4, Z, 1.3, 8, 1.4, { top: 0.32, left: 0.22, right: 0.1 });
    // the till: a drawer block with a screen on a neck
    p.box(8, -4.2, Z, 8, 8.4, 3.2, { top: 0.2, left: 0.06, right: 0.04, lw: 0.6 });
    p.line([[9, 4.23, Z + 1.3], [15, 4.23, Z + 1.3]], SH.edge, 0.5);
    p.dot([12, 4.25, Z + 0.7], 0.5, 1);
    p.box(11.2, -0.9, Z + 3.2, 1.6, 1.6, 2.2, { top: 0.1, left: 0.12, right: 0.065, edge: 0 });
    p.box(8.2, -1.3, Z + 5.2, 7.6, 2.2, 7, { top: 0.24, left: 0.035, right: 0.1, lw: 0.7 });
    p.line([[9.6, 0.93, Z + 10.2], [14.4, 0.93, Z + 10.2]], SH.edge, 0.8);
    p.line([[9.6, 0.93, Z + 7.8], [12.6, 0.93, Z + 7.8]], SH.edge, 0.8);
    // the tick badge pops in once the parcel reaches the till
    const b = clamp((h - 0.74) / 0.26);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [15, -4, Z + 16.5], 4.4 * pop);
    }
  },
};
