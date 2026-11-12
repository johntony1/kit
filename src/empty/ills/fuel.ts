// No fill ups logged: a fuel pump with its nozzle hung up. Hover and the display counts up bar by bar and a fuel drop pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// a thin solid part (a rail, a pole): bright in the dot styles, a plain stroke in line art
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const YF = 5, XR = 7.5; // the front and the right side of the pump

// a round bright badge with a dark drop, flat to the screen
function drop(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    const s = r * 0.42;
    g.fillStyle = "#000"; g.beginPath();
    g.moveTo(x, y - s * 1.5); g.bezierCurveTo(x + s * 0.4, y - s * 0.6, x + s, y - s * 0.1, x + s, y + s * 0.5);
    g.arc(x, y + s * 0.5, s, 0, Math.PI); g.bezierCurveTo(x - s, y - s * 0.1, x - s * 0.4, y - s * 0.6, x, y - s * 1.5); g.fill();
  });
}

export const fuel: Illustration = {
  k: "fuel", name: "Fuel pump", title: "No fill ups logged", body: "Log a fill up to track what you spend on fuel and how far each tank takes you.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-2, 0, -15);
    p.scale(1.08);
    p.shadow(1, 0, 23, 11, 0.12);
    // the island it stands on, the cabinet, its cap
    p.box(-10, -7, 0, 21, 14, 1.6, { top: 0.2, left: 0.12, right: 0.065 });
    p.box(-XR, -YF, 1.6, XR * 2, YF * 2, 24, { top: 0.22, left: 0.22, right: 0.075, lw: 0.6 });
    p.box(-XR - 0.7, -YF - 0.7, 25.6, XR * 2 + 1.4, YF * 2 + 1.4, 2, { top: 0.24, left: 0.22, right: 0.09, lw: 0.6 });
    p.line([[-XR, YF + 0.03, 25.6], [XR, YF + 0.03, 25.6]], SH.edge, 0.6);
    p.line([[-XR - 0.7, YF + 0.73, 27.6], [XR + 0.7, YF + 0.73, 27.6], [XR + 0.73, -YF - 0.7, 27.6]], SH.edge, 0.6);
    // the display: dark, with four bars that count up on hover
    const y = YF + 0.03;
    p.clear([[-5.6, y, 17.4], [5.6, y, 17.4], [5.6, y, 23.4], [-5.6, y, 23.4]]);
    for (let i = 0; i < 4; i++) {
      const k = Math.min(1, Math.max(0, (h - 0.08 - i * 0.15) / 0.14));
      const x = -4.6 + i * 2.5;
      if (k > 0) p.face([[x, y + 0.02, 18.4], [x + 1.7, y + 0.02, 18.4], [x + 1.7, y + 0.02, 18.4 + 4 * k], [x, y + 0.02, 18.4 + 4 * k]], 1, 0);
    }
    // under it: a grade button row and a panel line
    for (const x of [-4, 0, 4]) p.dot([x, y + 0.02, 13.6], 1.1, 0);
    p.line([[-5.6, y + 0.01, 9.6], [5.6, y + 0.01, 9.6]], SH.edge, 0.8);
    // the nozzle in its cradle on the side, and the hose looping down to it
    const sway = h * 0.5 * Math.sin(t * 2.4);
    const hose: V3[] = Array.from({ length: 17 }, (_, i) => {
      const q = i / 16, out = Math.sin(q * Math.PI) * 6.5;
      return [XR + 0.4 + out, 0.5 + sway * Math.sin(q * Math.PI), 23.5 - 18 * Math.sin(q * Math.PI * 0.5) * (q < 0.62 ? 1 : 1) + (q > 0.62 ? (q - 0.62) * 26 : 0)] as V3;
    });
    rod(p, hose, 1.2);
    p.box(XR, -1.2, 21.6, 1.6, 3.4, 2.8, { top: 0.24, left: 0.2, right: 0.14 });
    p.box(XR, -1.3, 13.4, 2.6, 3.6, 4.6, { top: 0.26, left: 0.22, right: 0.16, lw: 0.6 });
    p.box(XR + 2.6, -0.5, 15.8, 2.4, 2, 1.4, { top: 0.26, left: 0.22, right: 0.16 });
    // logged: a fuel drop pops in
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) drop(p, [-10, -4, 33], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
