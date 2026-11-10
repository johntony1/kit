// Blocked by the firewall: a brick wall with a shield standing guard in front. Packets fly in from the left, hit the shield and bounce off with a spark.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PERIOD = 2.7;
const L = 15, T = 2.6, H = 13;
const TURN = -0.5; // the scene turns toward us, so the wall's face and its end both show
const VX = Math.cos(-TURN) - Math.sin(-TURN); // the view direction's x, in the turned frame (its y is never needed) // half length, half thickness, height of the wall
type P2 = [number, number];

// the shield's outline (x right, z up), counter clockwise seen from the front
const SHIELD: P2[] = (() => {
  const right: P2[] = [];
  for (let i = 0; i <= 12; i++) { const k = i / 12; right.push([7 * Math.sin(k * Math.PI * 0.5) ** 0.8, 9 * k * k * 0.25 + 9 * k * 0.75]); }
  const top: P2[] = Array.from({ length: 11 }, (_, i) => { const x = 7 - (14 * i) / 10; return [x, 16.5 + 1.2 * Math.cos((x / 7) * Math.PI * 0.5)] as P2; });
  const left = right.slice(0, -1).reverse().map(([x, z]) => [-x, z] as P2);
  return [...right, ...top, ...left.slice(0, -1)];
})();

/** a flat shape standing upright, facing +y, from y0 to y1 */
function slab(p: Pen, pts: P2[], at: V3, y0: number, y1: number, front: number) {
  const P = (x: number, y: number, z: number): V3 => [at[0] + x, at[1] + y, at[2] + z];
  const strips: { k: number; pts: V3[]; fill: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz) || 1;
    const nx = dz / n, nz = -dx / n;
    if (VX * nx + nz <= 0.02) continue;
    strips.push({ k: (a[0] + b[0]) / 2 + (a[1] + b[1]) / 2, pts: [P(a[0], y0, a[1]), P(b[0], y0, b[1]), P(b[0], y1, b[1]), P(a[0], y1, a[1])], fill: nz > 0.35 ? SH.top : SH.right });
  }
  strips.sort((u, v) => u.k - v.k).forEach((s) => p.face(s.pts, s.fill, 0));
  p.line([...pts.map(([x, z]) => P(x, y0, z)), P(pts[0][0], y0, pts[0][1])], SH.edge, 0.55);
  p.face(pts.map(([x, z]) => P(x, y1, z)), front, SH.edge, 0.6);
}

export const firewall: Illustration = {
  k: "firewall", name: "Firewall", title: "This request was blocked", body: "Your security settings stopped it. Allow the address to let it through.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -10);
    // the wall turns toward us: its long face nearly square on, its end showing on the right
    p.rotate("z", TURN);
    p.shadow(0, 0, 34, 15, 0.12);
    p.shadow(0, 7, 16, 6, 0.1);
    // the wall, then its bricks: mortar joints cut into the front, the top and the end
    p.box(-L, -T, 0, L * 2, T * 2, H, { top: SH.top, left: SH.left, right: SH.right });
    const rows = 4, rh = H / rows, bw = 5;
    for (let r = 1; r < rows; r++) {
      p.line([[-L, T + 0.03, r * rh], [L, T + 0.03, r * rh]], SH.edge, 0.6);
      p.line([[L + 0.03, -T, r * rh], [L + 0.03, T, r * rh]], SH.edge, 0.6);
    }
    for (let r = 0; r < rows; r++) {
      for (let x = -L + (r % 2 ? bw / 2 : bw); x < L - 0.5; x += bw) p.line([[x, T + 0.03, r * rh], [x, T + 0.03, (r + 1) * rh]], SH.edge, 0.6);
    }
    for (let x = -L + (rows % 2 ? bw / 2 : bw); x < L - 0.5; x += bw) p.line([[x, -T, H + 0.03], [x, T, H + 0.03]], SH.edge, 0.6);
    p.line([[L + 0.03, 0, rh], [L + 0.03, 0, 2 * rh]], SH.edge, 0.6);
    p.line([[L + 0.03, 0, 3 * rh], [L + 0.03, 0, 4 * rh]], SH.edge, 0.6);
    // the shield, floating in front of the wall, pulsing a little when a packet hits
    const hits = [0, 1, 2].map((i) => (u + i / 3) % 1);
    const jolt = Math.max(...hits.map((v) => (v > 0.55 && v < 0.75 ? Math.sin(((v - 0.55) / 0.2) * Math.PI) : 0)));
    const Z = 4 + Math.sin(u * Math.PI * 6) * 0.4, SY = 6 - jolt * 0.6;
    p.guide([[-6.5, SY + 1, Z + 4], [-6.5, SY + 1, 0]]);
    p.guide([[0, SY + 1, Z], [0, SY + 1, 0]]);
    p.guide([[6.5, SY + 1, Z + 4], [6.5, SY + 1, 0]]);
    slab(p, SHIELD, [0, SY, Z], 0, 2.2, 0.4);
    // an inner rim and a check mark, cut into the shield
    const fy = SY + 2.25;
    p.line([...SHIELD.map(([x, z]) => [x * 0.78, fy, Z + 1.6 + z * 0.8] as V3), [SHIELD[0][0] * 0.78, fy, Z + 1.6 + SHIELD[0][1] * 0.8]], SH.edge, 0.6);
    p.line([[-3.2, fy, Z + 9.5], [-0.8, fy, Z + 6.8], [3.6, fy, Z + 12.2]], SH.edge, 1.3);
    // packets flying in from the left, then glancing off
    for (let i = 0; i < 3; i++) {
      const v = hits[i], z = Z + 5 + i * 3.5, y = fy + 1.5;
      if (v < 0.6) {
        const x = -21 + (v / 0.6) * (21 - 6.5 + i * 0.6);
        p.box(x - 0.9, y - 0.9, z - 0.9, 1.8, 1.8, 1.8, { top: 0.4, left: SH.left, right: SH.right });
      } else {
        const k = (v - 0.6) / 0.4, x = -6 + i * 0.6;
        if (k < 0.35) for (let s = 0; s < 4; s++) { const a = s * 1.6 + i; p.dot([x + Math.cos(a) * (1 + k * 7), y, z + Math.sin(a) * (1 + k * 7)], 0.6, 1); }
        p.dot([x - k * 10, y + k * 3, z + k * 6 - k * k * 9], 0.85, 1 - k);
      }
    }
  },
};
