// Football: a classic black and white football resting on the ground. Hover and it pops up into the air and spins, as if being juggled.
import { SH, type Illustration, type V3 } from "../dots";

const RW = 12.5, RS = RW * 1.2247; // the ball's radius in the world and on screen
const VIEW: V3 = [0.4082, 0.4082, 0.8165];
const AX: V3 = [0.7071, -0.7071, 0]; // the rolling axis: screen right
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mixv = (a: V3, b: V3, k: number): V3 => norm([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]);
/** v turned round the unit axis k by angle a */
const turn = (v: V3, k: V3, a: number): V3 => {
  const c = Math.cos(a), s = Math.sin(a), kv = dot(k, v), x = cross(k, v);
  return [v[0] * c + x[0] * s + k[0] * kv * (1 - c), v[1] * c + x[1] * s + k[1] * kv * (1 - c), v[2] * c + x[2] * s + k[2] * kv * (1 - c)];
};
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// the twelve black patches sit on the corners of an icosahedron
const F = 1.618;
const ICO: V3[] = ([[0, 1, F], [0, -1, F], [0, 1, -F], [0, -1, -F], [1, F, 0], [-1, F, 0], [1, -F, 0], [-1, -F, 0], [F, 0, 1], [F, 0, -1], [-F, 0, 1], [-F, 0, -1]] as V3[]).map(norm);

export const football: Illustration = {
  k: "football", name: "Football", title: "No matches scheduled", body: "Schedule a match and the fixture will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    const lift = 8 * e + h * Math.sin(t * 3) * 1.3;
    const spin = 0.5 + e * 1.9 + h * Math.sin(t * 1.5) * 0.35;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 25 - 6 * e, 12.5 - 3 * e, 0.13 - 0.04 * e);
    const C: V3 = [0, 0, RW + lift];
    const at = (n: V3, r = RW): V3 => [C[0] + n[0] * r, C[1] + n[1] * r, C[2] + n[2] * r];
    const disc = (r: number, du: number, dv: number): V3[] => Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2, u = Math.cos(a) * r + du; return [C[0] + u * 0.5774, C[1] - u * 0.5774, C[2] + Math.sin(a) * r + dv] as V3; });
    // the ball: a shaded rim and a lit face pulled towards the light
    p.face(disc(RS, 0, 0), 0.13, 0);
    p.face(disc(RS * 0.86, -RS * 0.1, RS * 0.1), 0.3, 0);
    const V = ICO.map((v) => turn(turn(v, [0, 0, 1], 0.4), AX, spin));
    // a point round the back is pressed onto the rim, so patches are cut by the edge
    const rim = (n: V3): V3 => { const k = dot(n, VIEW); return k > 0 ? n : norm([n[0] - VIEW[0] * k, n[1] - VIEW[1] * k, n[2] - VIEW[2] * k]); };
    V.forEach((c, i) => {
      const nb = V.filter((v, j) => j !== i && dot(v, c) > 0.4);
      const t1 = norm(cross(c, Math.abs(c[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), t2 = cross(c, t1);
      nb.sort((a, b) => Math.atan2(dot(a, t2), dot(a, t1)) - Math.atan2(dot(b, t2), dot(b, t1)));
      // the seams, from each corner of a patch out to the next patch: hairlines in the dot styles
      for (const v of nb) {
        const a = mixv(c, v, 0.36), b = mixv(c, v, 0.64);
        if (dot(a, VIEW) > 0.04 && dot(b, VIEW) > 0.04) p.line([at(a, RW + 0.02), at(mixv(c, v, 0.5), RW + 0.02), at(b, RW + 0.02)], SH.edge, p.ink ? 0.6 : 0.3);
      }
      if (dot(c, VIEW) < -0.12) return;
      p.clear(nb.map((v) => at(rim(mixv(c, v, 0.36)), RW + 0.02)));
    });
    p.line([...disc(RS, 0, 0), disc(RS, 0, 0)[0]], SH.edge, 0.6);
  },
};
