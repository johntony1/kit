// All caught up: a mug of coffee on its saucer. Three wisps of steam curl up out of it and fade, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop
const R = 7.5, H = 15, ZB = 2; // mug radius, mug height, the saucer's top
const SR = 13, S2 = Math.SQRT1_2;
const ring = (r: number, z: number, n = 44): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
const arc = (r: number, z: number, a0: number, a1: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
const front = (r: number, z: number) => arc(r, z, -Math.PI / 4, (Math.PI * 3) / 4);

/** the visible side of an upright cylinder, a dense part facing +y and a sparse part facing +x */
function side(p: Pen, r: number, z0: number, z1: number, split = Math.PI / 6) {
  const band = (a0: number, a1: number, f: number) => p.face([...arc(r, z0, a0, a1), ...arc(r, z1, a0, a1).reverse()], f, 0);
  band(-Math.PI / 4, split, SH.right);
  band(split, (Math.PI * 3) / 4, SH.left);
}

export const mug: Illustration = {
  k: "mug", name: "Coffee mug", title: "All caught up", body: "Nothing new right now. Take a break, we will let you know when something comes in.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 25, 12.5, 0.12);
    // the saucer: a thin plate with a raised lip and a well the mug sits in
    side(p, SR, 0, ZB);
    p.face(ring(SR, ZB), SH.top, 0);
    p.line(front(SR - 1.4, ZB), SH.edge, 0.55);
    p.face(ring(R + 1.2, ZB), 0.12, 0);
    // the handle, on the left as we look at it: a thick loop in the plane that faces us
    const hd: V3 = [-S2, S2, 0]; // out to the screen's left
    const hp = (u: number, v: number): V3 => [hd[0] * u, hd[1] * u, v];
    const outer: V3[] = Array.from({ length: 17 }, (_, i) => { const a = -Math.PI / 2 + (i / 16) * Math.PI; return hp(R - 0.6 + Math.cos(a) * 5.4, ZB + 7 + Math.sin(a) * 4.6); }).reverse();
    const inner: V3[] = Array.from({ length: 17 }, (_, i) => { const a = -Math.PI / 2 + (i / 16) * Math.PI; return hp(R - 0.6 + Math.cos(a) * 3, ZB + 7 + Math.sin(a) * 2.3); });
    p.push(); p.translate(0.6, 0.6, 0); // a touch behind the mug's outline, so the wall covers its roots
    p.face([...outer, ...inner], 0.16, 0);
    p.line(outer, SH.edge, 0.7);
    p.line(inner, SH.edge, 0.6);
    p.pop();
    // the mug's wall, cut free of the saucer by its outline, with a lit band near the top
    side(p, R, ZB, ZB + H);
    p.line(front(R + 0.05, ZB + 0.2), SH.edge, 0.7);
    p.line([[R * S2, -R * S2, ZB], [R * S2, -R * S2, ZB + H]], SH.edge, 0.7);
    p.line([[-R * S2, R * S2, ZB], [-R * S2, R * S2, ZB + H]], SH.edge, 0.7);
    p.face([...arc(R + 0.03, ZB + H - 4.2, Math.PI / 6, (Math.PI * 3) / 4), ...arc(R + 0.03, ZB + H - 1.6, Math.PI / 6, (Math.PI * 3) / 4).reverse()], SH.top, 0);
    p.line(front(R + 0.05, ZB + H - 4.2), SH.edge, 0.6);
    p.line(front(R + 0.05, ZB + H - 1.6), SH.edge, 0.6);
    // a heart on the lit side: a small cut outline
    const hc = Math.PI * 0.47, hz = ZB + 5.2;
    const hpt = (dx: number, dz: number): V3 => [Math.cos(hc + dx / R) * (R + 0.05), Math.sin(hc + dx / R) * (R + 0.05), hz + dz];
    p.line(Array.from({ length: 29 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(a), 3), z = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
      return hpt(x * 0.13, z * 0.13);
    }), SH.edge, 0.6);
    // the rim and the coffee inside
    p.face(ring(R, ZB + H), SH.top, 0);
    p.face(ring(R - 1, ZB + H - 0.01), 0.04, 0);
    p.line(arc(R - 1, ZB + H, (Math.PI * 3) / 4, (Math.PI * 7) / 4), SH.edge, 0.5);
    // a little crema swirl on the coffee
    p.dot([-1.5, -1.5, ZB + H - 0.5], 0.9, 0.45);
    // steam: three wisps rising and curling, each fading in then out, staggered
    p.screen((c) => {
      c.lineCap = "round"; c.lineJoin = "round";
      for (let i = 0; i < 3; i++) {
        const u = ((t / P) + i / 3) % 1;
        const a = Math.sin(u * Math.PI);
        if (a < 0.05) continue;
        const bx = (i - 1) * 3.4;
        const pts: [number, number][] = [];
        for (let j = 0; j <= 14; j++) {
          const k = j / 14;
          const z = ZB + H + 2 + u * 8 + k * 7;
          const x = bx + Math.sin(k * 5.2 + u * 6 + i * 1.7) * (1 + k * 1.4);
          pts.push(p.pt([x * S2, -x * S2, z]));
        }
        const n = Math.round(255 * Math.min(1, a * 1.2));
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.1;
        c.beginPath(); pts.forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      }
    });
  },
};
