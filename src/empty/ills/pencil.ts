// No drafts: a pencil writes a looping line across a blank page, lifts, and the line fades away before it starts again.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 5; // seconds per loop
const PZ = 0.9; // the top of the page
const N = 140; // segments in the written line
// the written line: small cursive loops running across the page
const path = (s: number): V3 => [-12 + 22 * s - 0.95 * Math.sin(Math.PI * 2 * 6 * s), 1.5 + 1.7 * Math.cos(Math.PI * 2 * 6 * s) - 1.7, PZ + 0.02];
const rnd = (i: number) => ((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1;

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
const vis = (n: V3) => n[0] + n[1] + n[2] > 0;
const LIGHT = norm([-0.2, 0.75, 0.6]);
const lit = (n: V3) => n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];

const AX = norm([0.6, -0.5, 0.6]); // from the tip towards the eraser
const E1 = norm(cross(AX, [0, 0, 1]));
const E2 = cross(AX, E1);
const R = 2.7; // radius of the hexagon
const ang = (k: number) => (k / 6) * Math.PI * 2 + Math.PI / 6;
const radial = (a: number): V3 => add(mul(E1, Math.cos(a)), mul(E2, Math.sin(a)));

/** the visible faces of the hexagon, brightest first, each with its tone: lit, dense, sparse */
const FACES = Array.from({ length: 6 }, (_, i) => ({ i, n: radial((ang(i) + ang(i + 1)) / 2) }))
  .filter((f) => vis(f.n))
  .sort((a, b) => lit(b.n) - lit(a.n))
  .map((f, k) => ({ i: f.i, tone: [SH.top, SH.left, SH.right][Math.min(2, k)] }));

/** a hexagonal stretch of the pencil from s0 to s1 along its axis */
function hex(p: Pen, tip: V3, s0: number, s1: number, rings: number[] = [], halo = 0) {
  const at = (s: number, a: number) => add(add(tip, mul(AX, s)), mul(radial(a), R + halo));
  for (const { i, tone } of FACES) {
    const quad = [at(s0, ang(i)), at(s0, ang(i + 1)), at(s1, ang(i + 1)), at(s1, ang(i))];
    if (halo) { p.clear(quad); continue; }
    p.face(quad, tone, 0);
    for (const s of rings) p.line([at(s, ang(i)), at(s, ang(i + 1))], SH.edge, 0.6);
  }
}

export const pencil: Illustration = {
  k: "pencil", name: "Pencil", title: "No drafts", body: "Anything you start writing and save for later will wait for you here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // f: how far along the line the pencil is; lift: how high it is; gone: how much of the line has faded
    let f = 0, lift = 0, gone = 0, shown = 1;
    if (u < 0.6) { f = u / 0.6; shown = f; }
    else if (u < 0.68) { f = 1; lift = easeInOut((u - 0.6) / 0.08); }
    else if (u < 0.9) { const k = easeInOut((u - 0.68) / 0.22); f = 1 - k; lift = 1; gone = Math.min(1, ((u - 0.68) / 0.18)); }
    else { f = 0; lift = 1 - easeInOut((u - 0.9) / 0.1); gone = 1; }
    p.translate(-3, 3, -11);
    p.shadow(0, 0, 28, 13, 0.1);
    // the page, with a second sheet peeking out underneath
    p.push(); p.rotate("z", 0.06, [0, 0, 0]);
    p.box(-15, -12, 0, 30, 24, 0.5, { top: 0.12, left: 0.12, right: 0.065 });
    p.pop();
    p.box(-15, -12, 0.5, 30, 24, PZ - 0.5, { top: SH.top, left: 0.12, right: 0.065 });
    // the written line, fading out cell by cell
    if (shown > 0) {
      const m = Math.round(N * shown);
      for (let i = 0; i < m; i++) {
        if (rnd(i) < gone) continue;
        p.line([path(i / N), path(Math.min(shown, (i + 1) / N))], SH.edge, 0.9);
      }
    }
    // the pencil
    const tip = add(path(f), [0, 0, lift * 4.5]);
    // the sharpened wood, then the lead at the very tip
    const cone = (s0: number, s1: number, fill: number, halo = 0) => {
      for (let i = 0; i < 6; i++) {
        const a0 = ang(i), a1 = ang(i + 1);
        const r0 = (R * s0) / 6.5 + halo, r1 = (R * s1) / 6.5 + halo;
        const n = norm(add(radial((a0 + a1) / 2), mul(AX, -R / 6.5)));
        if (!vis(n)) continue;
        const pt = (s: number, a: number, r: number) => add(add(tip, mul(AX, s)), mul(radial(a), r));
        const q = [pt(s0, a0, r0), pt(s0, a1, r0), pt(s1, a1, r1), pt(s1, a0, r1)];
        if (halo) p.clear(q); else p.face(q, fill, 0);
      }
    };
    // a dark halo first, so the pencil stands clear of the page
    cone(1.2, 6.5, 0, 0.8);
    hex(p, tip, 6.5, 26.8, [], 0.9);
    p.clear(Array.from({ length: 6 }, (_, i) => add(add(tip, mul(AX, 26.8)), mul(radial(ang(i)), R + 0.9))));
    cone(2, 6.5, SH.top);
    cone(0.05, 2, 0.035);
    hex(p, tip, 6.5, 21.4, [6.6]);
    // the ferrule and the eraser
    hex(p, tip, 21.4, 23.6, [21.5, 22.6]);
    hex(p, tip, 23.6, 26, [23.7]);
    // the eraser's end
    const end = Array.from({ length: 6 }, (_, i) => add(add(tip, mul(AX, 26)), mul(radial(ang(i)), R)));
    p.face(end, 0.12, 0);
  },
};
