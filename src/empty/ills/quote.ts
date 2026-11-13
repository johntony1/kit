// No quotes saved: a big pair of closing quote marks, thick and standing up. Hover and they hop one after the other and lean in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// one quote mark in the x-z plane: a round head with a tail curling down to the left
function mark(): [number, number][] {
  const r = 6.5, pts: [number, number][] = [];
  for (let i = 0; i <= 24; i++) { const a = (-110 - (255 * i) / 24) * (Math.PI / 180); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  const q = (a: [number, number], c: [number, number], b: [number, number]) => { for (let i = 1; i <= 10; i++) { const s = i / 10; pts.push([(1 - s) * (1 - s) * a[0] + 2 * s * (1 - s) * c[0] + s * s * b[0], (1 - s) * (1 - s) * a[1] + 2 * s * (1 - s) * c[1] + s * s * b[1]]); } };
  const start = pts[pts.length - 1];
  q(start, [7, -9], [-4.5, -15]);
  q([-4.5, -15], [1.5, -9.5], pts[0]);
  return pts;
}

function slab(p: Pen, shape: [number, number][], y0: number) {
  const at = (y: number) => shape.map(([u, v]) => [u, y, v] as V3);
  p.face(at(y0), SH.right, SH.edge, 0.55);
  for (let y = y0 + 0.4; y < 0; y += 0.4) p.face(at(y), 0.08, 0);
  p.face(at(0), 0.26, SH.edge, 0.65);
}

export const quote: Illustration = {
  k: "quote", name: "Quote", title: "No quotes saved", body: "Save a line you love and it will be kept here to read again.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.push(); p.translate(0, 0, -17); p.shadow(0, 1, 24, 9, 0.1); p.pop();
    p.rotate("z", -0.5);
    p.scale(1.25);
    const shape = mark();
    const hop = (d: number) => { const u = Math.min(1, Math.max(0, (h - d) / 0.45)); return Math.sin(u * Math.PI) * 6; };
    [-8.5, 8.5].forEach((x, i) => {
      p.push();
      p.translate(x, 0, 4 + hop(i * 0.35) + (h > 0.9 ? Math.sin(t * 2.6 + i) * 0.3 : 0));
      p.rotate("y", h * 0.12, [0, 0, -6]);
      slab(p, shape, -4);
      p.pop();
    });
  },
};
