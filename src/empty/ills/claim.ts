// Insurance claim: a rubber stamp resting on a claim form. Hover and the stamp lifts away to show the mark it left, a tick in a frame.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a surface of revolution about a vertical axis through (cx, cy); prof is [z, r] from the bottom up.
 *  Small quads, back to front, each in a face tone by its normal, then the outline */
function lathe(p: Pen, cx: number, cy: number, rough: [number, number][], gain = 1, nu = 32) {
  const prof: [number, number][] = [rough[0]];
  for (let j = 1; j < rough.length; j++) {
    const [z0, r0] = rough[j - 1], [z1, r1] = rough[j], n = Math.ceil(Math.hypot(z1 - z0, r1 - r0) / 1.3);
    for (let s = 1; s <= n; s++) prof.push([z0 + ((z1 - z0) * s) / n, r0 + ((r1 - r0) * s) / n]);
  }
  const P = (a: number, z: number, r: number): V3 => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z];
  const A = (i: number) => (i / nu) * Math.PI * 2;
  const quads: { d: number; pts: V3[]; f: number }[] = [], see: boolean[][] = [];
  for (let j = 0; j < prof.length - 1; j++) {
    const [z0, r0] = prof[j], [z1, r1] = prof[j + 1];
    const L = Math.hypot(z1 - z0, r1 - r0) || 1, nz = (r0 - r1) / L, nr = (z1 - z0) / L;
    see.push([]);
    for (let i = 0; i < nu; i++) {
      const am = A(i + 0.5), nx = Math.cos(am) * nr, ny = Math.sin(am) * nr, v = nx + ny + nz > 0;
      see[j].push(v);
      if (!v) continue;
      quads.push({
        d: (Math.cos(am) + Math.sin(am)) * (r0 + r1) / 2 + (z0 + z1) / 2,
        pts: [P(A(i) - 0.03, z0 - 0.08, r0), P(A(i + 1) + 0.03, z0 - 0.08, r0), P(A(i + 1) + 0.03, z1 + 0.08, r1), P(A(i) - 0.03, z1 + 0.08, r1)],
        f: Math.max(0.052, (nz > 0.6 ? SH.top : ny >= nx ? 0.13 : SH.right) * gain),
      });
    }
  }
  quads.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));
  for (let j = 0; j < see.length; j++) for (let i = 0; i < nu; i++) {
    if (!see[j][i]) continue;
    const [z0, r0] = prof[j], [z1, r1] = prof[j + 1];
    if (!see[j][(i + 1) % nu]) p.line([P(A(i + 1), z0, r0), P(A(i + 1), z1, r1)], SH.edge, 0.55);
    if (!see[j][(i + nu - 1) % nu]) p.line([P(A(i), z0, r0), P(A(i), z1, r1)], SH.edge, 0.55);
    if (j === see.length - 1 || !see[j + 1][i]) p.line([P(A(i), z1, r1), P(A(i + 1), z1, r1)], SH.edge, 0.55);
    if (j === 0 || !see[j - 1][i]) p.line([P(A(i), z0, r0), P(A(i + 1), z0, r0)], SH.edge, 0.55);
  }
}
const W = 13, D = 11, Z = 0.9; // the form: half width, half depth, thickness
const SX = 2.5, SY = 3.5; // where the stamp comes down
// the handle: a neck that swells into a round knob
const KNOB: [number, number][] = [[0, 1.7], [4, 1.7], [5, 2.6], ...Array.from({ length: 11 }, (_, i) => { const a = -0.85 + (i / 10) * (Math.PI / 2 + 0.85); return [8.6 + Math.sin(a) * 4.2, Math.max(0.05, Math.cos(a) * 4.2)] as [number, number]; })];

export const claim: Illustration = {
  k: "claim", name: "Insurance claim", title: "No claims yet", body: "If something goes wrong, start a claim and you can follow its progress here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(clamp(h / 0.7));
    p.translate(0, 0, -6);
    p.scale(1.22);
    p.shadow(0, 0, 23, 11, 0.12);
    // the form
    p.box(-W, -D, 0, W * 2, D * 2, Z, { top: 0.2, left: 0.12, right: 0.065 });
    const z = Z + 0.03;
    p.line([[-10, -8, z], [-2, -8, z]], SH.edge, 1.2);
    p.line([[-10, -5.4, z], [9, -5.4, z]], SH.edge, 0.7);
    p.line([[-10, -3, z], [5, -3, z]], SH.edge, 0.7);
    p.line([[-10, 1.5, z], [-6.5, 1.5, z]], SH.edge, 0.7);
    p.line([[-10, 4, z], [-5, 4, z]], SH.edge, 0.7);
    p.line([[-10, 6.5, z], [-7.5, 6.5, z]], SH.edge, 0.7);
    // the mark the stamp left: a frame with a tick in it
    const fx = 5.4, fy = 3.6;
    p.line([[SX - fx, SY - fy, z], [SX + fx, SY - fy, z], [SX + fx, SY + fy, z], [SX - fx, SY + fy, z], [SX - fx, SY - fy, z]], SH.edge, 0.9);
    p.line([[SX - 2.8, SY + 0.2, z], [SX - 0.8, SY + 2, z], [SX + 3, SY - 2, z]], SH.edge, 1.3);
    // the stamp: a block, a neck and a round knob
    p.push();
    p.translate(SX - 3 * e, SY - 7 * e, Z + 13 * e + (h > 0.9 ? Math.sin(t * 2.4) * 0.5 : 0));
    p.box(-6.2, -4.4, 0, 12.4, 8.8, 1.1, { top: 0.1, left: 0.07, right: 0.04 }); // the rubber
    p.box(-6.2, -4.4, 1.1, 12.4, 8.8, 2.6, { top: 0.2, left: 0.13, right: 0.065 });
    p.line([[-6.2, 4.43, 1.1], [6.2, 4.43, 1.1], [6.23, -4.4, 1.1]], SH.edge, 0.5);
    lathe(p, 0, 0, KNOB.map(([a, b]) => [a + 3.7, b] as [number, number]));
    p.pop();
    // a glint off the fresh ink
    const k = clamp((h - 0.7) / 0.3);
    if (k > 0) ([[SX + 8.5, SY - 5, 3], [SX - 7.5, SY + 5.5, 2.5], [SX + 7, SY + 6, 4]] as V3[]).forEach((q, i) => p.dot(q, (0.7 + 0.3 * Math.sin(t * 3.2 + i * 2.1)) * k, 1));
  },
};
