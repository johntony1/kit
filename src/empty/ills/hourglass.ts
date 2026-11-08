// Nothing yet: an hourglass in a frame. Sand trickles down, then the whole thing flips and starts again.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const HB = 12; // height of each bulb
const PT = 1.3; // half thickness of a plate
const PR = 8.6; // plate radius
const POSTS = [225, 105, 345].map((d) => (d * Math.PI) / 180); // symmetric under the flip
// the glass radius at height s (0 at the neck, HB at the plate)
const rad = (s: number) => 0.9 + 6.3 * Math.pow(Math.sin(Math.PI * Math.min(0.86, (Math.abs(s) / HB) * 0.86)), 0.75);
const VIEW: V3 = [1, 1, 1]; // towards the viewer
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const gray = (v: number) => { const n = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${n},${n},${n})`; };

type P2 = [number, number];
function hull(pts: P2[]): P2[] {
  const s = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P2[] = [], hi: P2[] = [];
  for (const q of s) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of s.reverse()) { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

export const hourglass: Illustration = {
  k: "hourglass", name: "Hourglass", title: "Nothing yet", body: "Hang tight. Things will show up here as soon as they are ready.",
  kind: "loop", period: 4, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % 4) / 4;
    const FLOW = 0.76;
    const flowing = u < FLOW;
    const f = flowing ? u / FLOW : 1; // how much sand has fallen
    const th = flowing ? 0 : easeInOut((u - FLOW) / (1 - FLOW)) * Math.PI;
    const ZC = 0;
    p.push(); p.translate(0, 0, -(HB + 2 * PT)); p.shadow(0, 0, 15, 7, 0.1); p.pop();

    // local (axis along z) to world: a turn about the horizontal axis (1,1,0), centred on the hourglass
    const c = Math.cos(th), sn = Math.sin(th), k = Math.SQRT1_2;
    const W = ([x, y, z]: V3): V3 => {
      // Rodrigues around n = (k, k, 0)
      const nd = k * x + k * y;
      const cx = k * z, cy = -k * z, cz = k * y - k * x; // n x v
      return [x * c + cx * sn + k * nd * (1 - c), y * c + cy * sn + k * nd * (1 - c), z * c + cz * sn + ZC];
    };
    const S = (l: V3): P2 => p.pt(W(l));
    const depth = (l: V3) => dot3(W(l), VIEW);
    const ring = (s: number, r: number, n = 36): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, s] as V3; });
    const poly = (pts: P2[], fill: number, edge: number, lw = 0.55) => p.screen((g) => {
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      if (fill > 0) { g.fillStyle = gray(fill); g.fill(); }
      if (edge > 0) { g.strokeStyle = gray(edge); g.lineWidth = lw; g.lineJoin = "round"; g.stroke(); }
    });
    const line = (a: V3, b: V3, shade: number, lw: number) => p.screen((g) => {
      const A = S(a), B = S(b); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.strokeStyle = gray(shade); g.lineWidth = lw; g.lineCap = "round"; g.stroke();
    });
    // the outline of the glass (or of sand inside it) between heights s0 < s1, as seen on screen
    const outline = (s0: number, s1: number, inset = 0): P2[] => {
      const ax = S([0, 0, 1]), o = S([0, 0, 0]);
      let nx = -(ax[1] - o[1]), ny = ax[0] - o[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      const left: P2[] = [], right: P2[] = [];
      const N = 18;
      for (let i = 0; i <= N; i++) {
        const s = s0 + ((s1 - s0) * i) / N;
        const pts = ring(s, Math.max(0.2, rad(s) - inset), 24).map(S);
        let mn = pts[0], mx = pts[0];
        for (const q of pts) { const d = q[0] * nx + q[1] * ny; if (d < mn[0] * nx + mn[1] * ny) mn = q; if (d > mx[0] * nx + mx[1] * ny) mx = q; }
        left.push(mn); right.push(mx);
      }
      return [...left, ...right.reverse()];
    };
    const plate = (s: number) => {
      const lo = ring(s - PT, PR), hi = ring(s + PT, PR);
      poly(hull([...lo, ...hi].map(S)), SH.left, SH.edge, 0.6);
      const cap = depth([0, 0, s + PT]) - depth([0, 0, s - PT]) > 0 ? hi : lo;
      poly(cap.map(S), SH.top, SH.edge, 0.6);
    };

    // sand: in the world-top bulb while it flows; during the flip it all sits in the local bottom bulb
    const sTop = HB + PT * 0; // glass meets the plates at +-HB
    const drawGlassAndSand = () => {
      poly(outline(-sTop, sTop), 0.05, 0);
      const fill = 0.36;
      // top sand: from the neck up to a level that falls as the sand runs out
      if (flowing && f < 0.995) {
        const lv = 0.6 + (HB * 0.68 - 0.6) * (1 - f);
        poly(outline(0.4, lv, 0.5), fill, 0);
        poly(ring(lv, rad(lv) - 0.5).map(S), 0.55, SH.edge, 0.45);
      }
      // bottom pile: rises from the floor of the lower bulb
      const pl = -HB + 0.4 + (HB * 0.68 - 0.4) * f;
      if (f > 0.03) {
        poly(outline(-HB + 0.3, pl, 0.5), fill, 0);
        poly(ring(pl, rad(pl) - 0.5).map(S), 0.55, SH.edge, 0.45);
      }
      // the stream through the neck, a line of falling grains
      if (flowing && f > 0.02 && f < 0.99) {
        line([0, 0, 0.6], [0, 0, pl + 0.4], 0.55, 0.5);
        for (let i = 0; i < 5; i++) {
          const q = (t * 2.2 + i / 5) % 1;
          const z = 0.4 + (pl - 0.4) * q;
          p.screen((g) => { const [x, y] = S([0, 0, z]); g.beginPath(); g.arc(x, y, 0.7, 0, Math.PI * 2); g.fillStyle = gray(1); g.fill(); });
        }
      }
      // the glass outline and a glint
      poly(outline(-sTop, sTop), 0, SH.edge, 0.6);
      p.screen((g) => {
        const pts = [3, 5, 7, 9].map((s) => S([Math.cos(-0.2) * rad(s) * 0.7, Math.sin(-0.2) * rad(s) * 0.7 + rad(s) * 0.45, s]));
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = gray(SH.soft); g.lineWidth = 0.6; g.lineCap = "round"; g.stroke();
      });
    };

    // painter's order: far plate, posts behind, glass, posts in front, near plate
    const ends = [-(HB + PT), HB + PT].sort((a, b) => depth([0, 0, a]) - depth([0, 0, b]));
    const posts = POSTS.map((a) => [Math.cos(a) * (PR - 1.6), Math.sin(a) * (PR - 1.6)] as P2);
    const post = ([x, y]: P2) => { line([x, y, -HB], [x, y, HB], SH.edge, 1.3); line([x, y, -HB], [x, y, HB], 0.15, 0.4); };
    plate(ends[0]);
    for (const q of posts) if (depth([q[0], q[1], 0]) < depth([0, 0, 0])) post(q);
    drawGlassAndSand();
    for (const q of posts) if (depth([q[0], q[1], 0]) >= depth([0, 0, 0])) post(q);
    plate(ends[1]);
  },
};
