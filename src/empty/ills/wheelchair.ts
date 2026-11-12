// Wheelchair: a wheelchair seen side on, one big spoked wheel, a solid seat and back, a small front caster. Hover and it rolls forward, then a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const glow = (p: Pen, pts: V3[], lw = 1.2, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const rod = (p: Pen, pts: V3[], lw = 1.2, v = 1) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw, v); };
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 9.4, WX = -6, WY = 5.4; // the big wheel: radius, axle x, depth

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const wheelchair: Illustration = {
  k: "wheelchair", name: "Wheelchair", title: "No access needs listed", body: "Add any access needs so we can prepare ahead of your visit.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(clamp(h / 0.7)), b = clamp((h - 0.7) / 0.3), dx = -1.5 + 3 * k;
    p.translate(0, 0, -18);
    p.shadow(0, 1, 24, 11, 0.12);
    p.rotate("z", -0.62);
    p.scale(1.14);
    p.translate(dx - 1.5, 0, 0);
    // the back and its push handle
    p.box(-11.8, -4.5, 13, 3.6, 9, 19, { top: 0.14, left: 0.3, right: 0.12, edge: 0 });
    rod(p, [[-10, 0, 31], [-15.5, 0, 32]], 1.8);
    // the seat: a solid slab
    p.box(-8.2, -4.5, 13, 20.2, 9, 3.2, { top: 0.2, left: 0.3, right: 0.065, edge: 0 });
    p.line([[-8.2, 4.53, 16.2], [12, 4.53, 16.2]], SH.edge, 0.5);
    // the footrest and the small front caster
    rod(p, [[11.4, 4.6, 13], [15, 4.6, 3.6]], 1.6);
    p.box(13.4, -3, 2.6, 5.4, 7.6, 1, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
    rod(p, [[7.6, WY, 13], [8.4, WY, 3.2]], 1.4);
    p.ringV("y", [8.4, WY, 3.2], 3.2, 0.3, 0);
    p.dot([8.4, WY + 0.05, 3.2], 1.1, 0);
    // the big wheel: a bold tyre, a dark middle, bright spokes and a hub
    const circ = (r: number): V3[] => Array.from({ length: 40 }, (_, i) => { const q = (i / 40) * Math.PI * 2; return [WX + Math.cos(q) * r, WY, R + Math.sin(q) * r] as V3; });
    p.face(circ(R), 0.3, 0);
    p.clear(circ(R - 2.3));
    const a = -dx / R;
    for (let s = 0; s < 4; s++) { const q = a + (s * Math.PI) / 4, c = Math.cos(q) * (R - 2.3), d = Math.sin(q) * (R - 2.3); rod(p, [[WX + c, WY, R + d], [WX - c, WY, R - d]], 0.9); }
    p.face(Array.from({ length: 16 }, (_, i) => { const q = (i / 16) * Math.PI * 2; return [WX + Math.cos(q) * 2, WY + 0.03, R + Math.sin(q) * 2] as V3; }), 0.3, 0);
    if (b > 0) badge(p, [14, 0, 27], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
