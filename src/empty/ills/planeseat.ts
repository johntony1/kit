// No seat chosen: one airline seat seen side on, with a tall backrest, a white headrest, a cushion, an armrest and a tray on its back. Hover and the seat reclines a little while the tray folds down, then a tick pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.32); g.stroke();
  });
}
const W = 6; // half width of the seat
const BX = 5; // where the backrest stands

export const planeseat: Illustration = {
  k: "planeseat", name: "Plane seat", title: "No seat chosen", body: "Pick a seat on the seat map and it will be saved here for your flight.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const rec = ease(seg(h, 0, 0.45)), tray = ease(seg(h, 0.2, 0.7)), b = seg(h, 0.7, 1);
    p.translate(0, 0, -19);
    p.shadow(0, 0, 26, 11, 0.12);
    // turned so we see it side on
    p.rotate("z", -0.6);
    p.translate(-1, 0, 0);
    // the legs and the floor rail
    p.box(-8, -W + 1, 0, 16, 2, 1.2, { top: 0.22, left: 0.12, right: 0.065 });
    p.box(-8, W - 3, 0, 16, 2, 1.2, { top: 0.22, left: 0.12, right: 0.065 });
    for (const x of [-6, 3]) p.box(x, W - 3, 1.2, 1.8, 2, 7.8, { top: 0.2, left: 0.14, right: 0.065 });
    // the cushion
    p.box(-11, -W, 9, BX + 11, W * 2, 4.5, { top: 0.3, left: 0.2, right: 0.075, lw: 0.6 });
    // the backrest, tipping back about its foot, with the headrest and the tray on its back
    p.push();
    p.rotate("y", 0.1 + 0.16 * rec, [BX, 0, 10]);
    p.box(BX, -W, 9, 6.5, W * 2, 22.5, { top: 0.24, left: 0.12, right: 0.065, lw: 0.6 });
    p.box(BX - 1.5, -W + 0.5, 32.5, 8, W * 2 - 1, 7, { top: 0.42, left: 0.4, right: 0.2, lw: 0.6 });
    // the tray: hangs flat against the back at rest, folds down to level
    p.push();
    p.rotate("y", (Math.PI / 2) * (1 - tray) - (0.1 + 0.16 * rec) * tray, [BX + 6.5, 0, 23]);
    p.box(BX + 6.5, -W + 1.2, 22, 8, W * 2 - 2.4, 0.9, { top: 0.36, left: 0.2, right: 0.12, lw: 0.6 });
    p.pop();
    p.pop();
    // the near armrest on its post
    p.box(-4, W, 13.5, 1.8, 1.6, 2, { top: 0.2, left: 0.065, right: 0.05 });
    p.box(-9, W, 15.5, BX + 9, 2, 2.4, { top: 0.4, left: 0.4, right: 0.12, lw: 0.6 });
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [-9, 2, 32], 4.6 * pop);
    }
  },
};
