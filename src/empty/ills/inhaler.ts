// No doses logged: an inhaler standing upright, a bright canister set into the boot shaped body, the mouthpiece facing left. Hover and the canister presses down and a puff leaves the mouthpiece.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const A = -1.0; // the turn: the front looks at us, the left end shows a little
const cl = (x: number) => Math.min(1, Math.max(0, x));
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 4): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u1 - r, v0 + r, -Math.PI / 2], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI / 2], [u0 + r, v0 + r, Math.PI]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
/** a side profile (x, z), counter clockwise, pushed from y0 (back) to y1 (front): the walls we see, then the front */
function prism(p: Pen, pts: P2[], y0: number, y1: number, front: number) {
  const k = Math.cos(A) + Math.sin(A);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], nx = b[1] - a[1], nz = -(b[0] - a[0]);
    if (nx * k + nz <= 0.01) continue;
    p.face([[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], nz > Math.abs(nx) ? 0.22 : nx < 0 ? 0.12 : 0.065, 0);
  }
  p.face(pts.map(([x, z]) => [x, y1, z] as V3), front, 0);
}

export const inhaler: Illustration = {
  k: "inhaler", name: "Inhaler", title: "No doses logged", body: "Log a dose each time you use your inhaler to see your pattern here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const press = 3.2 * Math.sin(Math.PI * cl(h / 0.55)), puff = cl((h - 0.25) / 0.6);
    p.translate(0, 0, -18);
    p.shadow(-1, 0, 24, 10, 0.12);
    p.push();
    p.rotate("z", A);
    // the boot: the tall body, then the mouthpiece reaching out to the left
    prism(p, rr(-2, 0, 8, 24, 3), -4.6, 4.6, 0.085);
    p.disc(2.5, 0, 24.03, 4.4, 0.03);
    prism(p, rr(-17, 1.5, -1, 9.5, 2), -3.6, 3.6, 0.085);
    p.line([[-2, 3.65, 1.9], [-2, 3.65, 9.1]], SH.edge, 0.7);
    // the dark mouth on the left end
    p.face([[-17.03, -2.2, 3.4], [-17.03, 2.2, 3.4], [-17.03, 2.2, 7.6], [-17.03, -2.2, 7.6]], 0.02, 0);
    // the puff: soft bright blobs drifting out of the mouth
    if (puff > 0) for (let i = 0; i < 3; i++) {
      const u = cl(puff * 1.6 - i * 0.3);
      if (u <= 0) continue;
      const [x, y] = p.pt([-19.4 - u * (0.6 + i * 2.6), Math.sin(t * 2 + i) * 0.4, 5.5 + [0, 1.8, -0.8][i] * u]), r = (2.6 - i * 0.5) * Math.min(1, u * 1.5);
      p.screen((c) => { c.strokeStyle = "#fff"; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke(); });
    }
    p.pop();
    // the canister: a bright metal can set into the top, pressed down on hover
    const cx = 2.5 * Math.cos(A), cy = 2.5 * Math.sin(A), H = 16 - press;
    p.cylinder(cx, cy, 24, 3.9, H, { side: 0.4, top: 0.22, edge: 0 });
    p.cylinder(cx, cy, 24 + H, 2.4, 1.8, { side: 0.12, top: 0.3, edge: 0 });
    p.line(Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 12; return [cx + Math.cos(a) * 3.9, cy + Math.sin(a) * 3.9, 24 + H - 2.6] as V3; }), SH.edge, 0.7);
  },
};
