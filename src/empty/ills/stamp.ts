// Nothing posted: a postage stamp with perforated edges and a little landscape. Hover and it straightens up while a postmark lands on its corner.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 12, H = 30, R = 1.45; // half width, height, perforation radius
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

/** the stamp's outline in [x, z]: a rectangle with a row of round bites out of each side */
function outline(): [number, number][] {
  const out: [number, number][] = [];
  const c: [number, number][] = [[-W, 0], [W, 0], [W, H], [-W, H]];
  for (let e = 0; e < 4; e++) {
    const [ax, az] = c[e], [bx, bz] = c[(e + 1) % 4];
    const L = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / L, dz = (bz - az) / L;
    const n = Math.round(L / 5), pitch = L / n;
    out.push([ax, az]);
    for (let i = 0; i < n; i++) {
      const m = (i + 0.5) * pitch;
      for (let j = 0; j <= 5; j++) {
        const a = (j / 5) * Math.PI, u = m - Math.cos(a) * R, v = Math.sin(a) * R;
        out.push([ax + dx * u - dz * v, az + dz * u + dx * v]);
      }
    }
  }
  return out;
}
const OUT = outline();
const trace = (p: Pen, g: CanvasRenderingContext2D, pts: V3[], close = true) => {
  g.beginPath();
  pts.forEach((q, i) => { const [x, y] = p.pt(q); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
  if (close) g.closePath();
};

export const stamp: Illustration = {
  k: "stamp", name: "Postage stamp", title: "Nothing posted", body: "Letters and parcels you send will be listed here once the first one is posted.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-2, 2, -16);
    p.shadow(0, 0, 22, 10, 0.12);
    p.rotate("z", -0.5);
    const up = ease(seg(h, 0, 0.5));
    p.translate(0, 0, 1 + 1.5 * up + h * Math.sin(t * 2.2) * 0.4);
    p.rotate("x", 0.34 - 0.2 * up);
    p.rotate("y", 0.14 * (1 - up), [0, 0, H / 2]);
    const front: V3[] = OUT.map(([x, z]) => [x, 0, z]);
    // the postmark: two rings on the top right corner and three wavy lines running off it
    const k = ease(seg(h, 0.25, 0.7)), kw = seg(h, 0.55, 1);
    const C: [number, number] = [W - 0.5, H - 3.5], s = 1 + 0.9 * (1 - k);
    const ring = (r: number): V3[] => Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2; return [C[0] + Math.cos(a) * r * s, 0.06, C[1] + Math.sin(a) * r * s]; });
    const marks = (g: CanvasRenderingContext2D, col: string) => {
      g.strokeStyle = col; g.lineWidth = 1; g.lineCap = "round"; g.lineJoin = "round";
      trace(p, g, ring(6.6)); g.stroke();
      trace(p, g, ring(4.3)); g.stroke();
      if (kw > 0) for (let i = -1; i <= 1; i++) {
        const n = Math.max(2, Math.round(16 * kw));
        trace(p, g, Array.from({ length: n }, (_, j) => [C[0] + 7.6 + j * 0.62, 0.06, C[1] + i * 3.1 + Math.sin(j * 0.75) * 0.8] as V3), false); g.stroke();
      }
    };
    // outside the paper the ink is bright
    if (k > 0.02) p.screen((g) => { const v = Math.round(255 * k); marks(g, `rgb(${v},${v},${v})`); });
    // the paper: a darker copy behind for thickness, then the lit front
    p.face(OUT.map(([x, z]) => [x, -0.9, z] as V3), SH.right, 0);
    p.face(front, 0.24, SH.edge, 0.55);
    // the picture: a dark sky, two hills and a sun
    const y = 0.03, I = 3.6;
    p.clear([[-W + I, y, I], [W - I, y, I], [W - I, y, H - I], [-W + I, y, H - I]]);
    p.ringV("y", [3.2, y + 0.02, 19.5], 2.5, 0.34, 0);
    p.face([[-W + I, y + 0.02, I], [-W + I, y + 0.02, 9], [-3.4, y + 0.02, 15.5], [0.2, y + 0.02, 10.5], [3.4, y + 0.02, 13.6], [W - I, y + 0.02, 8], [W - I, y + 0.02, I]], 0.3, 0);
    p.line([[-3.4, y + 0.04, 15.5], [0.2, y + 0.04, 10.5], [-1.6, y + 0.04, I + 2]], SH.edge, 0.55);
    // on the paper the ink is a dark cut
    if (k > 0.5) p.screen((g) => { trace(p, g, front); g.clip(); marks(g, "#000"); });
  },
};
