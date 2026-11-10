// No calls yet: a desk phone with its receiver in the cradle. Hover and the receiver lifts off, the coiled cord stretching.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 13, Y = 11, H = 6; // half width, half depth, height of the base
const RY = -6.5, CZ = H + 1.5, RZ = CZ + 2.5; // the receiver's centre line, the cradle top, the receiver's base line

// the receiver seen from the side, as [x, z] around its base line: a handle with two ends bulging down
const SIDE: [number, number][] = [
  [-13, -2.5], [-7.2, -2.5], [-6.2, 0.6], [6.2, 0.6], [7.2, -2.5], [13, -2.5], [13.6, 0.6], [12.6, 3.2], [-12.6, 3.2], [-13.6, 0.6],
];

/** the receiver: its side profile pushed through from y0 to y1, walls shaded by where they face */
function receiver(p: Pen, y0: number, y1: number) {
  const n = SIDE.length;
  let a = 0;
  for (let i = 0; i < n; i++) { const [x0, z0] = SIDE[i], [x1, z1] = SIDE[(i + 1) % n]; a += x0 * z1 - x1 * z0; }
  const s = a > 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const [x0, z0] = SIDE[i], [x1, z1] = SIDE[(i + 1) % n];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1;
    const nx = ((z1 - z0) * s) / L, nz = (-(x1 - x0) * s) / L;
    if (nx + nz <= 0) continue;
    const f = nz > 0.5 ? 0.24 : nx > 0 ? 0.065 : 0.12;
    p.face([[x0, y0, RZ + z0], [x1, y0, RZ + z1], [x1, y1, RZ + z1], [x0, y1, RZ + z0]], f, SH.edge, 0.5);
  }
  p.face(SIDE.map(([x, z]) => [x, y1, RZ + z] as V3), 0.13, SH.edge, 0.6);
  // the earpiece and mouthpiece: slots across the top of each end
  for (const cx of [-10, 10]) for (let i = -1; i <= 1; i++) p.line([[cx - 1.8, RY + i * 1.4, RZ + 3.24], [cx + 1.8, RY + i * 1.4, RZ + 3.24]], SH.edge, 0.55);
}

export const phone: Illustration = {
  k: "phone", name: "Desk phone", title: "No calls yet", body: "Your call history will show up here after your first call.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.shadow(-4, 0, 30, 15, 0.12);
    p.shadow(4, 0, 30, 15, 0.12);
    // the base, and the cradle along its back
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.22, left: 0.13, right: 0.065 });
    p.line([[-X, Y + 0.03, 1.6], [X, Y + 0.03, 1.6], [X + 0.03, -Y, 1.6]], SH.edge, 0.55);
    p.box(-X + 1, RY - 3.6, H, X * 2 - 2, 7.2, 1.5, { top: 0.2, left: 0.13, right: 0.065 });
    // the two cups and the hook switch that pops up when the receiver leaves
    for (const cx of [-10, 10]) p.face([[cx - 2.4, RY - 2.4, CZ + 0.02], [cx + 2.4, RY - 2.4, CZ + 0.02], [cx + 2.4, RY + 2.4, CZ + 0.02], [cx - 2.4, RY + 2.4, CZ + 0.02]], 0.03, SH.edge, 0.5);
    p.box(-1.4, RY - 1, CZ, 2.8, 2, 0.4 + 1.4 * h, { top: 0.26 });
    // the keypad: three by three keys set in a dark well on the front deck, the call key in the accent
    p.face([[-10.8, -0.8, H + 0.02], [3.6, -0.8, H + 0.02], [3.6, 10.2, H + 0.02], [-10.8, 10.2, H + 0.02]], 0.03, SH.edge, 0.5);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const accent = r === 2 && c === 2;
      p.box(-10 + c * 4.4, 0 + r * 3.6, H, 3.4, 2.6, 0.9, { top: accent ? 0.32 : 0.26, left: 0.13, right: 0.07 });
    }
    // a little display beside the keys
    p.face([[4.5, 0, H + 0.02], [10.5, 0, H + 0.02], [10.5, 9.6, H + 0.02], [4.5, 9.6, H + 0.02]], 0.03, SH.edge, 0.5);
    for (let i = 0; i < 2; i++) p.line([[6.3 + i * 2, 1.8, H + 0.04], [6.3 + i * 2, 7.6 - i * 2.4, H + 0.04]], 1, 0.55);

    // the receiver lifts and tilts, with a slow sway while it is held up
    const lift = h * 12, tilt = -0.16 * h + h * Math.sin(t * 2.4) * 0.04;
    if (h > 0.05) for (const cx of [-10, 10]) p.guide([[cx, RY, RZ + lift - 2.5], [cx, RY, CZ + 0.05]], true);
    p.push();
    p.translate(0, 0, lift);
    p.rotate("y", tilt, [0, RY, RZ]);
    const b = p.pt([12, RY + 2.6, RZ - 2.2]);
    p.pop();
    // the coiled cord: from the side of the base up to the receiver's near end
    p.screen((c) => {
      const s = p.pt([X, 4, 2.4]);
      const n = 90, coils = 10, rad = 1.2;
      c.beginPath();
      for (let i = 0; i <= n; i++) {
        const f = i / n, bend = Math.sin(f * Math.PI) * (5 - 3 * h);
        const x = s[0] + (b[0] - s[0]) * f + bend * 1.4, y = s[1] + (b[1] - s[1]) * f + bend * 0.6;
        const w = Math.sin(f * coils * Math.PI * 2) * rad;
        if (i) c.lineTo(x + w, y + w * 0.3); else c.moveTo(x + w, y + w * 0.3);
      }
      c.strokeStyle = "rgb(130,130,130)"; c.lineWidth = 0.75; c.stroke();
    });
    p.push();
    p.translate(0, 0, lift);
    p.rotate("y", tilt, [0, RY, RZ]);
    receiver(p, RY - 2.6, RY + 2.6);
    p.pop();
  },
};
