// Nothing to study: a simple desk on four legs with an open book and a desk lamp on it. Hover and the lamp clicks on, a pool of light spreads over the desk and a page of the book turns.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 21, Y = 8, TZ = 14, TH = 2.4; // half width, half depth, the legs' height, the top's thickness

/** a bright stroke with a dark rim, through 3D points */
function rod(p: Pen, pts: V3[], w: number) {
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.lineCap = "round"; c.lineJoin = "round";
    for (const [col, lw] of [["#000", w + 1.4], ["#fff", w]] as const) {
      c.strokeStyle = col; c.lineWidth = lw;
      c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    }
  });
}

export const studydesk: Illustration = {
  k: "studydesk", name: "Study desk", title: "Nothing to study", body: "Add a course or some notes and your study plan will be set out here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const on = ease(Math.min(1, h * 1.6)), turn = ease(Math.max(0, Math.min(1, (h - 0.35) / 0.65)));
    p.translate(0, 0, -13);
    p.shadow(0, 0, 32, 12, 0.12);
    p.rotate("z", -0.42);
    // four legs, the back two first
    for (const [lx, ly] of [[-X + 1, -Y + 1], [X - 3.6, -Y + 1], [-X + 1, Y - 3.6], [X - 3.6, Y - 3.6]]) p.box(lx, ly, 0, 2.6, 2.6, TZ, { top: 0.2, left: 0.2, right: 0.09, edge: 0 });
    // the top: a dense slab, a step below the bright book so the book stands out on it
    p.box(-X, -Y, TZ, X * 2, Y * 2, TH, { top: 0.13, left: 0.2, right: 0.065, edge: 0 });
    const Z = TZ + TH + 0.02;
    // the pool of light once the lamp is on
    if (on > 0.01) {
      const r = 10 * on;
      p.face(Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.max(-X, Math.min(X, -6 + Math.cos(a) * r * 1.3)), Math.max(-Y, Math.min(Y, Math.sin(a) * r * 0.75)), Z] as V3; }), 0.24, 0);
    }
    // the open book: a dark gap round it, two bright pages in a shallow V
    const BX = 5, BY = 0.5, BW = 8.5, BD = 6;
    p.face([[BX - BW - 0.9, BY - BD - 0.9, Z], [BX + BW + 0.9, BY - BD - 0.9, Z], [BX + BW + 0.9, BY + BD + 0.9, Z], [BX - BW - 0.9, BY + BD + 0.9, Z]], 0.015, 0);
    const page = (s: number): V3[] => [[BX, BY - BD, Z + 0.3], [BX + s * BW, BY - BD, Z + 1.6], [BX + s * BW, BY + BD, Z + 1.6], [BX, BY + BD, Z + 0.3]];
    p.face(page(-1), 0.5, 0);
    p.face(page(1), 0.42, 0);
    p.line([[BX, BY - BD, Z + 0.4], [BX, BY + BD, Z + 0.4]], 0, 0.7);
    if (turn > 0.01 && turn < 0.99) {
      const a = Math.PI * turn, ex = BX + Math.cos(a) * BW * 0.95, ez = Z + 0.6 + Math.sin(a) * BW * 0.95;
      p.face([[BX, BY - BD, Z + 0.5], [ex, BY - BD, ez], [ex, BY + BD, ez], [BX, BY + BD, Z + 0.5]], 0.55, 0);
      p.line([[ex, BY - BD, ez], [ex, BY + BD, ez]], 0, 0.6);
    }
    // the lamp, drawn in a face on frame: a round foot, a jointed arm, a cone shade whose mouth glows when on
    p.push();
    p.translate(-14, -3, Z);
    p.rotate("z", -Math.PI / 4 + 0.42);
    p.cylinder(0, 0, 0, 3.2, 1.3, { side: 0.12, top: 0.3, edge: 0 });
    const head: V3 = [4, 0, 17];
    rod(p, [[0, 0, 1.3], [-2.5, 0, 13], head], 1.8);
    const ax = [0.62, -0.78], nx = [0.78, 0.62], at = (l: number, w: number, y = 0): V3 => [head[0] + ax[0] * l + nx[0] * w, y, head[2] + ax[1] * l + nx[1] * w];
    p.face([at(-1, -2.2), at(8, -6.5), at(8, 6.5), at(-1, 2.2)], 0.3, 0);
    p.line([at(-1, -2.2), at(8, -6.5)], 0, 0.6);
    p.face(Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return at(8, Math.cos(a) * 6.5, Math.sin(a) * 5); }), 0.04 + 0.66 * on, 0);
    p.pop();
  },
};
