// Hidden eye: an eye with a bright slash across it. It looks from side to side, then blinks, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
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
const at = (y: number) => ([x, z]: P2): V3 => [x, y, z];
const P = 3.6, C = 17, W = 19, WI = 15.4; // seconds per loop, centre height, half width outside and inside
const almond = (w: number, hh: number, n = 18): P2[] => {
  const top: P2[] = [], bot: P2[] = [];
  for (let i = 0; i <= n; i++) { const x = -w + (2 * w * i) / n, z = hh * (1 - (x / w) * (x / w)); top.push([x, C + z]); bot.push([x, C - z]); }
  return [...bot, ...top.reverse().slice(1, -1)];
};

export const eye: Illustration = {
  k: "eye", name: "Hidden eye", title: "Nothing to preview", body: "Pick an item to see a preview of it here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const b = cl(1 - Math.abs(u - 0.86) / 0.08), open = 1 - 0.92 * b * b * (3 - 2 * b);
    const look = Math.sin(u * Math.PI * 2) * 4.4;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 26, 9, 0.12);
    p.rotate("z", YAW);
    const ho = 11.5 * (0.3 + 0.7 * open), hi = Math.max(0.45, ho - 3);
    slab(p, almond(W, ho), 2, 4, 0.2);
    p.clear(almond(WI, hi).map(at(2.03)));
    // the iris and the pupil, cut off by the lids
    const lim = (x: number) => Math.max(0, hi * (1 - (x / WI) * (x / WI)) - 0.7);
    const ball = (r: number, y: number): V3[] => Array.from({ length: 32 }, (_, i) => {
      const a = (i / 32) * Math.PI * 2, x = look + Math.cos(a) * r, z = Math.sin(a) * r, m = lim(x);
      return [x, y, C + Math.max(-m, Math.min(m, z))] as V3;
    });
    p.face(ball(6.6, 2.06), 0.22, 0);
    p.clear(ball(2.9, 2.09));
    // the slash: a dark gap, then the bright bar
    const bar = (w: number, y: number): V3[] => {
      const dx = 13.5, dz = 12.5, L = Math.hypot(dx, dz), nx = (-dz / L) * w, nz = (dx / L) * w;
      return [[-dx + nx, y, C - dz + nz], [dx + nx, y, C + dz + nz], [dx - nx, y, C + dz - nz], [-dx - nx, y, C - dz - nz]];
    };
    p.clear(bar(2.7, 2.12));
    p.face(bar(1.25, 2.15), 0.9, 0);
  },
};
