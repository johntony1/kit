// No recent files: a page standing up with a clock in front of its corner. The long hand sweeps round once each loop.
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

const W = 10.5, H = 27, T = 0.5, F = 5;
const P = 3;

function sheet(p: Pen, fill: number) {
  p.face([[W, -T, 0], [W, T, 0], [W, T, H - F], [W, -T, H - F]], SH.right, SH.edge, 0.5);
  p.face([[-W, -T, H], [W - F, -T, H], [W - F, T, H], [-W, T, H]], SH.top, SH.edge, 0.5);
  p.face([[-W, T, 0], [W, T, 0], [W, T, H - F], [W - F, T, H], [-W, T, H]], fill, SH.edge, 0.55);
  p.face([[W - F, T + 0.03, H], [W, T + 0.03, H - F], [W - F, T + 0.03, H - F]], 0.36, SH.edge, 0.5);
}

export const recent: Illustration = {
  k: "recent", name: "Recent files", title: "No recent files", body: "Files you open or edit will show up here so you can get back to them fast.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(-2, 0, -14);
    p.shadow(2, 3, 26, 12, 0.11);
    p.rotate("z", -0.42);
    p.push();
    p.translate(-3, -3, 0);
    sheet(p, 0.2);
    const fy = T + 0.03;
    p.line([[-7.5, fy, 22.5], [-1, fy, 22.5]], SH.edge, 0.95);
    for (let i = 0; i < 3; i++) p.line([[-7.5, fy, 19 - i * 2.8], [i === 2 ? 0 : 6.5, fy, 19 - i * 2.8]], SH.edge, 0.65);
    p.pop();
    // the clock: a thick disc standing in front, a dark face, four ticks and two hands
    const c: V3 = [6, 3.2, 8.4], r = 8;
    p.ringV("y", [c[0], c[1] - 1.8, c[2]], r, SH.right, SH.edge, 0.5);
    p.ringV("y", c, r, 0.2, SH.edge, 0.6);
    p.ringV("y", [c[0], c[1] + 0.02, c[2]], r - 1.5, 0.02, SH.edge, 0.5);
    const y = c[1] + 0.05;
    const at = (a: number, q: number): V3 => [c[0] + Math.sin(a) * q, y, c[2] + Math.cos(a) * q];
    for (let i = 0; i < 4; i++) bright(p, [at((i * Math.PI) / 2, r - 2.2), at((i * Math.PI) / 2, r - 3.4)], 0.6);
    bright(p, [at(-1.05, 3.2), at(0, 0)], 1.1); // the short hand rests near ten
    bright(p, [at(0, 0), at(u * Math.PI * 2, 5)], 0.9);
    p.dot(at(0, 0), 0.8, 1);
  },
};
