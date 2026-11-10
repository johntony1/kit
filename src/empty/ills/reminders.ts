// No reminders: a note pinned to a cork board. The pin hops up and taps back down, as if to say do not forget.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const T = 2.6; // thickness of the board

export const reminders: Illustration = {
  k: "reminders", name: "Pinned note", title: "Nothing to remind you of", body: "Add a reminder and we will nudge you at the right time.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // two hops, then a rest
    const hop = u < 0.56 ? Math.abs(Math.sin((u / 0.56) * Math.PI * 2)) * (u < 0.28 ? 1 : 0.55) : 0;
    p.translate(0, 0, -6);
    p.shadow(0, 0, 38, 19, 0.11);
    // the board: a lit frame around the cork
    p.box(-17, -14, 0, 34, 28, T, { top: 0.22, left: 0.13, right: SH.right });
    const z = T + 0.02;
    p.face([[-15, -12, z], [15, -12, z], [15, 12, z], [-15, 12, z]], 0.035, SH.edge, 0.55);
    // a small note at the back, turned the other way
    p.push(); p.rotate("z", 0.3, [-9.5, 1.5, 0]);
    p.box(-14, -3, z, 9, 9, 0.5, { top: 0.2, left: 0.12, right: SH.right });
    p.line([[-12.5, -0.5, z + 0.52], [-7, -0.5, z + 0.52]], SH.edge, 0.6);
    p.line([[-12.5, 2, z + 0.52], [-9, 2, z + 0.52]], SH.edge, 0.6);
    p.pop();
    // the reminder: a note with a little clock and two lines
    p.push(); p.rotate("z", -0.12, [3, 2, 0]);
    const zn = z + 0.5;
    p.box(-4, -5, z, 15, 14, 0.6, { top: 0.24, left: 0.13, right: SH.right });
    const zt = zn + 0.12;
    const clock: V3[] = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [0 + Math.cos(a) * 2.4, 4.5 + Math.sin(a) * 2.4, zt] as V3; });
    p.line([...clock, clock[0]], SH.edge, 0.6);
    p.line([[0, 4.5, zt], [-1.6, 4.5, zt]], SH.edge, 0.6);
    p.line([[0, 4.5, zt], [0, 3.2, zt]], SH.edge, 0.6);
    p.line([[4.5, 2.6, zt], [9, 2.6, zt]], SH.edge, 0.9);
    p.line([[4.5, 5.4, zt], [7.4, 5.4, zt]], SH.edge, 0.6);
    p.line([[-1.5, 8.6, zt], [6, 8.6, zt]], SH.edge, 0.6);
    // the pin: its hole, its shadow, a dashed line down while it is up, then the pin itself
    const px = 3.5, py = -2, lift = hop * 6;
    p.disc(px, py, zt, 2.6 - hop * 0.9, 0.03, 0);
    if (lift > 0.6) p.guide([[px, py, zt], [px, py, zt + lift + 1.6]], true);
    p.box(px - 0.3, py - 0.3, zt + lift, 0.6, 0.6, 2.8, { top: 0.2, left: 0.16, right: 0.1 });
    p.cylinder(px, py, zt + lift + 2.4, 1.5, 1.4, { side: SH.right, top: 0.2 });
    p.cylinder(px, py, zt + lift + 3.8, 3, 2.2, { side: SH.left, top: 0.32 });
    p.pop();
    // a tap where it lands
    const land = u > 0.28 && u < 0.38 ? (u - 0.28) / 0.1 : u > 0.56 && u < 0.66 ? (u - 0.56) / 0.1 : -1;
    if (land >= 0) for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      p.dot([3.3 + Math.cos(a) * (3 + land * 3), -1.6 + Math.sin(a) * (3 + land * 3), zt + 1.5], 0.6, 1 - land);
    }
  },
};
