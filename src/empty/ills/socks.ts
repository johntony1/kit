// No pairs found: two socks that do not match, one striped and one spotted. Hover and they lean apart; a question mark badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// a sock's outline in [x, z]: cuff at the top, toe out to the right
const SOCK: [number, number][] = [[-4.4, 25], [4.4, 25], [4.4, 11.5], [8.6, 9.8], [12.2, 7.6], [13.4, 4.6], [12.4, 1.6], [9.4, 0], [0.5, 0], [-2.8, 1], [-4.6, 3.6], [-4.8, 8], [-4.4, 12]];

// a round bright badge with a dark question mark, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.fillStyle = "#000"; g.lineWidth = r * 0.26; g.lineCap = "round";
    g.beginPath(); g.arc(x, y - r * 0.2, r * 0.3, Math.PI * 1.05, Math.PI * 2.45); g.lineTo(x, y + r * 0.22); g.stroke();
    g.beginPath(); g.arc(x, y + r * 0.56, r * 0.14, 0, Math.PI * 2); g.fill();
  });
}

function sock(p: Pen, x0: number, tall: number, lean: number, spotted: boolean) {
  p.push();
  p.translate(x0, 0, 0);
  p.rotate("y", lean, [4, 0, 0]);
  // the leg is stretched by `tall`, the foot stays as it is
  const at = (y: number) => SOCK.map(([x, z]) => [x, y, z > 11 ? z + tall : z] as V3);
  const top = 25 + tall, Y = 0.04;
  p.face(at(-1.8), SH.right, SH.edge, 0.5);
  p.face(at(0), spotted ? 0.2 : 0.24, SH.edge, 0.6);
  // the cuff: a brighter band with a cut under it
  p.face([[-4.4, Y, top - 4], [4.4, Y, top - 4], [4.4, Y, top], [-4.4, Y, top]], 0.4, 0);
  p.line([[-4.4, Y, top - 4], [4.4, Y, top - 4]], SH.edge, 0.7);
  if (spotted) {
    for (const [x, z] of [[-1.6, 17], [2, 13.6], [-1.4, 10], [2.6, 6.4], [-1.6, 4.4], [7.4, 6.6], [6.4, 2.4], [10.6, 4.2]]) p.dot([x, Y, z > 11 ? z + tall * 0.6 : z], 1.05, 0);
  } else {
    for (const z of [17.5, 14.5, 11.5]) p.line([[-4.6, Y, z + tall * 0.7], [4.4, Y, z + tall * 0.7]], SH.edge, 0.8);
    // the toe cap
    p.line([[9.2, Y, 9.4], [8.4, Y, 0]], SH.edge, 0.8);
  }
  p.pop();
}

export const socks: Illustration = {
  k: "socks", name: "Odd socks", title: "No pairs found", body: "Nothing matches yet. Try a different search or add more items to compare.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.4)), sway = h * Math.sin(t * 2.6) * 0.03;
    p.translate(0, 0, -14.5);
    p.shadow(0, 1, 26, 11, 0.1);
    p.rotate("z", -0.6); // turned to face us
    p.translate(-4, 0, 0);
    sock(p, 6.5, 2.5, 0.2 * k + sway, true);
    sock(p, -11.5, -1.5, -0.2 * k - sway, false);
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [5, 0, 37], 4.8 * pop);
    }
  },
};
