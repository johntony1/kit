// A blank canvas: a whiteboard on a stand, a marker tray under it. A marker draws one long squiggle across the board, then the line is wiped away from its start.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a bright stroke: lines turn dark in the dot styles, so marks on a dark ground are stroked on the screen
function bright(p: Pen, pts: V3[], lw: number) {
  if (p.ink) { p.line(pts, SH.edge, lw); return; }
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

const P = 3.6;
const X = 16, Z0 = 9, Z1 = 31; // half width, bottom and top of the board
const cl = (x: number) => Math.max(0, Math.min(1, x));
const N = 48;
const path = (s: number, y: number): V3 => [-11.5 + 23 * s, y, 20.5 + Math.sin(s * Math.PI * 3.5) * 5.2 * (1 - 0.35 * s)];

export const whiteboard: Illustration = {
  k: "whiteboard", name: "Whiteboard", title: "A blank canvas", body: "Start sketching, add a note or drop in a shape. Your board will be saved here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 30, 12, 0.11);
    p.rotate("z", -0.42);
    // the legs behind the board, and their feet
    for (const x of [-11.5, 10]) {
      p.box(x, -5, 0, 1.5, 10, 1.2, { top: 0.2 });
      p.box(x, -1.6, 1.2, 1.5, 1.2, Z0 - 1.2, { left: 0.14 });
    }
    // the board: a frame and a dark writing face
    p.box(-X, -0.9, Z0, X * 2, 1.8, Z1 - Z0, { top: 0.22, left: 0.22, right: 0.07 });
    const fy = 0.93;
    p.face([[-X + 1.6, fy, Z0 + 1.6], [X - 1.6, fy, Z0 + 1.6], [X - 1.6, fy, Z1 - 1.6], [-X + 1.6, fy, Z1 - 1.6]], 0.03, SH.edge, 0.5);
    // the squiggle: drawn, held, then faded
    const d = cl(u / 0.6), wipe = cl((u - 0.8) / 0.16);
    const n0 = Math.round(wipe * N), n = Math.max(1, Math.round(d * N));
    if (n > n0) bright(p, Array.from({ length: n - n0 + 1 }, (_, i) => path((n0 + i) / N, fy + 0.03)), 1.3);
    // the tray along the bottom
    p.box(-8, 0.9, Z0 - 0.4, 16, 2.2, 0.9, { top: 0.26, left: 0.14 });
    // the marker: at the tip of the line while drawing, back in the tray after
    const back = cl((u - 0.62) / 0.16), home = cl((u - 0.9) / 0.1);
    const tip0 = path(0, fy + 0.4), tip1 = path(d, fy + 0.4), rest: V3 = [3, 2, Z0 + 0.7];
    const m = u < 0.62 ? tip1 : back < 1 ? [tip1[0] + (rest[0] - tip1[0]) * back, tip1[1] + (rest[1] - tip1[1]) * back, tip1[2] + (rest[2] - tip1[2]) * back + Math.sin(back * Math.PI) * 3] as V3
      : [rest[0] + (tip0[0] - rest[0]) * home, rest[1] + (tip0[1] - rest[1]) * home, rest[2] + (tip0[2] - rest[2]) * home + Math.sin(home * Math.PI) * 3] as V3;
    const end: V3 = [m[0] + 2.2, m[1] + 5.5, m[2] + 3.4];
    p.line([m, end], SH.edge, 2.6);
    p.line([[m[0] + 0.5, m[1] + 1.3, m[2] + 0.8], end], 0.03, 1.4);
    p.dot(m, 0.7, 1);
  },
};
