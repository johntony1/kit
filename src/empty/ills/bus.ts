// No bus routes: a city bus short of its stop. Hover and it pulls up to the stop sign and its doors slide open.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// a thin solid part (a rail, a pole): bright in the dot styles, a plain stroke in line art
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const WR = 3.2, Y = 5.6; // wheel radius, the near side

function wheel(p: Pen, x: number, a: number) {
  const y = Y + 0.5;
  p.ringV("y", [x, y, WR], WR, 0.1);
  p.ringV("y", [x, y + 0.02, WR], WR - 0.2, 0, SH.edge, 0.7);
  p.ringV("y", [x, y + 0.04, WR], 1.8, 0.26);
  for (let i = 0; i < 2; i++) { const u = a + (i * Math.PI) / 2; p.line([[x + Math.cos(u) * 1.7, y + 0.06, WR + Math.sin(u) * 1.7], [x - Math.cos(u) * 1.7, y + 0.06, WR - Math.sin(u) * 1.7]], SH.edge, 0.5); }
}
const arch = (p: Pen, x: number) => p.clear(Array.from({ length: 13 }, (_, i) => { const u = (Math.PI * i) / 12; return [x + Math.cos(u) * (WR + 0.8), Y + 0.03, WR + Math.sin(u) * (WR + 0.5)] as V3; }));
const rect = (x0: number, x1: number, z0: number, z1: number): V3[] => [[x0, Y + 0.03, z0], [x1, Y + 0.03, z0], [x1, Y + 0.03, z1], [x0, Y + 0.03, z1]];

export const bus: Illustration = {
  k: "bus", name: "Bus", title: "No bus routes", body: "Save a route or a stop and its next departures will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(Math.min(1, h / 0.6)), d = ease(Math.min(1, Math.max(0, (h - 0.6) / 0.4)));
    const back = 6 * (1 - k);
    p.translate(0.5, 0, -12.5);
    p.shadow(-back * 0.5, 0, 32, 12, 0.12);
    // the stop behind it: a pole with a round sign, showing over the roof
    const sx = 8, sy = -9.5;
    rod(p, [[sx, sy, 0], [sx, sy, 27]], 0.9);
    p.ringV("y", [sx, sy, 30], 3.6, d > 0.5 ? 1 : 0.2, SH.edge, 0.6);
    p.line([[sx - 1.9, sy + 0.03, 30], [sx + 1.9, sy + 0.03, 30]], SH.edge, 1.2);
    p.push();
    p.translate(-back, 0, 0);
    // the body, with a cooler box on the roof
    p.box(-17, -Y, 2.4, 33, Y * 2, 15.8, { top: 0.22, left: 0.2, right: 0.075, lw: 0.6 });
    p.line([[-17, Y + 0.03, 18.2], [16, Y + 0.03, 18.2], [16.03, -Y, 18.2]], SH.edge, 0.6);
    p.box(-9, -3, 18.2, 12, 6, 1.2, { top: 0.24, left: 0.13, right: 0.07 });
    // the front: a windscreen, a route sign over it, two headlights
    p.clear([[16.03, -Y + 0.9, 9], [16.03, Y - 0.9, 9], [16.03, Y - 0.9, 15], [16.03, -Y + 0.9, 15]]);
    p.face([[16.04, -Y + 1.6, 15.8], [16.04, Y - 1.6, 15.8], [16.04, Y - 1.6, 17.4], [16.04, -Y + 1.6, 17.4]], 0.3, SH.edge, 0.4);
    p.dot([16.05, Y - 1.4, 5.4], 0.9, 1); p.dot([16.05, -Y + 1.4, 5.4], 0.9, 1);
    // the side: four windows, a stripe, the doors
    for (let i = 0; i < 4; i++) p.clear(rect(-15.6 + i * 5.7, -15.6 + i * 5.7 + 4.7, 10.2, 15.6));
    p.line([[-17, Y + 0.04, 8], [7.6, Y + 0.04, 8]], SH.edge, 0.8);
    const dx0 = 8.2, dx1 = 14.4, dm = (dx0 + dx1) / 2;
    p.line([...rect(dx0, dx1, 3.2, 15.9), [dx0, Y + 0.03, 3.2]], SH.edge, 0.6);
    for (const [a, b] of [[dx0 + 0.6, dm - 0.4], [dm + 0.4, dx1 - 0.6]]) p.clear(rect(a, b, 8.6, 15.2));
    p.line([[dm, Y + 0.04, 3.2], [dm, Y + 0.04, 15.9]], SH.edge, 0.5);
    if (d > 0.02) p.clear(rect(dm - (dm - dx0 - 0.3) * d, dm + (dx1 - dm - 0.3) * d, 3.4, 15.7));
    arch(p, -10); arch(p, 3);
    const a = (back / WR);
    wheel(p, -10, a); wheel(p, 3, a);
    p.pop();
  },
};
