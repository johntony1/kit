// Nothing written yet: a page standing up with a big heading mark at its top and blank lines below. Hover and the lines write themselves in one after another, a caret blinking at the end.
import { SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const W = 14, H = 34, R = 3; // half width and height of the page, its corner radius
const on = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
function rr(x0: number, v0: number, x1: number, v1: number, r: number): P2[] {
  const out: P2[] = [];
  const cs: [number, number, number][] = [[x1 - r, v1 - r, 0], [x0 + r, v1 - r, 0.5], [x0 + r, v0 + r, 1], [x1 - r, v0 + r, 1.5]];
  for (const [cx, cv, q] of cs) for (let i = 0; i <= 5; i++) { const a = (q + i / 10) * Math.PI; out.push([cx + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
}
const bar = (u0: number, u1: number, v: number, w: number): V3[] => [[u0, 0.05, v - w], [u1, 0.05, v - w], [u1, 0.05, v + w], [u0, 0.05, v + w]];

export const markdown: Illustration = {
  k: "markdown", name: "Markdown", title: "Nothing written yet", body: "Start typing. Headings, lists and links take shape as you write.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22, 9, 0.1);
    p.rotate("z", -0.62);
    const page = rr(-W, 0, W, H, R);
    for (let y = -3; y < 0; y += 0.6) p.face(on(page, y), y < -1.5 ? SH.right : 0.1, 0);
    p.face(on(page, 0), 0.24, SH.edge, 0.6);
    // the heading mark: a bold hash, two slanted uprights and two cross bars
    const hx = -6.5, hv = 25.5, s = 4.4, lean = 1.1;
    for (const du of [-1.6, 1.6]) p.clear([[hx + du - 0.8 - lean, 0.05, hv - s], [hx + du + 0.8 - lean, 0.05, hv - s], [hx + du + 0.8 + lean, 0.05, hv + s], [hx + du - 0.8 + lean, 0.05, hv + s]]);
    for (const dv of [-1.5, 1.5]) p.clear(bar(hx - s, hx + s, hv + dv, 0.75));
    // a heading bar beside the mark, then the body lines: faint grooves at rest, written in on hover
    const lines: [number, number, number][] = [[0, 9.5, 25.5], [-9.5, 9.5, 16.5], [-9.5, 6, 12], [-9.5, 9.5, 7.5], [-9.5, 2, 3]];
    const caret: [number, number][] = [];
    lines.forEach(([u0, u1, v], i) => {
      const e = Math.max(0, Math.min(1, (h - i * 0.15) / 0.25));
      const w = i === 0 ? 1.6 : 1;
      p.face(bar(u0, u1, v, w), 0.12, 0);
      if (e > 0) { const u = u0 + (u1 - u0) * e; p.clear(bar(u0, u, v, w)); if (e < 1 || i === lines.length - 1) caret[0] = [u + 1, v]; }
    });
    if (caret.length && Math.sin(t * 9) > -0.2) {
      const [u, v] = caret[0];
      p.clear([[u, 0.05, v - 1.8], [u + 0.8, 0.05, v - 1.8], [u + 0.8, 0.05, v + 1.8], [u, 0.05, v + 1.8]]);
    }
  },
};
