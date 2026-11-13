// Nothing to wash: a deep bathtub with rounded ends on four little feet, a tap at the far end. Hover and the tap runs, the tub fills with water and bubbles float on top.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const L = 12, R = 9.5, Z0 = 3.5, H = 11, RIM = 2.6; // half length of the straight sides, end radius, feet, wall height, rim width
const TH = -0.4, C = Math.cos(TH), S = Math.sin(TH); // turned so its long side faces us
/** a stadium outline: straight sides of half length l joined by round ends of radius r, counter clockwise */
const stadium = (l: number, r: number, z: number, n = 14): V3[] => {
  const o: V3[] = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI; o.push([l + Math.cos(a) * r, Math.sin(a) * r, z]); }
  for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + (i / n) * Math.PI; o.push([-l + Math.cos(a) * r, Math.sin(a) * r, z]); }
  return o;
};
const BUB: [number, number, number][] = [[-6, 2, 1.6], [-3, -3, 1.3], [1, 1.5, 1.8], [4.5, -2.5, 1.2], [7, 2.5, 1.5], [-9, -1.5, 1.1], [2.5, 4.5, 1]];

export const bathtub: Illustration = {
  k: "bathtub", name: "Bathtub", title: "Nothing to wash", body: "Add something and it will be waiting here to be cleaned up.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const fill = ease(clamp((h - 0.1) / 0.6)), ZT = Z0 + H;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 30, 14, 0.11);
    p.rotate("z", TH);
    // four little feet
    for (const [x, y] of [[-L - 3, -4.5], [L + 3, -4.5], [-L - 3, 4.5], [L + 3, 4.5]]) p.cylinder(x, y, 0, 1.6, Z0 + 1, { side: 0.28, top: 0.28, edge: 0 });
    // the walls we can see, tapering in toward the bottom
    const top = stadium(L, R, ZT), bot = stadium(L * 0.92, R * 0.8, Z0), n = top.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, nx = top[j][1] - top[i][1], ny = -(top[j][0] - top[i][0]);
      const wx = nx * C - ny * S, wy = nx * S + ny * C, l = Math.hypot(wx, wy) || 1;
      if (wx + wy <= 0) continue;
      const d = (wy - wx) / l;
      p.face([bot[i], bot[j], top[j], top[i]], d > 0.3 ? 0.16 : d > -0.4 ? 0.1 : 0.055, 0);
    }
    // the rim: a bright band round the dark inside
    const inner = stadium(L, R - RIM, ZT);
    p.face([...top, top[0], inner[0], ...inner.slice().reverse()], 0.3, 0);
    p.face(inner, 0.035, 0);
    // the water, seen through the opening
    const zw = Z0 + 1.5 + (H - 3) * fill;
    if (fill > 0.02) {
      const q = inner.map((v) => p.pt(v));
      p.screen((g) => {
        g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
        p.face(stadium(L * 0.97, (R - RIM) * 0.9, zw), 0.09, 0);
      });
    }
    p.line([...inner, inner[0]], 1, 0.8);
    // the tap at the far end: a post and a spout
    const tx = -L - R + 1;
    p.box(tx - 1, -1, ZT, 2, 2, 6.5, { top: 0.3, left: 0.28, right: 0.13, edge: 0 });
    p.box(tx - 1, -1, ZT + 5, 6.5, 2, 1.8, { top: 0.3, left: 0.28, right: 0.13, edge: 0 });
    p.box(tx + 3.7, -1, ZT + 3.4, 1.8, 2, 1.8, { top: 0.3, left: 0.28, right: 0.13, edge: 0 });
    // the running water, while it fills
    if (h > 0.08 && h < 0.85) {
      const [x0, y0] = p.pt([tx + 4.6, 0, ZT + 3.4]), [, y1] = p.pt([tx + 4.6, 0, zw]);
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke(); });
    }
    // bubbles on top once it is nearly full
    const b = clamp((h - 0.55) / 0.45);
    if (b > 0) BUB.forEach(([x, y, r], i) => {
      const k = clamp(b * 1.6 - i * 0.09);
      if (k <= 0) return;
      const at: V3 = [x, y, zw + 0.6 + Math.sin(t * 2 + i) * 0.25 * h], rr = r * 1.2 * (k < 0.7 ? (k / 0.7) * 1.15 : 1.15 - 0.15 * ((k - 0.7) / 0.3));
      p.dot(at, rr + 0.7, 0); p.dot(at, rr, 1);
    });
  },
};
