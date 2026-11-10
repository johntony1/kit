// No payments yet: a card terminal in its cradle. A card taps the screen, waves ripple out and a tick lights up.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const TW = 7.5, TD = 2.6, TH = 24; // terminal half width, half depth, height
const TILT = 0.32; // how far it leans back

export const pos: Illustration = {
  k: "pos", name: "Card terminal", title: "No payments yet", body: "Take your first payment and it will show up here the moment it clears.",
  kind: "loop", period: 3.6, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % 3.6) / 3.6;
    // the card: comes in (0..0.3), touches (0.3..0.42), backs off (0.42..0.7), waits
    const k = u < 0.3 ? easeInOut(u / 0.3) : u < 0.42 ? 1 : u < 0.7 ? 1 - easeInOut((u - 0.42) / 0.28) : 0;
    const paid = u > 0.36 && u < 0.97;
    p.translate(-1, -2, -13);
    p.shadow(0, 0, 26, 12, 0.12);
    // the cradle
    p.box(-9.5, -6, 0, 19, 12, 2.6, { top: 0.22, left: 0.13, right: 0.065 });
    p.line([[-8, 6.03, 1.3], [8, 6.03, 1.3]], SH.edge, 0.55);
    // everything on the terminal leans back with it
    p.push(); p.rotate("x", TILT, [0, 0, 2.6]);
    const z0 = 2.6, fy = TD + 0.03;
    p.box(-TW, -TD, z0, TW * 2, TD * 2, TH, { top: 0.22, left: 0.13, right: 0.065 });
    // the screen: dark glass at the top of the front
    const s0 = z0 + 12.6, s1 = z0 + TH - 1.6;
    p.face([[-TW + 1.3, fy, s0], [TW - 1.3, fy, s0], [TW - 1.3, fy, s1], [-TW + 1.3, fy, s1]], 0.03, SH.edge, 0.6);
    const mx = 0, mz = (s0 + s1) / 2;
    const band = (r0: number, r1: number, a0: number, a1: number, cx: number, cz: number): V3[] => {
      const out: V3[] = [];
      for (let i = 0; i <= 10; i++) { const a = a0 + ((a1 - a0) * i) / 10; out.push([cx + Math.cos(a) * r1, fy + 0.05, cz + Math.sin(a) * r1]); }
      for (let i = 10; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / 10; out.push([cx + Math.cos(a) * r0, fy + 0.05, cz + Math.sin(a) * r0]); }
      return out;
    };
    if (paid) {
      // a tick in a lit circle
      p.ringV("y", [mx, fy + 0.04, mz], 3.4, 0.34, SH.edge, 0.5);
      p.line([[mx - 1.6, fy + 0.08, mz], [mx - 0.4, fy + 0.08, mz - 1.3], [mx + 1.8, fy + 0.08, mz + 1.3]], SH.edge, 1);
    } else {
      // the contactless mark: three arcs
      for (let i = 0; i < 3; i++) p.face(band(1 + i * 1.6, 1.8 + i * 1.6, -0.8, 0.8, mx - 2.4, mz), 0.26, 0);
    }
    // the keypad: lit keys on the darker front
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const x = -4.8 + c * 3.4, z = z0 + 1.5 + r * 2.6;
      p.face([[x, fy, z], [x + 2.6, fy, z], [x + 2.6, fy, z + 1.8], [x, fy, z + 1.8]], 0.24, SH.edge, 0.45);
      p.line([[x, fy + 0.02, z], [x + 2.6, fy + 0.02, z], [x + 2.6, fy + 0.02, z + 1.8], [x, fy + 0.02, z + 1.8], [x, fy + 0.02, z]], SH.edge, 0.55);
    }
    // the card slot on top
    p.face([[-5, -0.35, z0 + TH + 0.03], [5, -0.35, z0 + TH + 0.03], [5, 0.35, z0 + TH + 0.03], [-5, 0.35, z0 + TH + 0.03]], 0.02, SH.edge, 0.5);
    // the card: parallel to the screen, floating out in front and up, coming in to tap
    const cy = fy + 1 + (1 - k) * 12, cz = mz + 1.5 + (1 - k) * 7, cx = 2.5 - (1 - k) * 3;
    const CW = 7, CH = 4.4;
    if (k < 0.9) {
      // dashed lines from the card back to the screen
      for (const [dx, dz] of [[-CW, -CH], [CW, -CH], [-CW, CH]]) p.guide([[cx + dx, fy, cz + dz], [cx + dx, cy, cz + dz]]);
    }
    p.box(cx - CW, cy - 0.6, cz - CH, CW * 2, 0.6, CH * 2, { top: 0.26, left: 0.32, right: 0.12 });
    p.line([[cx - CW, cy + 0.02, cz - CH], [cx + CW, cy + 0.02, cz - CH], [cx + CW, cy + 0.02, cz + CH], [cx - CW, cy + 0.02, cz + CH], [cx - CW, cy + 0.02, cz - CH]], SH.edge, 0.9);
    // chip, stripe of digits and the contactless mark on the card
    p.face([[cx - CW + 1.4, cy + 0.03, cz], [cx - CW + 3.6, cy + 0.03, cz], [cx - CW + 3.6, cy + 0.03, cz + 1.8], [cx - CW + 1.4, cy + 0.03, cz + 1.8]], 0.1, SH.edge, 0.45);
    p.line([[cx - CW + 1.4, cy + 0.04, cz - 2.2], [cx + 2, cy + 0.04, cz - 2.2]], SH.edge, 0.8);
    p.line([[cx - CW + 1.4, cy + 0.04, cz - 3.4], [cx - 2, cy + 0.04, cz - 3.4]], SH.edge, 0.6);
    p.pop();
    // waves rippling off the tap
    const w = u > 0.26 && u < 0.6 ? (u - 0.26) / 0.34 : -1;
    if (w >= 0) {
      const [gx, gy] = p.pt([2.5, fy + 2, mz + 3]);
      p.screen((c) => {
        for (let i = 0; i < 3; i++) {
          const r = 4 + (w * 9 + i * 3) % 9;
          c.strokeStyle = `rgba(255,255,255,${(1 - r / 14) * 0.9})`; c.lineWidth = 1;
          c.beginPath(); c.arc(gx, gy, r, -Math.PI * 0.95, -Math.PI * 0.05); c.stroke();
        }
      });
    }
  },
};
