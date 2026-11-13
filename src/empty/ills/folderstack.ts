// No folders yet: three folders standing one behind another, each with its tab. Hover and they fan apart and the front one leans toward us.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const YAW = -0.42, KX = Math.cos(YAW) + Math.sin(YAW);
const W = 14, H = 21, TH = 3.4, TW = 10; // half width, body height, tab height, tab width

/** a profile in [x, z] standing in the plane y (facing +y), thickness T going back: the rim, then the front */
function slab(p: Pen, prof: P2[], y: number, T: number, front: number) {
  const n = prof.length;
  let a = 0;
  for (let i = 0; i < n; i++) { const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const [x0, z0] = prof[i], [x1, z1] = prof[(i + 1) % n];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1, nx = ((z1 - z0) * sg) / L, nz = (-(x1 - x0) * sg) / L;
    if (nx * KX + nz <= 0.001) continue;
    p.face([[x0, y, z0], [x1, y, z1], [x1, y - T, z1], [x0, y - T, z0]], nz > 0.3 ? 0.24 : 0.065, 0);
  }
  p.face(prof.map(([x, z]) => [x, y, z] as V3), front, SH.edge, 0.6);
}
const PROF: P2[] = [[-W, 0], [W, 0], [W, H], [-W + TW + 2, H], [-W + TW, H + TH], [-W + 1, H + TH], [-W, H + TH - 1]];

function folder(p: Pen, y: number, front: number) {
  slab(p, PROF, y, 1.6, front);
  // the front flap's top edge, cut across under the tab
  p.line([[-W, y + 0.03, H - 3], [W, y + 0.03, H - 3]], SH.edge, 0.8);
}

export const folderstack: Illustration = {
  k: "folderstack", name: "Folders", title: "No folders yet", body: "Create a folder to keep related files together.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h / 0.7), bob = h > 0.9 ? Math.sin(t * 2.2) * 0.3 : 0;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 30, 13, 0.12);
    p.rotate("z", YAW);
    // back to front: each a little lower and to the right, spreading apart on hover
    for (let i = 0; i < 3; i++) {
      const s = i - 1;
      p.push();
      p.translate(-s * (3 + 1.5 * k) + 0, 0, -s * (3 + 1.2 * k) + 3 + (i === 2 ? bob : 0));
      if (i === 2) p.rotate("x", -0.18 * k, [0, 0, 0]);
      folder(p, s * 4.2, 0.2);
      p.pop();
    }
  },
};
