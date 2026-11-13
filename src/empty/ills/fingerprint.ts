// No fingerprint added: a fingerprint sensor standing up, its ridges faint on the dark pad. Hover and a scan line runs down the pad, lighting every ridge, and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a flat outline pushed back by `off`: the visible walls (toned by where they point), then the face */
function ext(p: Pen, f: V3[], off: V3, front: number, edge = SH.edge) {
  const n = f.length;
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < n; i++) { const a = f[i], b = f[(i + 1) % n]; nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]); }
  if (nx * off[0] + ny * off[1] + nz * off[2] > 0) f = f.slice().reverse();
  const g = f.map(([x, y, z]) => [x + off[0], y + off[1], z + off[2]] as V3);
  const back = g.slice().reverse();
  if (facing(p, back) > 0) p.face(back, front * 0.5, 0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = f[i], b = f[j], q: V3[] = [g[i], g[j], b, a];
    if (facing(p, q) <= 0) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const wx = dz * off[1] - dy * off[2], wy = dx * off[2] - dz * off[0], wz = dy * off[0] - dx * off[1];
    p.face(q, wz / (Math.hypot(wx, wy, wz) || 1) > 0.5 ? 0.22 : wy > wx ? 0.12 : 0.065, 0);
  }
  if (facing(p, f) > 0) p.face(f, front, edge, 0.6);
}
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const pop = (x: number) => (x <= 0 ? 0 : x < 0.65 ? ease(x / 0.65) * 1.18 : 1.18 - 0.18 * ease((x - 0.65) / 0.35));
const T = 2.6, Y = T / 2 + 0.06; // tile thickness, the pad's plane
const at = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 4): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI * 0.5]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
/** ridge i: an arch over the core with legs running down, in pad coordinates */
const ridge = (i: number): P2[] => {
  const rx = 1.6 + 2.15 * i, rz = 2.2 + 2.55 * i, cz = 17, o: P2[] = [];
  const legL = 3 + i * 1.6, legR = 2 + i * 1.1;
  o.push([-rx, cz - legL]);
  for (let j = 0; j <= 16; j++) { const a = Math.PI - (j / 16) * Math.PI; o.push([Math.cos(a) * rx, cz + Math.sin(a) * rz]); }
  o.push([rx, cz - legR]);
  return o;
};

export const fingerprint: Illustration = {
  k: "fingerprint", name: "Fingerprint", title: "No fingerprint added", body: "Add a fingerprint to sign in with a touch.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(cl(h / 0.75)), scan = 29 - 23 * k;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 20, 9, 0.11);
    p.rotate("z", -0.3);
    // the sensor: a lit tile with a dark pad
    ext(p, at(rr(-12.5, 1.5, 12.5, 32.5, 4.5), T / 2), [0, -T, 0], 0.22);
    p.face(at(rr(-9.8, 4.2, 9.8, 29.8, 3), Y - 0.03), 0.03, SH.edge, 0.6);
    // the ridges: faint, then bright where the scan has passed
    const lines = [0, 1, 2, 3].map((i) => ridge(i).map(([u, v]) => ({ s: p.pt([u, Y, v]), v })));
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = 2;
      for (const pts of lines) for (let j = 1; j < pts.length; j++) {
        const lit = h > 0.01 && (pts[j].v + pts[j - 1].v) / 2 > scan;
        g.strokeStyle = lit ? "#fff" : "rgba(255,255,255,0.4)";
        g.beginPath(); g.moveTo(pts[j - 1].s[0], pts[j - 1].s[1]); g.lineTo(pts[j].s[0], pts[j].s[1]); g.stroke();
      }
      // the scan line, while it runs
      if (k > 0.01 && k < 0.99) {
        const a = p.pt([-9, Y, scan]), b = p.pt([9, Y, scan]);
        g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
    });
    // a plus badge on the tile's corner
    const b = pop(cl((h - 0.72) / 0.28));
    if (b > 0) {
      const [x, y] = p.pt([9, Y, 28.5]), r = 4.2 * b;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 1.2, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      });
    }
  },
};
