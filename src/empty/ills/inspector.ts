// Nothing to inspect: a big magnifying glass standing on its edge. It drifts back and forth in a slow figure eight, and a beetle shows up magnified in the glass wherever the lens passes over it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 4, R = 12.5, RI = 9.6; // loop seconds, outer and inner radius of the rim
const BX = -3, BV = 21; // where the beetle sits, behind the glass
const circ = (cx: number, cv: number, r: number, n = 40): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cv + Math.sin(a) * r] as P2; });
const on = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
function slab(p: Pen, faces: (y: number) => V3[], d: number, front: number) {
  for (let y = -d; y < 0; y += 0.6) p.face(faces(y), y < -d / 2 ? SH.right : 0.1, 0);
  p.face(faces(0), front, 0);
}
// the beetle, dark on the lit glass: shell, head, six legs and two feelers
function beetle(p: Pen) {
  const y = 0.08, ell = (cu: number, cv: number, ru: number, rv: number): V3[] => Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [cu + Math.cos(a) * ru, y, cv + Math.sin(a) * rv] as V3; });
  for (const s of [-1, 1]) {
    for (const [v0, du, dv] of [[2, 3.4, 2.4], [0, 4, 0], [-2, 3.4, -2.6]] as [number, number, number][]) p.line([[BX + s * 2.4, y, BV + v0], [BX + s * (2.4 + du), y, BV + v0 + dv * 0.4], [BX + s * (2.8 + du), y, BV + v0 + dv]], SH.edge, 0.9);
    p.line([[BX + s * 0.7, y, BV + 5.6], [BX + s * 1.8, y, BV + 7.6], [BX + s * 3, y, BV + 8.2]], SH.edge, 0.8);
  }
  p.clear(ell(BX, BV - 0.6, 3.3, 4.4));
  p.clear(ell(BX, BV + 4.6, 1.9, 1.6));
  p.face(ell(BX - 1.1, BV + 0.4, 0.8, 1.6), 0.2, 0); // a glint on the shell
}

export const inspector: Illustration = {
  k: "inspector", name: "Debugger", title: "Nothing to inspect", body: "Pause your program at a breakpoint and its state will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    p.translate(0, 0, -17);
    p.shadow(2, 0, 26, 10, 0.1);
    p.rotate("z", -0.62);
    const cx = BX + 4.5 * Math.sin(w), cv = BV + 1.6 * Math.sin(w * 2);
    // the handle, out from the rim toward the lower right
    const a = -0.85, ca = Math.cos(a), sa = Math.sin(a), hw = 2.3;
    const hd: P2[] = [[R - 1, -hw], [R + 13, -hw * 1.15], [R + 13, hw * 1.15], [R - 1, hw]].map(([s, n]) => [cx + ca * s - sa * n, cv + sa * s + ca * n] as P2);
    slab(p, (y) => on(hd, y), 3, 0.24);
    p.line(on([[cx + ca * (R + 3), cv + sa * (R + 3)], [cx + ca * (R + 3) + 0.01, cv + sa * (R + 3) + 0.01]], 0.05), SH.edge, 0);
    // the rim: a thick ring
    const o = circ(cx, cv, R), i = circ(cx, cv, RI);
    slab(p, (y) => [...on(o, y), on(o, y)[0], on(i, y)[0], ...on(i, y).reverse()], 3, 0.26);
    p.line(on([...i, i[0]], 0.03), SH.edge, 0.7);
    // the glass, lit, with the beetle seen only through it
    p.face(on(i, -0.4), 0.2, 0);
    const ring = i.map(([x, v]) => p.pt([x, 0, v]));
    p.screen((c) => {
      c.beginPath(); ring.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      beetle(p);
    });
    // a bright glint across the glass
    const gl = Array.from({ length: 9 }, (_, k) => { const b = 1.9 + (k / 8) * 0.9; return p.pt([cx + Math.cos(b) * (RI - 2.2), 0.1, cv + Math.sin(b) * (RI - 2.2)]); });
    p.screen((c) => { c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.lineCap = "round"; c.beginPath(); gl.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); });
  },
};

