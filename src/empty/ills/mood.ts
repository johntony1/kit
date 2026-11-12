// No moods logged: three face tokens on a shelf, from low to bright. Hover and the happy one lifts, lights up and sparkles while the others dim.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 6.4, YF = 1.5;
function sparkle(p: Pen, at: V3, r: number) {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = "#fff"; g.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, q = i % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    g.closePath(); g.fill();
  });
}

export const mood: Illustration = {
  k: "mood", name: "Mood", title: "No moods logged", body: "Check in with how you feel today and your moods will line up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(clamp(h / 0.6));
    p.translate(0, 0, -10);
    p.shadow(0, 1, 36, 13, 0.11);
    p.rotate("z", -0.5);
    p.box(-23, -3.4, 0, 46, 6.8, 2.4, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    [-15, 0, 15].forEach((x, i) => {
      const sel = i === 2;
      const zc = 2.4 + R + (sel ? 6 * e + h * Math.sin(t * 2.4) * 0.6 : 0);
      if (sel && e > 0.05) p.guide([[x, 0, 2.4], [x, 0, zc - R]], true);
      // a thick token: its rim behind, its face in front
      p.ringV("y", [x, -YF, zc], R, sel ? 0.12 : 0.065, 0);
      p.ringV("y", [x, YF, zc], R, sel ? 0.13 + 0.2 * e : 0.13 - 0.065 * e, SH.edge, 0.6);
      const y = YF + 0.04;
      for (const sx of [-1, 1]) p.dot([x + sx * 2.3, y, zc + 1.5], 0.95, 0);
      // the mouth: a frown, a flat line, a smile
      const mouth: V3[] = i === 1 ? [[x - 2.4, y, zc - 2.2], [x + 2.4, y, zc - 2.2]]
        : Array.from({ length: 9 }, (_, j) => { const a = 0.55 + (j / 8) * (Math.PI - 1.1), up = i === 0 ? 1 : -1; return [x + Math.cos(a) * 3, y, zc - 2 - up * 1.9 + up * Math.sin(a) * 3] as V3; });
      p.line(mouth, SH.edge, 1.1);
    });
    const b = ease(clamp((h - 0.55) / 0.45));
    sparkle(p, [23, YF, 2.4 + R + 13], 3.4 * b * (0.8 + 0.2 * Math.sin(t * 4)));
    sparkle(p, [7.5, YF, 2.4 + R + 15], 2.2 * b * (0.8 + 0.2 * Math.sin(t * 4 + 2)));
  },
};
