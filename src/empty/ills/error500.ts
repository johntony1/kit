// Internal server error: a stack of three server units with a warning sign above it. Hover and the top unit jolts loose and rattles, smoke rises and the sign pulses.
import { SH, type Illustration, type Pen } from "../dots";

const L = 28, DP = 15, U = 7; // a unit's length, depth and height

function unit(p: Pen, z: number, lit: number) {
  p.box(-L / 2, -DP / 2, z, L, DP, U, { top: 0.3, left: 0.22, right: 0.065, edge: 0 });
  const y = DP / 2 + 0.03;
  for (let i = 0; i < 3; i++) p.line([[-L / 2 + 3 + i * 2.8, y, z + 1.8], [-L / 2 + 3 + i * 2.8, y, z + U - 1.8]], SH.edge, 1.1); // vents
  p.dot([7.4, y, z + U / 2], 1.4, 0);
  p.dot([11.2, y, z + U / 2], 1.4, lit);
  p.line([[-L / 2, y, z + U], [L / 2, y, z + U], [L / 2 + 0.03, -DP / 2, z + U]], SH.edge, 0.7);
  p.line([[L / 2, y, z], [L / 2, y, z + U]], SH.edge, 0.5);
}
// the dark gap between two units
const gap = (p: Pen, z: number) => p.box(-L / 2 + 1.2, -DP / 2 + 1.2, z, L - 2.4, DP - 2.4, 2.2, { top: 0.03, left: 0.03, right: 0.03, edge: 0 });

export const error500: Illustration = {
  k: "error500", name: "Server error", title: "Internal server error", body: "Something broke on our side. Try again in a moment while we look into it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 30, 14, 0.12);
    p.push();
    p.rotate("z", -0.4);
    unit(p, 0, 0);
    gap(p, U);
    unit(p, U + 2.2, 0);
    gap(p, U * 2 + 2.2);
    // the top unit: on hover one end is thrown up and it slides off its seat, rattling
    const z = U * 2 + 4.4, a = h * (0.13 + Math.sin(t * 22) * 0.02);
    p.push();
    p.translate(-1.5 * h, 1.6 * h, 0.4 * h);
    p.rotate("y", -a, [-L / 2, 0, z]);
    unit(p, z, h > 0.05 && Math.sin(t * 9) > 0 ? 1 : 0);
    p.pop();
    // smoke out of the open end
    for (let i = 0; i < 5; i++) {
      const u = (t * 0.5 + i / 5) % 1;
      p.dot([11 + Math.sin(i * 2.4 + u * 3) * 2.5, 0, z + 1 + u * 13], 1.5 - u * 0.7, h * Math.sin(u * Math.PI));
    }
    p.pop();
    // the warning sign: a bright triangle with a dark mark, flat to the screen
    const [x, y] = p.pt([9, -9, 39]);
    const r = 7.2 * (1 + h * 0.1 * Math.sin(t * 6));
    p.screen((g) => {
      g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineJoin = "round"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.95, y + r * 0.62); g.lineTo(x - r * 0.95, y + r * 0.62); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = "#000"; g.lineCap = "round"; g.lineWidth = r * 0.2;
      g.beginPath(); g.moveTo(x, y - r * 0.42); g.lineTo(x, y + r * 0.08); g.stroke();
      g.fillStyle = "#000"; g.beginPath(); g.arc(x, y + r * 0.37, r * 0.12, 0, Math.PI * 2); g.fill();
    });
  },
};
