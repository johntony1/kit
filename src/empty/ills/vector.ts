// No vectors stored: a two disk store with a port in its top. Three arrows stand in it, short. Hover and they shoot out to full length, each its own way.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 12.5, H = 5.6, GAP = 1.2;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const back = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2); // eases out past its mark, then settles
const arc = (z: number, a0: number, a1: number, n = 14): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * R, Math.sin(a) * R, z] as V3; });

function disk(p: Pen, z: number) {
  const side = (a0: number, a1: number, fill: number) => p.face([...arc(z, a0, a1), ...arc(z + H, a0, a1).reverse()], fill, 0);
  side(-Math.PI / 4, Math.PI / 4, SH.right);
  side(Math.PI / 4, (3 * Math.PI) / 4, SH.left);
  p.disc(0, 0, z + H, R, SH.top, SH.edge);
  p.line(arc(z, -Math.PI / 4, (3 * Math.PI) / 4, 24), SH.edge, 0.55);
  p.dot([Math.cos(2.25) * R + 0.2, Math.sin(2.25) * R + 0.2, z + 2.8], 0.8, 1);
}

// an arrow from a to b: a bright shaft and a solid head, drawn on screen
function arrow(p: Pen, a: V3, b: V3, lw: number) {
  const [x0, y0] = p.pt(a), [x1, y1] = p.pt(b);
  const d = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / d, uy = (y1 - y0) / d, hl = 4.2, hw = 2.3;
  p.screen((c) => {
    c.lineCap = "round";
    // a dark halo keeps the shaft apart from the lit top it crosses
    if (!p.ink) { c.strokeStyle = "#000"; c.lineWidth = lw + 2.2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - ux * hl * 0.8, y1 - uy * hl * 0.8); c.stroke(); }
    c.strokeStyle = "#fff"; c.fillStyle = "#fff"; c.lineWidth = lw;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - ux * hl * 0.8, y1 - uy * hl * 0.8); c.stroke();
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - ux * hl - uy * hw, y1 - uy * hl + ux * hw); c.lineTo(x1 - ux * hl + uy * hw, y1 - uy * hl - ux * hw); c.closePath(); c.fill();
  });
}

const DIRS: [V3, number, number][] = [ // direction, rest length, full length
  [[-0.62, 0.3, 0.72], 9, 19],
  [[0.12, -0.12, 1], 12, 22],
  [[0.7, -0.2, 0.5], 10, 20],
];

export const vector: Illustration = {
  k: "vector", name: "Vector store", title: "No vectors stored", body: "Index your first documents and their vectors will be stored here, ready to search.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 27, 13, 0.12);
    disk(p, 0);
    disk(p, H + GAP);
    // the port the arrows stand in
    const Z = 2 * H + GAP;
    p.disc(0, 0, Z + 0.03, 3.4, 0.02, SH.edge);
    DIRS.forEach(([d, l0, l1], i) => {
      const k = clamp((h - i * 0.12) / 0.6), len = l0 + (l1 - l0) * (k > 0 ? back(k) : 0);
      const sway = h * Math.sin(t * 2 + i * 2.1) * 0.05;
      const dx = d[0] + sway, dy = d[1] - sway;
      arrow(p, [dx * 1.5, dy * 1.5, Z - 0.5], [dx * len, dy * len, Z + d[2] * len], 1.5);
    });
    p.dot([0, 0, Z + 0.2], 1.6, 1);
  },
};
