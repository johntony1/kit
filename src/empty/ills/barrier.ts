// Under maintenance: a striped road barrier with a warning light that blinks, and a traffic cone beside it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2; // seconds per blink
type P2 = [number, number];
/** clip a polygon (in x,z) to a rectangle */
const clipRect = (poly: P2[], x0: number, x1: number, z0: number, z1: number): P2[] => {
  const edge = (pts: P2[], inside: (q: P2) => boolean, cut: (a: P2, b: P2) => P2) => {
    const out: P2[] = [];
    pts.forEach((b, i) => {
      const a = pts[(i + pts.length - 1) % pts.length];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); }
      else if (inside(a)) out.push(cut(a, b));
    });
    return out;
  };
  const atX = (x: number) => (a: P2, b: P2): P2 => [x, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0])];
  const atZ = (z: number) => (a: P2, b: P2): P2 => [a[0] + ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]), z];
  let r = edge(poly, (q) => q[0] >= x0, atX(x0));
  r = edge(r, (q) => q[0] <= x1, atX(x1));
  r = edge(r, (q) => q[1] >= z0, atZ(z0));
  return edge(r, (q) => q[1] <= z1, atZ(z1));
};
/** a striped board along x, its face toward +y */
const board = (p: Pen, x0: number, x1: number, y: number, z0: number, z1: number) => {
  p.box(x0, y - 1.4, z0, x1 - x0, 1.4, z1 - z0, { top: 0.22, left: 0.1, right: 0.12 });
  const h = z1 - z0, w = 3.2, k = 0.9 * h;
  for (let s = x0; s < x1 + k; s += w * 2) {
    const band = clipRect([[s, z0], [s + w, z0], [s + w - k, z1], [s - k, z1]], x0, x1, z0, z1);
    if (band.length > 2) p.face(band.map(([x, z]) => [x, y + 0.02, z] as V3), 0.5, 0);
  }
  p.face([[x0, y + 0.03, z0], [x1, y + 0.03, z0], [x1, y + 0.03, z1], [x0, y + 0.03, z1]], 0, SH.edge, 0.6);
};
/** the visible half of a cone section around the z axis */
const frustum = (p: Pen, cx: number, cy: number, z0: number, r0: number, z1: number, r1: number, fill: number, edge = SH.edge) => {
  const N = 32, pts: V3[] = [];
  for (let i = 0; i <= N / 2; i++) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, z0]); }
  for (let i = N / 2; i >= 0; i--) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, z1]); }
  p.face(pts, fill, edge, 0.5);
};

export const barrier: Illustration = {
  k: "barrier", name: "Road barrier", title: "Under maintenance", body: "We're making a few improvements. Please check back in a little while.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    const k = u < 0.06 ? u / 0.06 : u < 0.36 ? 1 : u < 0.5 ? 1 - (u - 0.36) / 0.14 : 0; // the light
    p.translate(-1, -1, -10);
    p.shadow(1, 4, 26, 12, 0.1);
    p.push();
    p.rotate("z", -0.5); // turn the barrier to face us a little more
    // feet, then legs, behind the boards
    for (const x of [-10, 10]) {
      p.box(x - 1, -4, 0, 2, 9, 1.4, { top: 0.22 });
      p.box(x - 0.8, -0.8, 1.4, 1.6, 1.6, 18.6, { top: 0.25, left: 0.16, right: 0.09 });
    }
    // the two striped boards
    board(p, -14, 14, 2.2, 12, 17);
    board(p, -14, 14, 2.2, 5, 8.5);
    // the warning light on the left leg
    p.box(-11.4, -1.4, 20, 2.8, 2.8, 1.6, { top: 0.2 });
    p.cylinder(-10, 0, 21.6, 1.9, 2.6, { side: 0.18 + 0.75 * k, top: 0.25 + 0.75 * k });
    p.ringV("y", [-10, 1.95, 22.9], 0.8, 0.3 + 0.7 * k, 0);
    if (k > 0) {
      const [sx, sy] = p.pt([-10, 0, 23]);
      p.screen((c) => {
        const g = c.createRadialGradient(sx, sy, 1, sx, sy, 9);
        g.addColorStop(0, `rgba(255,255,255,${0.35 * k})`); g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g; c.beginPath(); c.arc(sx, sy, 9, 0, Math.PI * 2); c.fill();
        c.strokeStyle = `rgba(255,255,255,${k})`; c.lineWidth = 0.7; c.lineCap = "round";
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + (i - 2.5) * 0.5, r0 = 4.4, r1 = 4.4 + 2.6 * k;
          c.beginPath(); c.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); c.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); c.stroke();
        }
      });
    }
    p.pop();
    // the traffic cone, in front and to the right
    const cx = 15, cy = 13;
    p.box(cx - 4, cy - 4, 0, 8, 8, 1.2, { top: 0.2 });
    frustum(p, cx, cy, 1.2, 3.4, 4.6, 2.75, 0.14);
    frustum(p, cx, cy, 4.6, 2.75, 7.6, 2.15, 0.6);
    frustum(p, cx, cy, 7.6, 2.15, 11.5, 1.2, 0.14);
    p.disc(cx, cy, 11.5, 1.2, 0.3, SH.edge);
  },
};
