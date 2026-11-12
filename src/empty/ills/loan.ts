// No loans yet: a loan agreement, a few sheets deep, with a pen resting at the signature line and coins beside it. Hover and the pen signs; a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 10, D = 13.5; // half width and half depth of a sheet

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.36); g.stroke();
  });
}
// the signature: a scrawl along the line, x from -6 to 5
const sign = (u: number): V3 => { const x = -6 + 11 * u; return [x, 8.4 - Math.sin(u * 15) * 1.5 * (1 - u * 0.5) - 1.2, 2.05]; };

export const loan: Illustration = {
  k: "loan", name: "Loan papers", title: "No loans yet", body: "When you take out a loan, the agreement and what is left to repay will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-2, -1, -3);
    p.shadow(1, 1, 30, 15, 0.1);
    // three sheets, each a little askew
    const sheet = (z: number, rot: number, top: number) => {
      p.push(); p.rotate("z", rot);
      p.box(-W, -D, z, W * 2, D * 2, 0.65, { top, left: 0.12, right: 0.065, lw: 0.5 });
      p.pop();
    };
    sheet(0, 0.09, 0.14); sheet(0.65, -0.06, 0.16); sheet(1.3, 0, 0.2);
    const z = 2;
    // the heading, the amount box, the clauses
    p.line([[-7, -10.4, z], [-1, -10.4, z]], SH.edge, 1.1);
    p.face([[2.4, -11.6, z], [7.4, -11.6, z], [7.4, -8.4, z], [2.4, -8.4, z]], 0.32, SH.edge, 0.5);
    for (let i = 0; i < 4; i++) p.line([[-7, -5.6 + i * 2.5, z], [i === 3 ? 2 : 7, -5.6 + i * 2.5, z]], 0.6, 0.55);
    // the signature line with its cross
    p.line([[-7, 9.2, z], [7, 9.2, z]], SH.edge, 0.6);
    p.line([[-7.6, 6.2, z], [-6.4, 7.6, z]], SH.edge, 0.6); p.line([[-7.6, 7.6, z], [-6.4, 6.2, z]], SH.edge, 0.6);
    // coins beside the papers
    for (let i = 0; i < 3; i++) p.cylinder(15.5 + (i % 2) * 0.4, -6 - (i % 2) * 0.3, i * 1.5, 4.2, 1.5, { side: 0.12, top: 0.22 });
    p.disc(15.5, -6, 4.52, 2.7, 0, SH.edge);
    // the pen writes the signature
    const k = ease(clamp((h - 0.05) / 0.7));
    const n = Math.max(1, Math.round(k * 40));
    if (k > 0) p.line(Array.from({ length: n + 1 }, (_, i) => sign((i / n) * k)), SH.edge, 0.8);
    const tip = sign(k);
    const lift = h < 0.05 ? 0 : h > 0.8 ? 2.5 * ease(clamp((h - 0.8) / 0.2)) : 0;
    p.push();
    p.translate(tip[0], tip[1], tip[2] + lift);
    p.rotate("y", 0.5); p.rotate("x", 0.45);
    p.face([[0, 0, 0], [-0.75, 0.75, 2.4], [0.75, 0.75, 2.4]], 0.5, SH.edge, 0.5);
    p.face([[0, 0, 0], [0.75, 0.75, 2.4], [0.75, -0.75, 2.4]], 0.3, SH.edge, 0.5);
    p.box(-0.85, -0.85, 2.4, 1.7, 1.7, 13, { top: 0.3, left: 0.26, right: 0.1 });
    p.box(-0.85, -0.85, 12.6, 1.7, 1.7, 2.8, { top: 0.4, left: 0.45, right: 0.2 });
    p.pop();
    const b = clamp((h - 0.75) / 0.25);
    if (b > 0) tick(p, [7.5, 10, 8], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
