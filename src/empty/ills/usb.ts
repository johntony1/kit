// USB stick: a flash drive lying on its side, its metal plug showing. Hover and it lifts and its light comes on; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const usb: Illustration = {
  k: "usb", name: "USB stick", title: "No devices plugged in", body: "Plug in a device and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const lift = 5 * back(clamp(h / 0.7)) + h * Math.sin(t * 3) * 0.6;
    p.translate(0, 0, -6);
    p.shadow(0, 0, 26 - h * 3, 11, 0.12);
    p.rotate("z", -0.42);
    p.translate(-1, 0, lift);
    // the body: the long plastic half, a seam near the plug, a ring hole at its tail
    p.box(-17, -6, 0, 20, 12, 6, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    const Z = 6.03;
    p.line([[0.6, -6, Z], [0.6, 6, Z], [0.6, 6.03, 0]], SH.edge, 0.55);
    p.disc(-13.4, 0, Z, 2.3, 0, 0);
    p.clear(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [-13.4 + Math.cos(a) * 2.3, Math.sin(a) * 2.3, Z] as V3; }));
    // its light
    const on = clamp((h - 0.45) / 0.25);
    p.disc(-6.5, 0, Z, 1.7, 0.03 + 0.97 * on, 0);
    if (on > 0) p.disc(-6.5, 0, Z + 0.02, 2.6 + 0.5 * Math.sin(t * 5), 0, on);
    // the plug: bright metal, two square holes in its top
    p.box(3, -4.4, 1, 11, 8.8, 4, { top: 0.9, left: 0.3, right: 0.14, lw: 0.5 });
    for (const y of [-2.9, 0.7]) p.clear([[8, y, 5.03], [11, y, 5.03], [11, y + 2.2, 5.03], [8, y + 2.2, 5.03]]);
    // the opening at its end
    p.clear([[14.03, -3.6, 1.7], [14.03, 3.6, 1.7], [14.03, 3.6, 4.3], [14.03, -3.6, 4.3]]);
    const b = clamp((h - 0.62) / 0.38);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [6, -9, 13], 4.6 * pop);
    }
  },
};
