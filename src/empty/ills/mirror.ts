// Nothing to reflect on: a tall oval standing mirror in a thick frame on two splayed legs, two bright glare stripes across its glass. Hover and the glare sweeps across the glass and a sparkle pops at its rim.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
type P2 = [number, number];
const VX = 0.233;

/** a flat outline in the x z plane, pushed out between y0 and y1: lit tops and sparse ends, then its front */
function slab(p: Pen, pts: P2[], y0: number, y1: number, front: number, top = 0.24, side = 0.065) {
  let a = 0;
  pts.forEach(([u0, v0], i) => { const [u1, v1] = pts[(i + 1) % pts.length]; a += u0 * v1 - u1 * v0; });
  const s = a > 0 ? 1 : -1;
  pts.map((q, i) => [q, pts[(i + 1) % pts.length]] as [P2, P2]).sort((A, B) => A[0][1] + A[1][1] - B[0][1] - B[1][1]).forEach(([[u0, v0], [u1, v1]]) => {
    const nx = (v1 - v0) * s, nz = (u0 - u1) * s;
    if (nx * VX + nz <= 0) return;
    p.face([[u0, y0, v0], [u1, y0, v1], [u1, y1, v1], [u0, y1, v0]], nz > Math.abs(nx) ? top : side, 0);
  });
  p.face(pts.map(([u, v]) => [u, y1, v] as V3), front, 0);
}

const CZ = 8, RU = 11, RV = 17, G = 3; // centre height, half width, half height, frame width
const oval = (ru: number, rv: number): P2[] => Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * ru, CZ + Math.sin(a) * rv]; });

export const mirror: Illustration = {
  k: "mirror", name: "Mirror", title: "Nothing to reflect on", body: "Once there is some history, you can look back on it here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -6);
    p.shadow(0, 2, 24, 10, 0.12);
    p.rotate("z", -0.62);
    // the two splayed legs and their feet, behind the frame
    for (const s of [-1, 1]) slab(p, [[s * 8.5, CZ + 2], [s * 10.5, CZ + 2], [s * 15, -22], [s * 12.4, -22]], -2.6, -0.6, 0.2);
    p.box(-17, -4, -22, 34, 4, 1.4, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    // the frame: a thick lit oval
    slab(p, oval(RU, RV), -1, 1.4, 0.24, 0.3);
    // the glass: sparse, with a dark cut at the frame's inner edge
    const gu = RU - G, gv = RV - G, Y = 1.45;
    p.face(oval(gu, gv).map(([u, v]) => [u, Y, v] as V3), 0.035, 0);
    p.line([...oval(gu, gv), oval(gu, gv)[0]].map(([u, v]) => [u, Y + 0.02, v] as V3), 1, 0.7);
    // two glare stripes across the glass, leaning up to the right; on hover they sweep across
    const sweep = ease(h) * 7 + h * Math.sin(t * 2) * 0.4;
    const stripe = (c: number, wd: number) => {
      for (let v = -gv + 0.2; v < gv - 0.2; v += 0.6) {
        const v1 = Math.min(gv - 0.2, v + 0.6), half = gu * Math.sqrt(Math.max(0, 1 - ((v + v1) / 2 / gv) ** 2)) - 0.3;
        const lo = Math.max(-half, c + v * 0.55 - wd), hi = Math.min(half, c + v * 0.55 + wd);
        if (hi <= lo) continue;
        p.face([[lo, Y + 0.04, CZ + v], [hi, Y + 0.04, CZ + v], [hi, Y + 0.04, CZ + v1], [lo, Y + 0.04, CZ + v1]], 0.42, 0);
      }
    };
    stripe(-4.5 + sweep, 2.2);
    stripe(0.6 + sweep, 1);
    // the pivots where the legs hold the frame
    for (const s of [-1, 1]) p.dot([s * (RU + 0.2), 1.5, CZ], 1.3, 1);
    // a sparkle pops at the top right of the rim
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const r = 4.2 * (b < 0.6 ? ease(b / 0.6) * 1.15 : 1.15 - 0.15 * ease((b - 0.6) / 0.4));
      const [x, y] = p.pt([RU * 0.8 + 2, 1.5, CZ + RV * 0.8 + 2]);
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.beginPath();
        g.moveTo(x, y - r); g.lineTo(x, y + r); g.moveTo(x - r, y); g.lineTo(x + r, y); g.stroke();
        g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - r * 0.4, y - r * 0.4); g.lineTo(x + r * 0.4, y + r * 0.4); g.moveTo(x + r * 0.4, y - r * 0.4); g.lineTo(x - r * 0.4, y + r * 0.4); g.stroke();
      });
    }
  },
};
