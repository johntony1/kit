// No rewards yet: a wrapped gift box with a ribbon and bow. Hover and the lid pops up with a little bounce; sparkles rise from the empty box.
import { SH, type Illustration, type Pen } from "../dots";

const W = 9, H = 12; // half width of the body, height of the body
const L = 10.2, LH = 4; // half width of the lid, lid height
const R = 1.7; // half width of the ribbon

// a ribbon loop of the bow: a petal in the vertical plane through the centre, leaning out along d
function loop(p: Pen, z: number, d: 1 | -1, fill: number) {
  // a circle through the knot (polar r = cos), stretched along its lean, standing in the plane that faces us
  const pts = Array.from({ length: 25 }, (_, i) => {
    const f = -Math.PI / 2 + (i / 24) * Math.PI;
    const r = 8 * Math.pow(Math.cos(f), 0.8);
    const dir = 0.62 + f * 0.75;
    const u = r * Math.cos(dir) * 0.707;
    return [d * u, -d * u, z + r * Math.sin(dir)] as [number, number, number];
  });
  p.face(pts, fill, SH.edge, 0.55);
  // its outline and the fold inside it, as cuts
  p.line([...pts, pts[0]], SH.edge, 0.7);
  p.line(pts.slice(6, 19).map(([x, y, zz]) => [x * 0.5, y * 0.5, z + (zz - z) * 0.5] as [number, number, number]), SH.edge, 0.65);
}

export const gift: Illustration = {
  k: "gift", name: "Gift box", title: "No rewards yet", body: "Earn your first reward and it will be waiting for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    // the lid pops up past its rest and settles with a little bounce, then bobs while hovered
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const lift = 7.5 * back(h) + h * Math.sin(t * 3.2) * 0.7;
    const tilt = h * (0.12 + Math.sin(t * 3.2 + 0.8) * 0.04);
    p.shadow(0, 0, 25, 12.5, 0.12);
    // body, open at the top: the dark inside shows once the lid is off
    p.box(-W, -W, 0, W * 2, W * 2, H, { open: true, left: 0.12, right: 0.065 });
    // ribbon down the two walls we see: brighter bands, edged with cut lines
    p.face([[-R, W + 0.03, 0], [R, W + 0.03, 0], [R, W + 0.03, H], [-R, W + 0.03, H]], 0.22, 0);
    p.face([[W + 0.03, -R, 0], [W + 0.03, R, 0], [W + 0.03, R, H], [W + 0.03, -R, H]], 0.16, 0);
    for (const s of [-1, 1]) {
      p.line([[s * R, W + 0.05, 0.2], [s * R, W + 0.05, H]], SH.edge, 0.6);
      p.line([[W + 0.05, s * R, 0.2], [W + 0.05, s * R, H]], SH.edge, 0.6);
    }
    // the lid, with its ribbon and bow
    p.push();
    p.translate(0, 0, lift);
    p.rotate("x", tilt, [0, -L, H]);
    p.box(-L, -L, H, L * 2, L * 2, LH, { top: 0.2, left: 0.12, right: 0.065 });
    const Z = H + LH + 0.03;
    // ribbon across the top: two bright bands in a cross, edged with cuts
    p.face([[-L, -R, Z], [L, -R, Z], [L, R, Z], [-L, R, Z]], 0.3, 0);
    p.face([[-R, -L, Z], [R, -L, Z], [R, L, Z], [-R, L, Z]], 0.3, 0);
    for (const s of [-1, 1]) {
      p.line([[-L, s * R, Z], [-R, s * R, Z]], SH.edge, 0.55);
      p.line([[R, s * R, Z], [L, s * R, Z]], SH.edge, 0.55);
      p.line([[s * R, -L, Z], [s * R, -R, Z]], SH.edge, 0.55);
      p.line([[s * R, R, Z], [s * R, L, Z]], SH.edge, 0.55);
    }
    // ribbon down the lid's walls
    p.face([[-R, L + 0.03, H], [R, L + 0.03, H], [R, L + 0.03, Z], [-R, L + 0.03, Z]], 0.22, 0);
    p.face([[L + 0.03, -R, H], [L + 0.03, R, H], [L + 0.03, R, Z], [L + 0.03, -R, Z]], 0.16, 0);
    // a seam where the lid meets its wall
    p.line([[-L, L + 0.05, H + 0.6], [-R, L + 0.05, H + 0.6]], SH.edge, 0.55);
    p.line([[R, L + 0.05, H + 0.6], [L, L + 0.05, H + 0.6]], SH.edge, 0.55);
    // the bow: back loop, front loop, then the knot
    loop(p, Z, -1, 0.14);
    loop(p, Z, 1, 0.24);
    p.box(-1.6, -1.6, Z, 3.2, 3.2, 2.2, { top: 0.3, left: 0.2, right: 0.1 });
    p.pop();
    // sparkles out of the open box
    const k = Math.max(0, (h - 0.35) / 0.65);
    if (k > 0) for (let i = 0; i < 8; i++) {
      const u = (t * 0.45 + i / 8) % 1;
      const a = i * 2.1;
      p.dot([Math.cos(a) * (6 + u * 9), Math.sin(a) * (6 + u * 9), H + 2 + u * 9], 1.1 - 0.4 * u, k * Math.min(1, Math.sin(u * Math.PI) * 1.8));
    }
  },
};
