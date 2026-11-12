// Plugin block: a studded base plate with one block fitted and a second held above its empty place. Hover and the block drops on and clicks home; a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const S = 10, BASE = 3.6, BH = 6.5; // half side of the plate, its height, a block's height

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
// the fall: a drop, a bounce, rest
function drop(k: number) {
  if (k < 0.55) return 1 - Math.pow(k / 0.55, 2);
  if (k < 0.82) { const v = (k - 0.55) / 0.27; return 0.16 * 4 * v * (1 - v); }
  return 0;
}
const studs = (p: Pen, y: number, z: number, top: number) => { for (const x of [-5, 5]) p.cylinder(x, y, z, 3, 2.2, { side: 0.03, top, lw: 0.5 }); };

export const plugin: Illustration = {
  k: "plugin", name: "Plugin block", title: "No plugins installed", body: "Install a plugin to add new abilities to your workspace.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 26, 13, 0.12);
    // the plate, the far block fitted on it, and the open studs in front
    p.box(-S, -S, 0, S * 2, S * 2, BASE);
    p.box(-S, -S, BASE, S * 2, S, BH, { top: 0.11, left: 0.075, right: 0.04 });
    studs(p, -5, BASE + BH, 0.16);
    studs(p, 5, BASE, 0.26);
    // the new block: held above its place, then dropped on
    const z = BASE + 10 * drop(clamp(h / 0.7));
    if (z > BASE + 0.4) for (const [x, y] of [[-S, S], [S, S], [S, 0]]) p.guide([[x, y, BASE], [x, y, z]], true);
    const lit = clamp((h - 0.6) / 0.25);
    p.box(-S, 0, z, S * 2, S, BH, { top: 0.24 + 0.3 * lit, left: 0.16 + 0.1 * lit, right: 0.085, lw: 0.7 });
    studs(p, 5, z + BH, 0.3 + 0.6 * lit);
    const b = clamp((h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [S + 2, -S + 2, BASE + BH + 11], 4.8 * pop);
    }
  },
};
