// Empty avatar: a thick round token with a head and shoulders in its dark window. Hover and it hops, the figure lights up and a plus badge pops onto its edge.
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
const C = 17, R = 15, RW = 11.8; // centre height, radius, window radius

export const avatar: Illustration = {
  k: "avatar", name: "Empty avatar", title: "No profile photo yet", body: "Add a photo so people can recognise you.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.55), hop = Math.sin(k * Math.PI) * 4 + h * Math.sin(t * 2.2) * 0.5;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22 - hop * 0.5, 8, 0.12);
    p.rotate("z", YAW);
    p.translate(0, 0, hop);
    slab(p, circle(0, C, R), 1.8, 3.6, 0.2);
    p.clear(circle(0, C, RW).map(at(1.83)));
    // the figure: dim at rest, lit on hover
    const lit = 0.075 + 0.26 * ease(cl((h - 0.1) / 0.45));
    p.face(circle(0, C + 3.6, 4.3, 28).map(at(1.86)), lit, 0);
    // shoulders: an arch, cut off by the window's rim
    const rim = RW - 0.7, sh: P2[] = [];
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI * (1 - i / 20), x = Math.cos(a) * 8.8, z = -10.8 + Math.sin(a) * 7.8, d = Math.hypot(x, z);
      sh.push(d > rim ? [(x * rim) / d, C + (z * rim) / d] : [x, C + z]);
    }
    const aL = Math.atan2(sh[0][1] - C, sh[0][0]), aR = Math.atan2(sh[20][1] - C, sh[20][0]);
    for (let j = 1; j < 10; j++) { const a = aR + ((aL - aR) * j) / 10; sh.push([Math.cos(a) * rim, C + Math.sin(a) * rim]); }
    p.face(sh.map(at(1.86)), lit, 0);
    badge(p, [11.2, 2.6, C - 10.2], 4.8 * pop((h - 0.5) / 0.45));
  },
};
