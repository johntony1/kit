// Nothing to parse: a page standing up with its corner folded and an empty pair of curly braces on it. Hover and the braces part and three key and value lines slide in between them.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 13, H = 34, F = 8; // half width and height of the page, the folded corner
const PAGE: P2[] = [[-W, 0], [W, 0], [W, H - F], [W - F, H], [-W, H]];
const on = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
// a curly brace as a stroke: d = 1 opens right (the left brace), -1 opens left
function brace(p: Pen, cx: number, cv: number, d: 1 | -1, hh: number) {
  const s: P2[] = [[2.2, hh], [0.8, hh - 0.5], [0.3, hh - 2], [0.3, 2], [-0.4, 0.8], [-1.6, 0], [-0.4, -0.8], [0.3, -2], [0.3, -hh + 2], [0.8, -hh + 0.5], [2.2, -hh]];
  p.line(s.map(([u, v]) => [cx + d * u, 0.06, cv + v] as V3), SH.edge, 1.7);
}

export const json: Illustration = {
  k: "json", name: "JSON", title: "Nothing to parse", body: "Paste some data or upload a file and it will be laid out here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22, 9, 0.1);
    p.rotate("z", -0.62);
    // the page: a few sheets thick, lit in front, the folded corner darker
    for (let y = -3; y < 0; y += 0.6) p.face(on(PAGE, y), y < -1.5 ? SH.right : 0.1, 0);
    p.face(on(PAGE, 0), 0.24, SH.edge, 0.6);
    p.face(on([[W - F, H], [W - F, H - F], [W, H - F]], 0.04), 0.08, SH.edge, 0.6);
    // the braces, close together at rest, parting on hover
    const k = ease(Math.min(1, h * 1.3)), gap = 3.2 + 4.6 * k, cv = 15;
    brace(p, -gap, cv, 1, 8);
    brace(p, gap, cv, -1, 8);
    // three key and value lines slide in once the braces have parted
    [[4.5, 3, 4], [0, 2.4, 5], [-4.5, 3.4, 3]].forEach(([dv, a, b], i) => {
      const e = Math.max(0, Math.min(1, (h - 0.35 - i * 0.12) / 0.3));
      if (e <= 0) return;
      const x0 = -4.4, v = cv + dv, w = 0.9;
      const bar = (u0: number, u1: number): V3[] => [[u0, 0.05, v - w], [u1, 0.05, v - w], [u1, 0.05, v + w], [u0, 0.05, v + w]];
      p.clear(bar(x0, x0 + a * ease(e)));
      if (e > 0.5) p.clear(bar(x0 + a + 1.4, x0 + a + 1.4 + b * ease((e - 0.5) * 2)));
    });
  },
};
