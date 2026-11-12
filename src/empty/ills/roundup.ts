// Round ups: a large coin on its edge with an up arrow struck in it, and loose change lying beside it. Hover and the small coins hop into a neat stack; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// a round bright badge with a dark plus, flat to the screen
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
const pop = (b: number) => (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
const arc = (cx: number, cy: number, z: number, r: number, a0: number, a1: number): V3[] =>
  Array.from({ length: 25 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 24; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });
const R = 10.5, CZ = 11.5; // the big coin
const SR = 4.2, SH2 = 1.9; // the small change
const LOOSE: [number, number][] = [[10, -9], [15, 1], [5, 10]], HOME: [number, number] = [12, 1];

export const roundup: Illustration = {
  k: "roundup", name: "Round ups", title: "No round ups yet", body: "Turn on round ups and the spare change from each purchase will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-3, 0, -11);
    p.shadow(-5, -2, 15, 7, 0.12);
    p.shadow(11, 1, 13, 7, 0.1);
    // the big coin, turned to face us
    p.push();
    p.translate(-6, -3, 0);
    p.rotate("z", -0.5);
    for (let i = 0; i <= 5; i++) p.ringV("y", [0, -1.4 + i * 0.45, CZ], R, i ? SH.right : 0.12, 0);
    p.ringV("y", [0, 1.1, CZ], R, 0.22, 0);
    p.ringV("y", [0, 1.15, CZ], R - 2.2, 0, SH.edge, 0.8);
    const lift = 1.1 * Math.sin(Math.PI * clamp(h / 0.5)), y = 1.16;
    p.line([[0, y, CZ - 4.6 + lift], [0, y, CZ + 4.4 + lift]], SH.edge, 1.3);
    p.line([[-3.4, y, CZ + 1.2 + lift], [0, y, CZ + 4.8 + lift], [3.4, y, CZ + 1.2 + lift]], SH.edge, 1.3);
    p.pop();
    // the small change: lying loose at rest, hopping into a stack on hover
    LOOSE.forEach(([x0, y0], j) => {
      const k = ease(clamp((h - 0.06 - j * 0.2) / 0.36));
      const x = x0 + (HOME[0] - x0) * k, y = y0 + (HOME[1] - y0) * k, z = j * SH2 * k + 9 * Math.sin(Math.PI * k);
      p.cylinder(x, y, z, SR, SH2, { side: 0.12, top: 0.22 });
      p.line(arc(x, y, z, SR, -Math.PI / 4, (Math.PI * 3) / 4), SH.edge, 0.5);
      p.line(arc(x, y, z + SH2 + 0.02, SR - 1.3, 0, Math.PI * 2), SH.edge, 0.55);
    });
    const b = clamp((h - 0.76) / 0.24);
    if (b > 0) badge(p, [HOME[0] + 3, HOME[1] - 3, 3 * SH2 + 7], 4.6 * pop(b));
  },
};
