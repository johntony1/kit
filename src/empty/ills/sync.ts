// Up to date: a small phone with a check on its screen, two curved arrows chasing each other round it in a ring.
import { SH, type Illustration, type V3 } from "../dots";

const PERIOD = 3.2, R = 17, BW = 1.7, ZR = 9; // ring radius, half band width, ring height
const SPAN = 2.1; // how much of the ring each arrow's tail covers (radians)

export const sync: Illustration = {
  k: "sync", name: "Sync", title: "Up to date", body: "Everything is in sync. New changes will show up here as they happen.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    const rot = u * Math.PI; // half a turn per loop: the two arrows swap places
    p.translate(0, 0, -13);
    p.shadow(0, 0, 25, 12, 0.12);

    // pieces of the ring: tail segments and the heads, each with a depth so we can draw back to front
    type Piece = { d: number; draw: () => void };
    const pieces: Piece[] = [];
    const at = (a: number, r: number, z = ZR): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];
    for (let k = 0; k < 2; k++) {
      const a0 = rot + k * Math.PI, N = 14;
      for (let i = 0; i < N; i++) {
        const s0 = a0 + (SPAN * i) / N, s1 = a0 + (SPAN * (i + 1)) / N, m = (s0 + s1) / 2;
        const w = BW * (0.55 + 0.45 * (i / N)); // the tail thins toward its end
        pieces.push({
          d: Math.cos(m) + Math.sin(m),
          draw: () => {
            // a little thickness on the outside where it faces us
            if (Math.cos(m) + Math.sin(m) > -0.3) {
              const facesY = Math.sin(m) > Math.cos(m);
              p.face([at(s0, R + w, ZR - 1.4), at(s1, R + w, ZR - 1.4), at(s1, R + w), at(s0, R + w)], facesY ? SH.left : SH.right, 0);
            }
            p.face([at(s0, R - w), at(s1, R - w), at(s1, R + w), at(s0, R + w)], 0.3, 0);
          },
        });
      }
      // the head, at the leading end, pointing along the turn
      const h0 = a0 + SPAN, h1 = h0 + 0.55, hm = h0 + 0.2;
      pieces.push({
        d: Math.cos(hm) + Math.sin(hm),
        draw: () => {
          if (Math.cos(hm) + Math.sin(hm) > -0.3) p.face([at(h0, R + 3.6, ZR - 1.4), at(h1, R, ZR - 1.4), at(h1, R), at(h0, R + 3.6)], Math.sin(hm) > Math.cos(hm) ? SH.left : SH.right, 0);
          p.face([at(h0, R - 3.6), at(h0, R + 3.6), at(h1, R)], 0.34, 0);
        },
      });
    }
    pieces.sort((a, b) => a.d - b.d);
    const back = pieces.filter((q) => q.d < 0), front = pieces.filter((q) => q.d >= 0);
    back.forEach((q) => q.draw());

    // the phone, upright in the middle, turned to face us, a check cut into its lit screen
    p.push();
    p.rotate("z", -Math.PI / 4);
    p.box(-5.5, -1.2, 0, 11, 2.4, 20, { top: 0.22, left: 0.12, right: 0.065 });
    const f = 1.23;
    p.face([[-4.2, f, 2.2], [4.2, f, 2.2], [4.2, f, 17.8], [-4.2, f, 17.8]], 0.3, 0);
    p.line([[-2.4, f + 0.02, 10.2], [-0.6, f + 0.02, 8], [2.8, f + 0.02, 12.6]], SH.edge, 1.2);
    p.line([[-1.4, f + 0.02, 16.4], [1.4, f + 0.02, 16.4]], SH.edge, 0.6);
    p.pop();

    front.forEach((q) => q.draw());
  },
};
