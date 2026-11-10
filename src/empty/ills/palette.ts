// No designs yet: a painter's palette with paint wells. A brush hops from well to well, dabbing.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 4; // seconds per loop
const RX = 17, RY = 12.5, ZT = 1.8; // palette radii and thickness
const NOTCH = 2.55; // the angle of the thumb notch, on the near left

/** the palette's outline: an oval with a bite out of it for the thumb */
const outline = (z: number): V3[] => Array.from({ length: 64 }, (_, i) => {
  const a = (i / 64) * Math.PI * 2;
  let d = a - NOTCH; d = Math.atan2(Math.sin(d), Math.cos(d));
  const r = 1 - 0.26 * Math.exp(-((d / 0.22) ** 2));
  return [Math.cos(a) * RX * r, Math.sin(a) * RY * r, z] as V3;
});
// the wells, round the far edge: position and how dense the paint is
const WELLS: { x: number; y: number; v: number }[] = [
  { x: -9, y: -5, v: 0.02 },
  { x: -3, y: -7, v: 0.6 },
  { x: 3.4, y: -7, v: 0.065 },
  { x: 9, y: -5, v: 0.02 },
  { x: 11.4, y: 0.6, v: 0.6 },
];

/** a brush, its tip at `tip`, leaning back along `dir` (a unit vector), drawn straight on the canvas */
function brush(p: Pen, tip: V3, dir: V3, paint: number) {
  const at = (s: number): [number, number] => p.pt([tip[0] + dir[0] * s, tip[1] + dir[1] * s, tip[2] + dir[2] * s]);
  const seg = (s0: number, s1: number, w: number, v: number) => {
    const [x0, y0] = at(s0), [x1, y1] = at(s1);
    p.screen((g) => {
      g.lineCap = "round";
      g.strokeStyle = "#000"; g.lineWidth = w + 1.2;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      const n = Math.round(255 * v);
      g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = w;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    });
  };
  seg(9, 21, 2.2, 1); // the handle
  seg(5.2, 9, 2.8, 1); // the ferrule
  // the bristles, a tapered tuft, carrying the last paint it touched
  const [ax, ay] = at(5.2), [bx, by] = at(0.2);
  p.screen((g) => {
    const nx = -(by - ay), ny = bx - ax, l = Math.hypot(nx, ny) || 1;
    const ux = (nx / l) * 1.6, uy = (ny / l) * 1.6;
    g.fillStyle = "#000";
    g.beginPath(); g.moveTo(ax + ux * 1.4, ay + uy * 1.4); g.lineTo(ax - ux * 1.4, ay - uy * 1.4); g.lineTo(bx, by + 0.6); g.closePath(); g.fill();
    const n = Math.round(255 * (paint > 0.1 ? 1 : 0.55));
    g.fillStyle = `rgb(${n},${n},${n})`;
    g.beginPath(); g.moveTo(ax + ux, ay + uy); g.quadraticCurveTo(ax + ux * 0.9 + (bx - ax) * 0.6, ay + uy * 0.9 + (by - ay) * 0.6, bx, by); g.quadraticCurveTo(ax - ux * 0.9 + (bx - ax) * 0.6, ay - uy * 0.9 + (by - ay) * 0.6, ax - ux, ay - uy); g.closePath(); g.fill();
  });
}

export const palette: Illustration = {
  k: "palette", name: "Paint palette", title: "No designs yet", body: "Start a design and your work in progress will be kept here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(-2, 2, -7);
    p.shadow(0, 0, 30, 14, 0.12);
    // the slab: its edge built up in slices, then the lit top
    for (let z = 0; z < ZT; z += 0.3) p.face(outline(z), 0.12, 0);
    p.face(outline(ZT), 0.24, SH.edge, 0.55);
    // the thumb hole
    const hx = Math.cos(NOTCH) * RX * 0.58, hy = Math.sin(NOTCH) * RY * 0.58;
    p.disc(hx, hy, ZT + 0.01, 2.4, 0.01, SH.edge);
    // the wells: little mounds of paint, each a different density
    for (const w of WELLS) p.cylinder(w.x, w.y, ZT, 2.8, 1.2, { top: w.v, side: 0.1, lw: 0.9 });

    // the brush: dips into a well, lifts, glides to the next one, and comes back
    const stops = [0, 3, 1];
    const n = stops.length, u = ((t % P) / P) * n, i = Math.floor(u), f = u - i;
    const A = WELLS[stops[i]], B = WELLS[stops[(i + 1) % n]];
    const m = easeInOut(Math.max(0, Math.min(1, (f - 0.35) / 0.65)));
    const dip = f < 0.35 ? Math.sin((f / 0.35) * Math.PI) : 0;
    const x = A.x + (B.x - A.x) * m, y = A.y + (B.y - A.y) * m;
    const z = ZT + 1.2 + 3.2 - dip * 3.1 + Math.sin(m * Math.PI) * 3;
    const paint = f < 0.2 ? WELLS[stops[(i + n - 1) % n]].v : A.v;
    const dir: V3 = [0.5, -0.5, 0.75];
    const l = Math.hypot(...dir);
    brush(p, [x, y, z], [dir[0] / l, dir[1] / l, dir[2] / l], paint);
    // a fleck of paint lifting off as it dabs
    if (dip > 0.6) p.dot([A.x + 2.6, A.y + 1, ZT + 1.5 + (dip - 0.6) * 6], 0.7, 1);
  },
};
