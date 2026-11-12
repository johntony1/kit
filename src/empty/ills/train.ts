// No train tickets: a train running on the spot. The sleepers slide by under it, the body rocks a little and wind lines streak past.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// a thin solid part (a rail, a pole): bright in the dot styles, a plain stroke in line art
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };

const P = 2.4; // seconds per loop
const Y = 4.6; // the near side of the train

function wheel(p: Pen, x: number, a: number) {
  p.ringV("y", [x, Y - 0.3, 1.9], 1.9, 0.2, SH.edge, 0.5);
  p.line([[x + Math.cos(a) * 1.5, Y - 0.27, 1.9 + Math.sin(a) * 1.5], [x - Math.cos(a) * 1.5, Y - 0.27, 1.9 - Math.sin(a) * 1.5]], SH.edge, 0.45);
}

export const train: Illustration = {
  k: "train", name: "Train", title: "No train tickets", body: "Book a journey and your tickets will be waiting here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(-1, 0, -8);
    p.shadow(0, 0, 32, 12, 0.12);
    // the track: sleepers sliding back, then the two rails
    for (let i = -6; i <= 6; i++) {
      const x = i * 4.6 - u * 4.6 * 3 % 4.6;
      const f = Math.max(0, 1 - Math.pow(Math.abs(x) / 29, 4));
      if (f > 0.3) p.face([[x - 0.7, -6.4, 0], [x + 0.7, -6.4, 0], [x + 0.7, 6.4, 0], [x - 0.7, 6.4, 0]], 0.1, SH.edge, 0.4);
    }
    for (const y of [-3.6, 3.6]) p.box(-29, y - 0.4, 0, 58, 0.8, 0.6, { top: 0.24, left: 0.2, right: 0.2, edge: 0 });
    p.push();
    p.translate(0, 0, 0.22 * Math.sin(u * Math.PI * 2 * 3));
    // the underframe
    p.box(-17.5, -Y + 0.8, 1.6, 34, Y * 2 - 1.6, 2, { top: 0.1, left: 0.045, right: 0.045, edge: 0 });
    // the body and its sloped nose
    const Z0 = 3.6, Z1 = 14.4, XN = 12, XE = 19, ZN = 8.2;
    p.box(-18, -Y, Z0, XN + 18, Y * 2, Z1 - Z0, { top: 0.22, left: 0.16, right: 0.065, edge: 0 });
    p.face([[XN, Y, Z0], [XE, Y, Z0], [XE, Y, ZN], [XN, Y, Z1]], 0.16, 0);
    p.face([[XE, -Y, Z0], [XE, Y, Z0], [XE, Y, ZN], [XE, -Y, ZN]], 0.065, 0);
    p.face([[XN, -Y, Z1], [XN, Y, Z1], [XE, Y, ZN], [XE, -Y, ZN]], 0.3, 0);
    // the outline
    p.line([[-18, Y, Z0], [XE, Y, Z0], [XE, Y, ZN], [XN, Y, Z1], [-18, Y, Z1], [-18, Y, Z0]], SH.edge, 0.6);
    p.line([[XE, Y, Z0], [XE, -Y, Z0], [XE, -Y, ZN], [XE, Y, ZN]], SH.edge, 0.55);
    p.line([[XE, -Y, ZN], [XN, -Y, Z1], [-18, -Y, Z1], [-18, Y, Z1]], SH.edge, 0.55);
    p.line([[XN, -Y, Z1], [XN, Y, Z1]], SH.edge, 0.5);
    // the windscreen on the slope, the headlights under it
    const S = (k: number, y: number): V3 => [XN + (XE - XN) * k, y, Z1 + (ZN - Z1) * k + 0.03];
    p.clear([S(0.14, -Y + 1), S(0.14, Y - 1), S(0.82, Y - 1), S(0.82, -Y + 1)]);
    p.dot([XE + 0.03, Y - 1.5, 5.6], 0.8, 1); p.dot([XE + 0.03, -Y + 1.5, 5.6], 0.8, 1);
    // the side: a row of windows, a door and a stripe
    const y = Y + 0.03;
    for (let i = 0; i < 5; i++) { const x = -16 + i * 4.7 + (i > 0 ? 1.6 : 0); if (i === 0) continue; p.face([[x, y, 9], [x + 3.7, y, 9], [x + 3.7, y, 12.6], [x, y, 12.6]], 0.03, SH.edge, 0.45); }
    p.line([[-16.2, y, 4.6], [-16.2, y, 12.8], [-13, y, 12.8], [-13, y, 4.6]], SH.edge, 0.5);
    p.face([[-15.6, y, 9], [-13.6, y, 9], [-13.6, y, 12.2], [-15.6, y, 12.2]], 0.03, SH.edge, 0.4);
    p.line([[-12, y, 6.6], [XE - 2.2, y, 6.6]], SH.edge, 0.8);
    // the pantograph on the roof
    rod(p, [[-9, 0, Z1], [-6, 0, Z1 + 2.6], [-9, 0, Z1 + 5]], 0.7);
    rod(p, [[-12, 0, Z1 + 5.1], [-5, 0, Z1 + 5.1]], 0.9);
    p.pop();
    // wheels turning under it
    const a = -u * Math.PI * 2 * 2;
    for (const x of [-13.5, -9.2, 7, 11.3]) wheel(p, x, a);
    // wind lines streaking back
    ([[8, -10, 15, 0], [14, 11, 6, 0.4], [2, -11, 9, 0.7]] as number[][]).forEach(([x0, yy, z, o]) => {
      const k = (u * 2 + o) % 1, x = x0 - k * 26;
      glow(p, [[x, yy, z], [x - 5, yy, z]], 0.6, Math.sin(k * Math.PI) * 0.9);
    });
  },
};
