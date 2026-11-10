// Nobody home yet: a little house with a gabled roof. Hover and its windows light up one by one, the porch lamp comes on and the chimney smokes.
import { SH, type Illustration, type V3 } from "../dots";

const W = 9, D = 7, HW = 12, RZ = 19.5; // half width (x), half depth (y), wall height, ridge height

export const home: Illustration = {
  k: "home", name: "Little house", title: "Nobody home yet", body: "Invite your household and everyone you add will settle in here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, -1.5, -10);
    p.shadow(0, 1.5, 26, 13, 0.12);
    // a dashed plot line around the house
    p.guide([[-12, -10, 0], [12, -10, 0], [12, 13.5, 0], [-12, 13.5, 0], [-12, -10, 0]]);
    // the back slope of the roof, just showing behind the ridge
    p.face([[-W - 1, -D - 1.2, HW - 0.8], [W + 1, -D - 1.2, HW - 0.8], [W + 1, 0, RZ], [-W - 1, 0, RZ]], 0.12, SH.edge, 0.55);
    // the chimney, rising from the back slope
    p.box(3.5, -5.2, 13, 2.8, 2.8, 8.5, { top: 0.22, left: 0.13, right: SH.right });
    p.box(3.1, -5.6, 21.5, 3.6, 3.6, 0.9, { top: 0.24, left: 0.14, right: SH.right });
    // walls
    p.box(-W, -D, 0, W * 2, D * 2, HW, { top: 0.02, left: 0.1, right: SH.right });
    // the gable end, on the right wall
    p.face([[W, -D, HW], [W, D, HW], [W, 0, RZ - 0.6]], SH.right, SH.edge, 0.55);
    // lights: each window comes on in turn
    const on = (k: number) => Math.min(1, Math.max(0, (h - k) / 0.18));
    const win = (pts: V3[], k: number, mull: V3[][]) => {
      const l = on(k);
      p.face(pts, l > 0.5 ? 0.3 : 0.03, SH.edge, 0.55);
      for (const m of mull) p.line(m, SH.edge, 0.55);
    };
    // a round window high in the gable
    const gw: V3[] = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [W + 0.03, Math.cos(a) * 1.5, HW + 2.6 + Math.sin(a) * 1.5] as V3; });
    win(gw, 0.62, [[[W + 0.05, -1.5, HW + 2.6], [W + 0.05, 1.5, HW + 2.6]]]);
    // the side window, on the right wall
    win([[W + 0.03, -4.5, 4], [W + 0.03, -0.5, 4], [W + 0.03, -0.5, 9], [W + 0.03, -4.5, 9]], 0.42, [[[W + 0.05, -2.5, 4], [W + 0.05, -2.5, 9]], [[W + 0.05, -4.5, 6.5], [W + 0.05, -0.5, 6.5]]]);
    p.face([[W + 0.03, -5, 3.4], [W + 0.03, 0, 3.4], [W + 0.6, 0, 3.4], [W + 0.6, -5, 3.4]], 0.22, SH.edge, 0.4); // sill
    // the front window, on the left wall
    win([[1.5, D + 0.03, 4], [7, D + 0.03, 4], [7, D + 0.03, 9.2], [1.5, D + 0.03, 9.2]], 0.12, [[[4.25, D + 0.05, 4], [4.25, D + 0.05, 9.2]], [[1.5, D + 0.05, 6.6], [7, D + 0.05, 6.6]]]);
    p.box(1, D, 3.3, 6.5, 0.7, 0.7, { top: 0.24, left: 0.14, right: SH.right }); // sill
    // the door, a lit panel with a knob
    p.face([[-6, D + 0.03, 0], [-1.6, D + 0.03, 0], [-1.6, D + 0.03, 8.4], [-6, D + 0.03, 8.4]], 0.22, SH.edge, 0.6);
    p.line([[-5, D + 0.06, 4.4], [-2.6, D + 0.06, 4.4]], SH.edge, 0.55);
    p.line([[-5, D + 0.06, 7.2], [-2.6, D + 0.06, 7.2]], SH.edge, 0.55);
    p.dot([-2.5, D + 0.1, 3.4], 0.45, 0.04);
    // the porch lamp beside the door
    p.box(-0.9, D, 7.6, 0.9, 0.8, 1.4, { top: 0.2, left: on(0.05) > 0.5 ? 0.32 : 0.1, right: SH.right });
    // the back slope's end, so the roof's edge reads as one folded board
    p.face([[W + 1, -D - 1.2, HW - 0.8], [W + 1, 0, RZ], [W + 1, 0, RZ - 1], [W + 1, -D - 1.2, HW - 1.8]], 0.12, SH.edge, 0.5);
    // warm light spilling onto the ground under the front window
    if (!p.ink && on(0.12) > 0.5) p.face([[1.5, D + 0.8, 0.03], [7, D + 0.8, 0.03], [7.6, D + 4.6, 0.03], [2.1, D + 4.6, 0.03]], 0.2, 0, 0.5);
    // the front slope of the roof, lit, with shingle rows cut across it
    const fr = (x: number, u: number): V3 => [x, (D + 1.2) * (1 - u), HW - 0.8 + (RZ - HW + 0.8) * u];
    p.face([fr(-W - 1, 0), fr(W + 1, 0), fr(W + 1, 1), fr(-W - 1, 1)], SH.top, SH.edge, 0.6);
    for (const u of [0.3, 0.6]) p.line([fr(-W - 0.6, u), fr(W + 0.6, u)], SH.edge, 0.55);
    // the roof's thickness along its right end
    p.face([[W + 1, D + 1.2, HW - 0.8], [W + 1, 0, RZ], [W + 1, 0, RZ - 1], [W + 1, D + 1.2, HW - 1.8]], 0.12, SH.edge, 0.5);
    // a step and a path of stones to the door
    p.box(-6.6, D, 0, 5.6, 1.8, 0.7, { top: 0.24, left: 0.13, right: SH.right });
    for (let i = 0; i < 3; i++) {
      const y = D + 3 + i * 2.6, x = -4.6 + (i % 2) * 0.8;
      p.face([[x - 1.6, y, 0.02], [x + 1.6, y, 0.02], [x + 1.6, y + 1.7, 0.02], [x - 1.6, y + 1.7, 0.02]], 0.2, SH.edge, 0.5);
    }
    // smoke from the chimney once the house is lit
    const k = Math.max(0, (h - 0.5) / 0.5);
    if (k > 0) for (let i = 0; i < 4; i++) {
      const u = (t * 0.35 + i / 4) % 1;
      if (u < 0.85 && k > 0.4) p.dot([4.9 - u * 2.2, -3.8 + u * 1.2, 23.4 + u * 9], 0.55 + u * 0.55, 1);
    }
  },
};
