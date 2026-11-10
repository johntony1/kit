// Something needs attention: a triangular warning sign on a post. Hover and gusts of wind blow past and the sign sways.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const SIDE = 23, RC = 2.2, Z0 = 15.5; // side of the triangle, corner radius, height of its bottom edge
const H = (SIDE * Math.sqrt(3)) / 2;
const D = 1.2; // half thickness (the sign looks toward +y)
const GUST = 2.4;

// a rounded triangle, counter clockwise in the x z plane
const TRI: P2[] = (() => {
  const v: P2[] = [[-SIDE / 2, Z0], [SIDE / 2, Z0], [0, Z0 + H]];
  const c: P2 = [0, Z0 + H / 3];
  const inner = v.map(([x, z]) => { const dx = x - c[0], dz = z - c[1], L = Math.hypot(dx, dz); return [x - (dx / L) * 2 * RC, z - (dz / L) * 2 * RC] as P2; });
  const spans: [number, number][] = [[150, 270], [270, 390], [30, 150]];
  return inner.flatMap(([x, z], i) => Array.from({ length: 7 }, (_, k) => {
    const a = ((spans[i][0] + ((spans[i][1] - spans[i][0]) * k) / 6) * Math.PI) / 180;
    return [x + Math.cos(a) * RC, z + Math.sin(a) * RC] as P2;
  }));
})();
const CEN: P2 = [0, Z0 + H / 3];
const BORDER: P2[] = TRI.map(([x, z]) => [CEN[0] + (x - CEN[0]) * 0.76, CEN[1] + (z - CEN[1]) * 0.76]);

const wind = (p: Pen, f: V3[]) => {
  const q = f.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return s;
};

export const warning: Illustration = {
  k: "warning", name: "Warning sign", title: "Something needs attention", body: "A few things need your review before you can continue.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    // each gust: a shove, then a sway that dies away
    const g = (t % GUST) / GUST;
    const ang = h * 0.13 * Math.exp(-3.2 * g) * Math.sin(Math.PI * 2 * 2.2 * g);
    p.translate(0, 0, -19);
    p.rotate("z", -0.5); // face us a little more
    p.shadow(0, 0, 15, 7, 0.12);
    // the weighted base
    p.box(-6, -4, 0, 12, 8, 2.6, { top: 0.2, left: SH.left, right: SH.right });
    p.push();
    p.rotate("y", ang, [0, 0, 2.6]);
    // the post
    p.box(-0.9, -0.9, 2.6, 1.8, 1.8, Z0 + H * 0.6, { top: 0.2, left: SH.left, right: SH.right });
    // the sign: walls that face us, then the lit face
    p.push();
    p.translate(0, 0.9 + D, 0);
    for (let i = 0; i < TRI.length; i++) {
      const a = TRI[i], b = TRI[(i + 1) % TRI.length];
      const f: V3[] = [[a[0], -D, a[1]], [b[0], -D, b[1]], [b[0], D, b[1]], [a[0], D, a[1]]];
      if (wind(p, f) > -0.01) continue;
      const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
      p.face(f, -dx / L > 0.6 ? 0.12 : SH.right, 0);
    }
    p.face(TRI.map(([x, z]) => [x, D, z] as V3), 0.24, 0);
    // the border, then the mark
    p.line([...BORDER, BORDER[0]].map(([x, z]) => [x, D + 0.03, z] as V3), SH.edge, 0.9);
    p.line([[0, D + 0.05, Z0 + H * 0.62], [0, D + 0.05, Z0 + H * 0.33]], SH.edge, 2.3);
    p.line([[0, D + 0.05, Z0 + H * 0.19], [0, D + 0.05, Z0 + H * 0.19]], SH.edge, 2.6);
    p.pop();
    p.pop();

    // the wind: streaks that blow past while it gusts
    if (h > 0.05) {
      p.screen((c) => {
        c.lineCap = "round"; c.lineWidth = 0.9;
        for (let i = 0; i < 3; i++) {
          const q = (g * 1.6 + i * 0.27) % 1;
          if (q > 0.85) continue;
          const k = h * Math.sin((q / 0.85) * Math.PI);
          const n = Math.round(255 * Math.min(1, k * 1.2));
          c.strokeStyle = `rgb(${n},${n},${n})`;
          const [x0, y0] = p.pt([0, 0, Z0 + 4 + i * 6.5]);
          const sx = x0 - 20 + q * 40, sy = y0 - 3 + i * 1.5;
          c.beginPath(); c.moveTo(sx - 4.5, sy); c.lineTo(sx + 4.5, sy); c.stroke();
        }
      });
    }
  },
};
