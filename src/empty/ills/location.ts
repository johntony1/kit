// Location is turned off: a map pin struck through, standing on a dim target. Hover and the strike pulls away, the pin hops and rings spread on the floor.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const C = 21, R = 8.6, YAW = -0.42;
// the pin from the front, as [x, z]: a round head drawn down to a point
const PIN: P2[] = [[0, 2.5], ...Array.from({ length: 29 }, (_, i) => { const a = -0.5 + ((Math.PI + 1) * i) / 28; return [Math.cos(a) * R, C + Math.sin(a) * R] as P2; })];

// a free standing stroke, flat to the screen (pen lines only show as cuts in a face)
const wire = (p: Pen, pts: V3[], w = 1, v = 255) => {
  const q = pts.map((a) => p.pt(a));
  p.screen((c) => {
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.stroke();
  });
};
/** a profile in [x, z] pushed through from y0 (back) to y1 (front); walls shaded by where they face */
function extrude(p: Pen, prof: P2[], y0: number, y1: number, front: number) {
  const n = prof.length, kx = Math.cos(YAW) + Math.sin(YAW);
  for (let i = 0; i < n; i++) {
    const [xa, za] = prof[i], [xb, zb] = prof[(i + 1) % n];
    const L = Math.hypot(xb - xa, zb - za) || 1, nx = (zb - za) / L, nz = -(xb - xa) / L;
    if (nx * kx + nz <= 0) continue;
    p.face([[xa, y0, za], [xb, y0, zb], [xb, y1, zb], [xa, y1, za]], nz > 0.5 ? 0.24 : 0.065, 0);
  }
  p.face(prof.map(([x, z]) => [x, y1, z] as V3), front, SH.edge, 0.65);
}
const ring = (r: number, n = 44): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, 0.02] as V3; });

export const location: Illustration = {
  k: "location", name: "Location off", title: "Location is turned off", body: "Turn on location to see places and results near you.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 26, 12, 0.1);
    // the target on the floor
    p.disc(0, 0, 0, 17, 0.2, SH.edge);
    p.disc(0, 0, 0.01, 15.4, 0.03, 0);
    p.disc(0, 0, 0.02, 9.6, 0.2, 0);
    p.disc(0, 0, 0.03, 8, 0.03, 0);
    for (let i = 0; i < 2; i++) {
      const u = (t * 0.45 + i / 2) % 1;
      if (h > 0.4) wire(p, ring(3 + u * 13), 1, Math.round(255 * cl((h - 0.4) / 0.4) * Math.sin(u * Math.PI)));
    }
    p.disc(0, 0, 0.04, 2.4, 0.3, SH.edge);
    // the pin hops once, then floats a little
    const k = cl(h / 0.7), hop = Math.sin(k * Math.PI) * 5 + h * (1.2 + Math.sin(t * 2.6) * 0.8);
    p.push();
    p.translate(0, 0, hop);
    p.rotate("z", YAW);
    extrude(p, PIN, -2.2, 2.2, 0.13);
    // the eye of the pin
    p.ringV("y", [0, 2.24, C], 3.3, 0.03, SH.edge, 0.65);
    if (h > 0.6) p.dot([0, 2.3, C], 1.5 * cl((h - 0.6) / 0.3), 1);
    // the strike across it, pulling back to one end
    const s = 1 - ease(cl(h / 0.5));
    if (s > 0.02) {
      const a: P2 = [-11.5, C + 11.5], b: P2 = [-11.5 + 23 * s, C + 11.5 - 23 * s], y = 2.3;
      const bar = (w: number, dy: number): V3[] => [[a[0] - w, y + dy, a[1] - w], [b[0] - w, y + dy, b[1] - w], [b[0] + w, y + dy, b[1] + w], [a[0] + w, y + dy, a[1] + w]];
      p.clear(bar(1.25, 0));
      p.face(bar(0.6, 0.02), 0.9, 0);
    }
    p.pop();
  },
};
