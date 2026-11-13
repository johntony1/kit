// No matches: a chunky tile standing on its edge with a bold dot and star cut into it, the pattern for anything. Hover and the star spins a sixth of a turn while the dot hops; a small badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// a rounded rectangle in [u, v]
function rr(x0: number, v0: number, x1: number, v1: number, r: number): P2[] {
  const out: P2[] = [];
  const cs: [number, number, number][] = [[x1 - r, v1 - r, 0], [x0 + r, v1 - r, 0.5], [x0 + r, v0 + r, 1], [x1 - r, v0 + r, 1.5]];
  for (const [cx, cv, q] of cs) for (let i = 0; i <= 5; i++) { const a = (q + i / 10) * Math.PI; out.push([cx + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
}
// a flat shape standing in the x z plane, extruded back along y
function slab(p: Pen, pts: P2[], d: number, front: number) {
  for (let y = -d; y < 0; y += 0.6) p.face(pts.map(([u, v]) => [u, y, v] as V3), y < -d / 2 ? SH.right : 0.1, 0);
  p.face(pts.map(([u, v]) => [u, 0, v] as V3), front, SH.edge, 0.6);
}
const at = (pts: P2[]): V3[] => pts.map(([u, v]) => [u, 0.05, v] as V3);

export const regex: Illustration = {
  k: "regex", name: "Regex", title: "No matches", body: "Nothing fits that pattern. Loosen it a little or try a different one.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 10, 0.1);
    p.rotate("z", -0.62);
    slab(p, rr(-16, 0, 16, 32, 5), 4, 0.24);
    // the dot: a square cut low on the left, hopping on hover
    const hop = 4 * Math.sin(Math.min(1, h * 1.4) * Math.PI) * (h < 0.72 ? 1 : 0);
    p.clear(at([[-11, 5 + hop], [-5, 5 + hop], [-5, 11 + hop], [-11, 11 + hop]]));
    // the star: three bars through one centre, turning on hover
    const cx = 4.5, cv = 18.5, R = 9, w = 1.7, a0 = ease(Math.min(1, h * 1.2)) * (Math.PI / 3) + h * Math.sin(t * 2) * 0.05;
    for (let i = 0; i < 3; i++) {
      const a = a0 + Math.PI / 2 + (i * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a), nx = -s * w, nv = c * w;
      p.clear(at([[cx - c * R + nx, cv - s * R + nv], [cx + c * R + nx, cv + s * R + nv], [cx + c * R - nx, cv + s * R - nv], [cx - c * R - nx, cv - s * R - nv]]));
    }
    // a small badge with a cross pops in at the corner once the star settles
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const [x, y] = p.pt([16, 0.2, 32]), r = 4.6 * pop;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 1.2, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.4, y - r * 0.4); g.lineTo(x + r * 0.4, y + r * 0.4); g.moveTo(x + r * 0.4, y - r * 0.4); g.lineTo(x - r * 0.4, y + r * 0.4); g.stroke();
      });
    }
  },
};
