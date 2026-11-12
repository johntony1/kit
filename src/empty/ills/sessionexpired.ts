// Your session ended: a laptop with a padlock on its screen. Hover and the lock gives a hop and a small clock pops in beside it.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

// a bright stroke: lines turn dark in the dot styles, so marks on a dark ground are stroked on the screen
function bright(p: Pen, pts: V3[], lw: number) {
  if (p.ink) { p.line(pts, SH.edge, lw); return; }
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

const X = 15, Y = 9.5;
const cl = (x: number) => Math.max(0, Math.min(1, x));

function clock(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.26; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x, y - r * 0.55); g.lineTo(x, y); g.lineTo(x + r * 0.4, y + r * 0.22); g.stroke();
  });
}

export const sessionexpired: Illustration = {
  k: "sessionexpired", name: "Session expired", title: "Your session ended", body: "You were signed out after a while away. Sign in again to pick up where you left off.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(3, 3, -11);
    p.shadow(-2, -2, 30, 15, 0.12);
    p.rotate("z", -0.3);
    // the screen, leaning back from the hinge
    p.push();
    p.rotate("x", 0.2, [0, -Y, 1.4]);
    p.box(-X, -Y - 1, 1.4, X * 2, 1, 21, { top: 0.2, left: 0.2, right: 0.065 });
    const fy = -Y + 0.03, fz = fy + 0.03;
    p.face([[-X + 1.6, fy, 3], [X - 1.6, fy, 3], [X - 1.6, fy, 20.8], [-X + 1.6, fy, 20.8]], 0.03, SH.edge, 0.5);
    // the padlock: a shackle and a lit body with a keyhole
    const hop = Math.sin(cl(h / 0.5) * Math.PI) * 2.2, zb = 6.2 + hop;
    bright(p, [[-3.1, fz, zb + 6] as V3].concat(Array.from({ length: 13 }, (_, i) => { const a = Math.PI - (i / 12) * Math.PI; return [Math.cos(a) * 3.1, fz, zb + 8 + Math.sin(a) * 3.4] as V3; }), [[3.1, fz, zb + 6]]), 1.3);
    p.face([[-5, fz, zb], [5, fz, zb], [5, fz, zb + 7], [-5, fz, zb + 7]], 0.36, SH.edge, 0.7);
    p.dot([0, fz + 0.03, zb + 4.2], 1.1, 0);
    p.line([[0, fz + 0.03, zb + 4], [0, fz + 0.03, zb + 2]], 0, 0.9);
    p.pop();
    // the base: keys and a trackpad on its top
    p.box(-X, -Y, 0, X * 2, Y * 2, 1.4, { top: 0.2, left: 0.12, right: 0.065 });
    const zt = 1.43;
    for (let r = 0; r < 3; r++) p.line([[-X + 3, -Y + 3 + r * 2.8, zt], [X - 3, -Y + 3 + r * 2.8, zt]], SH.edge, 0.5);
    p.line([[-4.5, 2.5, zt], [4.5, 2.5, zt], [4.5, 7, zt], [-4.5, 7, zt], [-4.5, 2.5, zt]], SH.edge, 0.5);
    const b = cl((h - 0.5) / 0.5);
    if (b > 0) {
      const pop = b < 0.65 ? easeInOut(b / 0.65) * 1.18 : 1.18 - 0.18 * easeInOut((b - 0.65) / 0.35);
      clock(p, [X - 1, -Y - 4, 22], 5 * pop);
    }
  },
};
