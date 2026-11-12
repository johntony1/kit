// Theatre masks: the laughing mask and the weeping mask, side by side. Hover and they trade places, one rising as the other dips, rocking gently.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** the outline of a mask: wide at the brow, drawn down to a chin */
const OUT: [number, number][] = Array.from({ length: 40 }, (_, i) => {
  const a = (i / 40) * Math.PI * 2, s = Math.sin(a);
  return [9 * Math.cos(a) * (1 - 0.22 * Math.max(0, -s)), 9 * s * (s < 0 ? 1.3 : 0.82)] as [number, number];
});
/** a crescent: an arch (up = 1) or a bowl (up = -1), thick in the middle */
const crescent = (cx: number, cz: number, w: number, hgt: number, up: number, thin = 0.3): [number, number][] => {
  const r: [number, number][] = [];
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; r.push([cx + Math.cos(a) * w, cz + up * Math.sin(a) * hgt]); }
  for (let i = 11; i > 0; i--) { const a = (i / 12) * Math.PI; r.push([cx + Math.cos(a) * w, cz + up * Math.sin(a) * hgt * thin]); }
  return r;
};

function mask(p: Pen, happy: boolean, tone: number) {
  const pl = (q: [number, number][], y: number): V3[] => q.map(([x, z]) => [x, y, z] as V3);
  p.face(pl(OUT, -2), 0.065, 0);
  p.face(pl(OUT, 0), tone, SH.edge, 0.65);
  const y = 0.03;
  if (happy) {
    p.clear(pl(crescent(-3.9, 1.4, 2.6, 2.6, 1), y)); p.clear(pl(crescent(3.9, 1.4, 2.6, 2.6, 1), y));
    p.clear(pl(crescent(0, -3.2, 5, 5, -1, 0.12), y));
  } else {
    // eyes that droop at the outer corners, a mouth turned down
    for (const s of [-1, 1]) p.clear(pl([[s * 1.6, 3.4], [s * 5.4, 1.2], [s * 6, -0.4], [s * 3.4, 0.2], [s * 1.6, 1.6]], y));
    p.clear(pl(crescent(0, -7.4, 4.2, 4.2, 1, 0.25), y));
  }
}

export const masks: Illustration = {
  k: "masks", name: "Theatre masks", title: "No performances yet", body: "Add a performance and it will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h), sway = h * Math.sin(t * 2.2) * 0.06;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 30, 12, 0.1);
    p.rotate("z", -0.6);
    p.scale(1.12);
    // the weeping one behind and higher, the laughing one in front
    p.push();
    p.translate(7.5, -3, 22 - 7 * k);
    p.rotate("y", -0.24 + 0.1 * k - sway);
    mask(p, false, 0.12);
    p.pop();
    p.push();
    p.translate(-6.5, 3, 12.5 + 7 * k);
    p.rotate("y", 0.2 - 0.1 * k + sway);
    mask(p, true, 0.24);
    p.pop();
  },
};
