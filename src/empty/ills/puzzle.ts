// Missing something: a jigsaw tray with one piece gone. The piece hovers above its gap, dips down as if to drop in, then floats back up.
import { easeInOut, pulse, SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 4.2; // seconds per loop
const ZB = 3; // the top of the tray
const KR = 2.3, KO = 1.9; // knob radius and how far its centre sits past the edge

/** an edge from a to b with a round knob in the middle; dir +1 bulges to the left of a->b, -1 to the right, 0 is flat */
function edge(a: P2, b: P2, dir: number): P2[] {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  if (!dir) return [a];
  const nx = -uy * dir, ny = ux * dir; // the bulge direction
  const m: P2 = [a[0] + dx / 2 + nx * KO, a[1] + dy / 2 + ny * KO];
  const pa: P2 = [a[0] + dx / 2 - ux * KR * 0.62, a[1] + dy / 2 - uy * KR * 0.62];
  const pb: P2 = [a[0] + dx / 2 + ux * KR * 0.62, a[1] + dy / 2 + uy * KR * 0.62];
  // go round the knob the long way, through its far side
  const TAU = Math.PI * 2, wrap = (v: number) => ((v % TAU) + TAU) % TAU;
  const aA = Math.atan2(pa[1] - m[1], pa[0] - m[0]), aB = Math.atan2(pb[1] - m[1], pb[0] - m[0]), aN = Math.atan2(ny, nx);
  const d1 = wrap(aB - aA), sweep = wrap(aN - aA) < d1 ? d1 : d1 - TAU;
  const out: P2[] = [a, pa];
  for (let i = 1; i < 18; i++) { const ang = aA + (sweep * i) / 18; out.push([m[0] + Math.cos(ang) * KR, m[1] + Math.sin(ang) * KR]); }
  out.push(pb);
  return out;
}

// the missing piece (front corner of the tray): a tab into its back neighbour, a slot for its left neighbour
const X0 = 5, X1 = 15, Y0 = 0, Y1 = 10;
const PIECE: P2[] = [
  ...edge([X0, Y0], [X1, Y0], -1),
  ...edge([X1, Y0], [X1, Y1], 0),
  ...edge([X1, Y1], [X0, Y1], 0),
  ...edge([X0, Y1], [X0, Y0], -1),
];
const area = (q: P2[]) => q.reduce((s, v, i) => { const w = q[(i + 1) % q.length]; return s + v[0] * w[1] - w[0] * v[1]; }, 0);
const CCW = area(PIECE) > 0;

export const puzzle: Illustration = {
  k: "puzzle", name: "Jigsaw", title: "Missing something", body: "Some pieces are not here yet. Add them and the picture will come together.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    const k = easeInOut(pulse(t, P, 0.25)); // 1 at the bottom of the dip
    p.translate(-1, 0, -10);
    p.shadow(0, 0, 30, 14, 0.1);
    // the tray
    p.box(-16, -11, 0, 32, 22, ZB, { top: SH.top, left: 0.12, right: 0.065 });
    const Z = ZB + 0.02;
    const cut = (pts: P2[]) => p.line(pts.map(([x, y]) => [x, y, Z] as V3), SH.edge, 0.7);
    // the seams between the pieces that are there
    cut([...edge([-5, -10], [-5, 0], 1), [-5, 0]]);
    cut([...edge([-5, 0], [-5, 10], -1), [-5, 10]]);
    cut([...edge([5, -10], [5, 0], -1), [5, 0]]);
    cut([...edge([-15, 0], [-5, 0], 1), [-5, 0]]);
    cut([...edge([-5, 0], [5, 0], -1), [5, 0]]);
    // the gap: dark, with its far walls showing
    const hole = PIECE.map(([x, y]) => [x, y, Z] as V3);
    p.clear(hole);
    for (let i = 0; i < PIECE.length; i++) {
      const a = PIECE[i], b = PIECE[(i + 1) % PIECE.length];
      const ex = b[0] - a[0], ey = b[1] - a[1];
      const ix = CCW ? -ey : ey, iy = CCW ? ex : -ex; // the wall's normal, pointing into the gap
      if (ix + iy <= 0) continue;
      p.face([[a[0], a[1], Z], [b[0], b[1], Z], [b[0], b[1], Z - 1.8], [a[0], a[1], Z - 1.8]], iy > ix ? SH.left : SH.right, 0);
    }

    // the loose piece, floating above its gap
    const lift = 1.6 + (1 - k) * 12 + 0.8 * Math.sin(Math.PI * 2 * u) * (1 - k);
    const rot = (1 - k) * 0.5 + 0.08 * Math.sin(Math.PI * 4 * u) * (1 - k);
    const cx = (X0 + X1) / 2, cy = (Y0 + Y1) / 2;
    const at = ([x, y]: P2, z: number): V3 => {
      const c = Math.cos(rot), s = Math.sin(rot), dx = x - cx, dy = y - cy;
      return [cx + dx * c - dy * s + (1 - k) * 3, cy + dx * s + dy * c - (1 - k) * 5, z];
    };
    const z0 = Z + lift, z1 = z0 + 2.6;
    // its shadow darkens the tray and the gap
    p.push(); p.translate(0, 0, ZB); p.shadow(cx, cy, 9 - k * 2, 4.5 - k, 0.05); p.pop();
    const sides: { q: V3[]; tone: number }[] = [];
    for (let i = 0; i < PIECE.length; i++) {
      const a = PIECE[i], b = PIECE[(i + 1) % PIECE.length];
      const A = at(a, z0), B = at(b, z0);
      const ex = B[0] - A[0], ey = B[1] - A[1];
      const nx = CCW ? ey : -ey, ny = CCW ? -ex : ex; // outward
      if (nx + ny <= 0) continue;
      sides.push({ q: [A, B, at(b, z1), at(a, z1)], tone: ny > nx ? SH.left : SH.right });
    }
    halo(p, [...sides.map((f) => f.q), PIECE.map((v) => at(v, z1))]);
    for (const f of sides) p.face(f.q, f.tone, 0);
    p.face(PIECE.map((v) => at(v, z1)), SH.top, 0);
  },
};

/** a thin dark outline around a shape, so it stands clear of whatever is behind it */
function halo(p: Pen, polys: V3[][]) {
  p.screen((c) => {
    c.fillStyle = "#000"; c.strokeStyle = "#000"; c.lineWidth = 1.6; c.lineJoin = "round";
    for (const q of polys) {
      c.beginPath(); q.forEach((v, i) => { const [x, y] = p.pt(v); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.closePath(); c.fill(); c.stroke();
    }
  });
}
