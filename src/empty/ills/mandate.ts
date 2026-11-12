// Direct debit: a mandate form lying flat, a bank at its head, with a pen resting on the signature line. Hover and the pen signs along the line; a tick pops in when it is done.
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
function solid(p: Pen, r: number, z0: number, z1: number, lit = 1) {
  const F: [V3[], number][] = [
    [[[-r, -r, z1], [r, -r, z1], [r, r, z1], [-r, r, z1]], 0.22],
    [[[-r, r, z0], [r, r, z0], [r, -r, z0], [-r, -r, z0]], 0.05],
    [[[r, -r, z0], [r, r, z0], [r, r, z1], [r, -r, z1]], SH.right],
    [[[-r, -r, z1], [-r, r, z1], [-r, r, z0], [-r, -r, z0]], 0.22],
    [[[-r, r, z0], [-r, r, z1], [r, r, z1], [r, r, z0]], 0.13],
    [[[r, -r, z0], [r, -r, z1], [-r, -r, z1], [-r, -r, z0]], SH.right],
  ];
  for (const [pts, f] of F) if (facing(p, pts) > 0.01) p.face(pts, f * lit, SH.edge, 0.5);
}
// a round bright badge with a dark tick, flat to the screen
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.36); g.stroke();
  });
}

const W = 11, D = 14, Z = 0.9; // the form: half width, half depth, thickness
// the signature: a looping hand along the line, s from 0 to 1
const sig = (s: number): V3 => [-6.4 + 12.6 * s + 1.1 * Math.sin(s * Math.PI * 7), 7.4 - 1.9 * Math.sin(s * Math.PI * 7 + 1.2) * (1 - 0.55 * s), Z + 0.03];

export const mandate: Illustration = {
  k: "mandate", name: "Direct debit", title: "No direct debits", body: "When you let a company collect payments from your account, the mandate will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(clamp((h - 0.08) / 0.62));
    p.translate(1, -1, -5);
    p.scale(1.28);
    p.shadow(0, 0, 22, 11, 0.12);
    p.box(-W, -D, 0, W * 2, D * 2, Z, { top: 0.2, left: 0.12, right: 0.065 });
    const z = Z + 0.03;
    const L = (a: [number, number], b: [number, number], lw = 0.7) => p.line([[a[0], a[1], z], [b[0], b[1], z]], SH.edge, lw);
    // the bank at the head of the form, and the lines of the mandate
    p.line([[-8.6, -8.6, z], [-3.6, -8.6, z], [-6.1, -11.2, z], [-8.6, -8.6, z]], SH.edge, 0.8);
    for (const x of [-7.6, -6.1, -4.6]) L([x, -7.8], [x, -6], 0.8);
    L([-8.8, -5], [-3.4, -5], 0.8);
    L([0, -10], [8, -10], 1.2);
    L([2.5, -7.4], [8, -7.4]);
    L([-8.6, -1.6], [8, -1.6]);
    L([-8.6, 1], [8, 1]);
    L([-8.6, 3.6], [3, 3.6]);
    // where to sign
    L([-8.6, 10.4], [8, 10.4], 0.6);
    // the signature so far
    const N = Math.round(60 * k);
    if (N > 0) p.line(Array.from({ length: N + 1 }, (_, i) => sig(i / 60)), SH.edge, 0.95);
    // the pen: leaning to the right, its nib on the paper, lifting off once it is done
    const tip = sig(k), lift = 3 * ease(clamp((h - 0.74) / 0.2));
    p.push();
    p.translate(tip[0], tip[1], tip[2] + lift);
    p.rotate("z", -Math.PI / 4);
    p.rotate("y", 0.62);
    const nib: V3[] = [[-1.4, -1.4, 4], [1.4, -1.4, 4], [1.4, 1.4, 4], [-1.4, 1.4, 4]];
    for (let i = 0; i < 4; i++) { const f: V3[] = [[0, 0, 0], nib[(i + 1) % 4], nib[i]]; if (facing(p, f) > 0.01) p.face(f, i === 1 ? 0.13 : 0.22, SH.edge, 0.5); }
    solid(p, 1.4, 4, 17);
    solid(p, 1.7, 17, 21, 0.6);
    p.pop();
    const b = clamp((h - 0.78) / 0.22);
    if (b > 0) tick(p, [W - 1, -D + 1, 9], 5 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
