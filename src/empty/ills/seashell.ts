// Nothing washed up yet: a big scallop shell standing face on, its rounded top edge scalloped, bright and shaded ribs fanning out from a narrow hinge with two little ears. Hover and it rocks on its hinge and a glint pops at its rim.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
type P2 = [number, number];
const VX = 0.233;

/** a flat outline in the x z plane between y0 and y1: its lit tops and sparse ends */
function sides(p: Pen, pts: P2[], y0: number, y1: number, top = 0.2, side = 0.065) {
  let a = 0;
  pts.forEach(([u0, v0], i) => { const [u1, v1] = pts[(i + 1) % pts.length]; a += u0 * v1 - u1 * v0; });
  const s = a > 0 ? 1 : -1;
  pts.map((q, i) => [q, pts[(i + 1) % pts.length]] as [P2, P2]).sort((A, B) => A[0][1] + A[1][1] - B[0][1] - B[1][1]).forEach(([[u0, v0], [u1, v1]]) => {
    const nx = (v1 - v0) * s, nz = (u0 - u1) * s;
    if (nx * VX + nz <= 0) return;
    p.face([[u0, y0, v0], [u1, y0, v1], [u1, y1, v1], [u0, y1, v0]], nz > Math.abs(nx) ? top : side, 0);
  });
}

const HZ = -16, N = 9, SPAN = 0.88; // the hinge's height, the ribs, half the fan's angle
// the rim: wide and round, each rib ending in a little bump
const rim = (f: number) => {
  const k = (f / SPAN + 1) / 2 * N, bump = Math.sin((k % 1) * Math.PI);
  return 29 * (1 - 0.1 * (f / SPAN) ** 4) + 1.6 * bump;
};
const at = (f: number, r: number): P2 => [Math.sin(f) * r * 0.95, HZ + 1 + Math.cos(f) * r];

export const seashell: Illustration = {
  k: "seashell", name: "Seashell", title: "Nothing washed up yet", body: "Nothing has come in so far. New finds will turn up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -2);
    p.shadow(0, 2, 26, 9, 0.12);
    p.rotate("z", -0.62);
    p.rotate("y", h * Math.sin(t * 5) * 0.06, [0, 0, HZ]);
    // the outline: up from the hinge along one shoulder, round the scalloped rim, back down
    const out: P2[] = [[-3, HZ + 1]];
    for (let i = 0; i <= 90; i++) { const f = -SPAN + (i / 90) * SPAN * 2; out.push(at(f, rim(f))); }
    out.push([3, HZ + 1]);
    sides(p, out, -1.5, 1.5);
    // the ribs: wedges from the hinge, bright and shaded by turns, the middle ones brightest
    for (let i = 0; i < N; i++) {
      const f0 = -SPAN + (i / N) * SPAN * 2, f1 = -SPAN + ((i + 1) / N) * SPAN * 2, w: P2[] = [[0, HZ + 1.5]];
      for (let j = 0; j <= 8; j++) { const f = f0 + ((f1 - f0) * j) / 8; w.push(at(f, rim(f))); }
      const mid = Math.abs((f0 + f1) / 2) / SPAN;
      p.face(w.map(([u, v]) => [u, 1.5, v] as V3), mid < 0.5 ? 0.28 : mid < 0.8 ? 0.2 : 0.12, 0);
    }
    // the grooves between the ribs: dark cuts fanning from the hinge
    for (let i = 1; i < N; i++) {
      const f = -SPAN + (i / N) * SPAN * 2, [u, v] = at(f, rim(f) - 0.6), [a, b] = at(f, 5);
      p.line([[a, 1.55, b], [u, 1.55, v]], 1, 0.9);
    }
    // the hinge and its two ears: a lit flat-topped wing under the fan
    const ear: P2[] = [[-7.5, HZ + 0.5], [7.5, HZ + 0.5], [7, HZ + 4.2], [2.6, HZ + 3.4], [0, HZ + 4], [-2.6, HZ + 3.4], [-7, HZ + 4.2]];
    sides(p, ear, -1.5, 2, 0.26);
    p.face(ear.map(([u, v]) => [u, 2, v] as V3), 0.24, 0);
    // a glint pops just off the rim at the top right
    const b = Math.max(0, (h - 0.5) / 0.5);
    if (b > 0) {
      const r = 4 * (b < 0.6 ? ease(b / 0.6) * 1.15 : 1.15 - 0.15 * ease((b - 0.6) / 0.4));
      const [gu, gv] = at(0.6, 32), [x, y] = p.pt([gu, 1.5, gv]);
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.beginPath();
        g.moveTo(x, y - r); g.lineTo(x, y + r); g.moveTo(x - r, y); g.lineTo(x + r, y); g.stroke();
      });
    }
  },
};
