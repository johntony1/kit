// No workers running: a hard hat resting on the floor. Hover and it lifts off and hovers, bobbing, with three short rays above it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 12.5; // the dome's radius
const E: V3 = [0.7071, -0.7071, 0], W: V3 = [-0.4082, -0.4082, 0.8165]; // screen right and screen up, in the world
const backOut = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));

/** the dome: half a ball seen from our corner, so its outline is the ball's rim above and its base circle in front */
function dome(p: Pen, z0: number) {
  const out: V3[] = [];
  for (let i = 0; i <= 28; i++) { const a = (Math.PI * i) / 28; out.push([E[0] * Math.cos(a) * R + W[0] * Math.sin(a) * R, E[1] * Math.cos(a) * R + W[1] * Math.sin(a) * R, z0 + W[2] * Math.sin(a) * R]); }
  for (let i = 1; i < 24; i++) { const b = (3 * Math.PI) / 4 - (Math.PI * i) / 24; out.push([Math.cos(b) * R, Math.sin(b) * R, z0]); }
  p.face(out, 0.075, SH.edge, 0.7);
  // the lit crown: a paler patch pulled up and to the left
  if (!p.ink) {
    const patch = (r: number, dx: number, dz: number): V3[] => Array.from({ length: 32 }, (_, i) => {
      const a = (i / 32) * Math.PI * 2, u = Math.cos(a) * r + dx, v = Math.sin(a) * r + dz;
      return [E[0] * u + W[0] * v, E[1] * u + W[1] * v, z0 + W[2] * v] as V3;
    });
    p.face(patch(R * 0.62, -R * 0.16, R * 0.5), 0.13, 0);
    p.face(patch(R * 0.36, -R * 0.24, R * 0.62), 0.22, 0);
  }
  // the ridge over the top, front to back, and a rib each side
  const rib = (x: number, lift: number): V3[] => {
    const r = Math.sqrt(R * R - x * x) + lift, pts: V3[] = [];
    for (let i = 0; i <= 30; i++) { const b = -Math.PI / 4 + 0.12 + ((Math.PI * 0.75 - 0.12) * i) / 30; if (x + r * Math.sin(b) + r * Math.cos(b) > 0) pts.push([x, r * Math.sin(b), z0 + r * Math.cos(b)]); }
    return pts;
  };
  p.face([...rib(-1.7, 0.5), ...rib(1.7, 0.5).reverse()], 0.3, SH.edge, 0.55);
  p.line(rib(-6.6, 0.05), SH.edge, 0.5);
  p.line(rib(6.6, 0.05), SH.edge, 0.5);
}

export const worker: Illustration = {
  k: "worker", name: "Workers", title: "No workers running", body: "Start a worker to pick up background jobs. Running workers will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const lift = 7 * backOut(cl(h * 1.3)) * (h > 0 ? 1 : 0) + h * Math.sin(t * 2.6) * 0.8;
    p.translate(-1, -1, -8);
    p.shadow(0, 1.5, 30 - lift, 15 - lift * 0.5, 0.13);
    p.push();
    p.translate(0, 0, lift);
    // the brim: wider at the front, where it becomes the peak
    p.cylinder(0.8, 3.2, 0, R + 3.4, 1.6, { side: 0.14, top: 0.3, lw: 0.7 });
    dome(p, 1.6);
    p.pop();
    if (lift > 0.3) for (const [x, y] of [[-10, 8], [9, 9], [10, -8]]) p.guide([[x, y, 0], [x, y, lift]]);
    // three short rays over the hat once it is up
    const k = cl((h - 0.6) / 0.4);
    if (k > 0) {
      const [cx, cy] = p.pt([0, 0, lift + 1.5 + R * 1.02]);
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1; g.lineCap = "round";
        for (const a of [-2.25, -1.57, -0.9]) { g.beginPath(); g.moveTo(cx + Math.cos(a) * 9.5, cy + 6 + Math.sin(a) * 9.5); g.lineTo(cx + Math.cos(a) * (9.5 + 4 * k), cy + 6 + Math.sin(a) * (9.5 + 4 * k)); g.stroke(); }
      });
    }
  },
};
