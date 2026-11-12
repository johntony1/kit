// No groceries yet: a paper grocery bag with a baguette, a carton and some greens poking out. Hover and an apple drops in on top with a bounce.
import { SH, type Illustration, type V3 } from "../dots";

const W = 8.4, D = 5.6, H = 17;
// height above the landing spot: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 40;
  if (k < 0.45) return 40 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 4.5 * 4 * v * (1 - v); }
  if (k < 0.85) { const v = (k - 0.7) / 0.15; return 1.3 * 4 * v * (1 - v); }
  return 0;
}

export const groceries: Illustration = {
  k: "groceries", name: "Grocery bag", title: "No groceries yet", body: "Add what you need to your list and your shop will be packed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.scale(1.08, [0, 0, 13]);
    p.shadow(0, 0, 23, 11.5, 0.12);
    // the inside of the far walls
    p.face([[-W, -D, 0], [W, -D, 0], [W, -D, H], [-W, -D, H]], 0.09, SH.edge, 0.55);
    p.face([[-W, -D, 0], [-W, D, 0], [-W, D, H], [-W, -D, H]], 0.07, SH.edge, 0.55);
    // the baguette: a long loaf leaning out of the back, scored across
    const A: [number, number] = [-2.6, H - 6], B: [number, number] = [-7.4, H + 14.5];
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / len, uz = (B[1] - A[1]) / len, r = 2;
    const loaf: V3[] = [];
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 10; loaf.push([B[0] + ux * Math.sin(a + Math.PI / 2) * r * 1.3 + uz * Math.sin(a) * r, -2.6, B[1] + uz * Math.sin(a + Math.PI / 2) * r * 1.3 - ux * Math.sin(a) * r]); }
    p.face([[A[0] - uz * r, -2.6, A[1] + ux * r], ...loaf, [A[0] + uz * r, -2.6, A[1] - ux * r]], 0.26, SH.edge, 0.6);
    for (let i = 0; i < 4; i++) { const s = 0.36 + i * 0.17, cx = A[0] + (B[0] - A[0]) * s, cz = A[1] + (B[1] - A[1]) * s; p.line([[cx - 1.1, -2.57, cz - 0.9], [cx + 1.1, -2.57, cz + 0.9]], SH.edge, 0.6); }
    // a carton with a gabled top
    p.box(1.6, -4.2, H - 7, 5.4, 4.6, 11.4, { top: 0.2, left: 0.2, right: 0.09, lw: 0.6 });
    p.face([[1.6, 0.4, H + 4.4], [7, 0.4, H + 4.4], [7, -1.9, H + 6.8], [1.6, -1.9, H + 6.8]], 0.3, SH.edge, 0.6);
    p.face([[7, 0.4, H + 4.4], [7, -4.2, H + 4.4], [7, -1.9, H + 6.8]], 0.1, SH.edge, 0.6);
    p.line([[1.6, -1.9, H + 6.8], [1.6, -1.9, H + 7.8], [7, -1.9, H + 7.8], [7, -1.9, H + 6.8]], SH.edge, 0.6);
    // greens: a bunch of leaves at the front
    ([[-3.6, 3.4, 2.5], [-0.8, 5.6, 2.7], [-5.2, 6.4, 2.2], [-2.6, 7.6, 2.3]] as [number, number, number][]).forEach(([x, z, rr], i) => {
      p.ringV("y", [x, 2.4, H + z - 1.5], rr, i % 2 ? 0.22 : 0.16, SH.edge, 0.6);
      p.line([[x, 2.43, H + z - 1.5 - rr * 0.7], [x, 2.43, H + z - 1.5 + rr * 0.5]], 0.6, 0.45);
    });
    // the apple, dropping in at the front corner
    const k = Math.min(1, h * 1.25);
    if (k > 0.01) {
      const ar = 3.5, [x, y] = p.pt([4.4, 3, H + 1.6 + drop(k)]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, ar, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#fff"; g.lineWidth = 0.8; g.lineCap = "round";
        g.beginPath(); g.moveTo(x, y - ar + 0.4); g.lineTo(x + 1, y - ar - 1.8); g.stroke();
        g.beginPath(); g.ellipse(x + 2.4, y - ar - 1.3, 1.5, 0.7, -0.5, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "#000"; g.lineWidth = 0.6; g.beginPath(); g.arc(x - 0.6, y - 0.4, ar * 0.55, Math.PI * 0.9, Math.PI * 1.5); g.stroke();
      });
    }
    // the near walls: a saw cut top edge, a fold line and the gusset
    const teeth: V3[] = Array.from({ length: 29 }, (_, i) => [-W + (2 * W * i) / 28, D, H + (i % 2 ? 0.75 : 0)] as V3);
    p.face([[-W, D, 0], [W, D, 0], ...teeth.slice().reverse()], 0.14, SH.edge, 0.6);
    p.face([[W, -D, 0], [W, D, 0], [W, D, H], [W, -D, H]], SH.right, SH.edge, 0.6);
    p.line([[-W, D + 0.03, H - 3], [W, D + 0.03, H - 3]], 0.7, 0.5);
    p.line([[W + 0.03, D, H], [W + 0.03, 0, H - 5.5], [W + 0.03, -D, H]], 0.7, 0.5);
    p.line([[W + 0.03, 0, H - 5.5], [W + 0.03, 0, 1.5]], 0.7, 0.5);
  },
};
