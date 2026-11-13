// No cruises booked: a cruise ship side on, a dark hull, two bright decks of round windows and a funnel. It bobs and pitches on the swell while waves roll along under it.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 3.6, A = -0.95; // seconds per loop, the turn (the side looks at us)
// the hull side on (x along the ship, z up), counter clockwise: a raked bow on the right, a short stern
const HULL: P2[] = [[-20, 0], [16, 0], [26, 11], [-24, 11], [-23, 4]];

/** a side profile (x, z), counter clockwise, pushed from y0 (back) to y1 (front): the walls we see, then the side */
function prism(p: Pen, pts: P2[], y0: number, y1: number, side: number) {
  const k = Math.cos(A) + Math.sin(A);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], nx = b[1] - a[1], nz = -(b[0] - a[0]);
    if (nx * k + nz <= 0.01) continue;
    p.face([[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], nz > Math.abs(nx) ? 0.22 : nx < 0 ? 0.12 : 0.065, 0);
  }
  p.face(pts.map(([x, z]) => [x, y1, z] as V3), side, 0);
}
/** a bright stroke drawn flat to the screen */
function stroke(p: Pen, pts: V3[], lw: number) {
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

export const cruise: Illustration = {
  k: "cruise", name: "Cruise ship", title: "No cruises booked", body: "Book a cruise and your voyage will be waiting here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, ph = u * Math.PI * 2;
    p.translate(0, 0, -12);
    p.shadow(0, 0, 32, 12, 0.08);
    p.rotate("z", A);
    p.push();
    p.translate(0, 0, Math.sin(ph) * 0.8);
    p.rotate("y", Math.sin(ph + 1.2) * 0.03);
    // the hull: dark, a bright stripe along it
    prism(p, HULL, -7, 7, 0.065);
    stroke(p, [[-23.4, 7.05, 8], [23, 7.05, 8]], 1.6);
    // two decks stepped back, bright, each with a row of dark round windows
    const deck = (x0: number, x1: number, d: number, z0: number, z1: number) => {
      prism(p, [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], -d, d, 0.3);
      for (let x = x0 + 2.2; x < x1 - 1.2; x += 3) p.dot([x, d + 0.05, (z0 + z1) / 2], 1.05, 0);
    };
    deck(-20, 16, 5.5, 11, 17);
    deck(-15, 9, 4.5, 17, 22.5);
    // the funnel, leaning back, with a dark band
    prism(p, [[-9, 22.5], [-1.5, 22.5], [-3, 32], [-10.5, 32]], -3, 3, 0.3);
    p.face([[-9.9, 3.05, 27.6], [-2.4, 3.05, 27.6], [-2.7, 3.05, 29.6], [-10.2, 3.05, 29.6]], 0.02, 0);
    p.pop();
    // waves rolling along under the hull
    for (const [y, z, amp, sp] of [[8.5, 1.2, 0.9, 1], [10.5, -0.6, 0.7, -1]] as const) {
      const pts: V3[] = [];
      for (let x = -27; x <= 28; x += 1) pts.push([x, y, z + Math.sin(x * 0.55 - sp * ph * 2) * amp]);
      stroke(p, pts, 1.4);
    }
  },
};
