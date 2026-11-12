// No device paired: a smartwatch lying flat, its screen asleep. Hover and the screen wakes with a heartbeat trace and a tick pops in beside it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// the first share k of a polyline
const part = (pts: V3[], k: number): V3[] => {
  const n = (pts.length - 1) * Math.min(1, Math.max(0, k)), i = Math.floor(n), f = n - i;
  const out = pts.slice(0, i + 1);
  if (i < pts.length - 1) { const a = pts[i], b = pts[i + 1]; out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2]]); }
  return out;
};
// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// a round bright badge with a dark tick, flat to the screen
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.35); g.stroke();
  });
}

export const smartwatch: Illustration = {
  k: "smartwatch", name: "Smartwatch", title: "No device paired", body: "Pair a watch or a tracker and your activity will start to show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -2);
    p.scale(1.45);
    p.shadow(0, 0, 25, 11, 0.12);
    const strap = { top: 0.15, left: 0.1, right: 0.06 };
    // the far strap and its buckle
    p.box(-4.4, -19.5, 0, 8.8, 12.5, 1, strap);
    p.line([[-5.2, -19.5, 1.1], [5.2, -19.5, 1.1], [5.2, -17.6, 1.1], [-5.2, -17.6, 1.1], [-5.2, -19.5, 1.1]], SH.edge, 0.8);
    for (const y of [-14.5, -11.5]) p.line([[-4.4, y, 1.03], [4.4, y, 1.03]], 0.5, 0.4);
    // the case and its crown
    p.box(-6.6, -7.6, 0, 13.2, 15.2, 3.2, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    p.box(6.6, -2.4, 1, 1.1, 3, 1.5, { top: 0.26, left: 0.14, right: 0.1 });
    // the near strap with its holes
    p.box(-4.4, 7.6, 0, 8.8, 13, 1, strap);
    for (const y of [11.5, 14, 16.5]) p.dot([0, y, 1.03], 0.55, 0);
    p.line([[-4.4, 20.6, 1], [4.4, 20.6, 1]], SH.edge, 0.5);
    // the screen: dark glass
    const z = 3.23;
    p.clear([[-5.2, -6.2, z], [5.2, -6.2, z], [5.2, 6.2, z], [-5.2, 6.2, z]]);
    p.line([[-5.2, -6.2, z], [5.2, -6.2, z], [5.2, 6.2, z], [-5.2, 6.2, z], [-5.2, -6.2, z]], 0.6, 0.45);
    // asleep: two dim dashes. Awake: a heartbeat trace draws across
    const k = ease(Math.min(1, h / 0.7));
    if (k < 0.5) { const s = 0.55 * (1 - k * 2); glow(p, [[-2.6, 0.5, z], [-0.7, 0.5, z]], 0.9, s); glow(p, [[0.7, 0.5, z], [2.6, 0.5, z]], 0.9, s); }
    if (k > 0.02) {
      const beat: V3[] = [[-4.3, 1.2, z], [-2.2, 1.2, z], [-1.3, -1, z], [-0.3, 4, z], [0.9, -4, z], [1.9, 1.2, z], [4.3, 1.2, z]];
      glow(p, part(beat, k), 1.1, 0.85 + 0.15 * Math.sin(t * 5));
      p.dot([-3.2, -3.9, z], 0.75, k);
    }
    // paired: a tick pops in
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) tick(p, [15, -1.5, 5], 3.1 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
