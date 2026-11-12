// No updates yet: a scroll hung on a stand, a short list of dated entries down a rail. Hover and the scroll unrolls further, the entries move down and a new one appears at the top with a plus badge.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const Y = 0.4, TOP = 30, STEP = 7.2;

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
/** an entry: a node on the rail, a title and a shorter line under it */
function entry(p: Pen, z: number, len: number, s: number) {
  p.dot(p_at(-7, z), 1.3 * s, 0);
  p.line([[-4, Y + 0.03, z + 0.6], [-4 + len * s, Y + 0.03, z + 0.6]], SH.edge, 1.2);
  p.line([[-4, Y + 0.03, z - 1.8], [-4 + 5 * s, Y + 0.03, z - 1.8]], SH.edge, 0.55);
}
const p_at = (x: number, z: number): V3 => [x, Y + 0.03, z];

export const changelog: Illustration = {
  k: "changelog", name: "Changelog", title: "No updates yet", body: "When something new ships, you will read about it here, newest first.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(Math.min(1, h / 0.6));
    p.translate(0, 0, -17);
    p.shadow(0, 1, 30, 13, 0.11);
    p.rotate("z", -0.42);
    // the stand: a foot, two posts and the roller across the top
    p.box(-15, -3.6, 0, 30, 7.2, 1.4, { top: 0.2, left: 0.12, right: 0.065 });
    for (const x of [-14.4, 13]) p.box(x, -0.7, 1.4, 1.4, 1.4, TOP - 1.4, { top: 0, left: 0.2, right: 0.1, edge: 0 });
    // the sheet, hanging from the roller, with a weighted bar along its foot
    const zb = TOP - 16.5 - STEP * k;
    p.face([[-11, Y, zb], [11, Y, zb], [11, Y, TOP], [-11, Y, TOP]], 0.21, SH.edge, 0.6);
    p.box(-15.4, -1.5, TOP, 30.8, 3, 2.8, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    p.line([[-7, Y + 0.03, TOP - 2], [-7, Y + 0.03, zb + 3.6]], SH.edge, 0.6);
    entry(p, TOP - 5.2 - STEP * k, 9.5, 1);
    entry(p, TOP - 5.2 - STEP - STEP * k, 7, 1);
    // the newest entry, written in at the top once there is room for it
    const n = ease(Math.max(0, Math.min(1, (h - 0.45) / 0.35)));
    if (n > 0) entry(p, TOP - 5.2, 11, n);
    p.box(-11.8, Y - 0.6, zb - 1.5, 23.6, 1.6, 1.5, { top: 0.3, left: 0.3, right: 0.2, lw: 0.5 });
    const b = Math.max(0, (h - 0.74) / 0.26);
    if (b > 0) badge(p, [11.5, Y, TOP - 4], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
