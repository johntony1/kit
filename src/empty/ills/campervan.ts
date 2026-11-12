// Camper van: a two tone camper with a split windscreen and a pop top roof. Hover and it rolls forward, then the roof tilts up on its canvas and the light inside comes on.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const WR = 3, Y = 5.5, X0 = -14, X1 = 13, ZW = 8.2, ZT = 15; // wheel radius, near side, tail, nose, waist, roof

function wheel(p: Pen, x: number, a: number) {
  const y = Y + 0.5;
  p.ringV("y", [x, y, WR], WR, 0.1);
  p.ringV("y", [x, y + 0.02, WR], WR - 0.2, 0, SH.edge, 0.7);
  p.ringV("y", [x, y + 0.04, WR], 1.7, 0.28);
  for (let i = 0; i < 2; i++) { const u = a + (i * Math.PI) / 2; p.line([[x + Math.cos(u) * 1.6, y + 0.06, WR + Math.sin(u) * 1.6], [x - Math.cos(u) * 1.6, y + 0.06, WR - Math.sin(u) * 1.6]], SH.edge, 0.5); }
}
const arch = (p: Pen, x: number) => p.clear(Array.from({ length: 13 }, (_, i) => { const u = (Math.PI * i) / 12; return [x + Math.cos(u) * (WR + 0.8), Y + 0.03, WR + Math.sin(u) * (WR + 0.5)] as V3; }));
const rect = (x0: number, x1: number, z0: number, z1: number): V3[] => [[x0, Y + 0.03, z0], [x1, Y + 0.03, z0], [x1, Y + 0.03, z1], [x0, Y + 0.03, z1]];

export const campervan: Illustration = {
  k: "campervan", name: "Camper van", title: "No road trips yet", body: "Plan a road trip and your stops will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(clamp(h / 0.5)), d = ease(clamp((h - 0.4) / 0.5));
    const back = 5 * (1 - k);
    p.translate(0.5, 0, -12);
    p.scale(1.14);
    p.shadow(-back * 0.5, 0, 28, 11, 0.12);
    p.push();
    p.translate(-back, 0, 0);
    // the body in two tones: a darker skirt, a lit upper half
    p.box(X0, -Y, 2.2, X1 - X0, 2 * Y, ZW - 2.2, { top: 0.2, left: 0.2, right: 0.07, lw: 0.6 });
    p.box(X0, -Y, ZW, X1 - X0, 2 * Y, ZT - ZW, { top: 0.2, left: 0.3, right: 0.11, lw: 0.6 });
    p.line([[X0, Y + 0.03, ZT], [X1, Y + 0.03, ZT], [X1 + 0.03, -Y, ZT]], SH.edge, 0.6);
    p.line([[X0, Y + 0.04, ZW], [X1, Y + 0.04, ZW], [X1 + 0.04, -Y, ZW]], SH.edge, 0.9);
    p.line([[X1 + 0.03, Y + 0.03, 2.2], [X1 + 0.03, Y + 0.03, ZT]], SH.edge, 0.6);
    // the front: a split windscreen, round headlights, a bumper
    for (const [a, b] of [[-Y + 0.8, -0.35], [0.35, Y - 0.8]]) p.clear([[X1 + 0.03, a, 9.6], [X1 + 0.03, b, 9.6], [X1 + 0.03, b, 13.8], [X1 + 0.03, a, 13.8]]);
    p.dot([X1 + 0.05, Y - 1.7, 5.9], 1.15, 1); p.dot([X1 + 0.05, -Y + 1.7, 5.9], 1.15, 1);
    p.line([[X1 + 0.05, -Y, 3.4], [X1 + 0.05, Y, 3.4]], SH.edge, 0.8);
    // the side: two cabin windows, the sliding door, the cab window
    for (const [a, b] of [[-12, -8.2], [-6.4, -2.6], [1.2, 4.6], [7.6, 11.4]]) p.clear(rect(a, b, 10, 13.4));
    p.line([[0, Y + 0.04, 3.2], [0, Y + 0.04, 14.4], [5.8, Y + 0.04, 14.4], [5.8, Y + 0.04, 3.2]], SH.edge, 0.5);
    arch(p, -8.5); arch(p, 8.2);
    const a = back / WR;
    wheel(p, -8.5, a); wheel(p, 8.2, a);
    // the pop top: hinged at the back, the front lifts on a canvas wedge
    const th = 0.52 * d, HX = -10.5, L = 20, YR = 4.5;
    if (d > 0.02) {
      const fx = HX + L * Math.cos(th), fz = ZT + L * Math.sin(th);
      p.face([[HX, YR, ZT], [HX + L, YR, ZT], [fx, YR, fz]], 0.1, SH.edge, 0.6);
      p.face([[HX + L, -YR, ZT], [HX + L, YR, ZT], [fx, YR, fz], [fx, -YR, fz]], 0.05, SH.edge, 0.6);
      // a mesh window in the canvas, lit once the roof is up
      if (d > 0.5) {
        const zt = (x: number) => ZT + (x - HX) * Math.tan(th) - 1.6, win: V3[] = [[1, YR + 0.03, ZT + 1.3], [6.2, YR + 0.03, ZT + 1.3], [6.2, YR + 0.03, zt(6.2)], [1, YR + 0.03, zt(1)]];
        p.face(win, h > 0.9 ? 1 : 0.3, SH.edge, 0.4);
      }
    }
    p.push();
    p.rotate("y", -th, [HX, 0, ZT]);
    p.box(HX, -YR, ZT, L, 2 * YR, 1.2, { top: 0.3, left: 0.2, right: 0.08, lw: 0.6 });
    p.pop();
    p.pop();
  },
};
