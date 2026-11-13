// No pages mapped: a site map standing up, a home page on top joined by a branching rail to three pages below. Hover and the three pages hop in turn and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const on = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
const rect = (u0: number, v0: number, u1: number, v1: number): P2[] => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
// a flat shape standing in the x z plane, extruded back along y
function slab(p: Pen, pts: P2[], d: number, front: number) {
  for (let y = -d; y < 0; y += 0.6) p.face(on(pts, y), y < -d / 2 ? SH.right : 0.1, 0);
  p.face(on(pts, 0), front, SH.edge, 0.6);
}
// a page: a lit card with a folded corner and a few cut lines
function page(p: Pen, cx: number, v0: number, w: number, ht: number) {
  const f = w * 0.42;
  slab(p, [[cx - w, v0], [cx + w, v0], [cx + w, v0 + ht - f], [cx + w - f, v0 + ht], [cx - w, v0 + ht]], 2.6, 0.26);
  p.face(on([[cx + w - f, v0 + ht], [cx + w - f, v0 + ht - f], [cx + w, v0 + ht - f]], 0.04), 0.08, SH.edge, 0.5);
  const n = ht > 12 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    const v = v0 + ht - f - 2.2 - i * 2.6, u1 = cx - w + 2 + (2 * w - 4) * (i === n - 1 ? 0.55 : 0.85);
    p.clear(on(rect(cx - w + 2, v - 0.6, u1, v + 0.6), 0.05));
  }
}

export const sitemap: Illustration = {
  k: "sitemap", name: "Sitemap", title: "No pages mapped", body: "Add your pages and see how they link together from the home page down.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 9, 0.1);
    p.rotate("z", -0.62);
    // the rail: a stem down from home, a cross bar, three drops
    const rail = 0.2, rw = 0.9;
    slab(p, rect(-rw, 13, rw, 20), 1.6, rail);
    slab(p, rect(-14 - rw, 13 - rw, 14 + rw, 13 + rw), 1.6, rail);
    for (const u of [-14, 14]) slab(p, rect(u - rw, 9, u + rw, 13), 1.6, rail);
    // the home page on top
    page(p, 0, 19, 7.5, 15);
    // the three pages below, hopping in turn on hover
    [-14, 0, 14].forEach((u, i) => {
      const e = Math.max(0, Math.min(1, (h - i * 0.16) / 0.4));
      const hop = 4 * Math.sin(e * Math.PI) * (e < 1 ? 1 : 0) + h * Math.sin(t * 2.6 + i * 1.3) * 0.25;
      page(p, u, hop, 5.8, 10.5);
    });
    // the plus badge beside the home page
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const [x, y] = p.pt([13, 0.3, 29]), r = 4.6 * pop;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 1.2, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      });
    }
  },
};
