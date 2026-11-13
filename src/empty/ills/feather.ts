// Nothing written yet: a big quill feather standing on its nib. Hover and it glides along, writing a loopy line under it.
import { SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const D = 1.4; // thickness
const A = 1.05; // the feather leans right, nib at the bottom left
const L = 38; // the feather from nib to tip
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);
const on = (s: number, v: number, ox: number): P2 => [ox - 12 + Math.cos(A) * s - Math.sin(A) * v, -14 + Math.sin(A) * s + Math.cos(A) * v];
/** the vane's half width at u along the feather (0 at the nib) */
const vane = (u: number, side: number) => (u < 0.22 ? 0 : (side > 0 ? 9.5 : 5.6) * Math.pow(Math.sin(Math.PI * ((u - 0.22) / 0.78) * 0.92), 0.6));
const half = (side: 1 | -1, ox: number): P2[] => [...Array.from({ length: 25 }, (_, i) => { const u = 0.22 + (i / 24) * 0.78; return on(u * L, side * vane(u, side), ox); }), on(0.22 * L, 0, ox)];

export const feather: Illustration = {
  k: "feather", name: "Feather", title: "Nothing written yet", body: "Write your first entry and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h), ox = 14 * e;
    p.translate(0, 0, 2);
    p.push(); p.translate(0, 0, -20); p.shadow(0, 0, 17, 6, 0.1); p.pop();
    p.rotate("z", -0.6); // turned to face us
    // the written line: loops trailing from where the nib started to where it is now
    if (e > 0.02) {
      const pts = Array.from({ length: 61 }, (_, i) => { const s = (i / 60) * ox; return p.pt([-12 + s - Math.sin(s * 0.9) * 1.6, 0, -14 - 1.2 + Math.cos(s * 0.9) * 1.8 - 1.8]); });
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
    }
    p.push();
    p.rotate("y", h * Math.sin(t * 9) * 0.02, [ox - 12, 0, -14]);
    // the vane: a shaded edge behind, then the lit half and the shaded half
    const up = half(1, ox), dn = half(-1, ox);
    for (let y = -D; y < 0; y += 0.35) { p.face(at(up, y), 0.08, 0); p.face(at(dn, y), 0.08, 0); }
    p.face(at(up), 0.3, 0);
    p.face(at(dn), 0.13, 0);
    // two notches split the vane
    for (const [u, s] of [[0.55, 1], [0.72, -1], [0.82, 1]] as [number, number][]) p.line(at([on(u * L, 0, ox), on((u + 0.08) * L, s * vane(u + 0.08, s) * 1.05, ox)], 0.05), SH.edge, 1);
    // the shaft, cut along the vane, and the bare quill below it, bright, down to the nib
    p.line(at([on(L * 0.22, 0, ox), on(L * 0.97, 0, ox)], 0.05), SH.edge, 0.5);
    const sp = [on(0, 0, ox), on(L * 0.24, 0, ox)].map(([x, z]) => p.pt([x, 0.4, z]));
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineWidth = 1.9; g.beginPath(); g.moveTo(sp[0][0], sp[0][1]); g.lineTo(sp[1][0], sp[1][1]); g.stroke(); });
    p.pop();
  },
};
