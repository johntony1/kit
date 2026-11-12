// No credit score yet: a half round score dial on a base, its five bands unlit and the needle at the low end. Hover and the needle sweeps up, lighting the bands as it passes.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 17, ZC = 4, Y0 = -1.2, Y1 = 1.2; // dial radius, hub height, back and front of the plaque
const arc = (r: number, a0: number, a1: number, y: number, n = 14): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, y, ZC + Math.sin(a) * r] as V3; });

export const creditscore: Illustration = {
  k: "creditscore", name: "Credit score dial", title: "No credit score yet", body: "Your score will show here once we have enough history to work it out.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 1, 28, 13, 0.1);
    p.rotate("z", -0.62);
    // the base
    p.box(-19, -3.5, 0, 38, 8, 3.2);
    // the plaque: its rim across the top, then the face
    const N = 28;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI, a1 = ((i + 1) / N) * Math.PI;
      const q = (a: number, y: number): V3 => [Math.cos(a) * R, y, ZC + Math.sin(a) * R];
      p.face([q(a0, Y0), q(a1, Y0), q(a1, Y1), q(a0, Y1)], a0 < Math.PI / 2 ? 0.12 : 0.2, 0);
    }
    p.line(arc(R, 0, Math.PI, Y0, 28), SH.edge, 0.5);
    p.face([[-R, Y1, 3.2], ...arc(R, Math.PI, 0, Y1, 28), [R, Y1, 3.2]], 0.035, SH.edge, 0.6);
    // the needle's sweep
    const k = ease(clamp(h / 0.8));
    const settle = h > 0.8 ? Math.sin(t * 9) * 0.02 * (1 - clamp((h - 0.8) / 0.2) * 0.5) : 0;
    const ang = Math.PI * (0.9 - 0.68 * k) + settle; // from the low end up to "good"
    // five bands, low to high from left to right
    const F = Y1 + 0.03;
    for (let i = 0; i < 5; i++) {
      const a0 = Math.PI * (1 - (i + 0.07) / 5), a1 = Math.PI * (1 - (i + 0.93) / 5);
      const lit = ang < (a0 + a1) / 2 + 0.12;
      p.face([...arc(14.6, a0, a1, F, 8), ...arc(10.2, a1, a0, F, 8)], lit ? 0.5 + i * 0.1 : 0.065, SH.edge, 0.55);
    }
    // ticks at the two ends
    p.line([[-8.2, F, ZC], [-6.4, F, ZC]], SH.edge, 0.6);
    p.line([[8.2, F, ZC], [6.4, F, ZC]], SH.edge, 0.6);
    // the needle and its hub
    const tip: V3 = [Math.cos(ang) * 11.6, F + 0.03, ZC + Math.sin(ang) * 11.6];
    const side = (s: number): V3 => [Math.cos(ang + s * Math.PI / 2) * 1.5, F + 0.03, ZC + Math.sin(ang + s * Math.PI / 2) * 1.5];
    p.face([side(1), tip, side(-1)], 1, SH.edge, 0.5);
    p.ringV("y", [0, F + 0.06, ZC], 2.3, 0.3, SH.edge, 0.6);
    p.dot([0, F + 0.1, ZC], 0.7, 1);
    // a spark at the needle's tip once it has arrived
    const b = clamp((h - 0.78) / 0.22);
    if (b > 0) {
      const [sx, sy] = p.pt([Math.cos(ang) * 19.5, F, ZC + Math.sin(ang) * 19.5]);
      p.screen((g) => {
        const s = 3.2 * b * (1 + 0.15 * Math.sin(t * 5));
        g.fillStyle = "#fff"; g.beginPath();
        g.moveTo(sx, sy - s); g.lineTo(sx + s * 0.22, sy - s * 0.22); g.lineTo(sx + s, sy); g.lineTo(sx + s * 0.22, sy + s * 0.22);
        g.lineTo(sx, sy + s); g.lineTo(sx - s * 0.22, sy + s * 0.22); g.lineTo(sx - s, sy); g.lineTo(sx - s * 0.22, sy - s * 0.22); g.closePath(); g.fill();
      });
    }
  },
};
