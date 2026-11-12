// No students enrolled: three students standing in a row, each in a graduation cap. Hover and the caps are thrown up one after another and hang in the air, turning.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const Q = Math.PI / 4, S2 = Math.SQRT1_2, SPLIT = Math.PI / 6;
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
/** screen winding: > 0 when an outward face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a box that may be turned any way: only the faces that look at us are drawn */
function slab(p: Pen, x: number, y: number, z: number, w: number, d: number, h: number, top: number = SH.top, under = 0.1) {
  const X = x + w, Y = y + d, Z = z + h;
  const up: V3[] = [[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]];
  const bot: V3[] = up.map(([a, b]) => [a, b, z] as V3).reverse();
  const fills = [SH.left, SH.right, SH.left, SH.right];
  up.forEach((a, i) => { const b = up[(i + 1) % 4], f: V3[] = [a, [a[0], a[1], z], [b[0], b[1], z], b]; if (facing(p, f) > 0) p.face(f, fills[i], SH.edge, 0.6); });
  if (facing(p, bot) > 0) p.face(bot, under, SH.edge, 0.6);
  if (facing(p, up) > 0) p.face(up, top, SH.edge, 0.6);
}
const arc = (r: number, z: number, a0: number, a1: number, n = 22): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
/** a turned shape on the origin: a dense side toward +y, a sparse side toward +x, bright outlines */
function lathe(p: Pen, prof: [number, number][], fl: number = SH.left, fr: number = SH.right) {
  const L = prof.map(([r, z]) => [-r * S2, r * S2, z] as V3), R = prof.map(([r, z]) => [r * S2, -r * S2, z] as V3);
  const [r0, z0] = prof[0], [r1, z1] = prof[prof.length - 1];
  if (p.ink) p.face([...arc(r0, z0, 3 * Q, -Q), ...R, ...arc(r1, z1, -Q, 3 * Q), ...L.slice().reverse()], fl, 0);
  else for (let i = 0; i < prof.length - 1; i++) {
    const [ra, za] = prof[i], [rb, zb] = prof[i + 1];
    p.face([...arc(ra, za, -Q, SPLIT), ...arc(rb, zb, -Q, SPLIT).reverse()], fr, 0);
    p.face([...arc(ra, za, SPLIT, 3 * Q), ...arc(rb, zb, SPLIT, 3 * Q).reverse()], fl, 0);
  }
  p.line(L, SH.edge, 0.6); p.line(R, SH.edge, 0.6); p.line(arc(r0, z0, -Q, 3 * Q), SH.edge, 0.6);
}
/** a ball, as a circle that faces the screen */
function ball(p: Pen, c: V3, r: number, fill: number) {
  const k = (r / 1.2247) * S2;
  p.face(Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [c[0] + Math.cos(a) * k, c[1] - Math.cos(a) * k, c[2] + Math.sin(a) * r] as V3; }), fill, SH.edge, 0.6);
}
/** a simple figure standing on the origin: a tapered body and a round head */
function person(p: Pen) {
  lathe(p, [[4.4, 0], [4.9, 4], [4.2, 8], [2.2, 10.4]], 0.2, 0.11);
  ball(p, [0, 0, 13.4], 3.4, 0.28);
}

export const students: Illustration = {
  k: "students", name: "Students", title: "No students enrolled", body: "Invite students or share the class code. Everyone who joins will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 31, 13, 0.12);
    // left and right at the back, the middle one a step forward
    ([[-10.5, 7.5, 1], [7.5, -10.5, 2], [1.5, 1.5, 0]] as [number, number, number][]).forEach(([x, y, i]) => {
      p.push();
      p.translate(x, y, 0);
      person(p);
      // the cap: up it goes, tipping and turning, and it stays up while hovered
      const k = seg(h, i * 0.16, 0.56 + i * 0.16), up = 1 - Math.pow(1 - k, 2.4);
      p.translate(0, 0, 16.2 + up * 11 + (k > 0 ? Math.sin(t * 2.2 + i * 2) * 0.7 * k : 0));
      p.rotate("z", up * 1.2 + (k > 0 ? Math.sin(t * 1.3 + i) * 0.25 * k : 0));
      p.rotate("x", Math.sin(up * Math.PI) * 0.5 + 0.22 * up);
      p.cylinder(0, 0, -1.4, 2.7, 1.4, { side: 0.1, top: 0.1, lw: 0.4 });
      slab(p, -4.6, -4.6, 0, 9.2, 9.2, 0.8, 0.3, 0.1);
      // the button and the tassel
      p.dot([0, 0, 0.85], 0.7, 0.02);
      p.line([[0, 0, 0.85], [4.2, 2.6, 0.85]], SH.edge, 0.5);
      p.box(3.9, 2.3, -2.6, 0.9, 0.9, 3.2, { top: 0.34, left: 0.34, right: 0.2, edge: 0 });
      p.pop();
    });
  },
};
