// School bus: a school bus with a long bonnet, waiting at the kerb. Hover and its stop sign swings out from the side while the roof lights flash in turn.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const WR = 3.3, Y = 5.8; // wheel radius, the near side
const XB = 7, XF = 15.5; // where the cabin ends and where the bonnet ends

function wheel(p: Pen, x: number) {
  const y = Y + 0.5;
  p.ringV("y", [x, y, WR], WR, 0.2, 0);
  p.ringV("y", [x, y + 0.04, WR], 1.5, 0.02, 0);
}
const arch = (p: Pen, x: number) => p.clear(Array.from({ length: 13 }, (_, i) => { const u = (Math.PI * i) / 12; return [x + Math.cos(u) * (WR + 0.9), Y + 0.03, WR + Math.sin(u) * (WR + 0.6)] as V3; }));
const rect = (x0: number, x1: number, z0: number, z1: number): V3[] => [[x0, Y + 0.03, z0], [x1, Y + 0.03, z0], [x1, Y + 0.03, z1], [x0, Y + 0.03, z1]];

export const schoolbus: Illustration = {
  k: "schoolbus", name: "School bus", title: "No classes today", body: "Nothing is on the timetable today. Your next class will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h / 0.7));
    p.translate(1, 0, -11);
    p.scale(1.08);
    p.shadow(-1, 0, 33, 13, 0.12);
    // the cabin: a lit roof, a dense side to carry the windows, a sparse front
    p.box(-18, -Y, 2.4, XB + 18, Y * 2, 16.4, { top: 0.3, left: 0.2, right: 0.075, edge: 0 });
    // the bonnet, low in front of it, with two headlights
    p.box(XB, -Y, 2.4, XF - XB, Y * 2, 7.8, { top: 0.3, left: 0.2, right: 0.09, edge: 0 });
    p.line([[-18, Y + 0.03, 18.8], [XB, Y + 0.03, 18.8], [XB + 0.03, -Y, 18.8]], SH.edge, 0.5);
    p.line([[XB, Y + 0.03, 10.2], [XF, Y + 0.03, 10.2], [XF + 0.03, -Y, 10.2]], SH.edge, 0.5);
    p.dot([XF + 0.05, Y - 1.5, 7.4], 1, 1); p.dot([XF + 0.05, -Y + 1.5, 7.4], 1, 1);
    // the windscreen over the bonnet
    p.clear([[XB + 0.03, -Y + 0.9, 11.4], [XB + 0.03, Y - 0.9, 11.4], [XB + 0.03, Y - 0.9, 16.4], [XB + 0.03, -Y + 0.9, 16.4]]);
    // the side: a row of windows, a stripe under them, the door by the front
    for (let i = 0; i < 4; i++) p.clear(rect(-16.6 + i * 4.7, -16.6 + i * 4.7 + 3.7, 11.6, 17));
    p.clear(rect(2.8, 5.8, 11.6, 17));
    p.line([[2.4, Y + 0.04, 3.4], [2.4, Y + 0.04, 17.6], [6.2, Y + 0.04, 17.6], [6.2, Y + 0.04, 3.4]], SH.edge, 0.4);
    p.line([[-18, Y + 0.04, 9.8], [2.4, Y + 0.04, 9.8]], SH.edge, 0.6);
    arch(p, -11); arch(p, 11);
    wheel(p, -11); wheel(p, 11);
    // the roof lights: they flash one after the other while it is stopped
    const on = h > 0.5 ? Math.floor(t * 3) % 2 : -1;
    [-Y + 1.6, Y - 1.6].forEach((y, i) => p.dot([XB + 0.06, y, 17.7], 0.95, on === i ? 1 : 0.02));
    if (on >= 0) {
      const [x, y] = p.pt([XB + 1.5, on ? Y - 1.6 : -Y + 1.6, 19.6]);
      p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, 1.5, 0, Math.PI * 2); g.fill(); });
    }
    // the stop sign: flat against the side at rest, swung out square to it on hover
    p.push();
    p.rotate("z", (k * Math.PI) / 2, [-3.4, Y, 0]);
    const oct: V3[] = Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + (i * Math.PI) / 4; return [-7 + Math.cos(a) * 3, Y + 0.25, 6.4 + Math.sin(a) * 3] as V3; });
    p.face([[-3.4, Y + 0.2, 5.9], [-3.4, Y + 0.2, 6.9], [-5, Y + 0.2, 6.9], [-5, Y + 0.2, 5.9]], 0.3, 0);
    p.clear(oct.map(([x, y, z]) => [-7 + (x + 7) * 1.25, y - 0.03, 6.4 + (z - 6.4) * 1.25] as V3));
    p.face(oct, 0.42, 0);
    p.line([[-8.6, Y + 0.3, 6.4], [-5.4, Y + 0.3, 6.4]], SH.edge, 0.9);
    p.pop();
  },
};
