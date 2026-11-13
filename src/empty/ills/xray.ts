// No scans yet: a light box with a chest X ray clipped to it. Hover and the light comes on, the ribs glow bright and a scan line sweeps down the film.
import { type Illustration, type V3 } from "../dots";

const W = 14, Z0 = 3, Z1 = 35, TH = 3; // half width, bottom and top of the box, thickness
const F = (u: number, v: number, d = 0): V3 => [u * 0.577 + d, -u * 0.577 + d, v];
const cl = (x: number) => Math.max(0, Math.min(1, x));
const quad = (u0: number, v0: number, u1: number, v1: number, d = 0): V3[] => [F(u0, v0, d), F(u1, v0, d), F(u1, v1, d), F(u0, v1, d)];

export const xray: Illustration = {
  k: "xray", name: "X ray", title: "No scans yet", body: "Your scans and imaging results will appear here once they are shared with you.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const on = cl(h / 0.35);
    p.translate(0, 0, -19);
    p.shadow(0, 0, 26, 9, 0.12);
    // two feet
    for (const u of [-9, 9]) p.box(F(u, 0)[0] - 2, F(u, 0)[1] - 3, 0, 4, 6, Z0, { edge: 0 });
    // the box: depth stepping back with a lit top, then the frame
    for (let d = -TH; d < 0; d += 0.5) p.face(quad(-W, Z0, W, Z1, d), 0.2, 0);
    p.face(quad(-W, Z0, W, Z1), 0.12, 0);
    // the film: dark at rest, a faint glow once the light is on
    p.face(quad(-W + 2, Z0 + 2, W - 2, Z1 - 2, 0.1), 0.02, 0);
    // the bones: spine, collar bones and four pairs of ribs, bright strokes on the dark film
    const lv = Math.round(205 + 50 * on);
    const col = `rgb(${lv},${lv},${lv})`;
    p.screen((g) => {
      g.strokeStyle = col; g.lineCap = "round"; g.lineJoin = "round";
      const pt = (u: number, v: number) => p.pt(F(u, v, 0.2));
      g.lineWidth = 2.6;
      g.beginPath(); { const [a, b] = pt(0, Z1 - 5); g.moveTo(a, b); const [c, d] = pt(0, Z0 + 4.5); g.lineTo(c, d); } g.stroke();
      g.lineWidth = 2;
      for (const s of [-1, 1]) {
        g.beginPath();
        { const [a, b] = pt(s * 1.4, Z1 - 5.6); g.moveTo(a, b); const [c, d] = pt(s * 5, Z1 - 4.6); const [e, f] = pt(s * 9, Z1 - 5.8); g.quadraticCurveTo(c, d, e, f); }
        g.stroke();
        for (let i = 0; i < 4; i++) {
          const v = Z1 - 9 - i * 5.2, r = 9.8 - Math.abs(i - 1.2) * 0.7;
          g.beginPath();
          const [a, b] = pt(s * 1.4, v), [c, d] = pt(s * (r * 0.7), v + 3.2), [e, f] = pt(s * (r + 1.2), v + 0.8), [x, y] = pt(s * r, v - 3.4);
          g.moveTo(a, b); g.bezierCurveTo(c, d, e, f, x, y); g.stroke();
        }
      }
    });
    // a scan line sweeping down once the light is on
    const s = cl((h - 0.3) / 0.7);
    if (s > 0 && s < 1) {
      const v = Z1 - 3 - s * (Z1 - Z0 - 6);
      p.screen((g) => {
        const [a, b] = p.pt(F(-W + 2.6, v, 0.3)), [c, d] = p.pt(F(W - 2.6, v, 0.3));
        g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke();
      });
    }
  },
};
