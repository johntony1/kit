// No forecast yet: a big open umbrella with striped panels and a hooked handle. Hover and it tips to one side while drops run off its edges.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const R = 18, HH = 14, D = 2.6; // canopy half width, canopy height, thickness
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);
/** a rib from the top of the canopy down to its tip at x = xc */
const rib = (xc: number, n = 14): P2[] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * (Math.PI / 2); return [xc * Math.sin(a), HH * Math.cos(a)]; });
/** the hem between two rib tips: it curves up between them */
const hem = (xa: number, xb: number, n = 10): P2[] => Array.from({ length: n + 1 }, (_, i) => { const s = i / n; return [xa + (xb - xa) * s, 2.6 * Math.sin(Math.PI * s)]; });
const TIPS = [-R, -R / 2, 0, R / 2, R];
const panel = (i: number): P2[] => [...rib(TIPS[i]), ...hem(TIPS[i], TIPS[i + 1]).slice(1), ...rib(TIPS[i + 1]).reverse().slice(1)];
const outline: P2[] = [...rib(-R), ...[0, 1, 2, 3].flatMap((i) => hem(TIPS[i], TIPS[i + 1]).slice(1)), ...rib(R).reverse().slice(1)];

function stroke(p: Pen, q: P2[], w: number) {
  const s = at(q, 0.4).map((v) => p.pt(v));
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); s.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
}

export const umbrella: Illustration = {
  k: "umbrella", name: "Umbrella", title: "No forecast yet", body: "Add a location and the forecast for it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(0, 0, 3);
    p.push(); p.translate(0, 0, -24); p.shadow(0, 0, 17, 7.5, 0.1); p.pop();
    p.rotate("z", -0.6); // turned to face us
    p.push();
    p.rotate("y", 0.2 * e + h * Math.sin(t * 2.2) * 0.03, [0, 0, -21]);
    // the shaft and its hooked handle, under the canopy
    stroke(p, [[0, -15.5], [0, 4]], 2.2);
    const hook: P2[] = Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI; return [-3.4 + Math.cos(a) * 3.4, -18 - Math.sin(a) * 3.4]; });
    stroke(p, [[0, -15], ...hook, [-6.8, -16.6]], 2.2);
    // the canopy: a shaded rim behind, then the striped panels
    for (let y = -D; y < 0; y += 0.45) p.face(at(outline, y), 0.1, 0);
    [0.3, 0.05, 0.3, 0.05].forEach((f, i) => p.face(at(panel(i)), f, 0));
    // the tip on top
    p.face(at([[-0.7, HH - 0.5], [0.7, HH - 0.5], [0.5, HH + 3], [-0.5, HH + 3]], -D / 2), 0.3, 0);
    // drops run off the rib tips while hovered
    if (h > 0.05) for (const [x, k] of [[-R, 0], [R / 2, 0.35], [R, 0.7]] as P2[]) {
      const u = (t * 0.7 + k) % 1;
      const [sx, sy] = p.pt([x, 0.5, 0.6 - u * 17]);
      const r = 1.9 * Math.min(1, h * 1.5) * Math.sin(Math.PI * Math.min(1, u * 1.4));
      if (r > 0.1) p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(sx, sy, r, 0, Math.PI); g.lineTo(sx, sy - r * 2.2); g.closePath(); g.fill(); });
    }
    p.pop();
  },
};
