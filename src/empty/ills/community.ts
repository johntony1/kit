// No community yet: six benches in a ring around a small campfire, all empty. The flame flickers and sparks drift up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

/** a box turned about z by `ang`, centred on (cx, cy): only the faces that face us, shaded by which way they point */
function rbox(p: Pen, cx: number, cy: number, z: number, w: number, d: number, h: number, ang: number, top: number = SH.top) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const pt = (u: number, v: number): [number, number] => [cx + u * c - v * s, cy + u * s + v * c];
  const q = [pt(-w / 2, -d / 2), pt(w / 2, -d / 2), pt(w / 2, d / 2), pt(-w / 2, d / 2)];
  const sides: { pts: V3[]; f: number; k: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const [x0, y0] = q[i], [x1, y1] = q[(i + 1) % 4];
    const nx = y1 - y0, ny = -(x1 - x0);
    if (nx + ny <= 0.001) continue;
    sides.push({ pts: [[x0, y0, z], [x1, y1, z], [x1, y1, z + h], [x0, y0, z + h]], f: ny > nx ? 0.13 : 0.07, k: (x0 + x1 + y0 + y1) / 2 });
  }
  sides.sort((a, b) => a.k - b.k).forEach((f) => p.face(f.pts, f.f, SH.edge, 0.55));
  p.face(q.map(([x, y]) => [x, y, z + h] as V3), top, SH.edge, 0.55);
}

const RING = 12.5, N = 6;
const P = 2.4;

export const community: Illustration = {
  k: "community", name: "Community", title: "No community yet", body: "Start a space and invite people in, and the conversation will gather here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -6);
    p.scale(1.1, [0, 0, 4]);
    p.shadow(-6, -6, 18, 9, 0.1); p.shadow(6, 6, 18, 9, 0.1); p.shadow(6, -6, 18, 9, 0.1); p.shadow(-6, 6, 18, 9, 0.1);
    // a dashed circle on the ground, the ring the benches stand on (line style only)
    p.guide(Array.from({ length: 49 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * 7.5, Math.sin(a) * 7.5, 0] as V3; }));
    // everything in the ring, drawn back to front
    const items: { d: number; fn: () => void }[] = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2 + Math.PI / 4 + Math.PI / N;
      const cx = Math.cos(th) * RING, cy = Math.sin(th) * RING, ang = th + Math.PI / 2;
      const ox = Math.cos(th), oy = Math.sin(th); // outward
      items.push({ d: cx + cy, fn: () => {
        // legs, then seat and backrest in depth order
        for (const sgn of [-1, 1]) rbox(p, cx + Math.cos(ang) * sgn * 3, cy + Math.sin(ang) * sgn * 3, 0, 0.9, 2.2, 2, ang, 0.13);
        const parts = [
          { d: cx + cy, fn: () => rbox(p, cx, cy, 2, 8, 3, 0.9, ang, 0.24) },
          { d: cx + cy + (ox + oy) * 1.6, fn: () => rbox(p, cx + ox * 1.6, cy + oy * 1.6, 2.9, 8, 0.7, 3.2, ang, 0.24) },
        ].sort((a, b) => a.d - b.d);
        parts.forEach((x) => x.fn());
      } });
    }
    items.push({ d: 0, fn: () => {
      // the fire pit: a stone ring with dark ash and two crossed logs
      p.cylinder(0, 0, 0, 3.6, 1.4, { side: 0.13, top: 0.22, lw: 0.6 });
      p.disc(0, 0, 1.42, 2.5, 0.03, SH.edge);
      rbox(p, 0, 0, 1.4, 4.4, 0.9, 0.9, 0.6, 0.13);
      rbox(p, 0, 0, 2.3, 4.4, 0.9, 0.9, -0.6, 0.13);
      // the flame: a flickering teardrop with a dark core
      const [fx, fy] = p.pt([0, 0, 3]);
      const f1 = Math.sin(t * 13) * 0.5 + Math.sin(t * 7.3) * 0.5, f2 = Math.sin(t * 9.1 + 1);
      const fl = (c: CanvasRenderingContext2D, w: number, hh: number, lean: number) => {
        c.beginPath();
        c.moveTo(fx - w, fy);
        c.bezierCurveTo(fx - w, fy - hh * 0.5, fx + lean - w * 0.3, fy - hh * 0.7, fx + lean, fy - hh);
        c.bezierCurveTo(fx + lean + w * 0.3, fy - hh * 0.7, fx + w, fy - hh * 0.5, fx + w, fy);
        c.quadraticCurveTo(fx, fy + w * 0.6, fx - w, fy);
        c.closePath();
      };
      p.screen((c) => {
        fl(c, 3.4, 10 + f1 * 1.2, f2 * 1.1); c.fillStyle = "#fff"; c.fill(); c.strokeStyle = "#000"; c.lineWidth = 0.7; c.stroke();
        fl(c, 1.5, 5 + f2 * 0.8, f1 * 0.6); c.fillStyle = "#000"; c.fill();
      });
      // sparks drifting up
      for (let i = 0; i < 4; i++) {
        const v = ((t / P) + i / 4) % 1;
        if (v > 0.08 && v < 0.85) p.dot([Math.sin(i * 2.3 + v * 5) * 2, Math.cos(i * 1.7) * 1.5, 12 + v * 12], 0.35 + 0.55 * Math.sin(v * Math.PI), 1);
      }
    } });
    items.sort((a, b) => a.d - b.d).forEach((x) => x.fn());
  },
};
