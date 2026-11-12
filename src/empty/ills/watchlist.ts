// Watchlist: a pair of binoculars lying ready, their big lenses turned to us. Hover and they lift, a glint crosses each lens and a star pops up to watch.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a point on the plane that faces us through c: u to the right, v up */
const bb = (c: V3, u: number, v: number): V3 => [c[0] + u * 0.7071 - v * 0.4082, c[1] - u * 0.7071 - v * 0.4082, c[2] + v * 0.8165];
const CZ = 6.4; // the height of the barrels' axis
/** one section of a barrel lying along y: its lit upper side, its shaded flank and its front end */
function tube(p: Pen, cx: number, y0: number, y1: number, r: number) {
  const P = (a: number, y: number): V3 => [cx + Math.cos(a) * r, y, CZ + Math.sin(a) * r];
  const side = (a0: number, a1: number, fill: number) => {
    const pts: V3[] = [];
    for (let i = 0; i <= 10; i++) pts.push(P(a0 + ((a1 - a0) * i) / 10, y0));
    for (let i = 10; i >= 0; i--) pts.push(P(a0 + ((a1 - a0) * i) / 10, y1));
    p.face(pts, fill, 0);
  };
  side(Math.PI / 4, (Math.PI * 3) / 4, 0.2);
  side(-Math.PI / 4, Math.PI / 4, SH.right);
  p.ringV("y", [cx, y1, CZ], r, 0.13, 0);
  p.ringV("y", [cx, y1 + 0.02, CZ], r, 0, SH.edge, 0.5);
}
const STAR: [number, number][] = Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? 1.9 : 4.6; return [Math.cos(a) * q, Math.sin(a) * q] as [number, number]; });

export const watchlist: Illustration = {
  k: "watchlist", name: "Watchlist", title: "Nothing on your watchlist", body: "Follow a stock or a currency and you can keep an eye on its price from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(clamp(h / 0.5));
    p.translate(1, -1, -8);
    p.scale(1.22);
    p.shadow(0, 0, 22 - 2 * e, 11 - e, 0.12);
    p.translate(0, 0, 2.6 * e);
    const barrel = (cx: number) => {
      tube(p, cx, -12, -7, 3.3); // the eyepiece
      tube(p, cx, -7, 2, 4.6);
      tube(p, cx, 2, 9, 6.2); // the big end
      // the lens: dark glass with a glint that crosses it on hover
      p.ringV("y", [cx, 9.04, CZ], 4.7, 0.03, 0);
      const g = -3.4 + 4.8 * e;
      p.face([[cx + g, 9.06, CZ + 2.6], [cx + g + 1.3, 9.06, CZ + 2.6], [cx + g + 2.9, 9.06, CZ - 1.2], [cx + g + 1.6, 9.06, CZ - 1.2]].map(([x, y, z]) => { const dx = x - cx, dz = z - CZ, d = Math.hypot(dx, dz), q = d > 4.2 ? 4.2 / d : 1; return [cx + dx * q, y, CZ + dz * q] as V3; }), 0.3, 0);
    };
    barrel(-6.6);
    // the bridge between the barrels and the focus wheel on it
    p.box(-2.6, -5.5, 4.4, 5.2, 6.5, 3.6, { top: 0.2, left: 0.12, right: 0.065 });
    p.box(-1.4, -4.4, 8, 2.8, 4, 1.8, { top: 0.2, left: 0.12, right: 0.065 });
    for (const y of [-3.4, -2.4, -1.4]) p.line([[-1.4, y, 9.82], [1.4, y, 9.82]], SH.edge, 0.4);
    barrel(6.6);
    // the star it has spotted
    const b = clamp((h - 0.5) / 0.4);
    if (b > 0) {
      const s = (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)) * (1 + 0.05 * Math.sin(t * 3)), C: V3 = [-4, -4, 24 + Math.sin(t * 2) * 0.5];
      p.face(STAR.map(([a, c]) => bb(C, a * s, c * s)), 0.3, 0);
    }
  },
};
