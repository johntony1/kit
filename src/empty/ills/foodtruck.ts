// No trucks nearby: a food truck with its serving hatch shut. Hover and the hatch lifts into a striped awning over a lit counter, and a plate slides out onto the shelf.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const WR = 3.5, Y = 6.5, F = Y + 0.03;
const quad = (x0: number, x1: number, z0: number, z1: number, y: number): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];

function wheel(p: Pen, x: number) {
  p.clear(Array.from({ length: 13 }, (_, i) => { const u = (Math.PI * i) / 12; return [x + Math.cos(u) * (WR + 0.9), F, WR + Math.sin(u) * (WR + 0.5)] as V3; }));
  p.ringV("y", [x, Y + 0.5, WR], WR, 0.12);
  p.ringV("y", [x, Y + 0.54, WR], 1.8, 0.3);
  p.dot([x, Y + 0.58, WR], 0.55, 0.02);
}

export const foodtruck: Illustration = {
  k: "foodtruck", name: "Food truck", title: "No trucks nearby", body: "No food trucks are trading near you right now. Check back around lunchtime.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, -3, -11);
    p.shadow(0, 2, 31, 13, 0.12);
    const open = ease(seg(h, 0, 0.6)), out = ease(seg(h, 0.45, 0.9));
    // the kitchen body and the cab in front of it
    p.box(-18, -Y, 2.6, 25, Y * 2, 19.4);
    p.box(7, -Y, 2.6, 10, Y * 2, 13.4);
    // a vent on the roof
    p.box(-13, -3, 22, 5, 5, 2.2, { top: 0.26 });
    // the cab: windscreen, side window, headlight, bumper
    p.face([[17.03, -Y + 1, 9.6], [17.03, Y - 1, 9.6], [17.03, Y - 1, 14.6], [17.03, -Y + 1, 14.6]], 0.26, SH.edge, 0.5);
    p.face(quad(9.2, 15.2, 9.6, 14.4, F), 0.28, SH.edge, 0.5);
    p.face([[17.04, Y - 3, 5.4], [17.04, Y - 0.9, 5.4], [17.04, Y - 0.9, 7], [17.04, Y - 3, 7]], 0.34, SH.edge, 0.4);
    p.box(16.4, -Y, 2.6, 1.4, Y * 2, 1.6, { top: 0.26 });
    // the serving window: dark when shut, lit once the hatch is up, a counter shelf under it
    const x0 = -15.5, x1 = 4.5, z0 = 10.4, z1 = 18.6;
    p.face(quad(x0, x1, z0, z1, F), 0.03 + 0.22 * open, SH.edge, 0.55);
    if (open > 0.5) for (const x of [-11, -5.5, 0]) p.ringV("y", [x, F + 0.02, 16.4], 0.9, 0.34, 0);
    p.box(x0 - 0.5, Y, z0 - 1, x1 - x0 + 1, 2.6 * open + 0.3, 1, { top: 0.3 });
    // a plate that slides out onto the shelf
    if (out > 0.02) { p.cylinder(-5.5, Y + 0.3 + out * 1.1, z0, 2.2, 0.5, { top: 0.34, side: 0.2, lw: 0.4 }); p.cylinder(-5.5, Y + 0.3 + out * 1.1, z0 + 0.5, 1.2, 1.1, { top: 0.36, side: 0.24, lw: 0.4 }); }
    // the hatch: hinged along its top, striped underneath
    p.push();
    p.rotate("x", open * 1.25, [0, Y, z1]);
    const N = 5, w = (x1 - x0) / N;
    for (let i = 0; i < N; i++) p.face(quad(x0 + i * w, x0 + (i + 1) * w, z0, z1, F + 0.3), i % 2 ? 0.1 : 0.3, 0);
    p.face(quad(x0, x1, z0, z1, F + 0.32), 0, SH.edge, 0.6);
    p.pop();
    wheel(p, -11); wheel(p, 10.5);
    // a little steam from the vent while it trades
    if (h > 0.6) for (let i = 0; i < 3; i++) {
      const k = (t * 0.45 + i / 3) % 1;
      p.dot([-10.5 - k * 2, -0.5, 25 + k * 8], 0.6 + k * 1.2, Math.sin(k * Math.PI) * seg(h, 0.6, 0.9));
    }
  },
};
