// Nothing synced yet: a folder standing up with a dark cloud cut into its front. An arrow rises through the cloud again and again, syncing.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 2.6;
const YAW = -0.42, KX = Math.cos(YAW) + Math.sin(YAW);
const W = 15, H = 26, TH = 3.6, TW = 11;

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
const circle = (cx: number, cz: number, r: number, y: number): V3[] => Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });

export const cloudfolder: Illustration = {
  k: "cloudfolder", name: "Cloud folder", title: "Nothing synced yet", body: "Turn on sync and the files in this folder will show up on all your devices.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 30, 12, 0.12);
    p.rotate("z", YAW);
    // the back of the folder, with its tab, then the front panel
    slab(p, [[-W, 0], [W, 0], [W, H], [-W + TW + 2, H], [-W + TW, H + TH], [-W + 1, H + TH], [-W, H + TH - 1]], -1.4, 1.4, 0.12);
    slab(p, [[-W, 0], [W, 0], [W + 0.6, H - 4], [-W - 0.6, H - 4]], 1.2, 1.2, 0.22);
    // the cloud: a dark hole made of three round puffs on a flat base
    const y = 1.24, zc = 9;
    p.clear(circle(-4.4, zc + 0.6, 3.6, y));
    p.clear(circle(0.6, zc + 2.6, 4.8, y));
    p.clear(circle(5, zc + 0.4, 3.2, y));
    p.clear([[-4.4, y, zc - 3], [5, y, zc - 3], [5, y, zc + 1], [-4.4, y, zc + 1]]);
    // the arrow rising through it, fading in at the bottom and out at the top
    const za = zc - 2.5 + u * 7, al = Math.sin(u * Math.PI);
    const pts: V3[][] = [[[0.6, y + 0.03, za - 3.4], [0.6, y + 0.03, za + 2.6]], [[-2.4, y + 0.03, za - 0.2], [0.6, y + 0.03, za + 2.8], [3.6, y + 0.03, za - 0.2]]];
    if (p.ink) { for (const s of pts) p.line(s, SH.edge, 1); return; }
    const qs = pts.map((s) => s.map((v) => p.pt(v)));
    p.screen((c) => {
      // keep the arrow inside the cloud
      c.beginPath();
      for (const [cx, cz, r] of [[-4.4, zc + 0.6, 3.6], [0.6, zc + 2.6, 4.8], [5, zc + 0.4, 3.2]]) { const [x0, y0] = p.pt([cx, y, cz]); c.moveTo(x0 + r, y0); c.ellipse(x0, y0, r * 0.98, r, 0, 0, Math.PI * 2); }
      const b = [[-4.4, zc - 3], [5, zc - 3], [5, zc + 1], [-4.4, zc + 1]].map(([x, z]) => p.pt([x, y, z]));
      c.moveTo(b[0][0], b[0][1]); b.forEach(([x, yy]) => c.lineTo(x, yy)); c.closePath();
      c.clip("nonzero");
      c.globalAlpha = Math.min(1, al * 1.6);
      c.strokeStyle = "#fff"; c.lineWidth = 2.3; c.lineCap = "round"; c.lineJoin = "round";
      for (const q of qs) { c.beginPath(); q.forEach(([x, yy], i) => (i ? c.lineTo(x, yy) : c.moveTo(x, yy))); c.stroke(); }
    });
  },
};
