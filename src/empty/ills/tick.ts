// Check circle: a thick round token lying flat, a bright tick in its dark face. Hover and it hops, a ring spreads out across the floor and sparks settle around it.
import { type Illustration, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const R = 16, H = 5.5; // the token's radius and height
// the tick in screen terms: [across, up]
const TICK: [number, number][] = [[-4.9, 0.6], [-1.8, -2.7], [5.4, 5.6], [7.6, 3.6], [-1.8, -6.9], [-7.1, -1.6]];
/** a point on the token's face from screen terms: across runs along the screen, up runs away from us */
const lay = (u: number, v: number, z: number): V3 => [(u - v) * 0.7071, (-u - v) * 0.7071, z];

export const tick: Illustration = {
  k: "tick", name: "Check circle", title: "You are all caught up", body: "Nothing needs your attention right now. New items will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.55), hop = Math.sin(k * Math.PI) * 5 + h * Math.sin(t * 2.2) * 0.5;
    p.translate(0, 0, -3);
    p.shadow(0, 0, 30 - hop, 15 - hop * 0.5, 0.12);
    // the ring spreading over the floor as the token lands
    const e = cl((h - 0.3) / 0.6);
    if (e > 0 && e < 1) {
      const [x, y] = p.pt([0, 0, 0]), r = R + 1.5 + 6 * ease(e);
      p.screen((c) => { c.strokeStyle = `rgba(255,255,255,${1 - e})`; c.lineWidth = 0.9; c.beginPath(); c.ellipse(x, y, r * 1.2247, r * 0.7071, 0, 0, Math.PI * 2); c.stroke(); });
    }
    p.cylinder(0, 0, hop, R, H, { side: 0.12, top: 0.2 });
    const z = hop + H + 0.02;
    p.clear(Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * (R - 3), Math.sin(a) * (R - 3), z] as V3; }));
    const s = 1.3 + 0.14 * Math.sin(k * Math.PI);
    p.face(TICK.map(([u, v]) => lay(u * s, (v + 0.6) * s * 1.3, z + 0.02)), 0.9, 0);
    const b = cl((h - 0.6) / 0.3);
    if (b > 0) ([[-15, 8, 9], [9, -15, 11], [16, 6, 8], [-5, -15, 15]] as V3[]).forEach((q, i) => p.dot(q, (0.85 + 0.35 * Math.sin(t * 3.2 + i * 2.1)) * b, 1));
  },
};
