// No homework due: a school backpack with a front pocket, straps and a carry loop. Hover and an exercise book rises out of the top, then a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const pop = (b: number) => (b <= 0 ? 0 : b < 0.6 ? (b / 0.6) * 1.2 : 1.2 - 0.2 * ((b - 0.6) / 0.4));
const W = 10, D = 6.5, H = 21;
// a round bright badge with a dark tick, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.52, y - r * 0.38); g.stroke();
  });
}

export const homework: Illustration = {
  k: "homework", name: "Homework", title: "No homework due", body: "You are all caught up. New assignments will show up here when they are set.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, -1, -14);
    p.scale(1.1);
    p.shadow(0, 1, 24, 12, 0.12);
    const rise = ease(seg(h, 0.04, 0.62)) * 11.5;
    // the carry loop at the back of the top
    for (const x of [-3.4, 2.4]) p.box(x, -5.4, H, 1, 1.4, 2.4, { top: 0.3, left: 0.3, right: 0.16, lw: 0.4 });
    p.box(-3.4, -5.4, H + 2.4, 6.8, 1.4, 1.1, { top: 0.34, left: 0.3, right: 0.16, lw: 0.4 });
    // the top, behind the opening, and the dark opening itself
    p.face([[-W, -D, H], [W, -D, H], [W, 0.8, H], [-W, 0.8, H]], SH.top, SH.edge, 0.6);
    p.face([[-8, -1.4, H + 0.02], [8, -1.4, H + 0.02], [8, 0.8, H + 0.02], [-8, 0.8, H + 0.02]], 0.03, SH.edge, 0.5);
    // the exercise book coming up out of it, a label on its cover
    if (rise > 0.3) {
      const zb = H - 14.5 + rise;
      p.box(-6.8, -1, zb, 13.6, 1.5, 14.5, { top: 0.3, left: 0.36, right: 0.16 });
      p.face([[-3.6, 0.53, zb + 8.6], [3.6, 0.53, zb + 8.6], [3.6, 0.53, zb + 12], [-3.6, 0.53, zb + 12]], 0.1, SH.edge, 0.4);
    }
    // the top in front of the opening, then the bag's walls
    p.face([[-W, 0.8, H], [W, 0.8, H], [W, D, H], [-W, D, H]], SH.top, SH.edge, 0.6);
    p.face([[-W, D, 0], [W, D, 0], [W, D, H], [-W, D, H]], SH.left, SH.edge, 0.6);
    p.face([[W, -D, 0], [W, D, 0], [W, D, H], [W, -D, H]], SH.right, SH.edge, 0.6);
    // a strap on the side
    p.face([[W + 0.03, -2.2, 2], [W + 0.03, 1.4, 2], [W + 0.03, 1.4, H], [W + 0.03, -2.2, H]], 0.2, SH.edge, 0.5);
    // the front pocket, with a zip and its pull
    p.box(-7.5, D, 1.5, 15, 2.8, 10.5, { top: 0.26 });
    p.line([[-6, D + 2.83, 9.4], [6, D + 2.83, 9.4]], SH.edge, 0.6);
    p.box(4.6, D + 2.8, 7.6, 1.2, 0.5, 1.9, { top: 0.36, left: 0.36, right: 0.2, lw: 0.35 });
    // a name tag above the pocket
    p.face([[-3, D + 0.03, 15], [3, D + 0.03, 15], [3, D + 0.03, 18.2], [-3, D + 0.03, 18.2]], 0.3, SH.edge, 0.5);
    const b = seg(h, 0.68, 1);
    if (b > 0) badge(p, [W + 3, -D, H + 9], 4.6 * pop(b) / 1.02);
  },
};
