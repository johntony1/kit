// No journeys yet: a metro train seen front on, standing on its rails: a rounded front, a big lit windscreen, a destination strip and two headlights. Hover and the headlights and the strip light up.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const glow = (p: Pen, pts: V3[], lw = 1.2, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// the train's cross section, in x and z: a box with rounded roof corners
const TW = 11, Z0 = 2.2, Z1 = 25, RC = 5;
const prof: [number, number][] = [[-TW, Z0], [TW, Z0],
  ...Array.from({ length: 7 }, (_, i) => { const a = (i / 6) * (Math.PI / 2); return [TW - RC + Math.cos(a) * RC, Z1 - RC + Math.sin(a) * RC] as [number, number]; }),
  ...Array.from({ length: 7 }, (_, i) => { const a = Math.PI / 2 + (i / 6) * (Math.PI / 2); return [-TW + RC + Math.cos(a) * RC, Z1 - RC + Math.sin(a) * RC] as [number, number]; })];
const YB = -7, YF = 7; // the back of the car we see, and its front

export const subway: Illustration = {
  k: "subway", name: "Metro", title: "No journeys yet", body: "Save a line or a station and your next journeys will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const L = ease(seg(h, 0, 0.6)), S = ease(seg(h, 0.4, 1));
    p.translate(0, 0, -15);
    p.shadow(0, 0, 32, 15, 0.12);
    p.rotate("z", -0.72); // turned so its front faces us
    // the rails, running out toward us under the front
    for (const x of [-6, 6]) glow(p, [[x, YB, 0], [x, YF + 12, 0]], 1.6, 0.9);
        // the wheels and underframe, dark
    p.box(-TW + 1, YB, 0, TW * 2 - 2, YF - YB - 0.5, Z0, { top: 0.04, left: 0.04, right: 0.03, edge: 0 });
    // the roof and the right side of the car
    for (let i = 0; i < prof.length; i++) {
      const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % prof.length];
      const nx = z1 - z0, nz = -(x1 - x0);
      if (nx + nz <= 0.001) continue;
      p.face([[x0, YB, z0], [x1, YB, z1], [x1, YF, z1], [x0, YF, z0]], nz > Math.abs(nx) * 1.2 ? 0.24 : 0.065, 0);
    }
    // side windows cut into the right side
    for (const y0 of [-5.5]) p.clear([[TW + 0.03, y0, 13], [TW + 0.03, y0 + 5.5, 13], [TW + 0.03, y0 + 5.5, 19.5], [TW + 0.03, y0, 19.5]]);
    // the front: a lit rounded face
    const F = YF + 0.03, at = (x: number, z: number): V3 => [x, F, z];
    p.face(prof.map(([x, z]) => [x, YF, z] as V3), 0.2, 0);
    p.line(prof.slice(2).map(([x, z]) => at(x, z)), 1, 0.8); // where the front meets the roof
    // the big windscreen, lit, split down the middle
    p.clear([at(-TW + 1.2, 9.8), at(TW - 1.2, 9.8), at(TW - 1.2, 19.7), at(-TW + 1.2, 19.7)]);
    p.face([at(-TW + 1.8, 10.5), at(TW - 1.8, 10.5), at(TW - 1.8, 19), at(-TW + 1.8, 19)], 0.4, 0);
    p.clear([at(-0.5, 10.5), at(0.5, 10.5), at(0.5, 19), at(-0.5, 19)]);
    // the destination strip over it: dark, its sign lights up on hover
    p.clear([at(-6.5, 20.4), at(6.5, 20.4), at(6.5, 23.4), at(-6.5, 23.4)]);
    glow(p, [[-4.8, F + 0.05, 21.9], [-4.8 + 9.6 * Math.max(0.15, S), F + 0.05, 21.9]], 1.8, 0.35 + 0.65 * S);
    // the bumper line and two headlights
    p.line([at(-TW, 4.8), at(TW, 4.8)], 1, 1);
    for (const x of [-6.6, 6.6]) {
      const [hx, hy] = p.pt([x, F, 7.8]), r = 1.7 + 0.5 * L;
      p.screen((g) => { g.beginPath(); g.arc(hx, hy, r, 0, Math.PI * 2); g.fillStyle = `rgb(${Math.round(150 + 105 * L)},${Math.round(150 + 105 * L)},${Math.round(150 + 105 * L)})`; g.fill(); g.strokeStyle = "#000"; g.lineWidth = 0.8; g.stroke(); });
    }
  },
};
