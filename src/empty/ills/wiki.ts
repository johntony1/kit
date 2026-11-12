// No pages yet: a page linked to two smaller pages, the start of a wiki. Hover and the small pages move out and signals run along the links.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

// a bright stroke: lines turn dark in the dot styles, so marks on a dark ground are stroked on the screen
function bright(p: Pen, pts: V3[], lw: number) {
  if (p.ink) { p.line(pts, SH.edge, lw); return; }
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

const cl = (x: number) => Math.max(0, Math.min(1, x));
const mix = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];

// a page standing in the y plane, centred on (cx, cz)
function page(p: Pen, cx: number, cz: number, w: number, hh: number, fill: number, lines: number) {
  p.box(cx - w, -0.5, cz - hh, w * 2, 1, hh * 2, { top: 0.2, left: fill, right: 0.065 });
  const y = 0.53;
  p.line([[cx - w + 1.8, y, cz + hh - 2.6], [cx - w * 0.1, y, cz + hh - 2.6]], SH.edge, 0.95);
  for (let i = 0; i < lines; i++) p.line([[cx - w + 1.8, y, cz + hh - 5.4 - i * 2.6], [cx + w - 1.8 - (i === lines - 1 ? w * 0.7 : 0), y, cz + hh - 5.4 - i * 2.6]], SH.edge, 0.6);
}

export const wiki: Illustration = {
  k: "wiki", name: "Wiki", title: "No pages yet", body: "Write your first page. Linked pages will grow into a wiki from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(cl(h / 0.7));
    p.translate(0, 0, -15);
    p.shadow(0, 0, 29, 12, 0.11);
    p.rotate("z", -0.42);
    const o = k * 2.6;
    const A: V3 = [-1.2, 0.5, 17], B: V3 = [8.6 + o, 0.5, 23.5 + o * 0.7], C: V3 = [8.6 + o, 0.5, 7.5 - o * 0.5];
    // the links, behind the pages they join
    bright(p, [A, [3.8 + o / 2, 0.5, A[2]], [3.8 + o / 2, 0.5, B[2]], B], 0.9);
    bright(p, [[3.8 + o / 2, 0.5, A[2]], [3.8 + o / 2, 0.5, C[2]], C], 0.9);
    if (h > 0.5) {
      const s = (t * 0.8) % 1, mx = 3.8 + o / 2;
      for (const q of [B, C]) p.dot(s < 0.5 ? mix(A, [mx, 0.5, A[2]], s * 2) : mix([mx, 0.5, A[2]], [mx, 0.5, q[2]], (s - 0.5) * 2), 1, cl((h - 0.5) / 0.3));
    }
    page(p, -8.5, 15, 8.5, 13, 0.22, 5);
    page(p, 13.5 + o, 23.5 + o * 0.7, 5.5, 6.5, 0.16, 2);
    page(p, 13.5 + o, 7.5 - o * 0.5, 5.5, 6.5, 0.16, 2);
    p.dot([0, 0.56, 17], 1.1, 1);
  },
};
