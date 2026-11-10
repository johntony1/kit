// Nothing here yet: a little pot of soil. A sprout pushes up, unfurls two leaves, rests swaying, then sinks back to start again.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 5.6; // seconds per loop
const PR = 7.6, PH = 12, RIM = 10, RH = 3; // pot radius at the foot, pot height, rim radius, rim height
const ZS = PH + RH - 1; // the soil's height
const S2 = Math.SQRT1_2;
const clamp = (x: number) => Math.max(0, Math.min(1, x));

/** a tapered pot wall: the visible half of a cone, split into a dense left part and a sparse right part */
function wall(p: Pen, z0: number, z1: number, r0: number, r1: number) {
  const N = 32;
  const side = (a0: number, a1: number, f: number) => {
    const pts: V3[] = [];
    for (let i = 0; i <= N; i++) { const a = a0 + ((a1 - a0) * i) / N; pts.push([Math.cos(a) * r0, Math.sin(a) * r0, z0]); }
    for (let i = N; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / N; pts.push([Math.cos(a) * r1, Math.sin(a) * r1, z1]); }
    p.face(pts, f, 0);
  };
  side(-Math.PI / 4, Math.PI / 5, SH.right); // facing +x: the shaded side
  side(Math.PI / 5, (Math.PI * 3) / 4, SH.left); // facing +y: the lit wall
}
const ring = (r: number, z: number, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
const front = (r: number, z: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });

/** a leaf from base b, pointing along the screen horizontal (side s), raised by angle el, grown by g */
function leaf(p: Pen, b: V3, s: 1 | -1, el: number, g: number, fill: number) {
  if (g <= 0.02) return;
  const L = 9 * g, Wd = 3.6 * g;
  // the leaf's long axis (out to the side, tipped up by el) and its width (towards us)
  const ax: V3 = [s * S2 * Math.cos(el), -s * S2 * Math.cos(el), Math.sin(el)];
  const wx: V3 = [S2 * 0.8, S2 * 0.8, -0.35 * Math.cos(el)];
  const at = (u: number, v: number): V3 => [b[0] + ax[0] * u + wx[0] * v, b[1] + ax[1] * u + wx[1] * v, b[2] + ax[2] * u + wx[2] * v];
  const N = 14, edge: V3[] = [];
  for (let i = 0; i <= N; i++) { const u = i / N; edge.push(at(u * L, Math.sin(Math.PI * Math.pow(u, 0.8)) * Wd)); }
  for (let i = N; i >= 0; i--) { const u = i / N; edge.push(at(u * L, -Math.sin(Math.PI * Math.pow(u, 0.8)) * Wd * 0.7)); }
  p.face(edge, fill, 0);
  // the midrib and two veins, as cuts
  p.line([at(L * 0.08, 0), at(L * 0.86, 0)], SH.edge, 0.6);
  if (g > 0.6) for (const k of [0.35, 0.6]) p.line([at(L * k, 0), at(L * (k + 0.16), Wd * 0.62)], SH.edge, 0.5);
}

export const plant: Illustration = {
  k: "plant", name: "Sprout", title: "Nothing here yet", body: "Plant the first seed. What you add will start growing here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // grow the stem, unfurl the leaves, rest, then sink back into the soil
    const sink = easeInOut(clamp((u - 0.86) / 0.12));
    const grow = easeInOut(clamp((u - 0.04) / 0.3)) * (1 - sink);
    const open = easeInOut(clamp((u - 0.28) / 0.28)) * (1 - sink);
    const sway = Math.sin(u * Math.PI * 2 * 2) * 0.6 * open;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 21, 10.5, 0.12);
    // the pot: tapered wall, a rim band, then the soil inside the rim
    wall(p, 0, PH, PR, RIM - 0.6);
    p.line(front(PR, 0.2), SH.edge, 0.6);
    // the rim
    wall(p, PH, PH + RH, RIM, RIM);
    p.face(ring(RIM, PH + RH), SH.top, 0);
    p.line(front(RIM, PH + 0.05), SH.edge, 0.7);
    // soil, a little below the rim, with a few crumbs cut into it
    p.face(ring(RIM - 1.6, PH + RH), 0.04, 0);
    p.line(front(RIM - 1.6, PH + RH), SH.edge, 0.5);
    // a cut band around the belly of the pot
    p.line(front((PR + RIM - 0.6) / 2 + 0.05, PH * 0.55), SH.edge, 0.6);
    // the sprout: a stem rising from the soil, bending a little, and its two leaves
    const sh = 13 * grow;
    if (sh > 0.3) {
      const pts: V3[] = Array.from({ length: 12 }, (_, i) => {
        const k = i / 11, z = ZS + sh * k;
        const bend = Math.sin(k * Math.PI * 0.9) * 1.2 + sway * k * k;
        return [bend * S2, -bend * S2, z] as V3;
      });
      // the seed casing pushed up beside it
      if (grow > 0.15) p.dot([1.8, 1.4, ZS + 0.6], 1.1 * Math.min(1, grow * 2), 0.6);
      p.screen((c) => {
        const q = pts.map((v) => p.pt(v));
        c.strokeStyle = "rgb(235,235,235)"; c.lineCap = "round"; c.lineJoin = "round";
        c.lineWidth = 1.5; c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      });
      const top = pts[pts.length - 1];
      // folded up together while growing, then they open out to the sides
      const el = 1.35 - open * 1.05;
      leaf(p, top, -1, el + sway * 0.15, 0.35 + 0.65 * open, SH.left + 0.04);
      leaf(p, top, 1, el - sway * 0.15, 0.35 + 0.65 * open, SH.top + 0.05);
      // the tip bud while it is still closed
      if (open < 0.4) p.dot([top[0], top[1], top[2] + 1], 1.2 * (1 - open / 0.4), 1);
    }
  },
};
