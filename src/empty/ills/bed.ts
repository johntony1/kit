// Nothing is awake: a single bed seen from the side, a tall headboard on the left, a thick mattress, a plump pillow and a blanket folded back over someone asleep. The blanket rises and falls with each breath and a little z drifts up.
import { type Illustration } from "../dots";

const P = 3.2; // seconds per breath

export const bed: Illustration = {
  k: "bed", name: "Bed", title: "Nothing is awake", body: "Everything is quiet for now. New activity will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P, br = (1 - Math.cos(u * Math.PI * 2)) / 2; // 0..1..0, one breath
    p.translate(0, 0, -10);
    p.shadow(0, 0, 32, 12, 0.12);
    p.rotate("z", -0.42);
    const tone = { top: 0.22, left: 0.12, right: 0.065, edge: 0 };
    // legs
    for (const [x, y] of [[-17, -7], [15.4, -7], [-17, 6], [15.4, 6]]) p.box(x, y, 0, 1.6, 1.6, 3, tone);
    // the headboard: a tall slab with a panel cut in
    p.box(-20, -8, 0, 2.4, 16, 19, { top: 0.26, left: 0.2, right: 0.1, edge: 0 });
    p.line([[-17.57, -6.5, 16.5], [-17.57, 6.5, 16.5], [-17.57, 6.5, 6], [-17.57, -6.5, 6], [-17.57, -6.5, 16.5]], 1, 0.7); // its panel, cut in
    // the frame and the thick mattress
    p.box(-17.6, -8, 3, 35, 16, 3, { top: 0.2, left: 0.065, right: 0.05, edge: 0 });
    p.box(-17.4, -7.6, 6, 34.6, 15.2, 5, { top: 0.24, left: 0.14, right: 0.065, edge: 0 });
    // the pillow at the head, plump and bright
    p.box(-16.6, -6, 11, 7, 12, 3.2, { top: 0.3, left: 0.24, right: 0.1, edge: 0 });
    p.line([[-9.55, -6, 12.6], [-9.55, 6, 12.6]], 1, 0.6);
    // the blanket over the sleeper: a hump that breathes, then the folded back edge
    const hump = 2.4 + br * 0.9;
    p.box(-8, -7.9, 6, 25.6, 15.8, 5.3, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.box(-5, -5, 11.3, 15, 10, hump, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.line([[-5, 5.05, 11.3], [10, 5.05, 11.3]], 1, 0.6);
    p.box(-9.6, -7.9, 6, 2.8, 15.8, 5.9, { top: 0.32, left: 0.28, right: 0.12, edge: 0 }); // the fold, lit
    // the footboard, low
    p.box(17, -8, 0, 2.2, 16, 12.5, { top: 0.26, left: 0.2, right: 0.1, edge: 0 });
    // a z drifts up from the pillow and fades, inside the headboard's height
    const a = Math.sin(u * Math.PI), s = 2.2 + u * 1.4;
    const [zx, zy] = p.pt([-13, 0, 15 + u * 5]);
    if (a > 0.05) p.screen((g) => {
      g.strokeStyle = `rgba(255,255,255,${Math.min(1, a * 1.6)})`; g.lineWidth = 1.3; g.lineJoin = "round"; g.lineCap = "round";
      g.beginPath(); g.moveTo(zx + 4, zy - s); g.lineTo(zx + 4 + s, zy - s); g.lineTo(zx + 4, zy); g.lineTo(zx + 4 + s, zy); g.stroke();
    });
  },
};
