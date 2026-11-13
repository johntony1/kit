// No drops logged: a glass dropper with a rubber bulb, held at a slant over a small puddle. The bulb squeezes, a drop swells at the tip, falls and splashes, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const TU = -6, TV = 17; // where the tip is, across and up, in the plane that faces us
const F = (u: number, v: number, d = 0): V3 => [u * 0.577 + d, -u * 0.577 + d, v];
const cl = (x: number) => Math.max(0, Math.min(1, x));

export const dropper: Illustration = {
  k: "dropper", name: "Dropper", title: "No drops logged", body: "Log a dose and each drop you take will be counted here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const squeeze = Math.sin(cl(u / 0.35) * Math.PI); // the bulb pinches while the drop swells
    p.translate(2, 2, -22);
    p.scale(1.25, [0, 0, 18]);
    p.shadow(-3, 3, 24, 10, 0.1);
    // the puddle under the tip, and the splash ring when the drop lands
    const [px, py] = [TU * 0.577, -TU * 0.577];
    p.disc(px, py, 0, 6, 0.22);
    p.disc(px, py, 0.05, 4.4, 0.1);
    const sp = cl((u - 0.55) / 0.3);
    if (sp > 0 && sp < 1) {
      const r = 2 + 5 * sp, a = 1 - sp;
      p.screen((g) => {
        g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 1.4;
        const pts = Array.from({ length: 33 }, (_, i) => { const q = (i / 32) * Math.PI * 2; return p.pt([px + Math.cos(q) * r, py + Math.sin(q) * r, 0.1]); });
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        g.fillStyle = `rgba(255,255,255,${a})`;
        for (const [dx, dz] of [[-2.5, 1], [2.5, 1.4], [0.5, 2]] as const) { const [x, y] = p.pt(F(TU + dx * (0.6 + sp), dz * 12 * sp * (1 - sp))); g.beginPath(); g.arc(x, y, 0.9, 0, Math.PI * 2); g.fill(); }
      });
    }
    // the dropper, drawn flat in the plane that faces us, tilted up to the right; s along it from the tip, w across it
    const tilt = 0.6, c = Math.cos(tilt), s = Math.sin(tilt);
    const Q = (w: number, a: number, d = 0.5): V3 => F(TU + a * s + w * c, TV + a * c - w * s, d);
    const half = (a: number) => {
      if (a < 5) return 0.6 + 2 * (a / 5); // the taper
      if (a < 18) return 2.6; // the tube
      if (a < 19.8) return 4.6; // the flange
      if (a < 20.6) return 3.5;
      const b = 3.6 - 1 * squeeze; // the bulb, rounded at its end
      if (a < 27) return b;
      return b * Math.sqrt(Math.max(0, 1 - Math.pow((a - 27) / 3.4, 2)));
    };
    const part = (a0: number, a1: number, w0: number, w1: number, fill: number) => {
      const as = Array.from({ length: 13 }, (_, i) => a0 + ((a1 - a0) * i) / 12);
      p.face([...as.map((a) => Q(half(a) * w0, a)), ...as.slice().reverse().map((a) => Q(half(a) * w1, a))], fill, 0);
    };
    // the glass: lit on the left, a bright glint down it
    part(0, 18, -1, 0.3, 0.22);
    part(0, 18, 0.3, 1, 0.1);
    part(5.5, 17, -0.55, -0.2, 0.42);
    p.line([Q(-2.6, 11), Q(2.6, 11)], 1, 0.8); // the liquid line
    // the flange, bright, and the dark rubber bulb with a lit strip
    part(18, 19.8, -1, 1, 0.3);
    p.line([Q(-4.6, 19.85), Q(4.6, 19.85)], 1, 0.8);
    part(19.8, 30.39, -1, 1, 0.08);
    part(21, 29, -0.7, -0.25, 0.2);
    // the drop: swelling at the tip, then falling to the puddle
    const grow = cl(u / 0.35), fall = cl((u - 0.35) / 0.2);
    if (u < 0.55) {
      const k = 0.5 + 0.7 * grow, zc = fall > 0 ? (TV - 2.6) * (1 - fall * fall) + 1.5 * fall * fall : TV - 2.6 * k;
      const drop = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return F(TU + 2 * k * Math.sin(a) * Math.sin(a / 2), zc + 2.6 * k * Math.cos(a), 3); });
      p.face(drop, 0.45, 0);
      p.line([...drop, drop[0]], 1, 0.6);
    }
  },
};
