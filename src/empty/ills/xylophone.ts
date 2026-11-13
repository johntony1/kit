// Nothing played yet: a toy xylophone, six bars stepping down in length on two dark rails, a mallet resting across it. Hover and the mallet lifts and strikes a bar, the bar lights up and a note pops up.
import { type Illustration, type V3 } from "../dots";

const N = 6, BW = 4.4, GAP = 2.5, BH = 2.6, RZ = 4; // bars, bar width, gap between bars, bar thickness, rail height
const len = (i: number) => 28 - i * 2.8; // bar lengths, longest at the back
const X0 = -((N * BW + (N - 1) * GAP) / 2);
const XS = Array.from({ length: N }, (_, i) => X0 + i * (BW + GAP));

export const xylophone: Illustration = {
  k: "xylophone", name: "Xylophone", title: "Nothing played yet", body: "Play your first tune and it will be saved here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 32, 14, 0.12);
    p.rotate("z", -0.12);
    // the rails: two dark wooden beams under the bar ends, closing in as the bars get shorter
    const rail = (s: number) => {
      const xa = X0 - 1.6, xb = XS[N - 1] + BW + 1.6;
      const ya = s * (len(0) / 2 - 3), yb = s * (len(N - 1) / 2 - 3), w = 1.5;
      p.face([[xa, ya + w, 0], [xb, yb + w, 0], [xb, yb + w, RZ], [xa, ya + w, RZ]], 0.09, 0);
      p.face([[xb, yb - w, 0], [xb, yb + w, 0], [xb, yb + w, RZ], [xb, yb - w, RZ]], 0.05, 0);
      p.face([[xa, ya - w, RZ], [xb, yb - w, RZ], [xb, yb + w, RZ], [xa, ya + w, RZ]], 0.14, 0);
    };
    rail(-1); rail(1);
    // the beat: the mallet lifts, comes down on bar 2, and the bar lights up
    const hit = 2;
    const up = h < 0.45 ? Math.sin((h / 0.45) * Math.PI * 0.5) * 7 : h < 0.6 ? 7 * (1 - (h - 0.45) / 0.15) : Math.sin(((h - 0.6) / 0.4) * Math.PI) * 1.4;
    const lit = h > 0.58 ? Math.min(1, (h - 0.58) / 0.1) : 0;
    const dip = h > 0.58 && h < 0.8 ? Math.sin(((h - 0.58) / 0.22) * Math.PI) * 0.7 : 0;
    // the bars, back to front, with dark gaps between them
    XS.forEach((x, i) => {
      const L = len(i), z = RZ - (i === hit ? dip : 0), on = i === hit ? lit : 0;
      p.box(x, -L / 2, z, BW, L, BH, { top: 0.26 + on * 0.22, left: 0.12, right: 0.03, edge: 0 });
    });
    // the mallet: a bright stick and a round head, resting across the bars
    const head: V3 = [XS[hit] + BW / 2, 3.5, RZ + BH + 2 + up];
    const end: V3 = [XS[N - 1] + BW + 2, 10, RZ + BH + 1.4 + up * 0.25];
    const [hx, hy] = p.pt(head), [ex, ey] = p.pt(end);
    p.screen((g) => {
      g.lineCap = "round";
      for (const [c, w] of [["#000", 4.6], ["#fff", 2.2]] as [string, number][]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke(); }
    });
    p.dot(head, 3.4, 0);
    p.dot(head, 2.6, 0.45);
    // a note pops up over the struck bar
    const n = Math.max(0, (h - 0.65) / 0.35);
    if (n > 0) {
      const [nx, ny] = p.pt([XS[hit] - 3, -9, RZ + 10 + n * 2 + h * Math.sin(t * 4) * 0.4]);
      const r = 1.8 * Math.min(1, n * 2.2);
      p.screen((g) => {
        g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineWidth = 1.4; g.lineCap = "round";
        g.beginPath(); g.ellipse(nx, ny, r * 1.2, r * 0.9, -0.4, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.moveTo(nx + r, ny - 0.3); g.lineTo(nx + r, ny - r * 4); g.lineTo(nx + r * 2.6, ny - r * 3); g.stroke();
      });
    }
  },
};
