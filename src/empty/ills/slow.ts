// This is taking a while: a snail making its way along, shell on its back. It stretches and gathers itself as it creeps, leaving a dotted trail.
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

const P = 3.2;

export const slow: Illustration = {
  k: "slow", name: "Snail", title: "This is taking a while", body: "Still working on it. You can wait here or come back in a little while.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    const hd = Math.sin(w) * 1.5, tl = Math.sin(w - 1.6) * 1.5, bob = Math.sin(w + 0.8) * 0.5;
    p.translate(1, 0, -11);
    p.scale(1.12);
    p.shadow(0, 1, 28, 11, 0.12);
    p.rotate("z", -0.42);
    // the trail it leaves, slipping back behind it
    for (let j = 0; j < 4; j++) {
      const s = j + u, x = -16 - s * 4.4;
      p.line([[x, 0, 0], [x - 1.8, 0, 0]], 0.9 * (1 - s / 4), 0.8);
    }
    const yb = 1.7, cz = 12.2 + bob, cx = -2.5, R = 9;
    // the far side of the shell
    p.ringV("y", [cx, -2.2, cz], R, SH.right, SH.edge, 0.5);
    // the body: a long foot, a neck and a head, with two eye stalks
    const body: V3[] = [
      [-15 + tl, yb, 0], [14.5 + hd, yb, 0], [16.6 + hd, yb, 1.6], [16.8 + hd, yb, 8.2], [15.2 + hd, yb, 10.2], [12.6 + hd, yb, 9.6],
      [11.4 + hd * 0.6, yb, 4.6], [-4, yb, 3.6], [-12 + tl, yb, 2.2],
    ];
    p.face(body.map(([x, , z]) => [x, -yb, z] as V3), SH.right, 0);
    p.face(body, 0.16, SH.edge, 0.6);
    const sw = Math.sin(w * 2) * 0.8;
    for (const [bx, tx] of [[15.6, 18.2], [13.4, 14.2]]) {
      const tip: V3 = [tx + hd + sw, yb, 15.4 + (bx > 14 ? -0.6 : 0)];
      bright(p, [[bx + hd, yb, 9.8], tip], 0.7);
      p.dot(tip, 0.95, 1);
    }
    p.dot([15.4 + hd, yb + 0.03, 6.6], 0.45, 1);
    // the shell, with its spiral
    p.ringV("y", [cx, 2.2, cz], R, 0.22, SH.edge, 0.7);
    const turns = 2.4, n = 60;
    p.line(Array.from({ length: n + 1 }, (_, i) => {
      const s = i / n, a = -Math.PI * 0.35 - s * turns * Math.PI * 2, r = (R - 1.8) * (1 - s * 0.9);
      return [cx + Math.cos(a) * r, 2.25, cz + Math.sin(a) * r] as V3;
    }), SH.edge, 0.85);
  },
};
