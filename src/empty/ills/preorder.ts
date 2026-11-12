// No preorders: the dashed outline of a parcel that is not here yet, under a small clock. Hover and the hands sweep round as the parcel fills in.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 10.5, D = 8.5, H = 12; // half width, half depth, height of the parcel

export const preorder: Illustration = {
  k: "preorder", name: "Preorder", title: "No preorders", body: "Reserve something before it launches and it will wait here until it ships.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 25, 12, 0.05 + 0.07 * k);
    // the parcel: only a hint of its faces at rest, solid once the clock has gone round
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.03 + 0.19 * k, left: 0.025 + 0.11 * k, right: 0.02 + 0.05 * k, edge: 0 });
    // its edges: dashes that close up into lines
    const dash = (a: V3, b: V3) => {
      const n = 7;
      for (let i = 0; i < n; i++) {
        const q0 = i / n, q1 = (i + 0.5 + 0.5 * k) / n;
        p.line([[a[0] + (b[0] - a[0]) * q0, a[1] + (b[1] - a[1]) * q0, a[2] + (b[2] - a[2]) * q0], [a[0] + (b[0] - a[0]) * q1, a[1] + (b[1] - a[1]) * q1, a[2] + (b[2] - a[2]) * q1]], SH.edge, 0.6);
      }
    };
    const c = (sx: number, sy: number, z: number): V3 => [sx * W, sy * D, z];
    dash(c(-1, -1, H), c(1, -1, H)); dash(c(1, -1, H), c(1, 1, H)); dash(c(1, 1, H), c(-1, 1, H)); dash(c(-1, 1, H), c(-1, -1, H));
    dash(c(-1, 1, 0), c(1, 1, 0)); dash(c(1, 1, 0), c(1, -1, 0));
    dash(c(-1, 1, 0), c(-1, 1, H)); dash(c(1, 1, 0), c(1, 1, H)); dash(c(1, -1, 0), c(1, -1, H));
    // the tape, once it is real
    if (k > 0.5) {
      const a = (k - 0.5) * 2;
      p.face([[-2, -D, H + 0.02], [2, -D, H + 0.02], [2, D, H + 0.02], [-2, D, H + 0.02]], 0.42 * a, 0.7 * a, 0.4);
      p.face([[-2, D + 0.02, H], [2, D + 0.02, H], [2, D + 0.02, H - 4], [-2, D + 0.02, H - 4]], 0.34 * a, 0.7 * a, 0.4);
    }
    // the clock above it, facing us: a dark face, twelve ticks, two hands
    const cz = H + 12.5 + 0.6 * Math.sin(t * 2) * h, R = 8;
    const [cx, cy] = p.pt([0, 0, cz]);
    p.screen((g) => {
      g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = "rgb(22,22,22)"; g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 1.1; g.stroke();
      g.lineCap = "round"; g.lineWidth = 0.6;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? R - 1.5 : R - 2.4;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * (R - 0.9), cy + Math.sin(a) * (R - 0.9)); g.stroke();
      }
      // the hands: ten o'clock at rest, sweeping a full turn and a half
      const m = -Math.PI / 2 + k * Math.PI * 3, hr = -Math.PI / 2 - 1.05 + k * Math.PI * 0.5;
      g.lineWidth = 0.9; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(m) * (R - 2.8), cy + Math.sin(m) * (R - 2.8)); g.stroke();
      g.lineWidth = 1.1; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(hr) * (R - 4.4), cy + Math.sin(hr) * (R - 4.4)); g.stroke();
      g.beginPath(); g.arc(cx, cy, 0.9, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    });
  },
};
