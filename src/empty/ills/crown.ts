// No leaders yet: a crown resting on a cushion. A glint runs across its band and a sparkle pops on one point after another.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const R = 11.5, ZB = 6; // crown radius, the cushion's top where it sits
const BAND = 4.4, PEAK = 17.5, DIP = 8.5; // the solid band, the height of the points
const NPK = 5, N = 60;
const S = Math.SQRT1_2;

/** the height of the crown's top edge at an angle: five points with dips between */
const topAt = (a: number) => {
  const f = (((a / (Math.PI * 2)) * NPK) % 1 + 1) % 1; // 0 at a point, 0.5 at a dip
  const d = Math.abs(f - 0.5) * 2; // 1 at a point, 0 at a dip
  return DIP + (PEAK - DIP) * Math.pow(d, 2);
};
// the points sit either side of the front, a dip right in front of us
const A0 = Math.PI / 4 + Math.PI / NPK;
const ang = (i: number) => A0 + (i / N) * Math.PI * 2;

export const crown: Illustration = {
  k: "crown", name: "Crown", title: "No leaders yet", body: "Be the first to score and your name will sit at the top.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -12);
    p.shadow(0, 0, 27, 13, 0.12);
    // the cushion: a plump lit square with piping round its top and tassels at the corners
    const C = 14.5;
    p.box(-C, -C, 0, C * 2, C * 2, ZB, { top: 0.2 });
    p.line([[-C + 1, C + 0.03, ZB - 1.2], [C - 0.03, C + 0.03, ZB - 1.2], [C + 0.03, -C + 1, ZB - 1.2]], SH.edge, 0.55);
    p.line([[-C + 1.6, C - 1.6, ZB + 0.03], [C - 1.6, C - 1.6, ZB + 0.03], [C - 1.6, -C + 1.6, ZB + 0.03], [-C + 1.6, -C + 1.6, ZB + 0.03], [-C + 1.6, C - 1.6, ZB + 0.03]], SH.edge, 0.55);
    ([[-C, C], [C, C], [C, -C]] as [number, number][]).forEach(([x, y]) => {
      const [sx, sy] = p.pt([x, y, ZB - 0.4]);
      p.screen((c) => { c.strokeStyle = "#fff"; c.lineWidth = 0.7; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx, sy + 3.2); c.stroke(); });
      p.dot([x, y, ZB - 4.6], 1.1, 1);
    });
    // the dent the crown makes in the cushion
    p.disc(0, 0, ZB + 0.02, R + 1.2, 0.1, 0);
    p.translate(0, 0, ZB);
    // the inside of the back half, seen over the front: sparse
    const vis = (a: number) => Math.cos(a) * S + Math.sin(a) * S; // > 0 faces us
    for (let i = 0; i < N; i++) {
      const a0 = ang(i), a1 = ang(i + 1);
      if (vis((a0 + a1) / 2) > 0) continue;
      p.face([[Math.cos(a0) * R, Math.sin(a0) * R, 0], [Math.cos(a1) * R, Math.sin(a1) * R, 0], [Math.cos(a1) * R, Math.sin(a1) * R, topAt(a1 - A0)], [Math.cos(a0) * R, Math.sin(a0) * R, topAt(a0 - A0)]], SH.right, 0);
    }
    // the front half's outside: lit toward the left, darker round to the right, a glint sweeping across
    const sweep = -Math.PI / 4 + 0.2 + ((u * 1.6) % 1.6) * Math.PI * 0.9;
    for (let i = 0; i < N; i++) {
      const a0 = ang(i), a1 = ang(i + 1), am = (a0 + a1) / 2;
      if (vis(am) <= 0) continue;
      const lit = Math.sin(am) > Math.cos(am) * 0.6; // faces +y, the lit side
      const glint = Math.abs(am - sweep) < 0.16 || Math.abs(am - sweep - Math.PI * 2) < 0.16;
      p.face([[Math.cos(a0) * R, Math.sin(a0) * R, 0], [Math.cos(a1) * R, Math.sin(a1) * R, 0], [Math.cos(a1) * R, Math.sin(a1) * R, topAt(a1 - A0)], [Math.cos(a0) * R, Math.sin(a0) * R, topAt(a0 - A0)]], glint ? 0.34 : lit ? 0.22 : SH.left, 0);
    }
    // the band: two cut rings round the front, and gems between them
    const arc = (z: number, r = R + 0.04): V3[] => Array.from({ length: 25 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 24; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
    p.line(arc(0.9), SH.edge, 0.6);
    p.line(arc(BAND), SH.edge, 0.6);
    for (const a of [Math.PI / 4 - 0.95, Math.PI / 4, Math.PI / 4 + 0.95]) {
      const x = Math.cos(a) * (R + 0.05), y = Math.sin(a) * (R + 0.05), m = (BAND + 0.9) / 2;
      const tx = -Math.sin(a), ty = Math.cos(a);
      p.clear([[x + tx * 1.3, y + ty * 1.3, m], [x, y, m + 1.1], [x - tx * 1.3, y - ty * 1.3, m], [x, y, m - 1.1]]);
    }
    // the rim of the top edge, cut, so the points read against the back half
    p.line(Array.from({ length: 31 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 30; return [Math.cos(a) * (R + 0.05), Math.sin(a) * (R + 0.05), topAt(a - A0) - 0.05] as V3; }), SH.edge, 0.6);
    // a bead on every point, and a sparkle hopping from one front point to the next
    for (let k = 0; k < NPK; k++) {
      const a = A0 + (k / NPK) * Math.PI * 2;
      p.dot([Math.cos(a) * R, Math.sin(a) * R, PEAK + 0.9], 1.25, vis(a) > -0.2 ? 1 : 0.8);
    }
    const order = [A0 - (Math.PI * 2) / NPK, A0, A0 + (Math.PI * 2) / NPK * 2];
    const which = Math.floor(u * 3), f = (u * 3) % 1;
    const a = order[which], tw = Math.sin(Math.PI * f);
    if (tw > 0.05) {
      const [sx, sy] = p.pt([Math.cos(a) * R, Math.sin(a) * R, PEAK + 0.9]);
      p.screen((c) => {
        const L = 1.5 + 3.2 * tw, n = Math.round(255 * tw);
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 0.8; c.lineCap = "round";
        c.beginPath(); c.moveTo(sx - L, sy - 2.4); c.lineTo(sx + L, sy - 2.4); c.moveTo(sx, sy - 2.4 - L); c.lineTo(sx, sy - 2.4 + L); c.stroke();
      });
    }
  },
};
