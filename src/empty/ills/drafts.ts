// No drafts: a page on a loose stack. A pencil scribbles line after line, lifts, and the page clears for the next try.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const PERIOD = 4.2, X0 = -9;
const LINES: [number, number][] = [[-6, 9], [-1.5, 7], [3, 9], [7.5, 2]]; // y and end x of each line
const W0 = 0.05, WD = 0.7; // writing starts, writing span

const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const norm = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const facing = (n: V3) => n[0] + n[1] + n[2]; // the viewer looks down (-1,-1,-1)
const shade = (n: V3, lit: number) => (n[2] > 0.5 ? lit : n[1] >= n[0] ? 0.13 : 0.065);

/** a hexagonal pencil from its point along `dir` */
function pencil(p: Pen, tip: V3, dir: V3) {
  const a = norm(dir), b = norm(cross(a, [0, 0, 1])), c = cross(b, a), r = 1.9, N = 6;
  const ring = (at: V3, rr: number) => Array.from({ length: N }, (_, i) => { const t = (i / N) * Math.PI * 2 + 0.3; return add(add(at, b, Math.cos(t) * rr), c, Math.sin(t) * rr); });
  const cone = add(tip, a, 3.6), ferrule = add(tip, a, 15.5), end = add(tip, a, 18);
  const r0 = ring(cone, r), r1 = ring(ferrule, r), r2 = ring(end, r);
  const sides = Array.from({ length: N }, (_, i) => i).map((i) => {
    const t = ((i + 0.5) / N) * Math.PI * 2 + 0.3;
    return { i, n: add(add([0, 0, 0], b, Math.cos(t)), c, Math.sin(t)) as V3 };
  }).filter((s) => facing(s.n) > -0.05).sort((x, y) => facing(x.n) - facing(y.n));
  // a dark halo round the whole pencil, so it stands off the lit page in the dot styles
  if (!p.ink) {
    const h0 = ring(cone, r + 0.8), h1 = ring(add(end, a, 0.6), r + 0.8);
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; p.face([h0[i], h0[j], h1[j], h1[i]], 0.02, 0); p.face([h0[i], h0[j], add(tip, a, -0.6)], 0.02, 0); }
  }
  // the sharpened wood and the lead
  const graph = add(tip, a, 1.2);
  for (const { i, n } of sides) {
    const j = (i + 1) % N, m = (q: V3) => add(graph, add(q, graph, -1), 0.4);
    p.face([r0[i], r0[j], m(r0[j]), m(r0[i])], n[2] > 0.3 ? 0.2 : 0.12, 0);
    p.face([m(r0[i]), m(r0[j]), tip], 0.04, 0);
  }
  // the painted body, one lit facet in the accent, and the metal band, then the eraser
  const best = sides[sides.length - 1].i;
  for (const { i, n } of sides) {
    const j = (i + 1) % N;
    p.face([r0[i], r0[j], r1[j], r1[i]], i === best ? 0.32 : shade(n, 0.22), SH.edge, 0.5);
    p.face([r1[i], r1[j], r2[j], r2[i]], i === best ? 0.2 : shade(n, 0.2), SH.edge, 0.5);
  }
  if (facing(a) > 0) p.face(r2, 0.16, SH.edge, 0.5);
}

export const drafts: Illustration = {
  k: "drafts", name: "Drafts", title: "Nothing in drafts", body: "Anything you start and do not send yet is saved here as a draft.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(-3, 3, -7);
    p.shadow(0, 0, 30, 14, 0.1);
    // two loose sheets under the draft, a little askew
    p.push(); p.rotate("z", 0.16);
    p.box(-12.5, -10.5, 0, 25, 21, 0.7, { top: 0.12, left: 0.12, right: 0.065 });
    p.pop();
    p.push(); p.rotate("z", -0.08);
    p.box(-12.5, -10.5, 0.7, 25, 21, 0.7, { top: 0.13, left: 0.12, right: 0.065 });
    p.pop();
    // the draft itself
    p.box(-12.5, -10.5, 1.4, 25, 21, 0.6, { top: 0.22 });
    const Z = 2.05;
    const fade = u < 0.84 ? 1 : u > 0.95 ? 0 : 1 - easeInOut((u - 0.84) / 0.11);
    // where the point is: writing a line, travelling to the next, or going home
    const k = Math.max(0, Math.min(4, ((u - W0) / WD) * 4));
    const slot = Math.min(3, Math.floor(k)), fr = k - slot;
    const wob = (x: number, y: number): V3 => [x, y + Math.sin(x * 1.3) * 0.55, Z];
    let nib: V3, lift = 0;
    if (u >= W0 + WD) {
      const g = easeInOut(Math.min(1, (u - W0 - WD) / (1 - W0 - WD)));
      const [y, x1] = LINES[3];
      nib = [x1 + (X0 - x1) * g, y + (LINES[0][0] - y) * g, Z]; lift = Math.sin(g * Math.PI) * 5;
    } else if (u < W0) nib = wob(X0, LINES[0][0]);
    else {
      const [y, x1] = LINES[slot];
      if (fr < 0.8) nib = wob(X0 + (x1 - X0) * (fr / 0.8), y);
      else {
        const g = easeInOut((fr - 0.8) / 0.2), n = LINES[slot + 1] ?? LINES[slot];
        nib = [x1 + (X0 - x1) * g, y + (n[0] - y) * g, Z]; lift = Math.sin(g * Math.PI) * 2.5;
      }
    }
    // the scribbles so far, and dashed guides where the rest will go
    LINES.forEach(([y, x1], i) => {
      const done = u >= W0 + WD ? 1 : i < slot ? 1 : i === slot ? Math.min(1, fr / 0.8) : 0;
      const xe = X0 + (x1 - X0) * done;
      if (done < 1) p.guide([wob(Math.max(X0, xe), y), [x1, y, Z]]);
      if (done <= 0 || fade < 0.05 || (p.ink && fade < 0.5)) return;
      const pts: V3[] = [];
      for (let x = X0; x <= xe + 0.01; x += 0.5) pts.push(wob(Math.min(x, xe), y));
      if (pts.length > 1) p.line(pts, SH.edge * fade, 1.05);
    });
    pencil(p, [nib[0], nib[1], nib[2] + lift], [0.62, -0.22, 0.75]);
  },
};
