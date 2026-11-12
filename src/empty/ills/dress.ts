// No outfits saved: a sleeveless dress with a belt and a full skirt. Hover and the skirt flares and swishes; a heart badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// a round bright badge with a dark heart, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    const s = r * 0.5, cy = y + r * 0.08;
    g.fillStyle = "#000"; g.beginPath(); g.moveTo(x, cy + s);
    g.bezierCurveTo(x - s * 1.9, cy - s * 0.2, x - s * 0.9, cy - s * 1.5, x, cy - s * 0.45);
    g.bezierCurveTo(x + s * 0.9, cy - s * 1.5, x + s * 1.9, cy - s * 0.2, x, cy + s);
    g.fill();
  });
}

const WAIST = 18.5, HEM = 3;

export const dress: Illustration = {
  k: "dress", name: "Dress", title: "No outfits saved", body: "Save an outfit you like and it will hang here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.4));
    const flare = 1 + 0.16 * k, swish = h * Math.sin(t * 3) * 1.6;
    p.translate(0, 0, -16.5);
    p.shadow(0, 0, 22 + 3 * k, 9.5, 0.1);
    p.rotate("z", -0.6); // turned to face us
    // below the waist the skirt widens and sways; the further down, the more
    const sk = (x: number, z: number): [number, number] => { const f = Math.max(0, (WAIST - z) / (WAIST - HEM)); return [x * (1 + (flare - 1) * f) + swish * f * f, z]; };
    const hem: [number, number][] = Array.from({ length: 21 }, (_, i) => { const x = 13.6 - (27.2 * i) / 20; return [x, HEM - 1 + Math.abs(Math.sin((i / 20) * Math.PI * 5)) * 1.3] as [number, number]; });
    const out: [number, number][] = [[2.4, 31], [4.7, 31], [5, 27], [6.8, 23.4], [4.9, WAIST], ...hem, [-4.9, WAIST], [-6.8, 23.4], [-5, 27], [-4.7, 31], [-2.4, 31], [-2.3, 27.4], [0, 25.4], [2.3, 27.4]];
    const at = (y: number) => out.map(([x, z]) => { const [a, b] = sk(x, z); return [a, y, b] as V3; });
    p.face(at(-1.7), SH.right, SH.edge, 0.5);
    p.face(at(0), 0.2, SH.edge, 0.6);
    const Y = 0.04;
    // the folds of the skirt, fanning from the waist to the hem
    for (const f of [-0.62, -0.22, 0.22, 0.62]) {
      const [a, b] = sk(13.6 * f, HEM + 0.6);
      p.line([[4.9 * f, Y, WAIST - 1.6], [a, Y, b]], SH.edge, 0.6);
    }
    // the belt: a bright band with a buckle
    p.face([[-5.1, Y, WAIST - 1.2], [5.1, Y, WAIST - 1.2], [5.1, Y, WAIST + 1.2], [-5.1, Y, WAIST + 1.2]], 0.42, SH.edge, 0.6);
    p.dot([0, Y + 0.02, WAIST], 0.8, 0);
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [15, 0, 31], 4.6 * pop);
    }
  },
};
