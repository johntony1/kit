// Too many requests: a chunky hourglass in a frame of two plates and four posts, sand still in its top bulb. Hover and the sand runs down into a pile, and a cross badge pops in when it is spent.
import { easeInOut, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pop = (b: number) => (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
// a round bright badge with a dark mark: a plus, or a cross
function badge(p: Pen, c: V3, r: number, cross = false) {
  const [x, y] = p.pt(c);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    const d = r * (cross ? 0.4 : 0.5);
    g.beginPath();
    if (cross) { g.moveTo(x - d, y - d); g.lineTo(x + d, y + d); g.moveTo(x + d, y - d); g.lineTo(x - d, y + d); }
    else { g.moveTo(x - d, y); g.lineTo(x + d, y); g.moveTo(x, y - d); g.lineTo(x, y + d); }
    g.stroke();
  });
}

const N = 17; // the neck's height
const w = (z: number) => 1.3 + 8.2 * Math.pow(Math.sin(Math.min(1, Math.abs(z - N) / 14) * Math.PI / 2), 0.6);
const side = (z0: number, z1: number, k: number, y: number): V3[] => {
  const o: V3[] = [];
  for (let i = 0; i <= 10; i++) { const z = z1 + (z0 - z1) * (i / 10); o.push([-w(z) * k, y, z]); }
  for (let i = 0; i <= 10; i++) { const z = z0 + (z1 - z0) * (i / 10); o.push([w(z) * k, y, z]); }
  return o;
};

export const ratelimit: Illustration = {
  k: "ratelimit", name: "Rate limit", title: "Too many requests", body: "You have hit the limit for now. Wait a moment, then try again.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = 0.25 + 0.75 * easeInOut(Math.min(1, h * 1.15));
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 11, 0.12);
    p.rotate("z", -0.6);
    const post = (x: number, y: number) => p.box(x - 0.9, y - 0.9, 3, 1.8, 1.8, 28, { top: 0.2, left: 0.24, right: 0.09, edge: 0 });
    const plates = { top: 0.2, left: 0.26, right: 0.065, edge: 0 };
    p.box(-12, -6, 0, 24, 12, 3, plates);
    post(-10.4, -4.4); post(10.4, -4.4);
    // the glass: a sparse silhouette, its rim as a cut
    p.face(side(3, 31, 0.92, 0), 0.05, 0);
    p.line(side(3, 31, 0.92, 0.04), 1, 0.6);
    // the sand: what is left in the top bulb, and the pile below
    const top = N + 0.6 + 12.4 * (1 - k);
    if (k < 0.99) p.face(side(N + 0.4, top, 0.9, 0.05), 0.3, 0);
    const e = 3.3 + 5.2 * k, pk = e + 4 * k;
    const pile: V3[] = [];
    for (let i = 0; i <= 6; i++) { const z = e + (3.3 - e) * (i / 6); pile.push([-w(z) * 0.9, 0.05, z]); }
    for (let i = 0; i <= 6; i++) { const z = 3.3 + (e - 3.3) * (i / 6); pile.push([w(z) * 0.9, 0.05, z]); }
    pile.push([0, 0.05, pk]);
    p.face(pile, 0.3, 0);
    // the falling thread of sand while it runs
    if (h > 0.02 && k < 0.99) {
      const a = p.pt([0, 0.1, N]), b = p.pt([0, 0.1, pk]);
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.2; g.setLineDash([2, 1.2]); g.lineDashOffset = -t * 12; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
    }
    post(-10.4, 4.4); post(10.4, 4.4);
    p.box(-12, -6, 31, 24, 12, 3, plates);
    const b = Math.max(0, (h - 0.72) / 0.28);
    if (b > 0) badge(p, [12, 2, 37], 4.6 * pop(b), true);
  },
};
