// No price drops: three steps going down with a price tag standing on the highest. Hover and the tag hops down step by step to the lowest; a down arrow pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const D = 5.5;
const tag = (y: number): V3[] => [[-3.6, y, 0], [3.6, y, 0], [3.6, y, 6.6], [1.5, y, 9.6], [-1.5, y, 9.6], [-3.6, y, 6.6]];

// a round bright badge with a dark down arrow
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.moveTo(x - r * 0.42, y + r * 0.1); g.lineTo(x, y + r * 0.52); g.lineTo(x + r * 0.42, y + r * 0.1); g.stroke();
  });
}

export const pricedrop: Illustration = {
  k: "pricedrop", name: "Price drop", title: "No price drops", body: "Follow a product and we will tell you here when its price falls.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -11.5);
    p.shadow(0, 0, 32, 14, 0.1);
    // the steps, high to low
    p.box(-15, -D, 0, 10, D * 2, 15, { top: 0.2, left: 0.1, right: 0.05, lw: 0.6 });
    p.box(-5, -D, 0, 10, D * 2, 10, { top: 0.2, left: 0.1, right: 0.05, lw: 0.6 });
    p.box(5, -D, 0, 10, D * 2, 5, { top: 0.2, left: 0.1, right: 0.05, lw: 0.6 });
    // the tag: two hops, each an arc
    const s1 = clamp((h - 0.04) / 0.38), s2 = clamp((h - 0.48) / 0.38);
    const x = -10 + 10 * s1 + 10 * s2;
    const z = 15 - 5 * s1 - 5 * s2 + 5.5 * 4 * s1 * (1 - s1) + 5.5 * 4 * s2 * (1 - s2);
    p.guide([[-10, 0, 15], [0, 0, 10], [10, 0, 5]], true);
    p.push();
    p.translate(x, 0, z);
    p.rotate("y", 0.35 * (Math.sin(Math.PI * s1) + Math.sin(Math.PI * s2)), [0, 0, 4]);
    for (let y = -1.2; y < -0.1; y += 0.4) p.face(tag(y), SH.left, 0);
    p.face(tag(0), 0.42, SH.edge, 0.7);
    p.dot([0, 0.05, 7.6], 0.95, 0.02);
    p.line([[-2, 0.05, 4.6], [2, 0.05, 4.6]], 0.02, 0.8);
    p.line([[-2, 0.05, 2.6], [0.6, 0.05, 2.6]], 0.02, 0.8);
    p.pop();
    const b = clamp((h - 0.84) / 0.16);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [11, -D, 20], 4.6 * pop);
    }
  },
};
