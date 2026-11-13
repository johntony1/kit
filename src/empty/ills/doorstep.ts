// Nothing delivered yet: a front door on a stoop with a taped parcel waiting on the step. Hover and the door swings open toward the parcel; a tick pops in over it.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const FY = 0; // the front of the wall
const DW = 6.5, DZ0 = 3, DZ1 = 26; // half width of the door, its foot and head

// a round bright badge with a dark tick, flat to the screen
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}

export const doorstep: Illustration = {
  k: "doorstep", name: "Parcel on doorstep", title: "Nothing delivered yet", body: "When a parcel arrives it will show up here with the time it was left at your door.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, 0, -14);
    p.shadow(0, 3, 30, 14, 0.12);
    // the stoop: one wide step in front of the wall
    p.box(-14, -4, 0, 28, 15, 3, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.line([[-14, 11.03, 3], [14, 11.03, 3], [14.03, -4, 3]], SH.edge, 0.5);
    // the wall: a slab, its face toward us in mid shade
    p.box(-12, -4, 3, 24, 4, 26, { top: 0.2, left: 0.065, right: 0.05, edge: 0 });
    // the door frame: a lit band round the doorway
    const y = FY + 0.03;
    p.face([[-DW - 1.4, y, DZ0], [DW + 1.4, y, DZ0], [DW + 1.4, y, DZ1 + 1.4], [-DW - 1.4, y, DZ1 + 1.4]], 0.12, 0);
    const a = easeInOut(Math.min(1, h * 1.5)) * 0.95;
    if (a > 0.01) p.clear([[-DW, y + 0.02, DZ0], [DW, y + 0.02, DZ0], [DW, y + 0.02, DZ1], [-DW, y + 0.02, DZ1]]);
    // the door, hinged on its left edge, swinging out toward us
    p.push();
    p.rotate("z", a, [-DW, FY, 0]);
    p.box(-DW, FY, DZ0, DW * 2, 0.9, DZ1 - DZ0, { top: 0.2, left: 0.24, right: 0.065, edge: 0 });
    const fy = FY + 0.93;
    // two recessed panels and a knob
    for (const [z0, z1] of [[5.5, 13.5], [15.5, 23.5]]) p.line([[-DW + 2, fy, z0], [DW - 2, fy, z0], [DW - 2, fy, z1], [-DW + 2, fy, z1], [-DW + 2, fy, z0]], SH.edge, 0.6);
    p.dot([DW - 1.3, fy + 0.05, 14.5], 0.75, 0.02);
    p.pop();
    // a small porch lamp beside the door
    p.box(DW + 3, FY, 18, 2, 1.6, 3.2, { top: 0.3, left: 0.3, right: 0.16, edge: 0 });
    // the parcel on the step, toward the right, tape across its lid
    const px = 1.5, py = 3, W = 11.5, D = 8, H = 8.5;
    p.box(px, py, DZ0, W, D, H, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    p.line([[px, py + D + 0.03, DZ0 + H], [px + W, py + D + 0.03, DZ0 + H], [px + W + 0.03, py, DZ0 + H]], SH.edge, 0.8);
    p.line([[px + W + 0.03, py + D, DZ0], [px + W + 0.03, py + D, DZ0 + H]], SH.edge, 0.6);
    p.face([[px, py + D / 2 - 0.9, DZ0 + H + 0.03], [px + W, py + D / 2 - 0.9, DZ0 + H + 0.03], [px + W, py + D / 2 + 0.9, DZ0 + H + 0.03], [px, py + D / 2 + 0.9, DZ0 + H + 0.03]], 0.06, 0);
    p.face([[px + W + 0.03, py + D / 2 - 0.9, DZ0 + H - 3], [px + W + 0.03, py + D / 2 + 0.9, DZ0 + H - 3], [px + W + 0.03, py + D / 2 + 0.9, DZ0 + H], [px + W + 0.03, py + D / 2 - 0.9, DZ0 + H]], 0.2, 0);
    p.face([[px + 1.4, py + D + 0.03, DZ0 + 1.4], [px + 5.4, py + D + 0.03, DZ0 + 1.4], [px + 5.4, py + D + 0.03, DZ0 + 4.4], [px + 1.4, py + D + 0.03, DZ0 + 4.4]], 0.26, 0);
    const b = Math.max(0, (h - 0.62) / 0.38);
    if (b > 0) tick(p, [px + W / 2, py + D / 2, DZ0 + H + 6], 4.4 * (b < 0.6 ? easeInOut(b / 0.6) * 1.15 : 1.15 - 0.15 * easeInOut((b - 0.6) / 0.4)));
  },
};
