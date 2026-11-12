// No tutors yet: a tutor and a smaller student side by side, an open book in front of them. Hover and the tutor's speech bubble pops up, then a light comes on over the student.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const Q = Math.PI / 4, S2 = Math.SQRT1_2, SPLIT = Math.PI / 6;
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const pop = (b: number) => (b <= 0 ? 0 : b < 0.6 ? (b / 0.6) * 1.2 : 1.2 - 0.2 * ((b - 0.6) / 0.4));
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
/** a point in the plane that faces us, through c: u across the screen, v up */
const flat = (c: V3, u: number, v: number): V3 => [c[0] + u * S2, c[1] - u * S2, c[2] + v];

export const tutor: Illustration = {
  k: "tutor", name: "Tutor", title: "No tutors yet", body: "Find a tutor for the subjects you need help with. Your tutors will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 30, 13, 0.12);
    // the student, smaller, on the right
    const st: V3 = [7.5, -7.5, 0];
    p.push(); p.translate(st[0], st[1], 0); p.scale(0.82); person(p); p.pop();
    // the tutor, on the left
    const tu: V3 = [-8.5, 5.5, 0];
    p.push(); p.translate(tu[0], tu[1], 0); p.scale(1.22); person(p); p.pop();
    // the open book on the floor in front: two pages rising from the spine
    const bx = 8.5, y0 = 3, y1 = 13;
    p.face([[bx - 7, y0, 2.2], [bx, y0, 0.6], [bx, y1, 0.6], [bx - 7, y1, 2.2]], 0.24, SH.edge, 0.6);
    p.face([[bx, y0, 0.6], [bx + 7, y0, 2.2], [bx + 7, y1, 2.2], [bx, y1, 0.6]], 0.34, SH.edge, 0.6);
    p.face([[bx - 7, y1, 0], [bx, y1, 0], [bx + 7, y1, 0], [bx + 7, y1, 2.2], [bx, y1, 0.6], [bx - 7, y1, 2.2]], SH.left, SH.edge, 0.5);
    for (const dy of [2.5, 5, 7.5]) { p.line([[bx - 5.6, y0 + dy, 1.9], [bx - 1.2, y0 + dy, 0.9]], SH.edge, 0.5); p.line([[bx + 1.2, y0 + dy, 0.9], [bx + 5.6, y0 + dy, 1.9]], SH.edge, 0.5); }
    // the speech bubble over the tutor, three dots in it
    const b = pop(seg(h, 0.06, 0.42));
    if (b > 0) {
      const c: V3 = [tu[0], tu[1], 28.5 + Math.sin(t * 2.2) * 0.4 * h], w = 6.6 * b, hh = 4 * b, r = 2 * b;
      const body: V3[] = [];
      ([[w - r, hh - r, 0], [-(w - r), hh - r, 1], [-(w - r), -(hh - r), 2], [w - r, -(hh - r), 3]] as [number, number, number][]).forEach(([cu, cv, q]) => {
        for (let i = 0; i <= 6; i++) { const a = (q + i / 6) * (Math.PI / 2); body.push(flat(c, cu + Math.cos(a) * r, cv + Math.sin(a) * r)); }
      });
      p.face([flat(c, -3.4 * b, -hh + 0.2), flat(c, -2.6 * b, -hh - 3.4 * b), flat(c, -0.4 * b, -hh + 0.2)], 0.34, SH.edge, 0.5);
      p.face(body, 0.34, SH.edge, 0.6);
      for (const du of [-2.8, 0, 2.8]) p.dot(flat(c, du * b, 0), 0.8 * b, 0.02);
    }
    // the light over the student: a bulb and its rays
    const g = pop(seg(h, 0.55, 0.9));
    if (g > 0) {
      const c: V3 = [st[0], st[1], 19.5];
      ball(p, c, 2.7 * g, 0.38);
      p.face([flat(c, -1.1 * g, -2.4 * g), flat(c, 1.1 * g, -2.4 * g), flat(c, 1.1 * g, -4 * g), flat(c, -1.1 * g, -4 * g)], 0.2, SH.edge, 0.4);
      for (let i = 0; i < 5; i++) { const a = (i / 4) * Math.PI; p.dot(flat(c, Math.cos(a) * 5.2 * g, Math.sin(a) * 5.2 * g + 0.4), 0.6 + 0.2 * Math.sin(t * 4 + i), 1); }
    }
  },
};
