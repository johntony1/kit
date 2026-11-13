// No trips yet: a city tram side on, a long car with a row of big windows on two bogies, its pantograph up against the overhead wire. Hover and a spark jumps at the wire, the headlights come on and the windows light up one by one.
import { type Illustration, type Pen, type V3 } from "../dots";

const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
// a thin bright part (a wire, an arm): a white stroke with a dark rim, flat to the screen
const rod = (p: Pen, pts: V3[], lw = 1.4) => {
  const q = pts.map((a) => p.pt(a));
  p.screen((g) => {
    g.lineCap = "round"; g.lineJoin = "round";
    for (const [c, w] of [["#000", lw + 1.6], ["#fff", lw]] as [string, number][]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
  });
};
const Y = 5, X0 = -21, X1 = 21, Z0 = 3.6, Z1 = 17, ZW = 27; // half width, the ends, floor and roof of the body, the wire
const side = (x0: number, x1: number, z0: number, z1: number): V3[] => [[x0, Y + 0.04, z0], [x1, Y + 0.04, z0], [x1, Y + 0.04, z1], [x0, Y + 0.04, z1]];
const front = (y0: number, y1: number, z0: number, z1: number): V3[] => [[X1 + 0.04, y0, z0], [X1 + 0.04, y1, z0], [X1 + 0.04, y1, z1], [X1 + 0.04, y0, z1]];

export const tram: Illustration = {
  k: "tram", name: "Tram", title: "No trips yet", body: "Plan a journey across town and your trips will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 34, 11, 0.12);
    p.rotate("z", -0.42); // side on, the front end just showing
    // the bogies: two dark frames with bright wheels
    for (const bx of [-12, 12]) {
      p.box(bx - 5, -3.6, 0.6, 10, 7.2, 3, { top: 0.1, left: 0.065, right: 0.05, edge: 0 });
      for (const wx of [bx - 2.6, bx + 2.6]) { p.ringV("y", [wx, 3.65, 2.4], 2.4, 0.4, 0); p.dot([wx, 3.7, 2.4], 0.7, 0); }
    }
    // the body: lit roof, a lit side with a dark skirt, the front end in shade
    p.box(X0, -Y, Z0, X1 - X0, Y * 2, Z1 - Z0, { top: 0.26, left: 0.2, right: 0.07, edge: 0 });
    p.line([[X0, Y + 0.05, Z1 - 0.2], [X1, Y + 0.05, Z1 - 0.2], [X1 + 0.05, -Y, Z1 - 0.2]], 1, 0.6);
    p.face(side(X0, X1, Z0, Z0 + 2), 0.06, 0);
    p.face(front(-Y, Y, Z0, Z0 + 2), 0.04, 0);
    // a row of big windows, lighting up one by one on hover
    const L = seg(h, 0.35, 1);
    for (let i = 0; i < 6; i++) {
      const x = X0 + 2 + i * 6.4, q = side(x, x + 4.8, 8, 15);
      const on = seg(L * 6, i, i + 0.6);
      p.clear(q);
      if (on > 0) p.face(side(x + 0.8, x + 4, 8.8, 14.2), 0.1 + on * 0.4, 0);
    }
    p.clear(front(-Y + 1.2, Y - 1.2, 8, 15.6)); // the windscreen
    for (const y of [-Y + 1.8, Y - 1.8]) p.dot([X1 + 0.08, y, Z0 + 3.6], 1.1, 0.25 + 0.75 * seg(h, 0.2, 0.35));
    // the roof box, and the pantograph up to the wire
    p.box(-8, -3, Z1, 12, 6, 1.4, { top: 0.28, left: 0.12, right: 0.065, edge: 0 });
    const zb = Z1 + 1.4, zt = ZW - 0.9;
    rod(p, [[-3, 0, zb], [2.6, 0, (zb + zt) / 2], [-1.5, 0, zt]], 1.6);
    rod(p, [[-4.6, 0, zt], [1.6, 0, zt]], 1.8);
    // the overhead wire
    rod(p, [[X0 + 3, 0, ZW], [X1 - 3, 0, ZW]], 1.2);
    // a spark where it meets the wire
    const s = seg(h, 0.05, 0.25);
    if (s > 0) {
      const [sx, sy] = p.pt([-1.5, 0, ZW]), r = (1.3 + 0.4 * Math.sin(t * 23)) * s;
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1; g.lineCap = "round";
        for (let i = 0; i < 5; i++) { const a = i * 1.26 + t * 3; g.beginPath(); g.moveTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); g.lineTo(sx + Math.cos(a) * r * 2.6, sy + Math.sin(a) * r * 2.6); g.stroke(); }
      });
      p.dot([-1.5, 0, ZW], 1.1 * s, 1);
    }
  },
};
