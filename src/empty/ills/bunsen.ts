// No experiments running: a bunsen burner, a heavy round base, a tall tube with its air collar, the gas pipe out the side, a tall two tone flame flickering on top.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 2.4, TR = 3.8, TZ = 23; // seconds per loop, tube radius, top of the tube

/** a flat shape standing up and facing us, from (u, z) pairs about (0, 0) */
const flat = (p: Pen, pts: [number, number][], fill: number) =>
  p.face(pts.map(([u, z]) => [u * 0.577, -u * 0.577, z] as V3), fill, 0);

/** a sharp cone of flame: half width w at its foot z0, a point at height h, leaning */
const flame = (w: number, z0: number, h: number, lean: number): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 12; i++) { const k = i / 12; pts.push([-w * Math.pow(1 - k, 0.7) + lean * k * k, z0 + h * k]); }
  for (let i = 12; i >= 0; i--) { const k = i / 12; pts.push([w * Math.pow(1 - k, 0.7) + lean * k * k, z0 + h * k]); }
  return pts;
};

export const bunsen: Illustration = {
  k: "bunsen", name: "Bunsen burner", title: "No experiments running", body: "Set up your first experiment and its runs will show up here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1, w = u * Math.PI * 2;
    p.translate(3, 0, -24);
    p.shadow(0, 0, 30, 12, 0.12);
    // the hose: a thick bright tube from the gas pipe down to the floor and away
    const hose: V3[] = Array.from({ length: 15 }, (_, i) => { const k = i / 14; return [-12.6 - 4 * k, 1.9 + 13 * k, 6.5 * (1 - k) ** 1.6] as V3; });
    const q = hose.map((v) => p.pt(v));
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round";
      for (const [col, lw] of [["#000", 5], ["#fff", 2]] as [string, number][]) {
        g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      }
    });
    // the heavy base: a wide low drum with a lit top
    p.cylinder(0, 0, 0, 11.5, 3.2, { side: 0.065, top: 0.24, edge: 0 });
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(a) * 11.5, Math.sin(a) * 11.5, 3.2] as V3; }), SH.edge, 0.8);
    p.cylinder(0, 0, 3.2, 5.5, 2.2, { side: 0.065, top: 0.24, edge: 0 });
    // the gas pipe out to the left, ribbed where the hose slips on
    p.push(); p.rotate("z", Math.PI / 2 - 0.15);
    p.box(-1.3, 0, 5.2, 2.6, 12.5, 2.6, { top: 0.26, left: 0.14, right: 0.065, edge: 0 });
    p.pop();
    // the tube, its air collar with a dark hole, and its open mouth
    p.cylinder(0, 0, 5.4, TR, TZ - 5.4, { side: 0.24, top: 0.1, edge: 0 });
    p.cylinder(0, 0, 8, TR + 1.4, 4.4, { side: 0.065, top: 0.24, edge: 0 });
    p.ringV("x", [TR + 1.45, 1.4, 10.2], 1.2, 0, 0);
    p.disc(0, 0, TZ + 0.02, TR - 0.9, 0.02);
    // the flame: two tone, a shaded outer cone and a bright inner cone, both flickering
    const fh = 17 + 1.4 * Math.sin(w) + 0.8 * Math.sin(w * 3 + 1);
    const fw = TR + 2 + 0.3 * Math.sin(w * 2 + 0.5);
    const lean = 1.4 * Math.sin(w + 0.7) + 0.5 * Math.sin(w * 2);
    p.clear(flame(fw + 1, TZ - 0.6, fh + 1.6, lean).map(([a, z]) => [a * 0.577, -a * 0.577, z] as V3));
    flat(p, flame(fw, TZ, fh, lean), 0.13);
    p.clear(flame(fw * 0.7, TZ + 0.2, fh * 0.66, lean * 0.5).map(([a, z]) => [a * 0.577 + 0.3, -a * 0.577 + 0.3, z] as V3));
    flat(p, flame(fw * 0.56, TZ + 0.6, fh * 0.58, lean * 0.5), 0.45);
  },
};
