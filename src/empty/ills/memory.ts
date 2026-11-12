// No memories saved: a memory module held over its slot. Hover and it drops in and seats, the clips close on it and its chips light one by one.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const BZ = 3.4, SH_ = 14, HW = 14; // top of the slot base, the module's height, its half width
// height of the module's bottom over its seat: a fall, then a small settle
const fall = (k: number) => (k < 0.7 ? 1 - Math.pow(k / 0.7, 2) : 0.06 * Math.sin(((k - 0.7) / 0.3) * Math.PI));

export const memory: Illustration = {
  k: "memory", name: "Memory", title: "No memories saved", body: "Things worth remembering between chats will be kept here. You can edit or remove them any time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 30, 12, 0.12);
    p.rotate("z", -0.5);
    // the slot: a long base with a dark groove
    p.box(-18, -4, 0, 36, 8, BZ);
    p.clear([[-15.5, -1.1, BZ + 0.02], [15.5, -1.1, BZ + 0.02], [15.5, 1.1, BZ + 0.02], [-15.5, 1.1, BZ + 0.02]]);
    const k = clamp(h / 0.55), seat = BZ - 2, z0 = seat + 9.5 * fall(k), on = k >= 1 ? clamp((h - 0.55) / 0.2) : 0;
    // the far clip
    const clipZ = 3 + 2.4 * on;
    p.box(-17.4, -2, BZ, 2, 4, clipZ, { lw: 0.45 });
    // the module: only what stands above the base shows
    const lo = Math.max(z0, BZ), Z = z0 + SH_, f = 0.83;
    p.box(-HW, -0.8, lo, 2 * HW, 1.6, Z - lo, { top: 0.22 });
    // gold contacts along its bottom edge, a notch off centre
    for (let i = 0; i < 17; i++) {
      const x = -HW + 1.6 + i * 1.55;
      if (i === 6 || z0 + 2.6 <= BZ + 0.3) continue;
      p.line([[x, f, Math.max(z0 + 0.4, BZ)], [x, f, z0 + 2.6]], SH.edge, 0.7);
    }
    if (z0 + 3.2 > BZ) p.line([[-HW, f, z0 + 3.2], [HW, f, z0 + 3.2]], SH.edge, 0.45);
    // four chips, and a label strip above them
    for (let i = 0; i < 4; i++) {
      const x0 = -12.2 + i * 6.4, lit = on > 0 && clamp((h - 0.7 - i * 0.07) / 0.08) > 0;
      const q: V3[] = [[x0, f, z0 + 5], [x0 + 5.2, f, z0 + 5], [x0 + 5.2, f, z0 + 10.4], [x0, f, z0 + 10.4]];
      if (lit) p.face(q, 0.42, SH.edge, 0.5); else p.clear(q);
      if (lit) p.dot([x0 + 2.6, f + 0.02, z0 + 7.7], 0.6 + 0.2 * Math.sin(t * 4 + i), 0);
    }
    p.line([[-12.2, f, z0 + 12.2], [-3, f, z0 + 12.2]], SH.edge, 0.8);
    if (k > 0.03 && k < 1) { p.guide([[-HW, 0.8, BZ], [-HW, 0.8, lo]], true); p.guide([[HW, 0.8, BZ], [HW, 0.8, lo]], true); }
    // the near clip, and a light on the base that comes on once it is seated
    p.box(15.4, -2, BZ, 2, 4, clipZ, { lw: 0.45 });
    p.dot([-14.5, 4.03, 1.7], 0.9, on > 0.5 ? 1 : 0);
    if (on <= 0.5) p.line([[11, 4.03, 1.7], [15, 4.03, 1.7]], SH.edge, 0.6);
    else p.dot([13, 4.03, 1.7], 0.9, 0);
  },
};
