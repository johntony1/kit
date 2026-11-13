// No bonds held: a stack of bond certificates, the top one with a big rosette seal. Hover and the top certificate lifts and tips up toward you, and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 13, Y = 9.5, ST = 3.2; // half length, half width, height of the stack under the top sheet

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
/** the printed top of a certificate at height z: a double border, lines of text and the seal */
function sheet(p: Pen, z: number) {
  p.box(-X, -Y, z, X * 2, Y * 2, 0.7, { top: 0.2, left: 0.14, right: 0.07, lw: 0.55 });
  const Z = z + 0.73;
  const rect = (i: number): V3[] => [[-X + i, -Y + i, Z], [X - i, -Y + i, Z], [X - i, Y - i, Z], [-X + i, Y - i, Z], [-X + i, -Y + i, Z]];
  p.line(rect(1.3), SH.edge, 0.55);
  // a title bar and lines of text toward the back
  p.face([[-7, -Y + 3.6, Z], [7, -Y + 3.6, Z], [7, -Y + 5.2, Z], [-7, -Y + 5.2, Z]], 0.03, 0);
  for (const y of [0, 3.4]) p.line([[0, y, Z], [9.5, y, Z]], SH.edge, 0.8);
  // the rosette seal near the front left corner: a bright scalloped disc with a dark ring
  const cx = -7, cy = 3.4;
  const ros = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 3.9 : 4.6; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, Z + 0.02] as V3; });
  p.face(ros, 0.42, 0);
  p.line([...ros, ros[0]], SH.edge, 0.6);
  const ring = Array.from({ length: 29 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 2.6, Z + 0.04] as V3; });
  p.line(ring, SH.edge, 0.75);
  // two ribbon tails from the seal, over the front edge
  p.face([[cx - 1.8, cy + 3.6, Z + 0.03], [cx - 0.4, cy + 4.1, Z + 0.03], [cx - 1.4, Y + 1.6, Z + 0.03], [cx - 3, Y + 1, Z + 0.03]], 0.3, SH.edge, 0.55);
  p.face([[cx + 0.4, cy + 4.1, Z + 0.03], [cx + 1.8, cy + 3.6, Z + 0.03], [cx + 3, Y + 1, Z + 0.03], [cx + 1.4, Y + 1.6, Z + 0.03]], 0.3, SH.edge, 0.55);
}

export const bonds: Illustration = {
  k: "bonds", name: "Bonds", title: "No bonds held", body: "Buy a bond and its value, rate and maturity date will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(clamp(h / 0.7)), bob = h * Math.sin(t * 2.4) * 0.3;
    p.translate(0, 0, -6);
    p.scale(1.08);
    p.shadow(0, 0, 30, 15, 0.12);
    p.rotate("z", -0.3);
    // the stack under it, each sheet a little off true
    for (const i of [0, 1]) {
      p.push();
      p.box(-X, -Y, i * (ST / 2), X * 2, Y * 2, ST / 2, { top: 0.16, left: 0.1, right: 0.065, lw: 0.55 });
      p.line([[-X, Y + 0.03, i * (ST / 2) + ST / 4], [X, Y + 0.03, i * (ST / 2) + ST / 4], [X + 0.03, -Y, i * (ST / 2) + ST / 4]], SH.edge, 0.4);
      p.pop();
    }
    // the top certificate: lifts and tips up on its back edge
    p.push();
    p.translate(0, 0, 1.5 * k + bob);
    p.rotate("x", -0.75 * k, [0, Y, ST]);
    sheet(p, ST);
    p.pop();
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) badge(p, [11, -12, 17], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
