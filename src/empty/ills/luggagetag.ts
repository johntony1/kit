// Luggage tag: a bag tag on its strap loop, an address window on its face. Hover and it swings on the strap and settles, and a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const BODY: [number, number][] = [[-8.5, 0], [8.5, 0], [8.5, 18], [4.6, 23], [-4.6, 23], [-8.5, 18]];
const ZP = 34; // the top of the strap, where it swings from

// a round bright badge with a dark tick, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}

export const luggagetag: Illustration = {
  k: "luggagetag", name: "Luggage tag", title: "No bags checked", body: "Check a bag and its tag will show here so you can track it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = clamp(h / 0.75);
    const sw = 0.12 + 0.5 * Math.sin(e * Math.PI * 2.5) * (1 - e) + h * 0.05 * Math.sin(t * 2.4);
    p.translate(0, 0, -21);
    p.scale(1.12);
    p.shadow(0, 0, 19, 9, 0.11);
    p.rotate("z", -0.42);
    p.push();
    p.translate(0, 0, 3);
    p.rotate("y", sw, [0, 0, ZP]);
    const at = (y: number) => (q: [number, number]): V3 => [q[0], y, q[1]];
    // the tag: its thickness a step back, then the lit face
    p.face(BODY.map(at(-1.5)), 0.07, 0);
    p.face(BODY.map(at(0)), 0.26, SH.edge, 0.6);
    // the address window and its lines
    p.face(([[-6, 3], [6, 3], [6, 14.6], [-6, 14.6]] as [number, number][]).map(at(0.03)), p.ink ? 0.4 : 0.04, SH.edge, 0.5);
    for (const [z, x1] of [[11.6, 4.4], [8.6, 4.4], [5.6, 0.4]]) {
      if (p.ink) p.line([[-4.4, 0.06, z], [x1, 0.06, z]], SH.edge, 0.8);
      else p.face([[-4.4, 0.06, z - 0.55], [x1, 0.06, z - 0.55], [x1, 0.06, z + 0.55], [-4.4, 0.06, z + 0.55]], 0.5, 0);
    }
    // the eyelet and the strap looped through it
    p.dot([0, 0.05, 19.6], 1.5, 0);
    rod(p, ([[0, 19.4], [-2.4, 24], [-2.7, 28.5], [-1.6, 32], [0, ZP - 0.4], [1.6, 32], [2.7, 28.5], [2.4, 24], [0, 19.4]] as [number, number][]).map(at(0.08)), 1.3);
    p.pop();
    const b = clamp((h - 0.7) / 0.3);
    if (b > 0) badge(p, [11, 0, 30], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
