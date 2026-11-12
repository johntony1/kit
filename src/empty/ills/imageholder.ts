// Image placeholder: a thick tile with two hills in its dark window. Hover and it hops, the hills light up, a sun pops in and a plus badge lands on the corner.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const YAW = -0.42, KX = Math.cos(YAW) + Math.sin(YAW); // turned to face us; how far a wall facing +x looks at us
/** a profile in [x, z] standing in the plane y (facing +y), thickness T going back: the rim, then the front */
function slab(p: Pen, prof: P2[], y: number, T: number, front: number, kx = KX, top = 0.26, side = 0.065) {
  const n = prof.length;
  let a = 0;
  for (let i = 0; i < n; i++) { const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1, nx = ((z1 - z0) * sg) / L, nz = (-(x1 - x0) * sg) / L;
    if (nx * kx + nz <= 0.001) continue;
    p.face([[x0, y, z0], [x1, y, z1], [x1, y - T, z1], [x0, y - T, z0]], nz > 0.3 ? top : side, 0);
  }
  p.face(prof.map(([x, z]) => [x, y, z] as V3), front, SH.edge, 0.6);
}
const circle = (cx: number, cz: number, r: number, n = 40): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r] as P2; });
const at = (y: number) => ([x, z]: P2): V3 => [x, y, z];
/** a rounded rectangle as [x, z] points, counter clockwise */
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 5): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI * 0.5]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, pos: V3, r: number) {
  const [x, y] = p.pt(pos);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
const pop = (b: number) => (b <= 0 ? 0 : b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
const W = 16.5, H = 27, IN = 2.4; // half width, height, frame width

export const imageholder: Illustration = {
  k: "imageholder", name: "Image placeholder", title: "No image yet", body: "Upload an image and it will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.5), hop = Math.sin(k * Math.PI) * 3.5 + h * Math.sin(t * 2.2) * 0.5;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26 - hop * 0.5, 9, 0.12);
    p.rotate("z", YAW);
    p.translate(0, 0, 1.5 + hop);
    slab(p, rr(-W, 0, W, H, 2.6), 1.6, 3.2, 0.2);
    p.clear(rr(-W + IN, IN, W - IN, H - IN, 1).map(at(1.63)));
    const f = at(1.66), b = IN, lit = 0.075 + 0.26 * ease(cl((h - 0.1) / 0.4));
    // two hills along the bottom of the window
    p.face(([[-W + IN, b], [-5.4, b + 13.5], [1.2, b + 5.4], [4, b]] as P2[]).map(f), lit, 0);
    p.face(([[-1.5, b], [6.6, b + 9.6], [W - IN, b + 1.8], [W - IN, b]] as P2[]).map(f), lit * 0.75, 0);
    // the sun pops in
    const s = pop((h - 0.3) / 0.4);
    if (s > 0.03) p.face(circle(7.2, H - IN - 5.2, 2.9 * s, 24).map(f), 0.9, 0);
    badge(p, [W - 1, 2.4, H - 1], 4.8 * pop((h - 0.55) / 0.4));
  },
};
