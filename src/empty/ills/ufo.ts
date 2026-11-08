// Page not found: a flying saucer hovers over the ground, its beam pulsing, lifting stray pages up into it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop
const ZS = 22; // saucer height
/** the visible half of a cone section around the z axis */
const frustum = (p: Pen, z0: number, r0: number, z1: number, r1: number, fill: number, edge = SH.edge, lw = 0.55) => {
  const N = 40, pts: V3[] = [];
  for (let i = 0; i <= N / 2; i++) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([Math.cos(a) * r0, Math.sin(a) * r0, z0]); }
  for (let i = N / 2; i >= 0; i--) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([Math.cos(a) * r1, Math.sin(a) * r1, z1]); }
  p.face(pts, fill, edge, lw);
};
const ring = (z: number, r: number, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const ufo: Illustration = {
  k: "ufo", name: "Flying saucer", title: "Page not found", body: "The page you're looking for has been moved, deleted or never existed.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = (t / P) * Math.PI * 2;
    const bob = Math.sin(w) * 1.2, beam = 0.5 + 0.5 * Math.sin(w * 2);
    p.translate(0, 0, -14);
    p.shadow(0, 0, 18, 9, 0.1);
    // the pool of light on the ground
    p.face(ring(0, 9.5), 0.06 + 0.06 * beam, 0.55 + 0.35 * beam, 0.5);
    p.face(ring(0, 6), 0, 0.25 + 0.3 * beam, 0.45);

    // the beam: a translucent cone from the saucer's belly to the ground
    const zb = ZS + bob - 1.6;
    p.screen((c) => {
      c.globalAlpha = 0.45 + 0.25 * beam;
      frustum(p, 0, 9.5, zb, 3, 0.12 + 0.08 * beam, 0);
      c.globalAlpha = 1;
    });
    p.line([[Math.cos(-Math.PI / 4) * 9.5, Math.sin(-Math.PI / 4) * 9.5, 0], [Math.cos(-Math.PI / 4) * 3, Math.sin(-Math.PI / 4) * 3, zb]], 0.35, 0.45);
    p.line([[Math.cos((3 * Math.PI) / 4) * 9.5, Math.sin((3 * Math.PI) / 4) * 9.5, 0], [Math.cos((3 * Math.PI) / 4) * 3, Math.sin((3 * Math.PI) / 4) * 3, zb]], 0.35, 0.45);
    // pages drifting up in the beam
    for (let i = 0; i < 3; i++) {
      const u = (t / P + i / 3) % 1;
      const z = 2 + u * (zb - 4), r = 9.5 - (6.5 * z) / zb; // stay inside the cone
      const a = i * 2.1 + u * 2.4;
      const fade = Math.min(1, u * 5, (1 - u) * 4);
      p.push();
      p.translate(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, z);
      // turned to face us, rocking and turning slowly as it rises
      p.rotate("x", -Math.PI / 4 + 0.45 * Math.sin(w + i * 2));
      p.rotate("y", 0.62 + 0.35 * Math.cos(w * 0.5 + i));
      p.rotate("z", 1.05 + 0.6 * Math.sin(u * Math.PI * 2 + i));
      p.face([[-1.7, -2.2, 0], [1.7, -2.2, 0], [1.7, 2.2, 0], [-1.7, 2.2, 0]], 0.35 * fade, fade, 0.5);
      p.line([[-0.9, -1, 0.05], [0.9, -1, 0.05]], 0.8 * fade, 0.4);
      p.line([[-0.9, 0.2, 0.05], [0.9, 0.2, 0.05]], 0.8 * fade, 0.4);
      p.pop();
    }

    // the saucer, bobbing and wobbling
    p.push();
    p.translate(0, 0, ZS + bob);
    p.rotate("x", Math.sin(w) * 0.09);
    p.rotate("y", Math.cos(w) * 0.09);
    frustum(p, -1.6, 4, 0, 11, 0.07, SH.edge, 0.5); // belly
    p.face(ring(-1.6, 3.4), 0.3 + 0.6 * beam, SH.edge, 0.5); // the beam's source
    frustum(p, 0, 11, 1.4, 11, 0.16); // rim band
    // lights round the rim, chasing
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 4 + ((i + 0.5) / 10) * Math.PI;
      const on = 0.5 + 0.5 * Math.cos(w * 2 - i * 1.2);
      p.dot([Math.cos(a) * 11.05, Math.sin(a) * 11.05, 0.7], 0.55, 0.3 + 0.7 * on);
    }
    frustum(p, 1.4, 11, 3.6, 6.5, 0.2); // upper hull
    p.face(ring(3.6, 6.5), 0.22, SH.edge, 0.5);
    // the glass dome, a stack of rings
    const D = 4.6, n = 6;
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * (Math.PI / 2), a1 = ((k + 1) / n) * (Math.PI / 2);
      frustum(p, 3.6 + Math.sin(a0) * D, Math.cos(a0) * D, 3.6 + Math.sin(a1) * D, Math.max(0.01, Math.cos(a1) * D), 0.06 + 0.04 * k, k === 0 ? SH.edge : 0, 0.5);
    }
    // dome outline and a glint
    const [cx, cy] = p.pt([0, 0, 3.6]);
    p.screen((c) => {
      c.strokeStyle = "#fff"; c.lineWidth = 0.55;
      c.beginPath(); c.arc(cx, cy, D * 1.22, Math.PI * 1.06, Math.PI * 1.94); c.stroke();
      c.beginPath(); c.arc(cx, cy - 1.2, D * 0.8, Math.PI * 1.2, Math.PI * 1.45); c.lineWidth = 0.8; c.lineCap = "round"; c.stroke();
    });
    p.pop();
  },
};
