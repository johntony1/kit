// No subscription: a calendar card with a round repeat badge. The badge's arrows turn, and the renewal day blinks.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];

/** a curved arrow in the (x,z) plane round (cx,cz): a band from angle a0 to a1 with a head at a1 */
function arrow(cx: number, cz: number, r: number, w: number, a0: number, a1: number): P2[] {
  const out: P2[] = [], n = 14;
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push([cx + Math.cos(a) * (r + w), cz + Math.sin(a) * (r + w)]); }
  const dir = Math.sign(a1 - a0);
  out.push([cx + Math.cos(a1) * (r + w * 2.4), cz + Math.sin(a1) * (r + w * 2.4)]);
  out.push([cx + Math.cos(a1 + dir * 0.75) * r, cz + Math.sin(a1 + dir * 0.75) * r]);
  out.push([cx + Math.cos(a1) * (r - w * 2.4), cz + Math.sin(a1) * (r - w * 2.4)]);
  for (let i = n; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / n; out.push([cx + Math.cos(a) * (r - w), cz + Math.sin(a) * (r - w)]); }
  return out;
}

const X = 11, Y = 2.2, Z = 25; // calendar half width, half depth, height
const BX = 8, BZ = 6, BR = 7; // the badge centre and radius on the front

export const subscription: Illustration = {
  k: "subscription", name: "Repeat calendar", title: "No active subscription", body: "Pick a plan to get started. Renewals and billing dates will show up here.",
  kind: "loop", period: 3.6, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % 3.6) / 3.6;
    p.translate(-1, -1, -14);
    p.shadow(0, 1, 28, 11, 0.12);
    // the card: lit front, a darker header band with two binder rings
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.22, left: 0.2, right: 0.065 });
    const fy = Y + 0.03;
    p.face([[-X, fy, Z - 6], [X, fy, Z - 6], [X, fy, Z], [-X, fy, Z]], 0.12, SH.edge, 0.55);
    for (const rx of [-5.5, 5.5]) {
      p.box(rx - 0.9, -0.9, Z - 1.2, 1.8, 1.8, 3.6, { top: 0.3, left: 0.16, right: 0.08 });
    }
    // the month name in the header
    p.line([[-4, fy + 0.02, Z - 3], [4, fy + 0.02, Z - 3]], SH.edge, 0.9);
    // the day grid: 7 by 4 cells cut into the lit front
    const g0 = -X + 1.2, g1 = X - 1.2, z0 = 1.4, z1 = Z - 7.4, cw = (g1 - g0) / 7, ch = (z1 - z0) / 4;
    for (let i = 0; i <= 7; i++) p.line([[g0 + i * cw, fy + 0.02, z0], [g0 + i * cw, fy + 0.02, z1]], SH.edge, 0.55);
    for (let j = 0; j <= 4; j++) p.line([[g0, fy + 0.02, z0 + j * ch], [g1, fy + 0.02, z0 + j * ch]], SH.edge, 0.55);
    // the renewal day: the cell that lights, brighter as the arrows finish their turn
    const turn = u < 0.6 ? easeInOut(u / 0.6) : 1;
    const blink = u > 0.55 && u < 0.85 ? Math.sin(((u - 0.55) / 0.3) * Math.PI) : 0;
    const cx0 = g0 + cw * 2, cz0 = z0 + ch * 2;
    p.face([[cx0 + 0.4, fy + 0.04, cz0 + 0.4], [cx0 + cw - 0.4, fy + 0.04, cz0 + 0.4], [cx0 + cw - 0.4, fy + 0.04, cz0 + ch - 0.4], [cx0 + 0.4, fy + 0.04, cz0 + ch - 0.4]], 0.32 + blink * 0.6, SH.edge, 0.5);
    // the badge: a thick round token standing in front of the bottom right corner
    const by = Y + 1.2;
    for (let k = 0; k <= 4; k++) p.ringV("y", [BX, by + k * 0.4, BZ], BR, k === 0 ? 0.12 : SH.right, 0);
    p.ringV("y", [BX, by + 1.7, BZ], BR, 0.24, SH.edge, 0.6);
    p.ringV("y", [BX, by + 1.72, BZ], BR - 1.3, 0.03, SH.edge, 0.5);
    // two arrows chasing each other, a half turn a loop
    const rot = -turn * Math.PI;
    for (const o of [0, Math.PI]) {
      const pts = arrow(BX, BZ, 3.6, 0.8, o + rot + 0.35, o + rot + 2.35).map(([x, z]) => [x, by + 1.76, z] as V3);
      p.face(pts, 0.34, SH.edge, 0.45);
    }
    // a glint when the turn lands
    if (blink > 0.1) {
      const [gx, gy] = p.pt([BX + BR * 0.75, by + 1.8, BZ + BR * 0.75]);
      p.screen((c) => {
        c.fillStyle = `rgba(255,255,255,${blink})`;
        const s = 1 + 2.2 * blink;
        c.beginPath(); c.moveTo(gx, gy - s); c.lineTo(gx + 0.5, gy - 0.5); c.lineTo(gx + s, gy); c.lineTo(gx + 0.5, gy + 0.5);
        c.lineTo(gx, gy + s); c.lineTo(gx - 0.5, gy + 0.5); c.lineTo(gx - s, gy); c.lineTo(gx - 0.5, gy - 0.5); c.closePath(); c.fill();
      });
    }
  },
};
