// No listings yet: a block of flats, its windows dark. Hover and the windows light up floor by floor, and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const apartment: Illustration = {
  k: "apartment", name: "Apartment block", title: "No listings yet", body: "Add your first place to rent and it will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 25, 12.5, 0.1);
    const W = 8.6, D = 6.6, H = 27;
    p.box(-W - 1.6, -D - 1.6, 0, 2 * W + 3.2, 2 * D + 3.2, 1.2, { top: 0.2, left: 0.12, right: 0.065 });
    p.box(-W, -D, 1.2, 2 * W, 2 * D, H - 1.2, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    // the roof: a parapet line, a stair head and a water tank
    p.line([[-W + 1, -D + 1, H + 0.02], [W - 1, -D + 1, H + 0.02], [W - 1, D - 1, H + 0.02], [-W + 1, D - 1, H + 0.02], [-W + 1, -D + 1, H + 0.02]], 0.6, 0.45);
    p.box(-5.6, -3.6, H, 5, 4.4, 3, { top: 0.24, left: 0.14, right: 0.07 });
    p.cylinder(3.4, 0.6, H, 2.1, 2.8, { side: 0.14, top: 0.24 });
    // windows: dark at rest, lighting up in a scattered order
    let n = 0;
    const lit = () => { const o = (n++ * 7) % 19; return o % 5 === 4 ? 0 : ease(seg(h, 0.04 + o * 0.036, 0.16 + o * 0.036)); };
    const y = D + 0.03, x = W + 0.03;
    for (let r = 0; r < 5; r++) {
      const z = 3.6 + r * 4.7;
      for (const cx of [-5.4, 0, 5.4]) {
        if (r === 0 && cx === 0) continue; // the door goes here
        p.face([[cx - 1.5, y, z], [cx + 1.5, y, z], [cx + 1.5, y, z + 2.8], [cx - 1.5, y, z + 2.8]], 0.02 + 0.9 * lit(), SH.edge, 0.45);
      }
      for (const cy of [-3.1, 3.1]) p.face([[x, cy - 1.4, z], [x, cy + 1.4, z], [x, cy + 1.4, z + 2.8], [x, cy - 1.4, z + 2.8]], 0.02 + 0.75 * lit(), SH.edge, 0.45);
    }
    // the door, with a step and a canopy
    p.clear([[-1.8, y, 1.2], [1.8, y, 1.2], [1.8, y, 6.2], [-1.8, y, 6.2]]);
    p.line([[-1.8, y, 1.2], [-1.8, y, 6.2], [1.8, y, 6.2], [1.8, y, 1.2]], SH.edge, 0.5);
    p.box(-2.8, D, 6.6, 5.6, 1.8, 0.5, { top: 0.3, left: 0.2, right: 0.1 });
    const b = seg(h, 0.72, 1);
    if (b > 0) badge(p, [W + 3, -D - 2, H + 2], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
