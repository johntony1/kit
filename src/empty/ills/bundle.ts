// No bundles yet: three boxes of stepping size stacked and strapped together, a bow on top. Hover and the stack hops with a little wobble; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// each box: half width, base height, height
const TIERS: [number, number, number][] = [[13, 0, 8], [9.5, 8, 7], [6, 15, 6.5]];

// a ribbon loop of the bow, standing in the plane that faces us, leaning out along d
function loop(p: Pen, z: number, d: 1 | -1, fill: number) {
  const pts = Array.from({ length: 21 }, (_, i) => {
    const f = -Math.PI / 2 + (i / 20) * Math.PI, r = 7 * Math.pow(Math.cos(f), 0.8), dir = 0.5 + f * 0.75, u = r * Math.cos(dir) * 0.707;
    return [d * u, -d * u, z + r * Math.sin(dir)] as V3;
  });
  p.face(pts, fill, 0);
  p.line([...pts, pts[0]], SH.edge, 0.7);
}

export const bundle: Illustration = {
  k: "bundle", name: "Bundle", title: "No bundles yet", body: "Group products together and sell them as one. Your bundles will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 30, 15, 0.12);
    const k = Math.min(1, h * 1.5);
    p.translate(0, 0, 5 * Math.sin(k * Math.PI));
    p.rotate("y", Math.sin(k * Math.PI * 2) * 0.05 + h * Math.sin(t * 3) * 0.012);
    for (const [w, z, hh] of TIERS) {
      p.box(-w, -w, z, w * 2, w * 2, hh, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
      const Z = z + hh, e = w + 0.03;
      // its edges, and the dark seam where it sits on the box below
      p.line([[-w, e, Z], [w, e, Z], [e, -w, Z]], SH.edge, 0.5);
      p.line([[w, e, z], [w, e, Z]], SH.edge, 0.5);
      if (z > 0) p.line([[-w, e, z + 0.1], [w, e, z + 0.1], [e, -w, z + 0.1]], SH.edge, 1.1);
      // the strap: across the top both ways and down the two walls we see
      p.line([[-w, 0, Z + 0.03], [w, 0, Z + 0.03], [e, 0, z]], SH.edge, 1.3);
      p.line([[0, -w, Z + 0.03], [0, w, Z + 0.03], [0, e, z]], SH.edge, 1.3);
    }
    // the bow
    const Z = 21.55;
    loop(p, Z, -1, 0.14);
    loop(p, Z, 1, 0.26);
    p.box(-1.5, -1.5, Z, 3, 3, 2, { top: 0.3, left: 0.2, right: 0.1, edge: 0 });
    // the plus badge
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const [x, y] = p.pt([14, -8, 24]);
      const r = 4.8 * pop;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      });
    }
  },
};
