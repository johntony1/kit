// No signals yet: a striped lighthouse on its rock, the lamp in its lantern room turning and its beam sweeping slowly round.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 6; // seconds per sweep
const ZB = 3, ZT = 25; // the tower's foot and top
const RB = 5.8, RT = 3.9; // its radius at the foot and the top
const rad = (z: number) => RB + (RT - RB) * ((z - ZB) / (ZT - ZB));
const BANDS = [ZB, 8.5, 14, 19.5, ZT];
const A0 = -Math.PI / 4, A1 = (Math.PI * 3) / 4; // the half of a ring that faces us
const S = Math.SQRT1_2;

/** a lathe band from z0 to z1: slices round the front, shaded by how much each faces the light */
function band(p: Pen, z0: number, z1: number, r0: number, r1: number, lit: boolean) {
  const N = 26;
  for (let i = 0; i < N; i++) {
    const a = A0 + ((A1 - A0) * i) / N, b = A0 + ((A1 - A0) * (i + 1)) / N, m = (a + b) / 2;
    const k = (1 + Math.cos(m - A1 + 0.5)) / 2; // 1 on the lit left, 0 on the far right
    const f = lit ? 0.12 + 0.12 * k : k > 0.55 ? SH.right : 0.04;
    p.face([[Math.cos(a) * r0, Math.sin(a) * r0, z0], [Math.cos(b) * r0, Math.sin(b) * r0, z0], [Math.cos(b) * r1, Math.sin(b) * r1, z1], [Math.cos(a) * r1, Math.sin(a) * r1, z1]], f, 0);
  }
}
const front = (r: number, z: number, n = 26): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = A0 + ((A1 - A0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const lighthouse: Illustration = {
  k: "lighthouse", name: "Lighthouse", title: "No signals yet", body: "When something needs your attention out there, it will light up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const th = ((t % P) / P) * Math.PI * 2 + 0.6;
    const LZ = 27.4; // the lamp's height
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22, 11, 0.12);
    // dashed: the circle the beam's tip sweeps, at the lamp's height
    p.guide(Array.from({ length: 49 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * 14, Math.sin(a) * 14, LZ] as V3; }));
    // the beam: a fan out of the lamp. Behind the lantern when it points away
    const beam = () => {
      const w = 0.24, L = 15, r0 = 1.6;
      const near = (s: number): V3 => [Math.cos(th + s * 0.6) * r0, Math.sin(th + s * 0.6) * r0, LZ];
      const far = (s: number, l = L): V3 => [Math.cos(th + s * w) * l, Math.sin(th + s * w) * l, LZ + (s > 0 ? 1.4 : -1.4)];
      if (p.ink) { p.face([near(-1), far(-1), far(1), near(1)], 0.3, SH.edge, 0.5); return; }
      // in dots the beam fades along its length
      p.face([near(-1), far(-1, L * 0.45), far(1, L * 0.45), near(1)], 0.32, 0);
      p.face([far(-1, L * 0.45), far(-1, L * 0.75), far(1, L * 0.75), far(1, L * 0.45)], 0.2, 0);
      p.face([far(-1, L * 0.75), far(-1), far(1), far(1, L * 0.75)], 0.12, 0);
    };
    const away = Math.cos(th) + Math.sin(th) < 0;
    // the rock it stands on
    p.cylinder(0, 0, 0, 9, ZB, { side: 0.12, top: SH.top });
    p.box(5, 3.5, 0, 3.4, 3, 2, { top: 0.24, left: 0.12, right: SH.right });
    p.box(-6.5, 5.6, 0, 2.6, 2.4, 1.4, { top: 0.24, left: 0.12, right: SH.right });
    // the tower: stripes, lit and dark in turn, with the seams between them cut in
    for (let i = 0; i < BANDS.length - 1; i++) band(p, BANDS[i], BANDS[i + 1], rad(BANDS[i]), rad(BANDS[i + 1]), i % 2 === 1);
    for (let i = 1; i < BANDS.length - 1; i++) p.line(front(rad(BANDS[i]), BANDS[i]), SH.edge, 0.55);
    p.line([[RB * S, -RB * S, ZB], [RT * S, -RT * S, ZT]], SH.edge, 0.55);
    p.line([[-RB * S, RB * S, ZB], [-RT * S, RT * S, ZT]], SH.edge, 0.55);
    // a door at the foot and a window up the lit band
    const onWall = (a: number, z: number, d = 0.05): V3 => { const r = rad(z) + d; return [Math.cos(a) * r, Math.sin(a) * r, z]; };
    p.face([onWall(1.0, ZB), onWall(1.5, ZB), onWall(1.5, ZB + 4.2), onWall(1.0, ZB + 4.2)], 0.3, SH.edge, 0.5);
    p.face([onWall(0.85, 15.2), onWall(1.25, 15.2), onWall(1.25, 17.6), onWall(0.85, 17.6)], 0.03, SH.edge, 0.5);
    // the gallery and its rail
    p.cylinder(0, 0, ZT, RT + 1.6, 1, { side: 0.12, top: SH.top });
    if (away) beam();
    p.line(front(RT + 1.5, ZT + 2.4, 20), SH.edge, 0.55);
    for (let i = 0; i <= 6; i++) { const a = A0 + ((A1 - A0) * i) / 6; p.line([[Math.cos(a) * (RT + 1.5), Math.sin(a) * (RT + 1.5), ZT + 1], [Math.cos(a) * (RT + 1.5), Math.sin(a) * (RT + 1.5), ZT + 2.4]], SH.edge, 0.45); }
    // the lantern room: dark glass, mullions, the lamp burning inside
    p.cylinder(0, 0, ZT + 1, 2.8, 4, { side: 0.04, top: 0.04 });
    p.dot([0, 0, LZ], 1.5, 1);
    for (const a of [0.1, 0.9, 1.7]) p.line([[Math.cos(a) * 2.85, Math.sin(a) * 2.85, ZT + 1], [Math.cos(a) * 2.85, Math.sin(a) * 2.85, ZT + 5]], SH.edge, 0.5);
    // the roof: a cone, lit on its left, and a ball on top
    const RZ = ZT + 5;
    const N = 20;
    for (let i = 0; i < N; i++) {
      const a = A0 + ((A1 - A0) * i) / N, b = A0 + ((A1 - A0) * (i + 1)) / N, k = (1 + Math.cos((a + b) / 2 - A1 + 0.5)) / 2;
      p.face([[Math.cos(a) * 3.6, Math.sin(a) * 3.6, RZ], [Math.cos(b) * 3.6, Math.sin(b) * 3.6, RZ], [0, 0, RZ + 3.4]], 0.1 + 0.16 * k, 0);
    }
    p.line([[3.6 * S, -3.6 * S, RZ], [0, 0, RZ + 3.4], [-3.6 * S, 3.6 * S, RZ]], SH.edge, 0.5);
    p.line(front(3.6, RZ, 20), SH.edge, 0.5);
    p.cylinder(0, 0, RZ + 3.2, 0.7, 1.2, { side: 0.16, top: 0.24 });
    if (!away) beam();
  },
};
