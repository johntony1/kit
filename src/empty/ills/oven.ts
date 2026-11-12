// Nothing in the oven: a kitchen oven with a windowed door and four knobs. Hover and the door swings down, the light comes on over two empty racks and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

const W = 12, D = 8.5, H = 25, F = D + 0.03;
const quad = (x0: number, x1: number, z0: number, z1: number, y: number): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];

export const oven: Illustration = {
  k: "oven", name: "Oven", title: "Nothing in the oven", body: "Nothing is cooking right now. Start a recipe and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(3, -5, -10);
    p.scale(0.88);
    p.shadow(0, 4, 29, 14, 0.11);
    const open = ease(seg(h, 0, 0.8)), glow = seg(h, 0.45, 0.85);
    p.box(-W, -D, 0, W * 2, D * 2, H);
    // the hob: two rings on the top
    for (const x of [-5.5, 5.5]) { p.disc(x, -1, H + 0.02, 3.4, 0.1, SH.edge); p.disc(x, -1, H + 0.04, 1.5, 0, SH.edge); }
    // the control strip and its four knobs
    p.line([[-W, F, 19.6], [W, F, 19.6]], SH.edge, 0.55);
    for (const x of [-8, -2.7, 2.7, 8]) {
      p.ringV("y", [x, F, 22.3], 1.45, 0.3, SH.edge, 0.5);
      p.line([[x, F + 0.03, 22.3], [x, F + 0.03, 23.5]], 0.02, 0.5);
    }
    // the cavity: dark, lit from inside once the door is down, with two racks
    p.face(quad(-9.5, 9.5, 3.5, 17.5, F), 0.03 + 0.2 * glow, SH.edge, 0.5);
    if (open > 0.15) {
      p.face(quad(-6.5, 6.5, 6.6, 15.5, F + 0.02), 0.03 + 0.09 * glow, 0.5, 0.4);
      for (const z of [8.2, 12.6]) p.line([[-9.5, F + 0.04, z], [9.5, F + 0.04, z]], SH.edge, 0.6);
      for (const x of [-9.5, 9.5]) { p.line([[x, F + 0.04, 3.5], [x * 0.68, F + 0.04, 6.6]], 0.5, 0.4); p.line([[x, F + 0.04, 17.5], [x * 0.68, F + 0.04, 15.5]], 0.5, 0.4); }
      if (glow > 0.3) p.dot([0, F + 0.05, 16.4], 0.8 + 0.15 * Math.sin(t * 5), glow);
    }
    // the door, hinged along its foot: a frame, a dark window and a bar handle
    p.push();
    p.rotate("x", -open * 1.42, [0, D, 2.6]);
    p.face(quad(-10.6, 10.6, 2.6, 18.4, F + 0.5), 0.14, SH.edge, 0.6);
    p.face(quad(-7.4, 7.4, 5.6, 14.4, F + 0.53), 0.035, SH.edge, 0.5);
    p.line([[-7.4, F + 0.56, 16.6], [7.4, F + 0.56, 16.6]], SH.edge, 1.3);
    p.pop();
    const b = seg(h, 0.72, 1);
    if (b > 0) badge(p, [W + 1, -D, H + 7], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
