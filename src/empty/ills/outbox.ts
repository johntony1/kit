// Nothing in the outbox: a letter tray. The top envelope lifts out and flies off, and a fresh one settles in its place.
import { easeInOut, SH, type Illustration, type Pen } from "../dots";

const P = 3.6; // seconds per loop
const X = 15, Y = 11, H = 5; // half width, half depth, height of the tray
const EX = 11.5, EY = 7.5; // half size of an envelope

/** an envelope lying flat at height z: a thin slab with its flap folded over the top */
function envelope(p: Pen, z: number, seal: boolean) {
  p.box(-EX, -EY, z, EX * 2, EY * 2, 1.1, { top: SH.top, left: 0.13, right: 0.065 });
  const t = z + 1.12;
  // the flap: a V from the two back corners to a point past the middle
  p.line([[-EX + 0.4, -EY + 0.4, t], [2, 0, t], [-EX + 0.4, EY - 0.4, t]], SH.edge, 0.75);
  if (seal) p.disc(2, 0, t + 0.02, 1.9, 0.32, SH.edge);
}

export const outbox: Illustration = {
  k: "outbox", name: "Outbox", title: "Nothing in your outbox", body: "Messages waiting to send will wait here until they go.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(2, 3, -8);
    p.shadow(-6, 0, 24, 12, 0.12);
    p.shadow(6, 0, 24, 12, 0.12);
    // the tray: an open box, the far walls inside first
    p.face([[-X, -Y, H], [X, -Y, H], [X, Y, H], [-X, Y, H]], 0.03, SH.edge, 0.55);
    p.face([[-X + 0.9, -Y + 0.9, 1], [X - 0.9, -Y + 0.9, 1], [X - 0.9, -Y + 0.9, H], [-X + 0.9, -Y + 0.9, H]], 0.1, SH.edge, 0.5);
    p.face([[-X + 0.9, -Y + 0.9, 1], [-X + 0.9, Y - 0.9, 1], [-X + 0.9, Y - 0.9, H], [-X + 0.9, -Y + 0.9, H]], 0.08, SH.edge, 0.5);

    // the envelope that leaves: rises, turns and flies off up and back, shrinking away
    const go = u > 0.14 && u < 0.62 ? easeInOut((u - 0.14) / 0.48) : u >= 0.62 ? 1 : 0;
    // a fresh one drops into the tray at the end of the loop
    const back = u > 0.74 ? easeInOut(Math.min(1, (u - 0.74) / 0.2)) : 0;
    // the stack already in the tray
    envelope(p, 1, false);
    const rest = 2.3;
    const flying = go > 0 && go < 1;
    const drawTop = (front: boolean) => {
      if (u < 0.14 || (u >= 0.94)) { if (!front) envelope(p, rest, true); return; }
      if (flying) {
        const lift = Math.min(1, go * 3);
        const zz = rest + lift * 8 + Math.max(0, go - 0.33) * 22;
        if ((zz > H + 0.6) !== front) return;
        const k = 1 - Math.max(0, (go - 0.3) / 0.7) * 0.92;
        p.push();
        p.translate(go * 6, -go * 20, 0);
        p.scale(k, [0, 0, zz]);
        p.rotate("z", -go * 0.5, [0, 0, zz]);
        p.rotate("x", -go * 0.35, [0, 0, zz]);
        envelope(p, zz, true);
        p.pop();
      } else if (back > 0) { const zz = rest + (1 - back) * 9; if ((zz > H + 0.6) === front) envelope(p, zz, true); }
    };
    drawTop(false);
    // the near walls of the tray, over anything still inside it
    p.face([[-X, Y, 0], [X, Y, 0], [X, Y, H], [-X, Y, H]], 0.13, SH.edge, 0.55);
    p.face([[X, -Y, 0], [X, Y, 0], [X, Y, H], [X, -Y, H]], SH.right, SH.edge, 0.55);
    // the rims: lit strips along the top of the near walls
    p.face([[-X, Y - 0.9, H], [X, Y - 0.9, H], [X, Y, H], [-X, Y, H]], 0.24, SH.edge, 0.4);
    p.face([[X - 0.9, -Y, H], [X, -Y, H], [X, Y, H], [X - 0.9, Y, H]], 0.24, SH.edge, 0.4);
    // a label on the front with an arrow pointing out
    p.face([[-5, Y + 0.04, 1.2], [5, Y + 0.04, 1.2], [5, Y + 0.04, 3.8], [-5, Y + 0.04, 3.8]], 0.24, SH.edge, 0.5);
    p.line([[-3, Y + 0.08, 2.5], [2.6, Y + 0.08, 2.5]], SH.edge, 0.6);
    p.line([[1.2, Y + 0.08, 3.3], [2.8, Y + 0.08, 2.5], [1.2, Y + 0.08, 1.7]], SH.edge, 0.6);
    drawTop(true);
    // its path, dashed, while it flies
    if (flying) p.guide(Array.from({ length: 12 }, (_, i) => { const g = (go * i) / 11, zz = rest + Math.min(1, g * 3) * 8 + Math.max(0, g - 0.33) * 22; return [g * 6, -g * 20, zz + 1] as [number, number, number]; }), true);
  },
};
