// No fonts installed: two wooden type blocks, a capital A and a small a cut into their faces. Hover and they hop in turn and a plus pops in.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const cl = (x: number) => Math.max(0, Math.min(1, x));
type S = [number, number][];
const BIG: S[] = [[[-2.7, -3.4], [0, 3.4], [2.7, -3.4]], [[-1.6, -1], [1.6, -1]]];
const bowl: S = Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [-0.3 + Math.cos(a) * 1.9, -1.5 + Math.sin(a) * 1.8] as [number, number]; });
const SMALL: S[] = [[[-1.7, 1.6], [-0.4, 2.4], [1, 2.1], [1.6, 1.2], [1.6, -3.3]], bowl];

function block(p: Pen, x: number, w: number, d: number, hgt: number, z: number, g: S[], s: number) {
  p.box(x, -d / 2, z, w, d, hgt, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
  const y = d / 2 + 0.03, cx = x + w / 2, cz = z + hgt / 2;
  // a bevel round the face, then the letter
  p.line([[x + 1.2, y, z + 1.2], [x + w - 1.2, y, z + 1.2], [x + w - 1.2, y, z + hgt - 1.2], [x + 1.2, y, z + hgt - 1.2], [x + 1.2, y, z + 1.2]], 0.5, 0.4);
  for (const st of g) p.line(st.map(([a, b]) => [cx + a * s, y + 0.02, cz + b * s] as V3), SH.edge, 1.15);
}
function plus(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const fonts: Illustration = {
  k: "fonts", name: "Fonts", title: "No fonts installed", body: "Add a font file and it will be ready to use across your projects.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -9);
    p.shadow(-7.5, 1, 14, 8, 0.11); p.shadow(8, 1, 12, 7, 0.11);
    p.rotate("z", -0.3);
    const hop = (a: number) => Math.sin(cl((h - a) / 0.45) * Math.PI) * 6;
    block(p, -15, 15, 11, 17, hop(0.05), BIG, 1.75);
    block(p, 2, 12.5, 10, 13.5, hop(0.3), SMALL, 1.5);
    const b = cl((h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? easeInOut(b / 0.65) * 1.18 : 1.18 - 0.18 * easeInOut((b - 0.65) / 0.35);
      plus(p, [15, -4, 20], 4.6 * pop);
    }
  },
};
