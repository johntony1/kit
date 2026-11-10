// No announcements: a megaphone. Every couple of seconds it kicks back a little and sends three sound arcs out of its mouth.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per shout
// the profile along the axis: [distance, radius], from the mouthpiece to the bell
const PROF: [number, number][] = [[0, 2.4], [2.6, 2.4], [3, 3.1], [6, 3.6], [12, 5.6], [18, 8.4], [21.5, 10.4], [22.4, 10.4]];
const L = 22.4, R = 10.4;
const N = 28;

const norm = (v: V3): V3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const crs = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const D = norm([1, -0.4, 0.2]); // the axis, pointing right, tipped up and a little toward us
const U = norm(crs([0, 0, 1], D)), V = crs(D, U);

/** a point on the megaphone: distance along the axis, angle round it, radius */
const at = (o: V3, x: number, a: number, r: number): V3 => [0, 1, 2].map((i) => o[i] + D[i] * x + (U[i] * Math.cos(a) + V[i] * Math.sin(a)) * r) as V3;

function body(p: Pen, o: V3) {
  const quads: { q: V3[]; d: number; fill: number }[] = [];
  for (let k = 0; k < PROF.length - 1; k++) {
    const [x0, r0] = PROF[k], [x1, r1] = PROF[k + 1];
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
      const q = [at(o, x0, a0, r0), at(o, x0, a1, r0), at(o, x1, a1, r1), at(o, x1, a0, r1)];
      // outward normal: radial, tipped back where the cone widens
      const s = (r1 - r0) / Math.max(0.01, x1 - x0);
      const n = norm([0, 1, 2].map((j) => U[j] * Math.cos(am) + V[j] * Math.sin(am) - D[j] * s) as V3);
      if (n[0] + n[1] + n[2] <= 0) continue;
      const fill = n[2] > 0.5 ? 0.24 : n[1] > n[0] - 0.15 && n[2] > -0.45 ? SH.left : SH.right;
      quads.push({ q, d: q.reduce((sum, v) => sum + v[0] + v[1] + v[2], 0), fill });
    }
  }
  quads.sort((a, b) => a.d - b.d).forEach((f) => p.face(f.q, f.fill, 0));
}
/** the half of a ring round the axis that faces us */
const front = (o: V3, x: number, r: number) => {
  const vis = (a: number) => [0, 1, 2].reduce((s, j) => s + U[j] * Math.cos(a) + V[j] * Math.sin(a), 0) > 0;
  let a0 = 0;
  while (vis(a0) || !vis(a0 + 0.05)) a0 += 0.05;
  const out: V3[] = [];
  for (let a = a0 + 0.05; vis(a) && a < a0 + 7; a += 0.08) out.push(at(o, x, a, r));
  return out;
};
const ring = (o: V3, x: number, r: number, n = 36) => Array.from({ length: n }, (_, i) => at(o, x, (i / n) * Math.PI * 2, r));

export const megaphone: Illustration = {
  k: "megaphone", name: "Megaphone", title: "No announcements", body: "News and updates from your team will be posted here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // a quick kick back as it shouts, then it eases forward again
    const kick = u < 0.08 ? u / 0.08 : Math.exp(-(u - 0.08) * 7);
    p.translate(0, 0, -17);
    p.shadow(-2, 2, 22, 8, 0.1);
    const o: V3 = [-16 - kick * 1.4 * D[0], 4 - kick * 1.4 * D[1], 13 - kick * 1.4 * D[2]];
    // the handle and the trigger, under the cone
    const hb = at(o, 6.5, -Math.PI / 2, 2.6);
    p.box(hb[0] - 1.6, hb[1] - 1.6, hb[2] - 9, 3.2, 3.2, 8, { top: 0.26 });
    p.box(hb[0] + 1.6, hb[1] - 0.8, hb[2] - 4.2, 1.6, 1.6, 2.6, { top: 0.26, left: 0.2 });
    body(p, o);
    // ridges round the cone, cut
    for (const [x, r] of [[3.4, 3.2], [19.6, 9.3]]) p.line(front(o, x, r), SH.edge, 0.7);
    // the mouth: a lit rim round the dark inside
    p.face(ring(o, L, R), 0.3, 0);
    p.face(ring(o, L + 0.05, R - 1.3), 0.02, 0);
    // the sound: three arcs leaving the mouth, brightest as they leave
    const [mx, my] = p.pt(at(o, L, 0, 0));
    const [dx, dy] = p.pt(at(o, L + 10, 0, 0));
    const ang = Math.atan2(dy - my, dx - mx);
    p.screen((c) => {
      c.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const f = (u - i * 0.1) / 0.62;
        if (f <= 0 || f >= 1) continue;
        const r = 9 + f * 13, a = Math.min(1, (1 - f) * 1.6);
        const n = Math.round(255 * a);
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.2;
        c.beginPath(); c.arc(mx, my, r, ang - 0.55, ang + 0.55); c.stroke();
      }
    });
  },
};
