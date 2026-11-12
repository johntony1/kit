// No registry yet: two wrapped presents stacked up, ribbons round both and a bow on top. Hover and the top present hops and a heart pops in beside it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// a wrapped box centred on the origin: lit top, a ribbon crossing it and running down both walls
function present(p: Pen, w: number, z: number, ht: number, r: number) {
  p.box(-w, -w, z, w * 2, w * 2, ht, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
  const Z = z + ht + 0.03;
  p.face([[-w, -r, Z], [w, -r, Z], [w, r, Z], [-w, r, Z]], 0.3, 0);
  p.face([[-r, -w, Z], [r, -w, Z], [r, w, Z], [-r, w, Z]], 0.3, 0);
  p.face([[-r, w + 0.03, z], [r, w + 0.03, z], [r, w + 0.03, Z], [-r, w + 0.03, Z]], 0.3, 0);
  p.face([[w + 0.03, -r, z], [w + 0.03, r, z], [w + 0.03, r, Z], [w + 0.03, -r, Z]], 0.2, 0);
  for (const s of [-1, 1]) {
    p.line([[s * r, w + 0.05, z + 0.2], [s * r, w + 0.05, Z], [s * r, s > 0 ? r : -w, Z]], SH.edge, 0.7);
    p.line([[w + 0.05, s * r, z + 0.2], [w + 0.05, s * r, Z], [s > 0 ? r : -w, s * r, Z]], SH.edge, 0.7);
  }
  // the box's own corners, as cuts
  p.line([[-w, w + 0.03, Z], [w + 0.03, w + 0.03, Z], [w + 0.03, -w, Z]], SH.edge, 0.6);
  p.line([[w + 0.03, w + 0.03, z], [w + 0.03, w + 0.03, Z]], SH.edge, 0.6);
}

// a loop of the bow: a petal standing in the plane that faces us, leaning out along d
function loop(p: Pen, z: number, d: 1 | -1, fill: number) {
  const pts = Array.from({ length: 25 }, (_, i) => {
    const f = -Math.PI / 2 + (i / 24) * Math.PI;
    const r = 8.6 * Math.pow(Math.cos(f), 0.8);
    const dir = 0.55 + f * 0.75;
    const u = r * Math.cos(dir) * 0.707;
    return [d * u, -d * u, z + r * Math.sin(dir)] as V3;
  });
  p.face(pts, fill, 0);
  p.line([...pts, pts[0]], SH.edge, 0.7);
}

function heart(p: Pen, pos: V3, r: number) {
  const [x, y] = p.pt(pos);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    const s = r * 0.62;
    g.fillStyle = "#000"; g.beginPath();
    g.moveTo(x, y + s * 0.95);
    g.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.75, y - s * 1.1, x, y - s * 0.4);
    g.bezierCurveTo(x + s * 0.75, y - s * 1.1, x + s * 1.5, y - s * 0.1, x, y + s * 0.95);
    g.fill();
  });
}

export const registry: Illustration = {
  k: "registry", name: "Gift registry", title: "No registry yet", body: "Start a registry and add the gifts you are hoping for.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = clamp(h * 1.3);
    const hop = Math.sin(k * Math.PI) * 5 + h * Math.max(0, Math.sin(t * 3.2)) * 0.8;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 31, 15.5, 0.12);
    // the big present underneath
    present(p, 12.5, 0, 10.5, 2.2);
    // the small one on top, with the bow
    p.push();
    p.translate(0, 0, hop);
    // a dark gap where it stands on the one below
    p.translate(-1.5, -1.5, 0);
    p.rotate("z", 0.3);
    p.line([[-7.2, 7.2, 10.56], [7.2, 7.2, 10.56], [7.2, -7.2, 10.56]], SH.edge, 1.4);
    present(p, 6.8, 10.5, 9.5, 1.6);
    loop(p, 20.03, -1, 0.16);
    loop(p, 20.03, 1, 0.3);
    p.box(-1.5, -1.5, 20.03, 3, 3, 2, { top: 0.3, left: 0.24, right: 0.12, edge: 0 });
    p.pop();
    const q = clamp((h - 0.64) / 0.36);
    if (q > 0) {
      const pop = q < 0.65 ? ease(q / 0.65) * 1.18 : 1.18 - 0.18 * ease((q - 0.65) / 0.35);
      heart(p, [13, -13, 22], 5.2 * pop);
    }
  },
};
