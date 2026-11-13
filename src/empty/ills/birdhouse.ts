// Nobody moved in yet: a birdhouse on a post, a pitched roof, a round door and a perch. Hover and a little bird pops its head out of the door.
import { SH, type Illustration, type V3 } from "../dots";

const back = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.6 * Math.pow(x - 1, 3) + 1.6 * Math.pow(x - 1, 2));

export const birdhouse: Illustration = {
  k: "birdhouse", name: "Birdhouse", title: "Nobody moved in yet", body: "Invite your first member and they will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -24);
    p.shadow(0, 0, 16, 7, 0.12);
    p.rotate("z", -0.5); // turned so its door faces us
    // the post
    p.box(-1.6, -1.6, 0, 3.2, 3.2, 15, { edge: 0 });
    p.box(-4.5, -4.5, 13.6, 9, 9, 1.4, { edge: 0 });
    // the house: a lit front wall, a sparse end
    const W = 8, Z0 = 15, Z1 = 31;
    p.box(-W, -W, Z0, W * 2, W * 2, Z1 - Z0, { top: 0.2, left: 0.16, right: 0.065, edge: 0 });
    // the gable above the front wall
    const F = W + 0.01, R = 41;
    p.face([[-W, F, Z1], [W, F, Z1], [0, F, R - 1.5]], 0.16, 0);
    // the roof: two slopes, the left one lit, overhanging the front
    const O = 2.6, Y0 = -W - 1, Y1 = W + O;
    p.face([[-W - O, Y0, Z1 - 2.2], [0, Y0, R], [0, Y1, R], [-W - O, Y1, Z1 - 2.2]], 0.24, 0);
    p.face([[0, Y0, R], [W + O, Y0, Z1 - 2.2], [W + O, Y1, Z1 - 2.2], [0, Y1, R]], 0.07, 0);
    p.face([[-W - O, Y1, Z1 - 2.2], [0, Y1, R], [0, Y1, R - 1.6], [-W - O, Y1, Z1 - 3.8]], 0.3, 0);
    p.face([[0, Y1, R], [W + O, Y1, Z1 - 2.2], [W + O, Y1, Z1 - 3.8], [0, Y1, R - 1.6]], 0.18, 0);
    p.line([[-W - O, Y1 + 0.03, Z1 - 2.2], [0, Y1 + 0.03, R], [W + O, Y1 + 0.03, Z1 - 2.2]], SH.edge, 0.6);
    // the round door, dark
    const D = 3.6, DZ = 25;
    const door = (r: number): V3[] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [Math.cos(a) * r, F + 0.02, DZ + Math.sin(a) * r] as V3; });
    p.clear(door(D));
    // the perch: a bright peg under the door
    p.box(-0.8, W, 18.4, 1.6, 4.5, 1.6, { top: 0.3, left: 0.3, right: 0.2, edge: 0 });
    // the bird pops its head out of the door
    const k = back(Math.min(1, Math.max(0, (h - 0.15) / 0.6)));
    if (k > 0.02) {
      const bob = h * Math.sin(t * 5) * 0.3;
      const [x, y] = p.pt([0, F + 0.05, DZ - 0.6 + 1.2 * k + bob]);
      const r = 3.1 * k;
      p.screen((g) => {
        g.save();
        const [cx, cy] = p.pt([0, F + 0.02, DZ]);
        g.beginPath(); g.ellipse(cx, cy, D * 1.25, D * 1.25, 0, 0, Math.PI * 2); g.clip();
        g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        g.restore();
        g.fillStyle = "#fff"; g.beginPath(); g.moveTo(x + r * 0.7, y - r * 0.35); g.lineTo(x + r * 1.75, y + r * 0.05); g.lineTo(x + r * 0.7, y + r * 0.45); g.fill();
        g.fillStyle = "#000"; g.beginPath(); g.arc(x + r * 0.28, y - r * 0.25, r * 0.24, 0, Math.PI * 2); g.fill();
      });
    }
  },
};
