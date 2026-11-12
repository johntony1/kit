// No drop offs: a parcel locker with one door standing open and a map pin on top. Hover and a parcel slides into the open locker, the door swings shut and its lamp lights.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 12, Y = 4, H = 21, F = Y + 0.03;
const CW = 7, CH = 6.1; // door size
const cell = (i: number, j: number): [number, number] => [-11.25 + i * 7.5, 1 + j * 6.6];
const pin = (cz: number, r: number): V3[] => {
  const pts: V3[] = [];
  for (let i = 0; i <= 20; i++) { const a = -0.5 + (i / 20) * (Math.PI + 1); pts.push([Math.cos(a) * r, 0, cz + Math.sin(a) * r]); }
  pts.push([0, 0, cz - r * 2.15]);
  return pts;
};

export const dropoff: Illustration = {
  k: "dropoff", name: "Drop off point", title: "No drop offs", body: "Parcels you leave at a drop off point will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-1, -1, -15.5);
    p.shadow(0, 2, 28, 14, 0.11);
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.2, left: 0.05, right: 0.1, lw: 0.6 });
    const shut = ease(clamp((h - 0.55) / 0.25));
    // the doors: a grid of them, a keypad in the middle, one bay open on the right
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      const [x, z] = cell(i, j);
      const r: V3[] = [[x, F, z], [x + CW, F, z], [x + CW, F, z + CH], [x, F, z + CH]];
      if (i === 1 && j === 1) {
        p.face(r, 0.36, SH.edge, 0.5);
        p.line([[x + 1.4, F + 0.03, z + 4.2], [x + 5.6, F + 0.03, z + 4.2]], 0.02, 0.8);
        for (const dx of [1.8, 3.5, 5.2]) p.dot([x + dx, F + 0.03, z + 2], 0.55, 0.02);
      } else if (i === 2 && j === 1) {
        p.clear(r);
        p.face([[x, F + 0.01, z], [x + CW, F + 0.01, z], [x + CW, F + 0.01, z + 0.9], [x, F + 0.01, z + 0.9]], 0.14, 0);
      } else {
        p.face(r, 0.14, SH.edge, 0.5);
        p.line([[x + CW - 1.2, F + 0.02, z + 2.2], [x + CW - 1.2, F + 0.02, z + 3.9]], SH.edge, 0.6);
      }
    }
    // the parcel: pops in out front, slides into the open bay
    const [bx, bz] = cell(2, 1);
    const s = ease(clamp((h - 0.12) / 0.4));
    const yf = F + 10.5 - 11 * s; // the parcel's near face
    if (h > 0.01 && shut < 0.98) {
      const px = bx + 1.3, pz = bz + 1;
      if (yf > F + 0.2) {
        const d = Math.min(4.2, yf - F);
        p.push();
        p.scale(Math.min(1, h / 0.12), [px + 2.2, yf - 2, pz + 2]);
        p.box(px, yf - d, pz, 4.4, d, 4, { top: 0.34, left: 0.26, right: 0.12, lw: 0.6 });
        p.line([[px + 2.2, yf + 0.03, pz + 4], [px + 2.2, yf + 0.03, pz + 2.4]], SH.edge, 0.6);
        p.pop();
      } else p.face([[px, F + 0.02, pz], [px + 4.4, F + 0.02, pz], [px + 4.4, F + 0.02, pz + 4], [px, F + 0.02, pz + 4]], 0.2, SH.edge, 0.5);
    }
    // the open door, hinged on its right edge, swinging shut
    const a = 1.8 * (1 - shut), hx = bx + CW;
    const dx = hx - Math.cos(a) * CW, dy = F + 0.02 + Math.sin(a) * CW;
    p.face([[hx, F + 0.02, bz], [dx, dy, bz], [dx, dy, bz + CH], [hx, F + 0.02, bz + CH]], shut > 0.98 ? 0.14 : 0.24, SH.edge, 0.6);
    const lamp = clamp((h - 0.8) / 0.15);
    if (lamp > 0) p.dot([bx + 1.4, F + 0.06, bz + CH - 1.4], 0.9, lamp);
    // the map pin on top
    const lift = 1 + h * (1.2 + Math.sin(t * 3) * 0.8);
    p.disc(0, 0, H + 0.02, 2, 0.04);
    p.face(pin(H + lift + 8.2, 3.8), 0.4, SH.edge, 0.7);
    p.dot([0, 0.05, H + lift + 8.2], 1.3, 0.02);
  },
};
