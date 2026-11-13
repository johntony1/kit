// Ready to help: a round little helper bot floating over its shadow, two tall eyes, a smile and an antenna. Hover and it bobs up, its eyes turn happy and one arm waves.
import { type Illustration, type V3 } from "../dots";

type Q = [number, number][];
const circ = (ca: number, cv: number, r: number, n = 36, rv = r): Q => Array.from({ length: n }, (_, i) => { const s = (i / n) * Math.PI * 2; return [ca + Math.cos(s) * r, cv + Math.sin(s) * rv]; });
const rrect = (a0: number, v0: number, a1: number, v1: number, r: number): Q => {
  const out: Q = [];
  const cs: [number, number, number][] = [[a1 - r, v1 - r, 0], [a0 + r, v1 - r, 1], [a0 + r, v0 + r, 2], [a1 - r, v0 + r, 3]];
  for (const [x, y, q] of cs) for (let i = 0; i <= 6; i++) { const s = ((q + i / 6) * Math.PI) / 2; out.push([x + Math.cos(s) * r, y + Math.sin(s) * r]); }
  return out;
};
const turn = (q: Q, a: number, [pa, pv]: [number, number]): Q => q.map(([x, y]) => [pa + (x - pa) * Math.cos(a) - (y - pv) * Math.sin(a), pv + (x - pa) * Math.sin(a) + (y - pv) * Math.cos(a)]);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 11, CV = 15; // body radius, body centre height

export const sidekick: Illustration = {
  k: "sidekick", name: "Sidekick", title: "Ready to help", body: "Ask a question or pick a task and your sidekick will take it from there.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h / 0.45));
    const lift = 2.5 * k + h * Math.sin(t * 3) * 0.6;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 20 - 2 * k, 9, 0.12);
    p.rotate("z", -0.62);
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a, y, v + lift] as V3);
    // the arms: stubby pills at the sides, the right one swings up and waves on hover
    const arm = rrect(-1.7, -6, 1.7, 0, 1.7);
    const left = turn(arm.map(([a, v]) => [a - R + 0.6, v + CV - 1] as [number, number]), -0.5, [-R + 0.6, CV - 1]);
    const wave = k * (2.3 + 0.35 * Math.sin(t * 9) * Math.min(1, h * 2));
    const right = turn(arm.map(([a, v]) => [a + R - 0.6, v + CV - 1] as [number, number]), 0.5 + wave, [R - 0.6, CV - 1]);
    for (let y = -3; y < -0.5; y += 0.5) { p.face(put(left, y), 0.065, 0); p.face(put(right, y), 0.065, 0); }
    p.face(put(left, -0.5), 0.14, 0);
    p.face(put(right, -0.5), 0.14, 0);
    // the antenna: a stem and a bright ball
    p.face(put(rrect(-0.6, CV + R - 1, 0.6, CV + R + 3.2, 0.5), -1.5), 0.14, 0);
    p.face(put(circ(0, CV + R + 4.4, 2.6, 20), -1.4), 0.03, 0);
    p.face(put(circ(0, CV + R + 4.4, 2, 20), -1.3), 0.45, 0);
    // the round body: depth, the lit face, a darker lower crescent
    const body = circ(0, CV, R);
    for (let y = -5; y < 0; y += 0.5) p.face(put(body, y), 0.065, 0);
    p.face(put(body, 0), 0.24, 0);
    p.face(put(circ(1.2, CV - 1.6, R - 2, 36), 0.02), 0.24, 0);
    // the face: tall dark eyes that turn into happy arcs, and a smile
    const eye = (ca: number) => {
      if (k < 0.6) p.face(put(rrect(ca - 1.4, CV + 0.6, ca + 1.4, CV + 6, 1.4), 0.1), 0.03, 0);
      else p.line(put(Array.from({ length: 7 }, (_, i) => { const s = (i / 6) * Math.PI; return [ca - Math.cos(s) * 2, CV + 2.4 + Math.sin(s) * 2.2] as [number, number]; }), 0.1), 0, 1.1);
    };
    eye(-4); eye(4);
    p.line(put(Array.from({ length: 9 }, (_, i) => { const s = Math.PI + (i / 8) * Math.PI; return [Math.cos(s) * (3 + k), CV - 2.5 + Math.sin(s) * (1.6 + k)] as [number, number]; }), 0.1), 0, 1);
  },
};
