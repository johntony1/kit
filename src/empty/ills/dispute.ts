// Dispute: a gavel raised over its sound block. Hover and it swings up, comes down on the block and rings.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a box under any rotation: only the faces that look at us */
function solid(p: Pen, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
  const F: [V3[], number][] = [
    [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], 0.22],
    [[[x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0]], 0.05],
    [[[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], SH.right],
    [[[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]], 0.2],
    [[[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], 0.13],
    [[[x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y0, z0]], SH.right],
  ];
  for (const [pts, f] of F) if (facing(p, pts) > 0.01) p.face(pts, f, SH.edge, 0.5);
}

const BX = -7, BZ = 2.6; // the sound block: where it sits and how tall it is
const PIV: V3 = [12.5, 0, BZ + 7]; // the end of the handle, where the gavel turns

const REST = 0.5;
// the angle of the gavel through the hover: wind up, strike, lift again
function swing(h: number) {
  if (h < 0.3) return REST + (1 - REST) * ease(h / 0.3);
  if (h < 0.55) { const v = (h - 0.3) / 0.25; return 1 - v * v; }
  return REST * ease((h - 0.55) / 0.45);
}

export const dispute: Illustration = {
  k: "dispute", name: "Dispute", title: "No disputes", body: "If a customer questions a payment, the case will open here for you to answer.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const a = swing(h);
    p.translate(-1.5, 0, -9);
    p.scale(1.16);
    p.shadow(-2, 0, 24, 10, 0.11);
    // the sound block
    p.cylinder(BX, 0, 0, 7.6, BZ, { side: 0.12, top: 0.22 });
    p.line(Array.from({ length: 33 }, (_, i) => { const b = (i / 32) * Math.PI * 2; return [BX + Math.cos(b) * 5.6, Math.sin(b) * 5.6, BZ + 0.02] as V3; }), SH.edge, 0.5);
    // the ring of the strike: short marks around the block
    const k = clamp((h - 0.54) / 0.14);
    if (k > 0) for (let i = 0; i < 7; i++) {
      const b = 0.5 + (i / 7) * Math.PI * 2, r0 = 9.4 + 1.4 * k + 0.5 * Math.sin(t * 5 + i), r1 = r0 + 3.6;
      const c = Math.cos(b), s = Math.sin(b), w = 0.8;
      p.face([[BX + c * r0 - s * w, s * r0 + c * w, 0.3], [BX + c * r1 - s * w, s * r1 + c * w, 0.3], [BX + c * r1 + s * w, s * r1 - c * w, 0.3], [BX + c * r0 + s * w, s * r0 - c * w, 0.3]], 0.3 * k, 0);
    }
    // the gavel, turning about the end of its handle
    p.push();
    p.translate(PIV[0], PIV[1], PIV[2]);
    p.rotate("y", a);
    const handle = () => {
      solid(p, -17, -1, -1, -3.5, 1, 1);
      solid(p, -3.5, -1.6, -1.6, 2.5, 1.6, 1.6); // the grip
    };
    const head = () => {
      const x0 = BX - PIV[0] - 3, x1 = BX - PIV[0] + 3;
      solid(p, x0 - 0.8, -4, -7, x1 + 0.8, 4, -4.6);
      solid(p, x0, -3.2, -4.6, x1, 3.2, 4.6);
      solid(p, x0 - 0.8, -4, 4.6, x1 + 0.8, 4, 7);
    };
    // raised, the head swings nearer to us than the handle
    if (a > 0.75) { handle(); head(); } else { head(); handle(); }
    p.pop();
  },
};
