// Nothing unboxed yet: an open cardboard box, its four flaps standing up and out. Hover and the flaps flex wider while a bright star rises out of the empty box and pops.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 10.5, D = 8.5, H = 13; // half width, half depth, height

// a five point star flat to the screen, bright with a dark edge
function star(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    g.closePath(); g.lineJoin = "round"; g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.stroke(); g.fillStyle = "#fff"; g.fill();
  });
}

export const unboxing: Illustration = {
  k: "unboxing", name: "Open box", title: "Nothing unboxed yet", body: "Your orders will show up here once they arrive, ready to open and review.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 13, 0.12);
    const e = easeInOut(Math.min(1, h * 1.4));
    const o = 1.95 + e * 0.3 + h * Math.sin(t * 4) * 0.03; // how far the flaps stand open
    const flap = (pts: V3[], fill: number) => p.face(pts, fill, 0);
    // the two far flaps, behind the opening
    p.push(); p.rotate("y", -o, [-W, 0, H]);
    flap([[-W, -D, H], [-W + D, -D, H], [-W + D, D, H], [-W, D, H]], 0.13);
    p.pop();
    p.push(); p.rotate("x", o, [0, -D, H]);
    flap([[-W, -D, H], [W, -D, H], [W, -D + D, H], [-W, -D + D, H]], 0.085);
    p.pop();
    // the body, open at the top: a dark inside
    p.box(-W, -D, 0, W * 2, D * 2, H, { open: true, left: 0.13, right: 0.07, edge: 0 });
    p.line([[-W, D + 0.03, H], [W, D + 0.03, H], [W + 0.03, -D, H]], SH.edge, 0.6);
    // the star rises out of the dark opening, clipped below the rim until it clears it
    const k = Math.max(0, (h - 0.3) / 0.7);
    if (k > 0) {
      const rise = easeInOut(Math.min(1, k * 1.3));
      const pop = k < 0.75 ? 1 : 1 + 0.25 * Math.sin(((k - 0.75) / 0.25) * Math.PI);
      star(p, [0, 0, H + 1 + rise * 8], 6 * pop * Math.min(1, k * 3));
    }
    // the two near flaps, drawn over the star's foot
    p.push(); p.rotate("y", o, [W, 0, H]);
    flap([[W - D, -D, H], [W, -D, H], [W, D, H], [W - D, D, H]], 0.065);
    p.pop();
    p.push(); p.rotate("x", -o, [0, D, H]);
    flap([[-W, 0, H], [W, 0, H], [W, D, H], [-W, D, H]], 0.16);
    p.pop();
    // tape remnants down the near walls and a shipping label
    p.face([[-1.8, D + 0.03, H - 4], [1.8, D + 0.03, H - 4], [1.8, D + 0.03, H], [-1.8, D + 0.03, H]], 0.26, 0);
    p.face([[W + 0.03, -1.8, H - 4], [W + 0.03, 1.8, H - 4], [W + 0.03, 1.8, H], [W + 0.03, -1.8, H]], 0.18, 0);
    p.face([[-8, D + 0.03, 2.5], [-3, D + 0.03, 2.5], [-3, D + 0.03, 6.5], [-8, D + 0.03, 6.5]], 0.28, 0);
    p.line([[-7, D + 0.06, 5.2], [-4, D + 0.06, 5.2]], SH.edge, 0.55);
    p.line([[-7, D + 0.06, 3.8], [-5.2, D + 0.06, 3.8]], SH.edge, 0.55);
  },
};
