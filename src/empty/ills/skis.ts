// Skis: a pair of long skis crossed and planted in the snow, a pole on either side. Hover and the poles hop and plant again while snow starts to fall.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const glow = (p: Pen, pts: V3[], lw = 1.2, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const rod = (p: Pen, pts: V3[], lw = 1.2, v = 1) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw, v); };
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const CZ = 18, A = 0.4; // where they cross, and how far each leans
const SKI: [number, number][] = [[-2.2, -19.5], [2.2, -19.5], [2.2, 20], [1.7, 23], [0, 25.5], [-1.7, 23], [-2.2, 20]];

// one ski, leaning by a about the crossing, at depth y
function ski(p: Pen, a: number, y: number, tone: number) {
  const at = (u: number, s: number): V3 => [Math.cos(a) * u + Math.sin(a) * s, y, CZ - Math.sin(a) * u + Math.cos(a) * s];
  const o = SKI.map(([u, s]) => at(u, s));
  p.face(o, tone, 0);
  p.line([...o, o[0]], SH.edge, 0.7);
  // two bands near the tip and two near the tail
  for (const s of [-11, -8.6, 16, 18.4]) p.line([at(-2.2, s), at(2.2, s)], SH.edge, 0.9);
}
// a pole: a bold shaft, a thick grip, a basket near the snow
function pole(p: Pen, x: number, lean: number, up: number) {
  const at = (z: number): V3 => [x + lean * z, 3, z + up];
  rod(p, [at(0), at(35)], 2.2);
  rod(p, [at(29.5), at(35)], 3.6);
  p.disc(x + lean * 4.5, 3, 4.5 + up, 2.6, 0.3, 0);
}

export const skis: Illustration = {
  k: "skis", name: "Skis", title: "No slopes open", body: "The slopes are closed for now. Check back when the lifts open.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -19);
    p.shadow(0, 0, 20, 9, 0.1);
    // the snow they stand in
    p.disc(0, 0, 0, 15, 0.05, 0);
    p.rotate("z", -0.62);
    p.scale(0.9);
    ski(p, A, -0.8, 0.14);
    ski(p, -A, 0.8, 0.3);
    const hop = (d: number) => { const k = clamp((h - d) / 0.5); return k < 0.6 ? Math.sin((k / 0.6) * Math.PI) * 5 : k < 0.85 ? Math.sin(((k - 0.6) / 0.25) * Math.PI) * 1.2 : 0; };
    pole(p, -17, -0.07, hop(0.05));
    pole(p, 17, 0.07, hop(0.3));
    // snow falls
    if (h > 0.05) for (let i = 0; i < 9; i++) {
      const u = (t * 0.32 + i * 0.37) % 1;
      p.dot([-16 + ((i * 17) % 33), 2, 40 - u * 34], 0.8, h * Math.min(1, Math.sin(u * Math.PI) * 2));
    }
  },
};
