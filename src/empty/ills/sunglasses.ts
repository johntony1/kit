// No looks saved: a pair of sunglasses floating with their arms open. They bob gently while a glint sweeps across the two lenses.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const CZ = 5.4, LX = 7.1; // lens centre height, lens centre offset from the bridge
const pw = (v: number) => Math.sign(v) * Math.pow(Math.abs(v), 0.6);
/** a lens outline: a soft rounded square, a little narrower at the bottom */
const lens = (cx: number, s: number, y: number): V3[] => Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2, c = pw(Math.cos(a)), sn = pw(Math.sin(a));
  return [cx + c * 6.1 * s * (sn < 0 ? 1 + 0.12 * sn : 1), y, CZ + sn * 4.9 * s] as V3;
});
const arm = (x: number): V3[] => [[x, 0, CZ + 3.6], [x, -15, CZ + 3.6], [x, -19, CZ - 0.8], [x, -19, CZ - 2.8], [x, -14.4, CZ + 1.4], [x, 0, CZ + 1.4]];

// the glint: slanted bars drawn only inside one lens
function glint(p: Pen, cx: number, s: number) {
  const hole = lens(cx, 0.8, 0.02).map((v) => p.pt(v));
  p.screen((c) => {
    c.beginPath(); hole.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
    const bar = (x0: number, w: number, f: number) => p.face([[x0, 0.03, CZ - 5], [x0 + w, 0.03, CZ - 5], [x0 + w + 4.4, 0.03, CZ + 5], [x0 + 4.4, 0.03, CZ + 5]], f, 0);
    bar(s, 2.6, 0.02); bar(s - 2.6, 1, 0.02);
  });
}

export const sunglasses: Illustration = {
  k: "sunglasses", name: "Sunglasses", title: "No looks saved", body: "Save a look you like and you can come back to it here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(-5.5, 5.5, -9);
    p.shadow(0, -8, 26, 13, 0.11);
    p.translate(0, 0, 5 + 0.9 * Math.sin(u * Math.PI * 2));
    p.scale(1.2);
    // the arms, reaching back from the hinges and hooking down
    p.face(arm(-LX - 6.1), 0.14, SH.edge, 0.6);
    p.face(arm(LX + 6.1), 0.3, SH.edge, 0.7);
    // the frame: two rims and a bridge, then the dark lenses
    p.face([[-2.2, 0, CZ + 3.4], [2.2, 0, CZ + 3.4], [2.2, 0, CZ + 1.4], [-2.2, 0, CZ + 1.4]], 0.3, 0);
    for (const cx of [-LX, LX]) {
      p.face(lens(cx, 1, 0), 0.12, SH.edge, 0.8);
      p.face(lens(cx, 0.8, 0.01), 0.3, SH.edge, 0.5);
    }
    // a glint crossing both lenses, once per loop
    const g = (u - 0.12) / 0.6;
    if (g > 0 && g < 1) { const s = -19 + g * 34; glint(p, -LX, s); glint(p, LX, s); }
  },
};
