// Nothing has set sail: a bold folded paper boat on three solid waves. It bobs and rocks while the waves run under it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const P = 3.2; // seconds per loop
// a wave: a white stroke, with a dark gap under it where it crosses the hull
function wave(p: Pen, v0: number, u0: number, u1: number, ph: number, cut: boolean) {
  const pts: P2[] = Array.from({ length: 41 }, (_, i) => { const u = u0 + ((u1 - u0) * i) / 40; return [u, v0 + Math.sin(u * 0.52 + ph) * 1.25] as P2; });
  if (cut) p.line(pts.map(B), SH.edge, 3.4);
  const q = pts.map((a) => p.pt(B(a)));
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.7; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
}

export const paperboat: Illustration = {
  k: "paperboat", name: "Paper boat", title: "Nothing has set sail", body: "Nothing has been sent yet. What you send will be tracked here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = ((t / P) % 1) * Math.PI * 2;
    p.push(); p.translate(0, 0, -23); p.shadow(0, 0, 26, 10, 0.1); p.pop();
    const a = Math.sin(w + 0.8) * 0.06, ca = Math.cos(a), sa = Math.sin(a), bob = 2.5 + Math.sin(w) * 1.1;
    const R = (u: number, v: number): V3 => B([u * ca + (v + 6) * sa, bob - 6 - u * sa + (v + 6) * ca]);
    // the sail: the folded peak, a lit side and a shaded side
    p.face([R(-9.5, 1), R(0, 1), R(0, 21)], 0.12, 0);
    p.face([R(0, 1), R(9.5, 1), R(0, 21)], 0.055, 0);
    p.line([R(-9.5, 1), R(0, 21), R(9.5, 1)], SH.edge, 0.6);
    p.line([R(0, 21), R(0, 1)], SH.edge, 0.8);
    // the hull: two wings swept up to the bow and the stern
    p.face([R(-24, 6.5), R(-7, 1.5), R(0, 1.5), R(0, -9), R(-12.5, -9)], 0.26, 0);
    p.face([R(0, 1.5), R(7, 1.5), R(24, 6.5), R(12.5, -9), R(0, -9)], 0.09, 0);
    p.line([R(-24, 6.5), R(-7, 1.5), R(7, 1.5), R(24, 6.5), R(12.5, -9), R(-12.5, -9), R(-24, 6.5)], SH.edge, 0.6);
    p.line([R(0, 1.5), R(0, -9)], SH.edge, 0.9);
    // the water
    wave(p, -9.6, -28, 28, -w, true);
    wave(p, -15.2, -19, 24, -w + 2.2, false);
    wave(p, -20.6, -25, 9, -w + 4.1, false);
  },
};
