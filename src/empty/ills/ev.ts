// No chargers nearby: a charging post with its cable holstered on the side. Hover and the bolt on its screen lights up and the charge bars fill one by one.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
// the bolt, as [u, v] around its centre
const BOLT: [number, number][] = [[1, 3], [-1.7, -0.4], [-0.1, -0.4], [-1, -3], [1.7, 0.5], [0.1, 0.5]];

/** a stroke drawn flat to the screen, so it stays a bright mark in every style */
function stroke(p: Pen, pts: V3[], shade: number, lw: number) {
  const q = pts.map((v) => p.pt(v)), n = Math.round(255 * Math.max(0, Math.min(1, shade)));
  p.screen((c) => {
    c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

export const ev: Illustration = {
  k: "ev", name: "Charger", title: "No chargers nearby", body: "Move the map or widen your search. Charging points close to you will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-4, 2, -16);
    p.scale(1.1, [0, 0, 14]);
    p.shadow(2.5, 0, 26, 12, 0.1);
    const W = 6.8, D = 4.6, H = 28;
    // the plinth and the post
    p.box(-9.5, -7, 0, 21, 14, 1.8, { top: 0.2, left: 0.12, right: 0.065 });
    p.box(-W, -D, 1.8, 2 * W, 2 * D, H - 1.8, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    p.line([[-W, D + 0.03, H - 1.8], [W + 0.03, D + 0.03, H - 1.8], [W + 0.03, -D, H - 1.8]], SH.edge, 0.5);
    const y = D + 0.04;
    // the screen, dark, with the bolt on it
    const k = ease(seg(h, 0, 0.5));
    p.face([[-5, y, 14.6], [5, y, 14.6], [5, y, 25.2], [-5, y, 25.2]], 0.02, SH.edge, 0.7);
    p.face(BOLT.map(([u, v]) => [u * 1.45, y + 0.03, 19.9 + v * 1.45] as V3), 0.5 + 0.5 * k, SH.edge, 0.55);
    // three charge bars under the screen
    for (let i = 0; i < 3; i++) {
      const on = ease(seg(h, 0.3 + i * 0.18, 0.46 + i * 0.18));
      const x0 = -5 + i * 3.6;
      p.face([[x0, y, 8.6], [x0 + 2.8, y, 8.6], [x0 + 2.8, y, 12], [x0, y, 12]], 0.02 + 0.92 * on, SH.edge, 0.5);
    }
    // the cable: out of the foot of the side, drooping to the floor and up into the holstered plug
    const x = W + 0.05, sway = Math.sin(t * 2.2) * 0.5 * h;
    const cable: V3[] = Array.from({ length: 21 }, (_, i) => {
      const s = i / 20, bow = Math.sin(Math.PI * s);
      return [x + 1.6 * s + bow * (9 + sway), 0, 6 + 11 * s - bow * 8.5] as V3;
    });
    stroke(p, cable, 1, 1.6);
    p.dot([x, 0, 6], 1, 0.6);
    p.box(W, -1.7, 16.6, 3, 3.4, 5.4, { top: 0.3, left: 0.2, right: 0.1, lw: 0.6 });
    // a spark or two once it is charging
    const s = seg(h, 0.75, 1);
    if (s > 0) ([[-9, 6, 30], [9, -9, 27]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.3 * Math.sin(t * 3.4 + i * 2), s));
  },
};
