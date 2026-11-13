// No shoot yet: a photo studio softbox, a deep square hood with a diffuser on its front, on a three legged stand. Hover and the light switches on with a flicker and the front glows.
import { type Illustration, type V3 } from "../dots";

const F = 11, B = 3.6, FY = 6, BY = -17, CZ = 28; // front and back half size, front and back y, centre height

export const softbox: Illustration = {
  k: "softbox", name: "Softbox", title: "No shoot yet", body: "Plan your first shoot and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -21);
    p.shadow(0, -2, 22, 10, 0.12);
    p.rotate("z", -0.25); // its front towards us, the hood going back up to the right
    // the stand: three legs out to the floor and a pole up to the box
    const foot = (a: number): V3 => [Math.cos(a) * 11, -3 + Math.sin(a) * 11, 0];
    const hub: V3 = [0, -3, 8], top: V3 = [0, -3, CZ - 6];
    const seg = (a: V3, b: V3, w: number) => {
      const [ax, ay] = p.pt(a), [bx, by] = p.pt(b);
      p.screen((g) => {
        g.lineCap = "round";
        for (const [c, lw] of [["#000", w + 1.8], ["#fff", w]] as [string, number][]) { g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); }
      });
    };
    seg(hub, foot(-2.3), 1.6);
    seg(hub, foot(0.3), 1.6);
    seg([0, -3, 0.5], top, 2.2);
    seg(hub, foot(2.3), 1.6);
    // the mount at the back of the hood
    p.box(-2.6, BY - 2.6, CZ - 2.6, 5.2, 2.6, 5.2, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the hood: four sloping walls narrowing to the back; we see the top and the right
    const fr = (x: number, z: number): V3 => [x, FY, CZ + z], bk = (x: number, z: number): V3 => [x * (B / F), BY, CZ + z * (B / F)];
    p.face([bk(-F, F), bk(F, F), fr(F, F), fr(-F, F)], 0.2, 0); // top wall, lit
    p.face([bk(F, -F), bk(F, F), fr(F, F), fr(F, -F)], 0.065, 0); // right wall, in shade
    p.line([bk(F, F), fr(F, F)], 1, 0.6); // the seam between them
    // the front: a dark rim, then the diffuser that glows once on
    const on = h < 0.3 ? 0 : h < 0.48 ? (Math.sin((h - 0.3) * 110) > 0 ? 0.8 : 0.1) : Math.min(1, 0.7 + (h - 0.48) * 0.8);
    const y = FY + 0.03;
    const sq = (k: number, yy: number): V3[] => [[-k, yy, CZ - k], [k, yy, CZ - k], [k, yy, CZ + k], [-k, yy, CZ + k]];
    p.face(sq(F, y), 0.03, 0);
    p.face(sq(F - 1.6, y + 0.02), 0.06 + on * 0.42 + h * Math.sin(t * 3) * 0.01, 0);
  },
};
