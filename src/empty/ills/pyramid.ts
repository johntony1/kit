// No sights saved: one great smooth pyramid, lit on its left face and dark on its right, with a desert sun low beside it. Hover and the sun rises beside the apex and its rays come out.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const B = 15, H = 30; // half base, height

export const pyramid: Illustration = {
  k: "pyramid", name: "Pyramid", title: "No sights saved", body: "Save the places you want to see and they will gather here for your trip.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const e = ease(seg(h, 0, 0.7)), L = ease(seg(h, 0.5, 1));
    p.translate(2, -1, -12);
    p.shadow(0, 0, 34, 15, 0.12);
    // the sun, behind the pyramid's left shoulder: a bright disc with a dark rim that rises on hover
    const [ax, ay] = p.pt([0, 0, H]);
    const sx = ax - 15, sy = ay + 13 - 11 * e, sr = 5.2;
    p.screen((g) => {
      g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fillStyle = "rgb(170,170,170)"; g.fill();
      g.strokeStyle = "#000"; g.lineWidth = 0.7; g.stroke();
      if (L > 0) {
        g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.lineCap = "round";
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + 0.2, r0 = sr + 1.6, r1 = sr + 1.6 + 2.6 * L;
          g.beginPath(); g.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); g.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); g.stroke();
        }
      }
    });
    // the two faces we see: the near left one lit, the right one in shade
    const apex: V3 = [0, 0, H];
    p.face([[-B, B, 0], [B, B, 0], apex], 0.22, 0);
    p.face([[B, B, 0], [B, -B, 0], apex], 0.065, 0);
    // a few courses of stone cut across the lit face, with staggered joints
    const w = (z: number) => B * (1 - z / H);
    const zs = [6, 12, 18, 24];
    zs.forEach((z) => p.line([[-w(z), w(z) + 0.03, z], [w(z), w(z) + 0.03, z]], 1, 0.6));
    [0, 6, 12, 18].forEach((z0, i) => {
      const z1 = z0 + 6, wm = w(z0 + 3);
      for (const f of i % 2 ? [-0.3, 0.3] : [-0.62, 0, 0.62]) p.line([[f * wm, w(z0 + 0.3) + 0.04, z0 + 0.3], [f * wm, w(z1 - 0.3) + 0.04, z1 - 0.3]], 1, 0.55);
    });
    // the ridge between the faces, a bright edge
    p.line([[B, B, 0], apex], 0.9, 0.6);
  },
};
