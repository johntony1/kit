// Money bag: a round sack tied at the neck, a currency mark on its front. Hover and the bag hops as two coins drop beside it; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// a round bright badge with a dark plus, flat to the screen
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
const pop = (b: number) => (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
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
/** a point on the plane that faces us through c: u to the right, v up */
const bb = (c: V3, u: number, v: number): V3 => [c[0] + u * 0.7071 - v * 0.4082, c[1] - u * 0.7071 - v * 0.4082, c[2] + v * 0.8165];
const arc = (cx: number, cy: number, z: number, r: number, a0: number, a1: number): V3[] =>
  Array.from({ length: 25 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 24; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });
const MARK: [number, number][] = [[2.4, 2.5], [1.3, 3.6], [-1.3, 3.6], [-2.4, 2.5], [-2.4, 1.1], [-1.3, 0.1], [1.3, -0.1], [2.4, -1.1], [2.4, -2.5], [1.3, -3.6], [-1.3, -3.6], [-2.4, -2.5]];
const SACK: [number, number][] = [[0, 7.5], [1, 10.8], [4, 13], [8, 13.4], [12, 12], [15.5, 8.4], [18, 4.8], [19.4, 3.8], [20.8, 4.6], [22.4, 6.4], [23.6, 7.4]];
// a coin's fall: down, a bounce, rest
const fall = (k: number) => (k < 0.6 ? 24 * (1 - Math.pow(k / 0.6, 2)) : 3 * Math.sin(((k - 0.6) / 0.4) * Math.PI) * (1 - (k - 0.6) / 0.4));

export const moneybag: Illustration = {
  k: "moneybag", name: "Money bag", title: "No funds raised yet", body: "Money you raise will collect here as soon as the first contribution comes in.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const hop = 3 * Math.sin(Math.PI * clamp(h / 0.4)), sq = 0.05 * Math.sin(Math.PI * clamp((h - 0.4) / 0.2));
    p.translate(-2, 0, -12);
    p.shadow(0, 0, 23 - hop, 11 - hop * 0.5, 0.12);
    // the sack, its gathered top open above the tie
    const prof = SACK.map(([z, r]) => [z * (1 - sq) + hop, r * (1 + sq)] as [number, number]), top = prof[prof.length - 1][0];
    lathe(p, 0, 0, prof, 1, 44);
    p.disc(0, 0, top, 7.4, 0.2, 0);
    p.disc(0, 0, top + 0.02, 5.6, 0.03, 0);
    for (let i = 0; i < 6; i++) { const a = -0.6 + i * 0.55; p.line([[Math.cos(a) * 4.4, Math.sin(a) * 4.4, prof[8][0]], [Math.cos(a) * 7.2, Math.sin(a) * 7.2, top - 0.2]], SH.edge, 0.45); } // the gathers
    p.line(arc(0, 0, prof[7][0], 4, -Math.PI / 4, (Math.PI * 3) / 4), SH.edge, 1.3); // the tie
    // the mark on its front
    const C: V3 = [0, 0, 8.4 * (1 - sq) + hop];
    p.line(MARK.map(([a, b]) => bb(C, a * 1.35, b * 1.35)), SH.edge, 1.3);
    p.line([bb(C, 0, 6.3), bb(C, 0, -6.3)], SH.edge, 0.9);
    // two coins dropping beside it
    ([[16.5, -6, 0.2], [10, 14, 0.36]] as [number, number, number][]).forEach(([x, y, at]) => {
      const k = clamp((h - at) / 0.5);
      if (k <= 0) return;
      const z = fall(k), a = Math.min(1, k * 4);
      p.cylinder(x, y, z, 4.4, 1.8, { side: 0.12 * a, top: 0.24 * a, edge: a });
      p.line(arc(x, y, z + 1.82, 3, 0, Math.PI * 2), SH.edge, 0.55);
    });
    const b = clamp((h - 0.78) / 0.22);
    if (b > 0) badge(p, [9, -9, 25], 4.8 * pop(b));
  },
};
