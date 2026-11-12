// No sizes saved: a T shirt held up flat. Hover and a measuring line draws across the chest; a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// a round bright badge with a dark tick, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.52, y - r * 0.36); g.stroke();
  });
}

// the shirt's outline in [x, z], from the right of the collar round to the left
const HALF: [number, number][] = [[3.4, 28], [9, 27.2], [16.5, 21.5], [13.4, 16.6], [9.2, 19.6], [9.2, 3.5]];
const NECK: [number, number][] = [[-2.3, 26], [0, 25.2], [2.3, 26]];
const OUT: [number, number][] = [...HALF, ...HALF.slice().reverse().map(([x, z]) => [-x, z] as [number, number]), ...NECK];

export const tshirt: Illustration = {
  k: "tshirt", name: "T shirt", title: "No sizes saved", body: "Save your measurements once and every size will be picked for you.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15 + h * (1.5 + 0.5 * Math.sin(t * 2.2)));
    p.shadow(0, 0, 22 - h * 2, 9, 0.1);
    p.rotate("z", -0.6); // turned to face us
    const at = (y: number) => OUT.map(([x, z]) => [x, y, z] as V3);
    // the back of the shirt, a step behind, then the lit front
    p.face(at(-1.6), SH.right, SH.edge, 0.5);
    p.face(at(0), 0.2, SH.edge, 0.6);
    const Y = 0.04;
    // the collar band, the sleeve seams and the hem
    p.line([[-3.4, Y, 28], [-2.6, Y, 24.9], [0, Y, 23.8], [2.6, Y, 24.9], [3.4, Y, 28]], SH.edge, 0.6);
    p.line([[9, Y, 27.2], [9.2, Y, 19.6]], 0.6, 0.5); p.line([[-9, Y, 27.2], [-9.2, Y, 19.6]], 0.6, 0.5);
    p.line([[14.2, Y, 17.8], [17.2, Y, 22.6]].map(([x, y, z]) => [x - 0.9, y, z - 0.2] as V3), 0.6, 0.45);
    p.line([[-14.2, Y, 17.8], [-17.2, Y, 22.6]].map(([x, y, z]) => [x + 0.9, y, z - 0.2] as V3), 0.6, 0.45);
    p.line([[-9.2, Y, 5], [9.2, Y, 5]], 0.6, 0.45);
    // the measuring line across the chest: it grows from the middle, with end stops and ticks
    const k = ease(Math.min(1, h * 1.5));
    if (k > 0.02) {
      const w = 8.4 * k, z = 15;
      p.line([[-w, Y, z], [w, Y, z]], SH.edge, 0.9);
      p.line([[-w, Y, z - 1.8], [-w, Y, z + 1.8]], SH.edge, 0.9); p.line([[w, Y, z - 1.8], [w, Y, z + 1.8]], SH.edge, 0.9);
      for (let x = -6; x <= 6; x += 2) if (Math.abs(x) < w - 0.6 && x !== 0) p.line([[x, Y, z], [x, Y, z - 1]], SH.edge, 0.5);
    }
    // the tick badge pops in once the line is drawn
    const b = Math.max(0, (h - 0.65) / 0.35);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [17, 2, 32], 4.6 * pop);
    }
  },
};
