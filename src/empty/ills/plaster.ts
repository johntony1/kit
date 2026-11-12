// Plaster: a sticking plaster lying flat, its pad raised and its ends dotted with air holes. Hover and a second one drops across it with a bounce and a few sparkles.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const L = 12, R = 5, TH = 1.3; // half the straight run, the end radius, the thickness
// the outline: a strip with round ends, along x or (swapped) along y
const stad = (z: number, sw: boolean): V3[] => {
  const q: [number, number][] = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; q.push([L + Math.cos(a) * R, Math.sin(a) * R]); }
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; q.push([-L + Math.cos(a) * R, Math.sin(a) * R]); }
  return q.map(([x, y]) => (sw ? [y, x, z] : [x, y, z]) as V3);
};

function strip(p: Pen, z: number, sw: boolean) {
  if (p.ink) p.face(stad(z, sw), 0.1, SH.edge);
  else for (let d = 0; d < TH; d += 0.3) p.face(stad(z + d, sw), 0.1, 0);
  p.face(stad(z + TH, sw), 0.2, SH.edge, 0.6);
  // the pad
  const a = 4.8, b = 4.1, st = { top: 0.36, left: 0.16, right: 0.1, lw: 0.5 };
  if (sw) p.box(-b, -a, z + TH, 2 * b, 2 * a, 0.8, st); else p.box(-a, -b, z + TH, 2 * a, 2 * b, 0.8, st);
  // air holes in both ends
  for (const s of [-1, 1]) for (const i of [0, 1, 2]) for (const j of [-1, 1]) {
    const u = s * (7.6 + i * 2.7), v = j * 1.9;
    p.dot(sw ? [v, u, z + TH + 0.05] : [u, v, z + TH + 0.05], 0.7, 0);
  }
}
// height above the first plaster: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 30;
  if (k < 0.45) return 30 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.72) { const v = (k - 0.45) / 0.27; return 3.4 * 4 * v * (1 - v); }
  if (k < 0.88) { const v = (k - 0.72) / 0.16; return 1 * 4 * v * (1 - v); }
  return 0;
}

export const plaster: Illustration = {
  k: "plaster", name: "Plaster", title: "No injuries logged", body: "Log an injury and it will be kept here with your notes.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = Math.min(1, h * 1.3);
    p.translate(0, 0, -3);
    p.scale(1.42);
    p.shadow(0, 0, 25, 12, 0.11);
    strip(p, 0, false);
    if (k > 0.01) strip(p, TH + 0.8 + drop(k), true);
    // sparkles once it has landed
    const b = clamp((h - 0.7) / 0.3);
    if (b > 0) ([[-13, -13, 9], [15, -6, 12], [-4, -17, 13]] as V3[]).forEach((q, i) => {
      const [x, y] = p.pt(q), r = b * (2.6 + 0.7 * Math.sin(t * 3.2 + i * 2.1));
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 0.8; g.lineCap = "round"; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); });
    });
  },
};
