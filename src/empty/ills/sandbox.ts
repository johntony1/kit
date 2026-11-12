// No sandboxes yet: a sandbox with a bucket and a spade. Hover and a sandcastle rises out of the sand; a flag runs up its tower.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
// a thin bright rod standing free of any face (a pole, a handle): stroked on screen so every style shows it
const wire = (p: Pen, pts: V3[], lw = 0.8) => {
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = p.ink ? "rgb(120,120,120)" : "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
};
const W = 16, D = 12, WH = 5, SZ = 3.6; // half width, half depth, wall height, sand level

export const sandbox: Illustration = {
  k: "sandbox", name: "Sandbox", title: "No sandboxes yet", body: "Spin up a sandbox to try things out safely. Nothing you do in it touches production.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -4);
    p.shadow(0, 0, 34, 16, 0.11);
    // the two far walls, then the sand
    p.box(-W, -D, 0, 2 * W, 2, WH);
    p.box(-W, -D, 0, 2, 2 * D, WH);
    p.face([[-W + 2, -D + 2, SZ], [W - 2, -D + 2, SZ], [W - 2, D - 2, SZ], [-W + 2, D - 2, SZ]], p.ink ? 0.2 : 0.045, 0);
    for (const [x, y] of [[-9, 7], [3, 6], [10, -7], [-2, -8], [8, 3], [-11, -2], [0, 1]]) p.dot([x, y, SZ], 0.5, 0.8);
    // the castle: a mound at rest, a tower with a keep and battlements on hover
    const k = ease(clamp(h / 0.7)), cx = -5, cy = -3;
    p.cylinder(cx, cy, SZ, 6.2, 0.9, { side: 0.12, top: 0.19, lw: 0.45 });
    if (k > 0.02) {
      const z1 = SZ + 0.9, hg = 8 * k;
      p.box(cx - 4, cy - 4, z1, 8, 8, hg, { top: 0.22 });
      if (k > 0.5) p.clear([[cx - 1.1, cy + 4.03, z1], [cx + 1.1, cy + 4.03, z1], [cx + 1.1, cy + 4.03, z1 + 3.2 * k], [cx - 1.1, cy + 4.03, z1 + 3.2 * k]]);
      for (const [ox, oy] of [[-4, -4], [1.6, -4], [-4, 1.6], [1.6, 1.6]]) p.box(cx + ox, cy + oy, z1 + hg, 2.4, 2.4, 1.6 * k, { top: 0.24, lw: 0.4 });
      // the flag
      const f = clamp((h - 0.7) / 0.3);
      if (f > 0) {
        const zt = z1 + hg, top = zt + 7 * ease(f), wave = Math.sin(t * 3) * 0.6;
        wire(p, [[cx, cy, zt], [cx, cy, top]], 0.8);
        p.face([[cx, cy, top], [cx + 4.4, cy + wave, top - 1.5], [cx, cy, top - 3]], 0.34, SH.edge, 0.5);
      }
    }
    // the bucket, and a spade stuck in the sand
    p.cylinder(8, -3.5, SZ, 3.3, 5.2, { side: 0.13, top: 0.03 });
    wire(p, Array.from({ length: 11 }, (_, i) => { const q = (i / 10) * Math.PI; return [8 + Math.cos(q) * 3.3, -3.5, SZ + 5.2 + Math.sin(q) * 3.4] as V3; }), 0.8);
    p.face([[-10.6, 6, SZ], [-7.4, 6, SZ], [-7.4, 6, SZ + 3.8], [-10.6, 6, SZ + 3.8]], 0.3, SH.edge, 0.5);
    wire(p, [[-9, 6, SZ + 3.8], [-9, 6, SZ + 10.5]], 1.1);
    wire(p, [[-10.5, 6, SZ + 10.5], [-7.5, 6, SZ + 10.5]], 1.1);
    // the two near walls
    p.box(-W, D - 2, 0, 2 * W, 2, WH);
    p.box(W - 2, -D, 0, 2, 2 * D, WH);
  },
};
