// No followers yet: avatar tokens in two rows with one empty spot. A new token appears above the spot and drops in, then everyone shuffles along one place to make room again.
import { SH, easeInOut, type Illustration, type Pen } from "../dots";

const R = 3.9, H = 2.2; // token radius and height
const P = 4.6;
const S = Math.SQRT1_2;
// the six spots, in the order tokens move through them (each one moves to the spot before)
const SPOT: [number, number][] = [[-9, -4.8], [0, -4.8], [9, -4.8], [-9, 4.8], [0, 4.8], [9, 4.8]];

/** an avatar token: a lit coin with a dark head and shoulders on its face */
function token(p: Pen, cx: number, cy: number, z: number, top: number, k = 1) {
  if (k < 0.02) return;
  p.push();
  p.scale(k, [cx, cy, z]);
  p.cylinder(cx, cy, z, R, H, { side: SH.left, top, lw: 0.6 });
  const zt = z + H + 0.02;
  // glyph space on the top face: u points to screen right, v to screen up
  const g = (u: number, v: number): [number, number, number] => [cx + (u - v) * S, cy + (-u - v) * S, zt];
  p.face(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return g(Math.cos(a) * 1.2, 1 + Math.sin(a) * 1.2); }), 0.03, 0);
  p.face(Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI; return g(Math.cos(a) * 2.2, -2.4 + Math.sin(a) * 1.95); }), 0.03, 0);
  p.pop();
}

export const followers: Illustration = {
  k: "followers", name: "Followers", title: "No followers yet", body: "Share your profile and the people who follow you will gather here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -8);
    p.scale(1.15, [0, 0, 4]);
    for (const [x, y] of SPOT) p.shadow(x, y, 10, 5, 0.1);
    // shuffle: at the end of the loop every token moves to the spot before it, the first one leaves
    const sl = u > 0.8 ? easeInOut((u - 0.8) / 0.2) : 0;
    const at = (i: number): [number, number] => {
      if (sl === 0 || i === 0) return SPOT[i];
      const [a, b] = SPOT[i], [c, d] = SPOT[i - 1];
      return [a + (c - a) * sl, b + (d - b) * sl];
    };
    // the empty spot: a dotted ring on the floor
    const [sx, sy] = SPOT[5];
    if (u < 0.56 || u > 0.8) for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; p.dot([sx + Math.cos(a) * R, sy + Math.sin(a) * R, 0], 0.45, 0.7); }
    // a wave of little hops runs through the tokens while the new one waits
    const hop = (i: number) => {
      const w = (u - 0.06 - i * 0.06) / 0.15;
      return w > 0 && w < 1 ? Math.sin(w * Math.PI) * 2.6 : 0;
    };
    // the new follower: pops in above the spot, then drops in with a small bounce
    const pop = easeInOut(Math.min(1, u / 0.1));
    const d = u < 0.42 ? 0 : Math.min(1, (u - 0.42) / 0.14);
    const bounce = u > 0.56 && u < 0.66 ? Math.sin(((u - 0.56) / 0.1) * Math.PI) * 1.4 : 0;
    const zNew = 15 * (1 - d * d) + bounce + (d === 0 ? Math.sin(t * 3) * 0.6 : 0);
    // draw back to front
    const items = [0, 1, 2, 3, 4, 5].map((i) => { const [x, y] = at(i); return { i, x, y }; }).sort((a, b) => a.x + a.y - (b.x + b.y));
    for (const { i, x, y } of items) {
      if (i < 5) token(p, x, y, hop(i), 0.22, i === 0 ? 1 - sl : 1);
      else {
        if (zNew > 1.5) {
          p.guide([[x + R * S, y - R * S, zNew], [x + R * S, y - R * S, 0]], true);
          p.guide([[x - R * S, y + R * S, zNew], [x - R * S, y + R * S, 0]], true);
        }
        token(p, x, y, zNew, d < 1 ? 0.32 : 0.22, 0.2 + 0.8 * pop);
      }
    }
    // a little burst of sparks as it lands
    const b = (u - 0.56) / 0.2;
    if (b > 0 && b < 1) for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      p.dot([sx + Math.cos(ang) * (5 + b * 3), sy + Math.sin(ang) * (5 + b * 3), 2 + b * 7], 0.8, 1 - b);
    }
  },
};
