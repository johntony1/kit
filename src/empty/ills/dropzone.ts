// Nothing uploaded: a page floating over a dashed drop zone. Hover and it drops in and settles on the zone.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 13, D = 11; // the pad's half size
const ZW = 8.5, ZD = 6.5; // the drop zone's half size

// a dashed line, cut into the face below it
function dashes(p: Pen, a: V3, b: V3, n: number) {
  const at = (u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  for (let i = 0; i < n; i++) p.line([at(i / n + 0.12 / n), at((i + 0.62) / n)], SH.edge, 0.75);
}

export const dropzone: Illustration = {
  k: "dropzone", name: "Drop zone", title: "Drop files here", body: "Drag files onto this space, or browse to pick them from your computer.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 32, 15, 0.12);
    p.box(-W, -D, 0, W * 2, D * 2, 2.4, { top: 0.2, left: 0.12, right: 0.065 });
    const Z = 2.42;
    const zone: V3[] = [[-ZW, -ZD, Z], [ZW, -ZD, Z], [ZW, ZD, Z], [-ZW, ZD, Z]];
    // the zone: a dashed outline (the accent in line art); it lights up as the page lands
    if (p.ink) {
      p.face(zone, h > 0.6 ? 0.32 : 0.17, 0);
      p.guide([...zone, zone[0]], true);
    } else {
      p.face(zone, 0.12, 0);
      dashes(p, zone[0], zone[1], 8); dashes(p, zone[1], zone[2], 6); dashes(p, zone[2], zone[3], 8); dashes(p, zone[3], zone[0], 6);
    }
    // a plus in the middle of the zone
    p.line([[-2.6, 0, Z], [2.6, 0, Z]], SH.edge, 0.9);
    p.line([[0, -2.6, Z], [0, 2.6, Z]], SH.edge, 0.9);
    // the page: floats and bobs at rest, drops onto the zone when hovered
    const bob = Math.sin(t * 2.2) * 0.6 * (1 - h);
    const z = Z + 0.2 + (1 - h) * (13 + bob);
    const pw = 7, pd = 5.2;
    p.push();
    p.translate(0, 0, z);
    p.rotate("z", (1 - h) * 0.12);
    if (z - Z > 1.2) {
      p.guide([[-pw, pd, Z - z], [-pw, pd, 0]]);
      p.guide([[pw, pd, Z - z], [pw, pd, 0]]);
      p.guide([[pw, -pd, Z - z], [pw, -pd, 0]]);
    }
    p.box(-pw, -pd, 0, pw * 2, pd * 2, 1, { top: 0.22, left: 0.12, right: 0.065 });
    const zz = 1.02;
    if (!p.ink) p.line([[-pw, pd, zz], [pw, pd, zz], [pw, -pd, zz]], SH.edge, 0.5);
    // the page: a title, lines of text, and a file badge
    p.line([[-5.2, -3.4, zz], [0.5, -3.4, zz]], SH.edge, 1);
    p.line([[-5.2, -1.4, zz], [4.5, -1.4, zz]], SH.edge, 0.6);
    p.line([[-5.2, 0.4, zz], [3, 0.4, zz]], SH.edge, 0.6);
    p.face([[2, 1.8, zz], [5.2, 1.8, zz], [5.2, 3.8, zz], [2, 3.8, zz]], 0.2, SH.edge, 0.55);
    if (!p.ink) p.line([[2, 1.8, zz], [5.2, 1.8, zz], [5.2, 3.8, zz], [2, 3.8, zz], [2, 1.8, zz]], SH.edge, 0.6);
    p.pop();
  },
};
