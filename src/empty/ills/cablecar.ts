// Cable car: a gondola hanging from its cable beside a pylon. It glides back and forth along the cable, swaying a little as it turns.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
const P = 3.6; // seconds per loop
const ZC = 30, PX = -22; // cable height at the cabin, the pylon

export const cablecar: Illustration = {
  k: "cablecar", name: "Cable car", title: "No lifts running", body: "The lifts are stopped for now. Running times will show here once they start.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = ((t / P) % 1) * Math.PI * 2, cx = 5 + 7 * Math.sin(w), sway = 0.08 * Math.cos(w);
    p.translate(0, 0, -20);
    p.scale(0.96);
    p.shadow(PX, 0, 8, 4, 0.1);
    p.shadow(cx, 0, 20, 10, 0.12);
    // the pylon: a post and a cross arm the cable runs over
    p.box(PX - 1.2, -1.2, 0, 2.4, 2.4, ZC + 1, { top: 0.22, left: 0.2, right: 0.08, lw: 0.5 });
    p.box(PX - 1.6, -4, ZC + 1, 3.2, 8, 1.2, { top: 0.24, left: 0.16, right: 0.08, lw: 0.5 });
    // the cable, pulled down a little by the cabin
    rod(p, [[-32, 0, ZC + 0.6], [PX, 0, ZC + 2.4], [cx, 0, ZC], [32, 0, ZC + 2]], 0.9);
    p.push();
    p.translate(cx, 0, 0);
    p.rotate("y", sway, [0, 0, ZC]);
    p.scale(1.32, [0, 0, ZC]);
    // the cabin: windows on both faces, a door line, a stripe
    const Y = 5.2, Z0 = 7.5, Z1 = 18.5;
    p.box(-7.5, -Y, Z0, 15, 2 * Y, Z1 - Z0, { top: 0.22, left: 0.22, right: 0.075, lw: 0.6 });
    for (const [a, b] of [[-6.3, -0.6], [0.6, 6.3]]) p.clear([[a, Y + 0.03, 12.2], [b, Y + 0.03, 12.2], [b, Y + 0.03, 17.2], [a, Y + 0.03, 17.2]]);
    p.clear([[7.53, -Y + 1.1, 12.2], [7.53, Y - 1.1, 12.2], [7.53, Y - 1.1, 17.2], [7.53, -Y + 1.1, 17.2]]);
    p.line([[0, Y + 0.04, Z0 + 0.5], [0, Y + 0.04, 17.2]], SH.edge, 0.5);
    p.line([[-7.5, Y + 0.04, 10.4], [7.5, Y + 0.04, 10.4], [7.54, -Y, 10.4]], SH.edge, 0.7);
    p.box(-5.8, -3.8, Z1, 11.6, 7.6, 1, { top: 0.24, left: 0.14, right: 0.07, lw: 0.5 });
    // the hanger and the grip that rides the cable
    p.box(-0.7, -0.7, Z1 + 1, 1.4, 1.4, ZC - Z1 - 1.8, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    p.box(-3.4, -1, ZC - 0.9, 6.8, 2, 1.7, { top: 0.26, left: 0.2, right: 0.1, lw: 0.5 });
    for (const x of [-2, 2]) p.dot([x, 1.05, ZC], 0.55, 0);
    p.pop();
  },
};
