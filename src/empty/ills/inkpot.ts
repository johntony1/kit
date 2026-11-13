// Nothing written yet: a squat ink pot with a quill feather standing in it. Hover and the quill lifts out, sways, and dips back in a little.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 12, BH = 10; // body radius and height
const NR = 5.2, NZ = 15; // neck radius, top of the neck

/** the visible front of a round band from radius r0 at z0 to radius r1 at z1 */
function band(p: Pen, r0: number, z0: number, r1: number, z1: number, tone: number) {
  const half = (r: number, z: number) => Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
  p.face([...half(r0, z0), ...half(r1, z1).reverse()], tone, 0);
}
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const inkpot: Illustration = {
  k: "inkpot", name: "Ink pot", title: "Nothing written yet", body: "Start your first piece of writing and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-2, 2, -15);
    p.scale(1.12);
    p.shadow(0, 0, 30, 13, 0.12);
    // the body: a wide round pot, a bright label band round its middle
    p.cylinder(0, 0, 0, R, BH, { side: 0.12, top: 0.2, edge: 0 });
    band(p, R + 0.05, 3, R + 0.05, 7.6, 0.26);
    // the shoulder up to the neck, the neck, and the dark ink inside
    band(p, R, BH, NR + 1.2, BH + 2.4, 0.2);
    p.disc(0, 0, BH + 2.4, NR + 1.2, 0.2);
    p.cylinder(0, 0, BH + 2.4, NR, NZ - BH - 2.4, { side: 0.075, top: 0.2, edge: 0 });
    p.disc(0, 0, NZ + 0.02, NR - 1.1, 0.02);
    // the quill: lifted on hover, swaying while it is out
    const up = ease(Math.min(1, h * 1.4)) * 9 - Math.max(0, (h - 0.75) / 0.25) * 2.5;
    const sway = h * Math.sin(t * 2.6) * 0.08;
    const ax: V3 = [0.12 + sway, -0.42, 1]; // up the quill, leaning back to the right
    const n = Math.hypot(ax[0], ax[1], ax[2]);
    const A: V3 = [ax[0] / n, ax[1] / n, ax[2] / n], S: V3 = [1, 0, -A[0]]; // along, and across the vane
    const at = (s: number, w: number): V3 => [A[0] * s + S[0] * w, A[1] * s + S[1] * w, NZ - 4 + up + A[2] * s + S[2] * w];
    // the bare shaft from inside the pot up to the vane, as a bright stroke
    const [x0, y0] = p.pt(at(Math.max(0, 4 - up * 0.9), 0)), [x1, y1] = p.pt(at(14, 0));
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
    // the vane: a long leaf, lit on the left, in shade on the right
    const L0 = 12, L1 = 36, side = (k: number) => Array.from({ length: 17 }, (_, i) => {
      const s = L0 + ((L1 - L0) * i) / 16, f = (s - L0) / (L1 - L0);
      return at(s, k * 6 * Math.pow(Math.sin(Math.PI * Math.pow(f, 0.8)), 0.75));
    });
    p.face([...side(-1), ...side(0).reverse()], 0.24, 0);
    p.face([...side(1), ...side(0).reverse()], 0.09, 0);
    // the shaft down the middle and a few barb cuts
    p.line([at(L0, 0), at(L1 - 1, 0)], SH.edge, 0.7);
    for (const s of [18, 24]) { p.line([at(s, 0), at(s + 5, -4.2)], SH.edge, 0.6); p.line([at(s + 2, 0), at(s + 6, 3.6)], SH.edge, 0.6); }
    // the neck's front lip again over the shaft
    band(p, NR, NZ - 1.2, NR, NZ, 0.075);
  },
};
