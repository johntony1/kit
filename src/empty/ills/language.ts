// No languages added: two speech bubbles, a letter A on the front one and a second script on the one behind. Hover and they slide apart and a swap badge pops in between them.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const pop = (b: number) => (b <= 0 ? 0 : b < 0.6 ? (b / 0.6) * 1.2 : 1.2 - 0.2 * ((b - 0.6) / 0.4));
/** screen winding: > 0 when an outward face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a flat shape in the plane that faces left, given as [x, z] points, with thickness from y0 to y1 */
function prism(p: Pen, poly: [number, number][], y0: number, y1: number, front: number = SH.left, edge: number = SH.edge) {
  let a = 0;
  poly.forEach(([x, z], i) => { const [x2, z2] = poly[(i + 1) % poly.length]; a += x * z2 - x2 * z; });
  const pts = a > 0 ? poly.slice().reverse() : poly;
  pts.forEach((q, i) => {
    const b = pts[(i + 1) % pts.length], f: V3[] = [[q[0], y1, q[1]], [q[0], y0, q[1]], [b[0], y0, b[1]], [b[0], y1, b[1]]];
    if (facing(p, f) > 0) p.face(f, b[0] - q[0] > Math.abs(b[1] - q[1]) * 0.3 ? SH.top : SH.right, edge, 0.5);
  });
  p.face(pts.map(([x, z]) => [x, y1, z] as V3), front, SH.edge, 0.6);
}
/** a rounded rectangle as [x, z] points */
const rr = (cx: number, cz: number, w: number, hh: number, r: number): [number, number][] => {
  const out: [number, number][] = [];
  ([[w - r, hh - r, 0], [-(w - r), hh - r, 1], [-(w - r), -(hh - r), 2], [w - r, -(hh - r), 3]] as [number, number, number][]).forEach(([x, z, q]) => {
    for (let i = 0; i <= 5; i++) { const a = (q + i / 5) * (Math.PI / 2); out.push([cx + x + Math.cos(a) * r, cz + z + Math.sin(a) * r]); }
  });
  return out;
};
const GA: [number, number][][] = [[[-1, -1.25], [0, 1.25], [1, -1.25]], [[-0.58, -0.35], [0.58, -0.35]]];
const GB: [number, number][][] = [[[0, 1.4], [0, 0.85]], [[-1.25, 0.8], [1.25, 0.8]], [[0.75, 0.75], [0.3, -0.35], [-1.25, -1.3]], [[-0.75, 0.75], [-0.2, -0.3], [1.25, -1.3]]];

function bubble(p: Pen, cx: number, cz: number, y: number, tail: number, fill: number, glyph: [number, number][][]) {
  prism(p, [[cx + tail * 2, cz - 5.6], [cx + tail * 6.4, cz - 5.6], [cx + tail * 6.8, cz - 10]], y, y + 2.4, fill);
  prism(p, rr(cx, cz, 9, 6.6, 2.6), y, y + 2.4, fill, 0);
  for (const s of glyph) p.line(s.map(([u, v]) => [cx + u * 2.9, y + 2.44, cz + v * 2.9] as V3), SH.edge, 1.1);
}

export const language: Illustration = {
  k: "language", name: "Language", title: "No languages added", body: "Add a language and your content can be translated into it from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const s = ease(seg(h, 0, 0.6)) * 3.4;
    p.translate(1, -1, -16);
    p.shadow(-1, 1, 28, 12, 0.12);
    bubble(p, 6 + s, 22 + s * 0.5 + Math.sin(t * 2) * 0.4 * h, -5, 1, 0.2, GB);
    bubble(p, -6 - s, 12.5 - s * 0.3, 3, -1, 0.3, GA);
    // the swap badge: a bright disc with two arrows, flat to the screen
    const b = pop(seg(h, 0.55, 0.95));
    if (b > 0) {
      const [x, y] = p.pt([4, 4.5, 6 + s]), r = 4.4 * b;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.22; g.lineCap = "round"; g.lineJoin = "round";
        for (const d of [-1, 1]) {
          const yy = y + d * r * 0.26;
          g.beginPath(); g.moveTo(x - r * 0.5, yy); g.lineTo(x + r * 0.5, yy);
          g.moveTo(x + d * r * 0.5, yy); g.lineTo(x + d * r * 0.22, yy + d * r * 0.28); g.stroke();
        }
      });
    }
  },
};
