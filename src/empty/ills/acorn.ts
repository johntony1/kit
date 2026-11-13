// Nothing planted yet: one big acorn, a smooth nut under a scaly cap with a stalk. Hover and the cap pops up with a bounce and settles back, tilted.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const turn = ([u, v]: P2, [pu, pv]: P2, a: number): P2 => { const c = Math.cos(a), s = Math.sin(a); return [pu + (u - pu) * c - (v - pv) * s, pv + (u - pu) * s + (v - pv) * c]; };
const NW = 11, NH = 24; // the nut's half width and height

// the nut: round at the top, drawn to a soft point at the bottom
const nut = (a: number, k = 1): P2 => {
  const s = Math.sin(a), c = Math.cos(a);
  const w = NW * k * (s < 0 ? 1 - 0.45 * s * s : 1);
  return [c * w, 14 + s * (s < 0 ? NH - 10 : 4) * k * (s < 0 ? 1.4 : 1)];
};

function cap(p: Pen, at: (q: P2) => P2) {
  const CW = 13, Z = 13, T = 22.5;
  const dome: P2[] = [];
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI; dome.push([Math.cos(a) * CW, Z + 1.6 + Math.sin(a) * (T - Z - 1.6)]); }
  dome.push([-CW + 0.4, Z], [-CW + 1.6, Z - 1.4], [CW - 1.6, Z - 1.4], [CW - 0.4, Z]);
  p.face(dome.map(at).map(B), 0.13, 0);
  // a shaded right side of the cap
  const sh: P2[] = [];
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * 1.1; sh.push([Math.cos(a) * CW, Z + 1.6 + Math.sin(a) * (T - Z - 1.6)]); }
  for (let i = 10; i >= 0; i--) { const a = (i / 10) * 1.1; sh.push([Math.cos(a) * CW * 0.62, Z + 0.6 + Math.sin(a) * (T - Z - 1.6) * 0.9]); }
  p.face(sh.map(at).map(B), 0.065, 0);
  p.line([...dome, dome[0]].map(at).map(B), SH.edge, 0.6);
  // the scales: two rows of arcs across the cap
  for (const [v, w] of [[16.4, 12], [19.6, 9]] as P2[]) {
    p.line(Array.from({ length: 13 }, (_, i) => { const x = -w + (i / 12) * 2 * w; return [x, v - 0.9 * Math.abs(Math.sin((x / w) * Math.PI * 2.5))] as P2; }).map(at).map(B), SH.edge, 0.6);
  }
  // the stalk
  p.face(([[-1.2, T - 0.6], [1.2, T - 0.6], [2.2, T + 4.2], [0, T + 4.6]] as P2[]).map(at).map(B), 0.3, SH.edge, 0.55);
}

export const acorn: Illustration = {
  k: "acorn", name: "Acorn", title: "Nothing planted yet", body: "Plant your first idea and watch it grow from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.scale(1.18);
    p.push(); p.translate(0, 0, -9); p.shadow(0, 0, 17, 7, 0.12); p.pop();
    // the nut: lit, a shaded crescent on its lower right, a cut rim and a shine
    const out = Array.from({ length: 48 }, (_, i) => nut((i / 48) * Math.PI * 2));
    p.face(out.map(B), 0.24, 0);
    const sh: P2[] = [];
    for (let i = 0; i <= 20; i++) sh.push(nut(-2.2 + (i / 20) * 2.6));
    for (let i = 20; i >= 0; i--) { const [u, v] = nut(-2.2 + (i / 20) * 2.6, 0.98), f = Math.sin((i / 20) * Math.PI); sh.push([u - 2.6 * f, v + 1.6 * f]); }
    p.face(sh.map(B), 0.08, 0);
    p.line([...out, out[0]].map(B), SH.edge, 0.6);
    // the cap: hops up past its rest and lands back with a tilt
    const k = Math.min(1, h * 1.25);
    const hop = k < 0.5 ? 7 * Math.sin((k / 0.5) * Math.PI * 0.5) : 7 * Math.cos(((k - 0.5) / 0.5) * Math.PI * 0.5) + (k > 0.85 ? 1.2 * Math.sin(((k - 0.85) / 0.15) * Math.PI) : 0);
    const tilt = -0.22 * k + h * Math.sin(t * 4) * 0.03;
    cap(p, (q) => turn([q[0], q[1] + hop], [0, 13 + hop], tilt));
  },
};
