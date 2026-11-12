// Mouse: a computer mouse with two buttons, a wheel and its cable. Hover and a button lights as it clicks, with little click marks beside it.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const A = 9.5, B = 14, H = 8.5; // half width, half length, height of the dome
// a point on the dome over (x, y)
const on = (x: number, y: number, lift = 0.05): V3 => [x, y, H * Math.sqrt(Math.max(0, 1 - (x / A) ** 2 - (y / B) ** 2)) + lift];

export const mouse: Illustration = {
  k: "mouse", name: "Mouse", title: "No clicks recorded", body: "Clicks on your links and buttons will be counted here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(2, 5, -5);
    p.shadow(0, 0, 26, 13, 0.12);
    // the cable: runs off from the nose and curls away
    const cable: V3[] = [[0, -B + 1, 2], [0, -B - 3.5, 0.4], [-1.5, -B - 7, 0], [-5, -B - 9.5, 0], [-9.5, -B - 9, 0], [-12, -B - 6, 0]];
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath();
      cable.forEach((q, i) => { const [x, y] = p.pt(q); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
    });
    // the body: a dome built from slices, darker low down and lit on top
    const N = p.ink ? 5 : 16; // fewer contour lines in the line style
    for (let i = 0; i < N; i++) {
      const z = (i / N) * H * 0.985, s = Math.sqrt(1 - (z / H) ** 2), f = i / (N - 1);
      const ring = Array.from({ length: 40 }, (_, n) => { const a = (n / 40) * Math.PI * 2; return [Math.cos(a) * A * s, Math.sin(a) * B * s, z] as V3; });
      p.face(ring, 0.075 + 0.15 * f * f, i === 0 ? SH.edge : 0, 0.6);
    }
    // the button that clicks: the near one, lit on hover
    const k = clamp((h - 0.2) / 0.3), pulse = k * (0.75 + 0.25 * Math.sin(t * 5));
    const seamY = -1.5;
    if (k > 0) {
      const patch: V3[] = [];
      for (let i = 0; i <= 10; i++) patch.push(on(0.5, seamY - (i / 10) * (B * 0.9 + seamY)));
      for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + 0.12 + (i / 14) * 1.38; patch.push(on(Math.cos(a) * A * 0.9, Math.sin(a) * B * 0.9)); }
      for (let i = 0; i <= 8; i++) patch.push(on(A * 0.88 * (1 - i / 8) + 0.5 * (i / 8), seamY));
      p.face(patch, 0.2 + 0.8 * pulse, 0);
    }
    // the seams: one down the middle of the nose, one across
    p.line(Array.from({ length: 12 }, (_, i) => on(0, -B * 0.97 + (i / 11) * (B * 0.97 + seamY))), SH.edge, 0.7);
    p.line(Array.from({ length: 21 }, (_, i) => on(-A * 0.96 + (i / 20) * A * 1.92, seamY)), SH.edge, 0.7);
    // the wheel
    const wheel: V3[] = [on(-1.1, -10, 0.1), on(1.1, -10, 0.1), on(1.1, -5.4, 0.1), on(-1.1, -5.4, 0.1)];
    p.clear(wheel.map(([x, y, z], i) => [x + (i === 0 || i === 3 ? -0.7 : 0.7), y + (i < 2 ? -0.7 : 0.7), z] as V3));
    p.face(wheel, 0.9, 0);
    // click marks: three short strokes fanning off the button
    const c = clamp((h - 0.45) / 0.35);
    if (c > 0) {
      const [ox, oy] = p.pt([A + 3, -B + 2, 5]);
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round";
        for (const a of [-1.25, -0.6, 0.05]) {
          const r0 = 2 + 1.5 * c, r1 = r0 + 4.5 * c;
          g.beginPath(); g.moveTo(ox + Math.cos(a) * r0, oy + Math.sin(a) * r0); g.lineTo(ox + Math.cos(a) * r1, oy + Math.sin(a) * r1); g.stroke();
        }
      });
    }
  },
};
