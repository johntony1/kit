// No dividends yet: three coin stacks, each taller than the last. Coins drop onto them in turn, one after another, without end.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 3.6, CR = 5.2, CH = 1.9; // seconds per loop, coin radius and thickness
const front = (cx: number, cy: number, z: number): V3[] =>
  Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return [cx + Math.cos(a) * CR, cy + Math.sin(a) * CR, z] as V3; });
const ring = (cx: number, cy: number, z: number, r: number): V3[] =>
  Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

function coin(p: Pen, cx: number, cy: number, z: number, hgt = CH) {
  p.cylinder(cx, cy, z, CR, hgt, { side: 0.12, top: 0.22 });
  p.line(front(cx, cy, z), SH.edge, 0.3);
}

export const dividend: Illustration = {
  k: "dividend", name: "Dividends", title: "No dividends yet", body: "When your holdings pay out, each dividend will be added here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    p.translate(0, 0, -10);
    p.shadow(0, 0, 30, 13, 0.1);
    // left to right across the picture: three, five and seven coins
    [3, 5, 7].forEach((n, i) => {
      const cx = (i - 1) * 9.4, cy = -(i - 1) * 9.4;
      const v = (u + i / 3) % 1, LANDS = 0.55;
      // the stack sinks by one coin over the loop, and the coin that lands makes it up again
      const top = n * CH - CH * ((v - LANDS + 1) % 1);
      const whole = Math.floor(top / CH), rest = top - whole * CH;
      if (rest > 0.05) coin(p, cx, cy, 0, rest);
      for (let j = 0; j < whole; j++) coin(p, cx, cy, rest + j * CH);
      p.line(ring(cx, cy, top + 0.02, CR - 1.5), SH.edge, 0.5);
      // the falling coin
      if (v < LANDS) {
        const f = v / LANDS, z = top + 24 * (1 - f * f);
        p.guide([[cx, cy, top], [cx, cy, z]]);
        coin(p, cx, cy, z);
        p.line(ring(cx, cy, z + CH + 0.02, CR - 1.5), SH.edge, 0.5);
      } else if (v < LANDS + 0.14) {
        // a ring of light as it lands
        const f = (v - LANDS) / 0.14;
        for (let a = 0; a < 8; a++) { const q = (a / 8) * Math.PI * 2; p.dot([cx + Math.cos(q) * (CR + 1 + 3 * f), cy + Math.sin(q) * (CR + 1 + 3 * f), top], 0.6 * (1 - f) + 0.15, 1); }
      }
    });
  },
};
