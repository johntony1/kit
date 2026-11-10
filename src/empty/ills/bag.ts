// Your bag is empty: a paper shopping bag. Hover and it lifts and tips toward you, showing nothing inside; a little dust falls out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 8.5, D = 5, H = 19; // half width (x), half depth (y), height

// a rope handle: a band arching over the bag in the plane y = yy
function handle(p: Pen, yy: number, fill: number) {
  const N = 18, r0 = 4.2, r1 = 5.4, rise = 1.25;
  const out: V3[] = [], inn: V3[] = [];
  for (let i = 0; i <= N; i++) {
    const a = (Math.PI * i) / N;
    out.push([Math.cos(a) * r1, yy, H - 0.6 + Math.sin(a) * r1 * rise]);
    inn.push([Math.cos(a) * r0, yy, H - 0.6 + Math.sin(a) * r0 * rise]);
  }
  p.face([...out, ...inn.reverse()], fill, 0);
}

export const bag: Illustration = {
  k: "bag", name: "Shopping bag", title: "Your bag is empty", body: "Browse the store and add something you like. It will wait for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-1, 1, -13);
    p.shadow(0, 0, 22 - 6 * h, 11 - 3 * h, 0.12 - 0.05 * h);
    p.push();
    // lift, tip toward us, and give it a little shake
    p.translate(0, 0, 6 * h);
    p.rotate("x", -0.26 * h, [0, D, 0]);
    p.rotate("y", Math.sin(t * 10) * 0.05 * h, [0, 0, H]);
    handle(p, -D + 0.6, 0.12); // the far handle, behind the opening
    // the opening: dark inside, only the top of the far walls catching light
    p.clear([[-W, -D, H], [W, -D, H], [W, D, H], [-W, D, H]]);
    p.face([[-W, -D, H - 4], [W, -D, H - 4], [W, -D, H], [-W, -D, H]], SH.right, 0);
    p.face([[-W, -D, H - 4], [-W, D, H - 4], [-W, D, H], [-W, -D, H]], SH.right, 0);
    p.face([[-W, D, 0], [W, D, 0], [W, D, H], [-W, D, H]], 0.21, 0);
    p.face([[W, -D, 0], [W, D, 0], [W, D, H], [W, -D, H]], SH.right, 0);
    // the folded rim along the top of the front
    p.line([[-W, D + 0.03, H - 2.6], [W, D + 0.03, H - 2.6]], SH.edge, 0.6);
    // the gusset fold on the side
    p.line([[W + 0.03, -D + 0.4, H - 0.2], [W + 0.03, 0, H - 6], [W + 0.03, D - 0.4, H - 0.2]], SH.edge, 0.6);
    p.line([[W + 0.03, 0, H - 6], [W + 0.03, 0, 1.5]], SH.edge, 0.6);
    // the store's mark on the front: a ring with a smile
    p.ringV("y", [0, D + 0.04, 9.6], 3.9, 0, SH.edge, 0.75);
    p.line(Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1.2 + (0.6 * i) / 8); return [Math.cos(a) * 2.3, D + 0.05, 10.4 + Math.sin(a) * 2.3] as V3; }), SH.edge, 0.75);
    p.dot([-1.2, D + 0.05, 10.9], 0.5, 0.02); p.dot([1.2, D + 0.05, 10.9], 0.5, 0.02);
    handle(p, D + 0.6, 0.22); // the near handle
    p.pop();
    // dust drifting down out of the empty bag
    const k = Math.max(0, (h - 0.5) / 0.5);
    if (k > 0) for (let i = 0; i < 5; i++) {
      const u = (t * 0.45 + i / 5) % 1;
      p.dot([-4 + i * 2.1, D + 6 + i * 0.4, 14 - u * 13], 0.55, k * Math.sin(u * Math.PI));
    }
  },
};
