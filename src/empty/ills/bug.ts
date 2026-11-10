// Something went wrong: a little beetle crawling round a slab, legs stepping in tripods, antennae feeling the way.
import { SH, type Illustration, type V3 } from "../dots";

const PERIOD = 8;
const STEPS = 16; // steps per lap, a whole number so the loop is seamless
const SX = 20, SY = 14, SZ = 3.5; // slab half width, half depth, height

// an ellipse in the beetle's own frame (forward is +x)
const ell = (cx: number, rx: number, ry: number, z: number, n = 28): V3[] =>
  Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, Math.sin(a) * ry, z] as V3; });

// a stadium lap: straight along the front, a turn, back along the far side, a turn
const L = 8, RT = 3.6, LAP = 2 * L + 2 * Math.PI * RT;
function lap(u: number): [number, number, number] {
  let d = u * LAP;
  if (d < L) return [-L / 2 + d, RT, 0];
  d -= L;
  if (d < Math.PI * RT) { const a = d / RT; return [L / 2 + Math.sin(a) * RT, Math.cos(a) * RT, -a]; }
  d -= Math.PI * RT;
  if (d < L) return [L / 2 - d, -RT, -Math.PI];
  d -= L;
  const a = d / RT;
  return [-L / 2 - Math.sin(a) * RT, -Math.cos(a) * RT, -Math.PI - a];
}

export const bug: Illustration = {
  k: "bug", name: "Bug", title: "Something went wrong", body: "We hit an unexpected error. Try again, and if it keeps happening, let us know.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -6);
    p.shadow(0, 0, 30, 15, 0.12);
    // the slab, with a couple of seams cut into its lit top
    p.box(-SX, -SY, 0, SX * 2, SY * 2, SZ, { top: 0.2, left: 0.12, right: 0.065 });
    p.line([[-SX + 2.5, -SY + 2.5, SZ + 0.02], [-SX + 2.5, SY - 2.5, SZ + 0.02], [SX - 2.5, SY - 2.5, SZ + 0.02]], SH.edge, 0.4);

    // the path: a lap of the slab, two straights and two turns, heading along it
    const [bx, by, head] = lap(u);
    p.push();
    p.translate(bx, by, SZ + 0.02);
    p.rotate("z", head);
    p.scale(1.45);
    const ph = u * Math.PI * 2 * STEPS;
    // legs: three a side, cut into the slab as dark lines, two tripods stepping in turn
    for (const s of [-1, 1]) for (let i = -1; i <= 1; i++) {
      const tri = (i === 0 ? -s : s) > 0 ? 0 : Math.PI;
      const sw = Math.sin(ph + tri) * 1.1, lift = Math.max(0, Math.cos(ph + tri)) * 0.5;
      const hip: V3 = [i * 1.9, s * 2.2, 0.8];
      const knee: V3 = [i * 2.4 + sw * 0.6, s * 4.3, 1.4 + lift];
      const foot: V3 = [i * 3.2 + sw, s * 5.6, 0];
      p.line([hip, knee, foot], SH.edge, 0.75);
    }
    // antennae, feeling about
    for (const s of [-1, 1]) {
      const f = Math.sin(t * 3.1 + s) * 0.5;
      p.line([[6.6, s * 0.6, 1], [8.4, s * (1.5 + f), 1.2], [9.8, s * (2.5 + f), 1.1]], SH.edge, 0.6);
    }
    // the body is a dark silhouette on the lit slab: head, the plate behind it, then the domed shell
    p.clear(ell(6.4, 1.5, 1.5, 0.6));
    for (let k = 0; k < 4; k++) { const e = k / 4, r = Math.sqrt(1 - e * e); p.clear(ell(4.3, 2 * r, 2.5 * r, 0.6 + e * 1.6)); }
    const K = 7;
    for (let k = 0; k < K; k++) { const e = k / K, r = Math.sqrt(1 - e * e); p.clear(ell(-0.6, 4.8 * r, 3.8 * r, 0.6 + e * 3.4)); }
    // a glint of light on the shell and on the plate
    p.face(ell(-0.8, 2.3, 1.6, 2.5), 0.24, 0);
    p.face(ell(4.4, 0.7, 1, 1.5), 0.18, 0);
    // where the wing cases meet
    p.line([[2.6, 0, 2.6], [-4.6, 0, 2.6]], SH.edge, 0.7);
    p.pop();
  },
};
