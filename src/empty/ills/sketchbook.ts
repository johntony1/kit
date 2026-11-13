// Nothing drawn yet: a spiral sketchbook standing up and leaning back, its coil along the top, a doodle of mountains and a sun on the cover, a pencil leaning against it. Hover and the pencil rises and draws in the sun's rays one by one.
import { SH, type Illustration, type V3 } from "../dots";

const W = 12, T = 2.6, H = 30; // half width, thickness, height
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// the sun on the cover and its rays, in cover coordinates (across, up)
const SX = -4.5, SV = 18.5, SR = 2.8;
const RAYS = Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 2 - (i * Math.PI) / 4; return [[SX + Math.cos(a) * 4.3, SV + Math.sin(a) * 4.3], [SX + Math.cos(a) * 6.2, SV + Math.sin(a) * 6.2]] as [number, number][]; });

export const sketchbook: Illustration = {
  k: "sketchbook", name: "Sketchbook", title: "Nothing drawn yet", body: "Start a sketch and it will be kept here, page by page.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 10, 0.12);
    p.rotate("z", -0.45);
    p.push();
    p.rotate("x", 0.22, [0, T, 0]); // leaning back
    // the book: a lit cover, the page block showing on top and at the side
    p.box(-W, -T, 0, W * 2, T * 2, H, { top: 0.2, left: 0.26, right: 0.065, edge: 0 });
    for (const k of [0.33, 0.66]) p.line([[W + 0.03, -T + T * 2 * k, 0.4], [W + 0.03, -T + T * 2 * k, H - 0.4]], SH.edge, 0.5);
    const c = (a: number, v: number, d = 0.04): V3 => [a, T + d, v];
    // the doodle: two mountain peaks and a round sun
    p.line(([[-10, 4], [-4, 11.5], [-0.5, 8], [4.5, 14], [10, 4]] as [number, number][]).map(([a, v]) => c(a, v)), SH.edge, 1.1);
    p.line(Array.from({ length: 19 }, (_, i) => { const a = (i / 18) * Math.PI * 2; return c(SX + Math.cos(a) * SR, SV + Math.sin(a) * SR); }), SH.edge, 1.1);
    // the sun's rays, drawn in one by one by the pencil on hover
    const k = ease(Math.max(0, Math.min(1, (h - 0.25) / 0.6))) * RAYS.length;
    let tip: [number, number] = RAYS[0][0];
    RAYS.forEach(([a, b], i) => {
      const f = Math.max(0, Math.min(1, k - i));
      if (f <= 0) return;
      const e: [number, number] = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      p.line([c(a[0], a[1]), c(e[0], e[1])], SH.edge, 1.1);
      tip = e;
    });
    // the coil: bright loops over the top edge
    const loops = Array.from({ length: 9 }, (_, i) => -W + 2.2 + i * ((W * 2 - 4.4) / 8));
    const coil = loops.map((x) => Array.from({ length: 11 }, (_, i) => { const b = -0.2 + (i / 10) * Math.PI * 1.4; return p.pt([x, Math.cos(b) * (T + 0.8), H - 1.6 + Math.sin(b) * 3]); }));
    // the pencil: rests leaning on the cover's right, rises to the star on hover
    const lift = ease(Math.min(1, h / 0.3)) * (h < 0.85 ? 1 : 1 - (h - 0.85) / 0.15);
    const rest: V3 = [W - 3, T + 3.2, 0.4], dr: V3 = c(tip[0], tip[1], 0.8);
    const tp: V3 = [rest[0] + (dr[0] - rest[0]) * lift, rest[1] + (dr[1] - rest[1]) * lift, rest[2] + (dr[2] - rest[2]) * lift];
    const dir: V3 = [0.42 + 0.2 * lift, 0.25 + 0.1 * lift, 1];
    const at = (s: number): [number, number] => p.pt([tp[0] + dir[0] * s, tp[1] + dir[1] * s, tp[2] + dir[2] * s]);
    p.pop();
    p.screen((g) => {
      g.lineCap = "round";
      for (const pts of coil) for (const [col, w] of [["#000", 3], ["#fff", 1.6]] as [string, number][]) {
        g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      }
    });
    p.push();
    p.rotate("x", 0.22, [0, T, 0]);
    const [ax, ay] = at(0), [bx, by] = at(3.2), [ex, ey] = at(22);
    p.screen((g) => {
      g.lineCap = "round";
      g.strokeStyle = "#000"; g.lineWidth = 5.4; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey); g.stroke();
      g.strokeStyle = "#fff"; g.lineWidth = 3.4; g.beginPath(); g.moveTo(bx, by); g.lineTo(ex, ey); g.stroke();
      g.strokeStyle = "rgb(120,120,120)"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    });
    p.pop();
  },
};
