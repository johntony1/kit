// No stories yet: three story rings standing in a row, an avatar in each, a plus on the first. Hover and the rings light up one after another as each avatar hops.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const TAU = Math.PI * 2;
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const circ = (cu: number, cv: number, r: number, n = 32): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r] as P2; });
/** a flat shape standing in the plane y = y0 (facing +y), thickness T going back: rim then front */
function slabY(p: Pen, pts: P2[], y0: number, T: number, front: number) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const nx = (z1 - z0) * sg, nz = -(x1 - x0) * sg;
    if (nx + nz <= 0.001) continue;
    p.face([[x0, y0, z0], [x1, y0, z1], [x1, y0 - T, z1], [x0, y0 - T, z0]], nz > Math.abs(nx) ? SH.top : SH.right, 0);
  }
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, SH.edge, 0.6);
}

function story(p: Pen, u: number, y: number, R: number, h: number, i: number) {
  const k = seg(h, 0.08 + i * 0.2, 0.5 + i * 0.2), hop = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 3 : 0;
  const zc = R + hop, on = (pts: P2[], d: number) => pts.map(([a, b]) => [a, y + d, b] as V3);
  // the ring: dim until its story plays, then lit round from the top
  slabY(p, circ(u, zc, R, 40), y, 2.4, 0.07);
  const sweep = ease(k) * TAU;
  if (sweep > 0.05) {
    const n = Math.max(2, Math.round(sweep / 0.16));
    const arc = (r: number) => Array.from({ length: n + 1 }, (_, j) => { const a = Math.PI / 2 - (sweep * j) / n; return [u + Math.cos(a) * r, zc + Math.sin(a) * r] as P2; });
    p.face(on([...arc(R), ...arc(R - 1.9).reverse()], 0.02), 0.32, 0);
  }
  p.clear(on(circ(u, zc, R - 1.9), 0.03));
  // the avatar
  const r = R - 2.9;
  p.face(on(circ(u, zc, r), 0.04), 0.2, 0);
  p.face(on(circ(u, zc + r * 0.25, r * 0.31, 18), 0.05), 0.03, 0);
  p.face(Array.from({ length: 13 }, (_, j) => { const a = (Math.PI * j) / 12; return [u + Math.cos(a) * r * 0.58, y + 0.05, zc - r * 0.72 + Math.sin(a) * r * 0.52] as V3; }), 0.03, 0);
}

export const stories: Illustration = {
  k: "stories", name: "Stories", title: "No stories yet", body: "Stories from people you follow will line up here. Add one of your own to get started.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -10);
    p.shadow(0, 1, 32, 11, 0.1);
    p.rotate("z", -0.5);
    story(p, -15, -2, 6.6, h, 0);
    story(p, 15, -2, 6.6, h, 2);
    story(p, 0, 2, 9.4, h, 1);
    // the plus on your own story
    const [x, y] = p.pt([-10.6, -1.5, 2.6]), r = 2.9;
    p.screen((g) => {
      g.beginPath(); g.arc(x, y, r + 0.8, 0, TAU); g.fillStyle = "#000"; g.fill();
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = "#fff"; g.fill();
      g.strokeStyle = "#000"; g.lineWidth = 0.9; g.lineCap = "round";
      g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
    });
  },
};
