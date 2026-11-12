// No subscribers yet: a newsletter page standing up, a masthead, a picture and columns, with a sealed envelope beside it. Hover and the envelope lifts off the floor and a plus pops in.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const cl = (x: number) => Math.max(0, Math.min(1, x));

function plus(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const newsletter: Illustration = {
  k: "newsletter", name: "Newsletter", title: "No subscribers yet", body: "Share your sign up link. People who subscribe will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, 0, -13);
    p.scale(0.92);
    p.shadow(0, 3, 27, 12, 0.11);
    p.rotate("z", -0.42);
    // the page, leaning back a little
    p.push();
    p.rotate("x", 0.1);
    p.box(-16, -4.6, 0, 20, 1.2, 29, { top: 0.2, left: 0.2, right: 0.065 });
    const fy = -3.37;
    p.face([[-13.5, fy, 22.6], [1.5, fy, 22.6], [1.5, fy, 26.2], [-13.5, fy, 26.2]], 0.03, SH.edge, 0.5); // masthead
    p.face([[-13.5, fy, 12.5], [-6.5, fy, 12.5], [-6.5, fy, 20], [-13.5, fy, 20]], 0.03, SH.edge, 0.55); // picture
    p.face([[-13.5, fy + 0.02, 12.5], [-10.6, fy + 0.02, 17], [-8.6, fy + 0.02, 14.6], [-6.5, fy + 0.02, 16.4], [-6.5, fy + 0.02, 12.5]], 0.22, 0);
    for (let i = 0; i < 3; i++) p.line([[-4.4, fy, 19.2 - i * 2.8], [i === 2 ? -1.5 : 1.5, fy, 19.2 - i * 2.8]], SH.edge, 0.8);
    for (let i = 0; i < 3; i++) p.line([[-13.5, fy, 9.4 - i * 2.8], [i === 2 ? -5 : 1.5, fy, 9.4 - i * 2.8]], SH.edge, 0.65);
    p.pop();
    // the envelope in front, hopping on hover
    const k = cl(h / 0.65);
    const z = (k < 0.7 ? easeInOut(k / 0.7) * 7.5 : 7.5 - 1.5 * easeInOut((k - 0.7) / 0.3));
    const x0 = 6.5, w = 15.5, hh = 10.5, y0 = 2.4, d = 1.4;
    if (z > 0.3) p.guide([[x0 + w / 2, y0 + d, z], [x0 + w / 2, y0 + d, 0]], true);
    p.box(x0, y0, z, w, d, hh, { top: 0.24, left: 0.3, right: 0.08, lw: 0.7 });
    const ey = y0 + d + 0.03;
    p.line([[x0, ey, z + hh], [x0 + w / 2, ey, z + hh * 0.42], [x0 + w, ey, z + hh]], SH.edge, 0.75);
    p.line([[x0, ey, z], [x0 + w * 0.36, ey, z + hh * 0.54]], SH.edge, 0.5);
    p.line([[x0 + w, ey, z], [x0 + w * 0.64, ey, z + hh * 0.54]], SH.edge, 0.5);
    const b = cl((h - 0.62) / 0.38);
    if (b > 0) {
      const pop = b < 0.65 ? easeInOut(b / 0.65) * 1.18 : 1.18 - 0.18 * easeInOut((b - 0.65) / 0.35);
      plus(p, [x0 + w - 1, ey, z + hh + 5], 4.6 * pop);
    }
  },
};
