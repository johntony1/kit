// No network: a phone in its dock. The signal bars on its screen fill one by one, flicker, then drop to zero.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const PERIOD = 3.8;
const ramp = (u: number, a: number, b: number) => Math.max(0, Math.min(1, (u - a) / (b - a)));

export const signal: Illustration = {
  k: "signal", name: "Phone signal", title: "No network", body: "Your device is not connected. Move somewhere with better signal and try again.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 11, 0.12);
    p.rotate("z", -0.5);
    // the dock: a low block with a lit top and a slot for the phone
    p.box(-9.5, -4.5, 0, 19, 9, 3, { top: 0.2 });
    p.line([[-7.5, 2.8, 3.02], [7.5, 2.8, 3.02]], SH.edge, 0.6);
    // the phone, standing in the dock, its screen facing +y
    const X0 = -7, X1 = 7, Y = 1.6, Z0 = 3, Z1 = 35;
    p.box(X0, -1.6, Z0, X1 - X0, 3.2, Z1 - Z0, { top: 0.22, left: 0.12, right: 0.065 });
    const f = Y + 0.03;
    const q = (x0: number, z0: number, x1: number, z1: number, fill: number) => {
      const pts: V3[] = [[x0, f, z0], [x1, f, z0], [x1, f, z1], [x0, f, z1]];
      if (fill > 0) p.face(pts, fill, 0); else p.clear(pts);
    };
    // the screen: dark glass, with a lit status strip and a home bar
    q(-6.1, 6, 6.1, 32.6, 0);
    q(-6.1, 29.4, 6.1, 32.6, 0.26);
    p.line([[-4.4, f + 0.02, 31], [-1.8, f + 0.02, 31]], SH.edge, 0.7); // the clock in the strip
    p.dot([4, f + 0.02, 31], 0.8, 0); // a camera hole
    q(-3, 7.6, 3, 8.8, 0.3);

    // the bars: each fills from the bottom in turn, the top ones flicker, then all fall away
    const fall = easeInOut(ramp(u, 0.6, 0.7));
    const BW = 1.8, GAP = 1.2, B0 = 11, x0 = -(4 * BW + 3 * GAP) / 2;
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * (BW + GAP), hgt = 4 + i * 3.8;
      // the empty bar: a sparse ghost of its full height
      q(x, B0, x + BW, B0 + hgt, 0.06);
      let k = easeInOut(ramp(u, 0.05 + i * 0.1, 0.13 + i * 0.1));
      if (u > 0.48 && u < 0.6 && i >= 2) k *= Math.sin(u * 220 + i * 2) > 0 ? 1 : 0.35;
      k *= 1 - fall;
      if (k > 0.02) q(x, B0, x + BW, B0 + hgt * k, 0.45);
    }
    // once empty: a small cross above the short bars
    const xk = ramp(u, 0.72, 0.8) * (1 - ramp(u, 0.95, 1));
    if (xk > 0.02) {
      const a = p.pt([-4.9, f, 22.4]), b = p.pt([-2.5, f, 20]), c = p.pt([-2.5, f, 22.4]), d = p.pt([-4.9, f, 20]);
      p.screen((cx) => {
        const n = Math.round(255 * xk);
        cx.strokeStyle = `rgb(${n},${n},${n})`; cx.lineWidth = 0.9; cx.lineCap = "round";
        cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.moveTo(c[0], c[1]); cx.lineTo(d[0], d[1]); cx.stroke();
      });
    }
  },
};
