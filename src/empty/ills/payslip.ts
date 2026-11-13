// No payslips yet: a pay slip with tractor holes down both sides and a perforated stub at the foot. Hover and the stub tears away, its total lights up, and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 10, Y0 = -13, Y1 = 13, YP = 5.5, T = 0.8; // half width, back and front edges, perforation, thickness

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
/** a run of paper from y0 to y1 with its tractor holes */
function paper(p: Pen, y0: number, y1: number, z: number) {
  p.box(-X, y0, z, X * 2, y1 - y0, T, { top: 0.2, left: 0.13, right: 0.065, lw: 0.6 });
  const Z = z + T + 0.02;
  for (let y = y0 + 1.4; y < y1 - 0.6; y += 2.4) { p.disc(-X + 1.3, y, Z, 0.55, 0.02); p.disc(X - 1.3, y, Z, 0.55, 0.02); }
  p.line([[-X + 2.6, y0 + 0.3, Z], [-X + 2.6, y1 - 0.3, Z]], SH.edge, 0.45);
  p.line([[X - 2.6, y0 + 0.3, Z], [X - 2.6, y1 - 0.3, Z]], SH.edge, 0.45);
}

export const payslip: Illustration = {
  k: "payslip", name: "Payslip", title: "No payslips yet", body: "Your payslips will be filed here each payday, ready to view or download.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(clamp(h / 0.6)), lit = clamp((h - 0.45) / 0.3), bob = h * Math.sin(t * 2.6) * 0.3;
    p.translate(0, 0, -5);
    p.shadow(0, 0, 26, 13, 0.12);
    p.rotate("z", -0.35);
    // a second slip under it, just showing
    p.push(); p.rotate("z", 0.06);
    p.box(-X, Y0, 0, X * 2, Y1 - Y0, T, { top: 0.14, left: 0.12, right: 0.065, lw: 0.55 });
    p.pop();
    // the slip: a dark header with a bright mark, rows of figures
    paper(p, Y0, YP, T);
    const Z = T * 2 + 0.03;
    p.face([[-X + 3.4, Y0 + 2, Z], [X - 3.4, Y0 + 2, Z], [X - 3.4, Y0 + 6, Z], [-X + 3.4, Y0 + 6, Z]], 0.03, 0);
    p.dot([-X + 5.4, Y0 + 4, Z], 1.2, 1);
    for (const y of [-4.4, -1.4, 1.6]) {
      p.line([[-X + 3.6, y, Z], [0.5, y, Z]], SH.edge, 0.75);
      p.line([[3.2, y, Z], [X - 3.6, y, Z]], SH.edge, 0.75);
    }
    // the perforation: a row of dark nicks
    for (let x = -X + 0.6; x < X; x += 1.5) p.line([[x, YP + 0.05, Z], [x + 0.7, YP + 0.05, Z]], SH.edge, 0.7);
    // the stub: tears free, slides forward and tips a little, its total bar lighting up
    p.push();
    p.translate(0, 4 * k, 0.6 * k + bob);
    p.rotate("z", 0.12 * k, [0, YP, 0]);
    paper(p, YP + 0.15, Y1, T);
    const bar: V3[] = [[-X + 3.6, YP + 2.6, Z], [X - 3.6, YP + 2.6, Z], [X - 3.6, YP + 5.6, Z], [-X + 3.6, YP + 5.6, Z]];
    p.face(bar, lit > 0.5 ? 0.42 : 0.03, SH.edge, 0.65);
    p.line([[-X + 5, YP + 4.1, Z + 0.02], [-X + 8.5, YP + 4.1, Z + 0.02]], lit > 0.5 ? SH.edge : 0.3, 0.8);
    p.pop();
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) badge(p, [10, -14, 9], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
