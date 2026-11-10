// No tickets: an admission ticket lying flat, a perforated line before its stub. Hover and the stub tears off and lifts away.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const X0 = -18, X1 = 18, Y = 7.4, TH = 2.2; // ends, half depth, thickness
const XT = 7.5, NR = 1.8; // the tear line and the notch radius

// a quarter arc of points around (cx, cy), from angle a0 to a1
const arc = (cx: number, cy: number, a0: number, a1: number): P2[] =>
  Array.from({ length: 7 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 6; return [cx + Math.cos(a) * NR, cy + Math.sin(a) * NR]; });
const H = Math.PI / 2;
// the main part and the stub, each with notched corners where they meet and at the ends
const MAIN: P2[] = [...arc(X0, -Y, H, 0), ...arc(XT, -Y, Math.PI, H), ...arc(XT, Y, -H, -Math.PI), ...arc(X0, Y, 0, -H)];
const STUB: P2[] = [...arc(XT, -Y, H, 0), ...arc(X1, -Y, Math.PI, H), ...arc(X1, Y, -H, -Math.PI), ...arc(XT, Y, 0, -H)];

// a flat outline extruded from z0 to z1: the walls that face us, back to front, then the lit top
function slab(p: Pen, pts: P2[], z0: number, z1: number, top: number) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  const walls: { d: number; f: number; q: V3[] }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    let nx = (b[1] - a[1]) * sg, ny = -(b[0] - a[0]) * sg;
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (nx + ny <= 0.02) continue;
    const k = Math.max(0, Math.min(1, (ny - nx) * 0.5 + 0.5)); // 1 facing +y, 0 facing +x
    walls.push({ d: a[0] + a[1] + b[0] + b[1], f: SH.right + (SH.left - SH.right) * k, q: [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]] });
  }
  walls.sort((u, v) => u.d - v.d).forEach((w) => p.face(w.q, w.f, 0));
  p.face(pts.map(([x, y]) => [x, y, z1] as V3), top, 0);
}

export const ticket: Illustration = {
  k: "ticket", name: "Ticket", title: "No tickets", body: "When you book an event, your tickets will be waiting for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-1.5, 0, -1);
    p.rotate("z", -0.12);
    p.shadow(0, 0, 30, 13, 0.12);
    const z = TH + 0.02;
    // the main part, with a border, a star and the admit lines
    slab(p, MAIN, 0, TH, 0.22);
    p.line([[X0 + 2, -Y + 2, z], [XT - 2, -Y + 2, z], [XT - 2, Y - 2, z], [X0 + 2, Y - 2, z], [X0 + 2, -Y + 2, z]], SH.edge, 0.5);
    const star = Array.from({ length: 11 }, (_, i) => { const a = -H + (i * Math.PI) / 5, r = i % 2 ? 1.5 : 3.4; return [-11 + Math.cos(a) * r, -0.2 + Math.sin(a) * r, z] as V3; });
    p.line(star, SH.edge, 0.65);
    p.line([[-5.6, -2.2, z], [3.2, -2.2, z]], SH.edge, 1.3);
    p.line([[-5.6, 0.6, z], [1, 0.6, z]], SH.edge, 0.8);
    p.line([[-5.6, 2.8, z], [-1.4, 2.8, z]], SH.edge, 0.8);
    // the perforation
    if (h < 0.15) for (let y = -Y + 2.4; y < Y - 2; y += 1.4) p.line([[XT, y, z], [XT, y + 0.55, z]], SH.edge, 0.65);
    // the stub: tears along the line, lifts its far end and drifts off
    p.push();
    p.translate(4.5 * h, 3 * h, 6 * h);
    p.rotate("z", 0.3 * h, [XT, 0, 0]);
    p.rotate("x", -0.32 * h, [0, 0, 0]);
    p.rotate("y", 0.2 * h, [XT, 0, 0]);
    slab(p, STUB, 0, TH, 0.28);
    p.line([[XT + 1.2, -Y + 2, z], [X1 - 2, -Y + 2, z], [X1 - 2, Y - 2, z], [XT + 1.2, Y - 2, z]], SH.edge, 0.5);
    p.line([[XT + 3.4, -Y + 3.4, z], [XT + 3.4, Y - 3.4, z]], SH.edge, 1);
    p.line([[XT + 5.6, -Y + 3.6, z], [XT + 5.6, Y - 3.6, z]], SH.edge, 0.6);
    p.line([[XT + 7.6, -Y + 3.4, z], [XT + 7.6, 0.6, z]], SH.edge, 0.6);
    p.pop();
    // the torn edge left behind, and a few paper crumbs falling from the tear
    if (h > 0.15) for (let y = -Y + 1.2; y < Y - 1; y += 1.4) p.line([[XT - 0.2, y, z], [XT + 0.25, y + 0.7, z]], SH.edge, 0.55);
    const k = Math.max(0, (h - 0.35) / 0.65);
    if (k > 0) for (let i = 0; i < 5; i++) {
      const u = (t * 0.6 + i / 5) % 1;
      p.dot([XT + 2 + i * 0.6, -4 + i * 2, 5 - u * 4.5], 0.55, k * Math.sin(u * Math.PI));
    }
  },
};
