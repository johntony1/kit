// Nothing to merge: a thick merge arrow standing up, two tails joining into one head. Hover and a bead runs down each tail into the trunk; a tick pops in at the tip.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// two tails from the left, one trunk, an arrow head to the right
const ARROW: P2[] = [[19, 15], [7, 27], [7, 18.5], [1.5, 18.5], [-8, 28], [-18, 28], [-18, 22], [-10.5, 22], [-3.5, 15], [-10.5, 8], [-18, 8], [-18, 2], [-8, 2], [1.5, 11.5], [7, 11.5], [7, 3]];

function slab(p: Pen, s: P2[], yF: number, yB: number, front: number) {
  let a = 0;
  for (let i = 0; i < s.length; i++) { const [x0, z0] = s[i], [x1, z1] = s[(i + 1) % s.length]; a += x0 * z1 - x1 * z0; }
  const o = a > 0 ? 1 : -1;
  for (let i = 0; i < s.length; i++) {
    const [x0, z0] = s[i], [x1, z1] = s[(i + 1) % s.length];
    const l = Math.hypot(x1 - x0, z1 - z0) || 1, nx = (o * (z1 - z0)) / l, nz = (-o * (x1 - x0)) / l;
    if (nx * 0.45 + nz <= 0) continue;
    p.face([[x0, yB, z0], [x1, yB, z1], [x1, yF, z1], [x0, yF, z0]], nz > 0.3 ? 0.045 + 0.2 * nz : 0.045, 0);
  }
  const f = s.map(([x, z]) => [x, yF, z] as V3);
  p.face(f, front, 0);
  p.line([...f, f[0]], SH.edge, 0.5);
}

// a point along a tail and on into the trunk, s from 0 to 1
function along(up: boolean, s: number): P2 {
  const pts: P2[] = up ? [[-17, 25], [-9.2, 25], [0, 15.8], [0, 15.8]] : [[-17, 5], [-9.2, 5], [0, 14.2], [0, 14.2]];
  const q = Math.min(2.999, s * 3), i = Math.floor(q), f = q - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
}

export const merge: Illustration = {
  k: "merge", name: "Merge conflict", title: "Nothing to merge", body: "When two branches are ready to come together, the merge will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 2, 30, 12, 0.11);
    p.rotate("z", -0.5);
    const YF = 3.2;
    slab(p, ARROW, YF, -3.2, 0.2);
    // a bead on each tail, running into the trunk
    const k = ease(Math.min(1, h / 0.7));
    for (const up of [true, false]) {
      const [x, z] = along(up, k);
      if (h > 0.01 && k < 0.98) p.dot([x, YF + 0.05, z], 1.7, 0);
    }
    // the tick badge at the tip
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const [x, y] = p.pt([16, YF, 33]);
      const r = 5 * pop;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.48, y - r * 0.32); g.stroke();
      });
    }
  },
};
