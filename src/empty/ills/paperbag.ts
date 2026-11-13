// Nothing in the bag: a plain paper grocery bag with a zigzag cut top. Hover and it tips toward you, showing it empty inside, and a few crumbs fall out.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 8.5, D = 4, H = 26; // half width, half depth, height to the top of the teeth

// a zigzag cut top edge running from a to b at height H
const zig = (a: [number, number], b: [number, number]): V3[] => Array.from({ length: 11 }, (_, i) => {
  const k = i / 10;
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, H - (i % 2 ? 2 : 0)] as V3;
});

export const paperbag: Illustration = {
  k: "paperbag", name: "Paper bag", title: "Nothing in the bag", body: "Add items as you shop and they will be bagged up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h / 0.7));
    p.translate(0, 0, -15);
    p.shadow(0, 0, 22, 11, 0.12);
    p.rotate("z", -0.5);
    p.push();
    // tip toward us round the front bottom edge
    p.translate(0, 0, 2.5 * k);
    p.rotate("x", -0.32 * k, [0, D, 0]);
    // the empty mouth: dark, with the far walls catching light inside
    p.clear([[-W, -D, H - 2], [W, -D, H - 2], [W, D, H - 2], [-W, D, H - 2]]);
    p.face([[-W, -D, H - 7], [W, -D, H - 7], ...zig([W, -D], [-W, -D])], 0.065, 0);
    p.face([[-W, -D, H - 7], [-W, D, H - 7], ...zig([-W, D], [-W, -D])], 0.04, 0);
    // the cut edges of the far walls, catching the light
    const rims = [zig([W, -D], [-W, -D]), zig([-W, -D], [-W, D])].map((r) => r.map((q) => p.pt(q)));
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.1; g.lineJoin = "round";
      for (const r of rims) { g.beginPath(); r.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
    });
    // the front and the side, each with its cut top
    p.face([[-W, D, 0], [W, D, 0], ...zig([W, D], [-W, D])], 0.2, 0);
    p.face([[W, -D, 0], [W, D, 0], ...zig([W, D], [W, -D])], SH.right, 0);
    // the gusset fold down the side, the bottom fold and the fold line across the front
    p.line([[W + 0.03, -D + 0.4, H - 1], [W + 0.03, 0, H - 6], [W + 0.03, D - 0.4, H - 1]], SH.edge, 0.6);
    p.line([[W + 0.03, 0, H - 6], [W + 0.03, 0, 1.2]], SH.edge, 0.6);
    p.line([[-W, D + 0.03, 3], [W, D + 0.03, 3]], SH.edge, 0.6);
    p.pop();
    // a few crumbs falling out of the tipped mouth
    const s = Math.max(0, (h - 0.55) / 0.45);
    if (s > 0) for (let i = 0; i < 4; i++) {
      const u = (t * 0.6 + i / 4) % 1;
      p.dot([-4 + i * 2.6, D + 7 + i * 0.5, H - 4 - u * 13], 0.6, s * Math.sin(u * Math.PI));
    }
  },
};
