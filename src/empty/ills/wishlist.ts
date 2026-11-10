// No wishes yet: a gift tag with a heart on it. Hover and the heart lifts off the tag and beats, leaving its outline behind.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];

/** a flat shape extruded along an axis: "y" pushes an (x,z) shape toward the viewer's left, its cap at a1 faces +y */
function ext(p: Pen, shape: P2[], a0: number, a1: number, f: { cap: number; top?: number; right?: number; edge?: number; side?: number }) {
  const at = (u: number, v: number, w: number): V3 => [u, w, v];
  let A = 0;
  shape.forEach((a, i) => { const b = shape[(i + 1) % shape.length]; A += a[0] * b[1] - b[0] * a[1]; });
  const s = A > 0 ? 1 : -1;
  const sides: { d: number; pts: V3[]; fill: number }[] = [];
  shape.forEach((a, i) => {
    const b = shape[(i + 1) % shape.length], du = b[0] - a[0], dv = b[1] - a[1], L = Math.hypot(du, dv) || 1;
    const nx = (s * dv) / L, nz = (-s * du) / L;
    if (nx + nz <= 0.01) return;
    const pts = [at(a[0], a[1], a0), at(b[0], b[1], a0), at(b[0], b[1], a1), at(a[0], a[1], a1)];
    sides.push({ d: a[0] + b[0] + a[1] + b[1], pts, fill: nz > nx ? f.top ?? SH.top : f.right ?? SH.right });
  });
  sides.sort((x, y) => x.d - y.d).forEach((q) => p.face(q.pts, q.fill, f.side ?? SH.edge, 0.5));
  p.face(shape.map(([u, v]) => at(u, v, a1)), f.cap, f.edge ?? SH.edge, 0.6);
}

/** a heart in the (x,z) plane, centred on (cx,cz), about 2s wide */
const heart = (cx: number, cz: number, s: number): P2[] => Array.from({ length: 40 }, (_, i) => {
  const a = (i / 40) * Math.PI * 2;
  return [cx + (s * 16 * Math.pow(Math.sin(a), 3)) / 16, cz + (s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))) / 16] as P2;
});

const T = 1; // half thickness of the tag
const HZ = 9.5; // the heart's seat on the tag

export const wishlist: Illustration = {
  k: "wishlist", name: "Gift tag", title: "Your wishlist is empty", body: "Tap the heart on anything you love and it will be saved here for later.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 22, 10, 0.12);
    // the tag leans back a touch, standing on its foot
    p.push(); p.rotate("z", -0.5, [0, 0, 0]); p.rotate("x", -0.16, [0, 0, 0]);
    const tag: P2[] = [[-8.5, 0], [8.5, 0], [8.5, 18], [3.4, 24.5], [-3.4, 24.5], [-8.5, 18]];
    ext(p, tag, -T, T, { cap: 0.12, top: 0.24, right: 0.065, edge: SH.edge });
    const y = T + 0.04;
    // stitching round the edge
    p.line([[-7, y, 1.5], [7, y, 1.5], [7, y, 17.4], [2.7, y, 22.8], [-2.7, y, 22.8], [-7, y, 17.4], [-7, y, 1.5]], SH.edge, 0.6);
    // the eyelet
    p.ringV("y", [0, y, 20.4], 2, 0.3, SH.edge, 0.55);
    p.ringV("y", [0, y + 0.02, 20.4], 1.05, 0.02, 0);
    // two lines for a name under the heart
    p.line([[-4.5, y, 4.4], [4.5, y, 4.4]], SH.edge, 0.7);
    p.line([[-2.8, y, 2.9], [2.8, y, 2.9]], SH.edge, 0.7);
    const k = Math.min(1, h * 1.2);
    // once the heart lifts, its seat shows: a dark recess with a dashed outline
    if (k > 0.05) {
      const seat = heart(0, HZ, 5.2).map(([u, v]) => [u, y + 0.02, v] as V3);
      p.face(seat, 0.03, SH.edge, 0.5);
      p.guide([...seat, seat[0]], true);
    }
    // the heart: raised off the tag, lifting forward and up, beating while it floats
    const beat = 1 + 0.08 * k * Math.max(0, Math.sin(t * 7)) ** 3;
    const lift = k * 8, rise = k * 5;
    if (k > 0.05) {
      // drop lines from the floating heart to its seat
      for (const u of [-3.6, 3.6]) p.guide([[u, y, HZ + 2.6], [u, y + lift, HZ + 2.6 + rise]]);
      p.guide([[0, y, HZ - 5], [0, y + lift, HZ - 5 * beat + rise]]);
    }
    ext(p, heart(0, HZ + rise, 5.2 * beat), y + lift, y + lift + 1.6, { cap: 0.34, top: 0.26, right: 0.1, side: 0 });
    // a cut outline so the heart reads against the tag in the dot styles
    const rim = heart(0, HZ + rise, 5.2 * beat).map(([u, v]) => [u, y + lift + 1.62, v] as V3);
    p.line([...rim, rim[0]], SH.edge, 1);
    // a shine on the heart
    p.line([[-3.4 * beat, y + lift + 1.65, HZ + rise + 2.8 * beat], [-2.2 * beat, y + lift + 1.65, HZ + rise + 3.8 * beat]], SH.edge, 0.7);
    p.pop();
    // the string: a loop up from the eyelet, as a thin ribbon
    p.push(); p.rotate("z", -0.5, [0, 0, 0]); p.rotate("x", -0.16, [0, 0, 0]);
    const loop: V3[] = Array.from({ length: 25 }, (_, i) => { const a = -Math.PI / 2 + (i / 24) * Math.PI * 2; return [Math.cos(a) * 3.2 + Math.sin(a * 0.5) * 0.6, T + 0.3, 25.6 + Math.sin(a) * 5.2] as V3; });
    for (let i = 0; i < loop.length - 1; i++) {
      if (loop[i][2] < 21.5) continue;
      const [a, b] = [loop[i], loop[i + 1]];
      p.face([[a[0] - 0.45, a[1], a[2]], [a[0] + 0.45, a[1], a[2]], [b[0] + 0.45, b[1], b[2]], [b[0] - 0.45, b[1], b[2]]], 0.24, 0);
    }
    p.pop();
    // sparkles once it floats
    if (k > 0.5) for (let i = 0; i < 4; i++) {
      const u = (t * 0.55 + i / 4) % 1, a = i * 1.7;
      p.dot([Math.cos(a) * 9, 7 + Math.sin(a) * 3, HZ + 8 + u * 6], 0.8, (k - 0.5) * 2 * Math.sin(u * Math.PI));
    }
  },
};
