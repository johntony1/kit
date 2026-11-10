// No payouts yet: a vault with a round door and a slot. Coins slide out of the slot along a tray and drop onto a little stack.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const FY = 5; // the vault's front face
const CR = 2.1, CT = 0.8; // coin radius and thickness

/** a coin lying flat, cut off where it is still inside the slot (y < FY) */
function coin(p: Pen, cx: number, cy: number, z: number, fill = 0.34) {
  const ring = (zz: number, r = CR): V3[] => Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    return [cx + Math.cos(a) * r, Math.max(FY + 0.1, cy + Math.sin(a) * r), zz] as V3;
  });
  if (cy + CR < FY + 0.3) return;
  for (let k = 0; k < 3; k++) p.face(ring(z + (k * CT) / 3), 0.13, 0);
  p.face(ring(z + CT), fill, SH.edge, 0.5);
}

export const payouts: Illustration = {
  k: "payouts", name: "Vault", title: "No payouts yet", body: "Once you have earnings, payouts to your bank account will be listed here.",
  kind: "loop", period: 3.3, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const P = 3.3;
    p.translate(1, -5, -12);
    p.shadow(-1, 2, 30, 13, 0.12);
    // feet and body: the front faces +y
    for (const [x, y] of [[-12, 3], [7, 3], [7, -8]]) p.box(x, y, 0, 2, 2, 1.6, { top: 0.2 });
    p.box(-13, -9, 1.6, 22, 14, 22, { top: 0.22, left: 0.13, right: 0.065 });
    // a raised panel round the door
    const fy = FY + 0.03;
    p.face([[-11.5, fy, 3.5], [1.5, fy, 3.5], [1.5, fy, 22], [-11.5, fy, 22]], 0.2, SH.edge, 0.55);
    // the round door: a ring, a dial with spokes and a hub
    const dx = -5, dz = 12.7;
    p.ringV("y", [dx, fy + 0.04, dz], 5.6, 0.12, SH.edge, 0.6);
    p.ringV("y", [dx, fy + 0.08, dz], 4.2, 0.24, SH.edge, 0.55);
    const spin = (t / P) * Math.PI * 2 / 3;
    for (let i = 0; i < 3; i++) {
      const a = spin + (i * Math.PI * 2) / 3;
      p.line([[dx + Math.cos(a) * 1.4, fy + 0.1, dz + Math.sin(a) * 1.4], [dx + Math.cos(a) * 4.8, fy + 0.1, dz + Math.sin(a) * 4.8]], SH.edge, 0.9);
    }
    p.ringV("y", [dx, fy + 0.12, dz], 1.4, 0.32, SH.edge, 0.5);
    // hinges on the left of the panel
    p.box(-12.6, FY, 7, 1, 0.8, 2.6, { top: 0.24 }); p.box(-12.6, FY, 17, 1, 0.8, 2.6, { top: 0.24 });
    // the right column: a status light and a little keypad
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      const x = 3.2 + c * 2.6, z = 14 + r * 2.4;
      p.face([[x, fy, z], [x + 1.8, fy, z], [x + 1.8, fy, z + 1.6], [x, fy, z + 1.6]], 0.24, SH.edge, 0.45);
    }
    // the slot and the tray under it
    p.face([[2.8, fy, 6.4], [8.2, fy, 6.4], [8.2, fy, 7.8], [2.8, fy, 7.8]], 0.02, SH.edge, 0.5);
    p.box(2.2, FY, 4.8, 6.6, 9, 1.2, { open: true, left: 0.16, right: 0.08 });
    p.line([[2.4, FY, 5.3], [8.6, FY, 5.3]], SH.edge, 0.5);
    // the stack the coins land on, at the end of the tray
    const sx = 5.5, sy = 18.5, n0 = 3;
    for (let i = 0; i < n0; i++) coin(p, sx + (i % 2) * 0.3, sy - (i % 2) * 0.2, i * CT, i === n0 - 1 ? 0.24 : 0.22);
    // the light blinks as each coin leaves
    // coins: three a loop, each sliding out, crossing the tray and tipping off onto the stack
    const zt = 5.25, top = n0 * CT;
    const coins: { y: number; z: number }[] = [];
    let flash = 0;
    for (let i = 0; i < 3; i++) {
      const v = ((t / P) + i / 3) % 1;
      // 0..0.55 slide out and across, 0.55..0.8 drop, then it sits on the stack (and becomes the stack)
      if (v < 0.55) {
        const s = v / 0.55;
        coins.push({ y: FY - CR + (sy - 3.6 - FY + CR) * (1 - (1 - s) * (1 - s)), z: zt });
        if (s < 0.15) flash = Math.max(flash, 1 - s / 0.15);
      } else if (v < 0.8) {
        const s = (v - 0.55) / 0.25;
        coins.push({ y: sy - 3.6 + 3.6 * s, z: zt + (top - zt) * s * s });
      }
    }
    p.dot([7.3, fy + 0.1, 21.4], 0.9, 0.3 + flash * 0.7);
    coins.sort((a, b) => a.y - b.y).forEach((c) => coin(p, sx, c.y, c.z));
    // dashed path: from the slot, along the tray, down to the stack
    p.guide([[sx, FY, zt + 1], [sx, sy - 3.6, zt + 1], [sx, sy, top + 1]], true);
  },
};
