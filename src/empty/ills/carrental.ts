// No rentals: a car key on its ring. Hover and the unlock button lights up while signal arcs pulse out from it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// a thin solid part (a rail, a pole): bright in the dot styles, a plain stroke in line art
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const circle = (cx: number, cy: number, z: number, r: number, n = 32): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

export const carrental: Illustration = {
  k: "carrental", name: "Car key", title: "No rentals", body: "Rent a car and its booking will be kept here until you hand back the keys.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(2, 0, -4);
    p.scale(1.5);
    p.shadow(0, 2, 24, 11, 0.12);
    // the blade, with a groove and three cuts along its edge
    p.box(-1.5, -17, 0.8, 3, 15, 1, { top: 0.24, left: 0.14, right: 0.08 });
    p.line([[-0.2, -16, 1.83], [-0.2, -3, 1.83]], SH.edge, 0.5);
    for (const y of [-14.5, -11.5, -8.5]) p.clear([[1.55, y, 1.83], [0.7, y + 0.5, 1.83], [0.7, y + 1.2, 1.83], [1.55, y + 1.7, 1.83]]);
    // the ring, threaded through the end of the fob
    rod(p, circle(0, 17.4, 0.9, 5), 1);
    // the fob
    p.box(-5.8, -2.6, 0, 11.6, 16, 2.8, { top: 0.22, left: 0.15, right: 0.075, lw: 0.6 });
    const z = 2.83;
    p.dot([0, 11.6, z], 1, 0);
    // two buttons: the far one unlocks, and lights when pressed
    const on = h > 0.25;
    p.disc(0, 1.7, z, 2.9, on ? 1 : 0.04, SH.edge);
    p.line(circle(0, 1.7, z + 0.01, 2.9), SH.edge, 0.6);
    p.disc(0, 7.6, z, 2, 0.04, SH.edge);
    p.line(circle(0, 7.6, z + 0.01, 2), SH.edge, 0.5);
    // signal arcs pulsing out from the lit button
    if (on) {
      const [cx, cy] = p.pt([-3.2, -5.2, z]);
      [0, 1, 2].forEach((i) => {
        const k = ease((h - 0.3 - i * 0.18) / 0.3);
        if (k <= 0) return;
        const r = 4.5 + i * 4.4, v = k * (0.75 + 0.25 * Math.sin(t * 5 - i * 1.2));
        p.screen((g) => { const n = Math.round(255 * v); g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 1.1; g.lineCap = "round"; g.beginPath(); g.arc(cx, cy, r, -Math.PI * 0.5 - 1.5, -Math.PI * 0.5 - 0.2); g.stroke(); });
      });
    }
  },
};
