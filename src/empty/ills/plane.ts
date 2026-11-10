// No sent items: a paper plane gliding a gentle loop, banking into the turn, a dashed trail drawn out behind it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 6; // seconds per loop
const Z0 = 10; // height above the floor
const VIEW: V3 = [1, 1, 1];
const LIGHT: V3 = (() => { const v: V3 = [-0.25, 0.35, 0.9]; const L = Math.hypot(...v); return v.map((x) => x / L) as V3; })();
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => { const L = Math.hypot(...a) || 1; return [a[0] / L, a[1] / L, a[2] / L]; };

const F: V3 = norm([0.55, -1, 0]); // the heading: towards the screen's upper right
const B: V3 = [-F[0], -F[1], 0]; // straight back along the floor plan

// the trail it leaves, in the upright plane through its heading: back, up and over in one loop-the-loop, then back
// out straight. A prolate cycloid: b runs backwards except near the top, where it doubles back into the loop
const trail = (ph: number): [number, number] => {
  const k = 1.8, kz = 1.75;
  if (ph <= Math.PI * 2) return [k * (1.7 * ph + 5 * Math.sin(ph)), kz * (5 - 5 * Math.cos(ph) - ph * 0.6)];
  return [k * (3.4 * Math.PI + (ph - Math.PI * 2) * 7), kz * (-Math.PI * 1.2 - (ph - Math.PI * 2) * 1.5)];
};
/** the plane in its own frame: nose along +f, wings out along s, up along u. Faces back to front, three tones by light */
function paperPlane(p: Pen, o: V3, f: V3, s: V3, u: V3) {
  const at = (a0: number, b0: number, c0: number): V3 => { const a = a0 * 1.3, b = b0 * 1.3, c = c0 * 1.3; return [o[0] + f[0] * a + s[0] * b + u[0] * c, o[1] + f[1] * a + s[1] * b + u[1] * c, o[2] + f[2] * a + s[2] * b + u[2] * c]; };
  const nose = at(8, 0, 0), tailL = at(-6, 6.2, 0.6), tailR = at(-6, -6.2, 0.6), keelT = at(-6, 0, 0), keelB = at(-6, 0, -3), foldL = at(-6, 1.1, 0), foldR = at(-6, -1.1, 0);
  const faces: V3[][] = [
    [nose, foldL, tailL], // left wing
    [nose, tailR, foldR], // right wing
    [nose, keelB, foldL], // keel, left half
    [nose, foldR, keelB], // keel, right half
  ];
  const list = faces.map((pts) => {
    let n = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
    if (dot3(n, VIEW) < 0) n = [-n[0], -n[1], -n[2]];
    const l = Math.abs(dot3(n, LIGHT));
    const f = l > 0.72 ? SH.top + 0.04 : l > 0.42 ? SH.left : SH.right;
    const c: V3 = [0, 1, 2].map((k) => (pts[0][k] + pts[1][k] + pts[2][k]) / 3) as V3;
    return { pts, f, d: dot3(c, VIEW) };
  });
  list.sort((a, b) => a.d - b.d).forEach((q) => {
    p.face(q.pts, q.f, 0);
    p.line([...q.pts, q.pts[0]], SH.edge, 0.55);
  });
  // the centre crease on the wings
  p.line([nose, keelT], SH.edge, 0.6);
}

export const plane: Illustration = {
  k: "plane", name: "Paper plane", title: "No sent items", body: "Messages you send will land here, so you can always find them again.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const a = ((t % P) / P) * Math.PI * 2;
    p.translate(-0.4, -5.6, -7);
    p.scale(0.84);
    // it glides round a small, gentle loop of its own, rolling and pitching a little as it goes
    const o: V3 = [10 + Math.cos(a) * 1.6, -8 + Math.sin(a) * 1.6, Z0 + Math.sin(a) * 1.8];
    // the dashed trail behind it, flowing away: bright dashes that fade towards the far end
    const tail: V3 = [o[0] - F[0] * 8.6, o[1] - F[1] * 8.6, o[2]];
    p.screen((c) => {
      c.lineCap = "round";
      const N = 24, END = Math.PI * 2 + 1.2, flow = (t % P) / P; // one dash step per loop, so it repeats seamlessly
      for (let i = 0; i < N; i++) {
        const k0 = (i + flow) / N, k1 = k0 + 0.45 / N;
        const seg = Array.from({ length: 5 }, (_, j) => {
          const [bk, up] = trail((k0 + ((k1 - k0) * j) / 4) * END);
          return p.pt([tail[0] + B[0] * bk, tail[1] + B[1] * bk, tail[2] + up]);
        });
        const fade = 1 - k0 * 0.75;
        const n = Math.round(255 * fade);
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 0.9 + 0.5 * fade;
        c.beginPath(); seg.forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      }
    });
    // its frame: heading with a little pitch, then a roll
    const pitch = 0.16 + Math.cos(a) * 0.1, roll = -0.62 + Math.sin(a) * 0.22; // rolled towards us so its wings show
    const f = norm([F[0] * Math.cos(pitch), F[1] * Math.cos(pitch), Math.sin(pitch)]);
    let s = norm(cross([0, 0, 1], f));
    let u = cross(f, s);
    const cr = Math.cos(roll), sr = Math.sin(roll);
    [s, u] = [norm([s[0] * cr + u[0] * sr, s[1] * cr + u[1] * sr, s[2] * cr + u[2] * sr]), norm([u[0] * cr - s[0] * sr, u[1] * cr - s[1] * sr, u[2] * cr - s[2] * sr])];
    paperPlane(p, o, f, s, u);
  },
};
