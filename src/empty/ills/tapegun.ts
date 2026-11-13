// Nothing sealed yet: a packing tape gun seen side on, a big roll of tape over a body bar, a pistol grip below, the toothed blade at the front. Hover and the roll turns, pulling a strip of tape out past the blade; a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a side profile in [x, z] pushed through from y0 to y1: the strips that face us, then the near side */
function prism(p: Pen, prof: [number, number][], y0: number, y1: number, front: number) {
  const F = prof.map(([x, z]) => [x, y1, z] as V3), s = Math.sign(facing(p, F));
  prof.forEach((a, i) => {
    const b = prof[(i + 1) % prof.length];
    const q: V3[] = [[b[0], y1, b[1]], [a[0], y1, a[1]], [a[0], y0, a[1]], [b[0], y0, b[1]]];
    if (facing(p, q) * s <= 0) return;
    const dx = Math.abs(b[0] - a[0]), dz = Math.abs(b[1] - a[1]);
    p.face(q, SH.right + (SH.top - SH.right) * (dx / (dx + dz || 1)), 0);
  });
  p.face(F, front, 0);
}
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.52, y - r * 0.38); g.stroke();
  });
}

const RC: [number, number] = [1, 20], RO = 9.5, RI = 4.2; // roll centre, outer and core radius
const TW = 2.6; // half width of the tape
// the frame arm, behind the roll: from the hub down and back to the body
const ARM: [number, number][] = [[-0.6, 21.4], [2.6, 19.6], [-1.6, 7], [-6, 7]];
// the body: a chunky bar under the roll, a dark gap between them
const BAR: [number, number][] = [[-7, 8.4], [11.4, 8.4], [11.4, 4.8], [-7, 4.8]];
// the pistol grip, hanging down and back from the body
const GRIP: [number, number][] = [[-7.4, 4.8], [-1.6, 4.8], [-4.6, -9.6], [-11.6, -9.6], [-10.4, -1]];

export const tapegun: Illustration = {
  k: "tapegun", name: "Tape gun", title: "Nothing sealed yet", body: "Orders waiting to be packed and taped up will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(Math.min(1, h / 0.75));
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 11, 0.12);
    p.translate(0, 0, 6);
    p.rotate("z", -0.74); // turned so the gun's side faces us
    // the frame arm, the grip with a finger cut, then the body
    prism(p, ARM, -1, 1, 0.3);
    prism(p, GRIP, -TW * 0.6, TW * 0.8, 0.3);
    p.line([[-10.2, TW * 0.8 + 0.05, -1.6], [-3.4, TW * 0.8 + 0.05, -1.6]], SH.edge, 0.8);
    prism(p, BAR, TW - 0.8, TW + 0.6, 0.3);
    // the roll: a dense tread, the near face bright round a big dark core, the hub in it
    for (let i = 0; i <= 12; i++) p.ringV("y", [RC[0], -TW + (i / 12) * TW * 2, RC[1]], RO, i === 12 ? 0.3 : 0.12, 0);
    p.ringV("y", [RC[0], TW + 0.05, RC[1]], RI, 0.02, 0);
    const a = 0.5 - k * 3.4;
    p.ringV("y", [RC[0], TW + 0.08, RC[1]], 2, 0.45, 0);
    p.dot([RC[0] + Math.cos(a) * 1, TW + 0.1, RC[1] + Math.sin(a) * 1], 0.6, 0);
    // the tape running off the front of the roll down to the blade, and the strip pulled out below it
    const out = 6 * k, t0 = p.pt([RC[0] + RO * 0.96, TW + 0.1, RC[1] - RO * 0.28]), t1 = p.pt([13.2, TW + 0.7, 7.6]), t2 = p.pt([13.6, TW + 0.7, 7.6 - out]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(t0[0], t0[1]); g.lineTo(t1[0], t1[1]); if (out > 0.2) g.lineTo(t2[0], t2[1]); g.stroke();
    });
    // the toothed blade on the front end of the body
    p.face([[11.2, TW + 0.65, 8.4], ...Array.from({ length: 8 }, (_, i) => [i % 2 ? 14.2 : 13.2, TW + 0.65, 8.4 - i * 0.51] as V3), [11.2, TW + 0.65, 4.8]], 0.5, 0);
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      tick(p, [-10, 0, 24], 4.4 * pop);
    }
  },
};
