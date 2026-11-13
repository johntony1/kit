// No stays booked: a hospital bed seen side on, its head section raised, a side rail along it and wheels under it. Hover and the head of the bed tilts further up with its pillow, and a plus badge pops in over the headboard.
import { SH, type Illustration, type Pen } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const io = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pop = (x: number) => (x <= 0 ? 0 : x < 0.65 ? (1 - Math.pow(1 - x / 0.65, 3)) * 1.18 : 1.18 - 0.18 * (1 - Math.pow(1 - (x - 0.65) / 0.35, 3)));
const D = 5.5, ZM = 11; // half depth of the bed, height of the mattress base

/** a leg with its wheel, the wheel seen side on */
function leg(p: Pen, x: number, y: number) {
  p.box(x - 0.8, y - 0.8, 3.6, 1.6, 1.6, ZM - 5.2, { top: 0.2, left: 0.2, right: 0.1, edge: 0 });
  p.ringV("y", [x, y + 0.9, 2.3], 2.3, 0.3, 0, 0.6);
  p.dot([x, y + 0.95, 2.3], 0.9, 0);
}

export const hospitalbed: Illustration = {
  k: "hospitalbed", name: "Hospital bed", title: "No stays booked", body: "Book a stay and its details will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const a = 0.42 + 0.3 * io(cl(h / 0.65));
    p.translate(1, 0, -13);
    p.scale(1.08);
    p.shadow(0, 0, 30, 11, 0.12);
    p.rotate("z", -0.62);
    // the far legs
    leg(p, -14, -D + 1);
    leg(p, 14, -D + 1);
    // the headboard at the far left
    p.box(-22, -D - 0.5, 3.6, 3.6, D * 2 + 1, 22, { top: 0.26, left: 0.22, right: 0.12, edge: 0 });
    // the frame, in shade under the mattress
    p.box(-18, -D, ZM - 2, 36, D * 2, 2, { top: 0.065, left: 0.065, right: 0.05, edge: 0 });
    // the foot part of the mattress
    p.box(-5, -D + 0.4, ZM, 21.6, D * 2 - 0.8, 4, { top: 0.24, left: 0.16, right: 0.065, edge: 0 });
    // the head part, tilted up on its hinge, with its pillow
    p.push();
    p.rotate("y", a, [-5, 0, ZM]);
    p.box(-17.6, -D + 0.4, ZM, 12.4, D * 2 - 0.8, 4, { top: 0.24, left: 0.16, right: 0.065, edge: 0 });
    p.line([[-5.2, D - 0.37, ZM], [-5.2, D - 0.37, ZM + 4]], SH.edge, 0.7);
    p.box(-16.8, -4, ZM + 4, 5.4, 8, 2.6, { top: 0.34, left: 0.2, right: 0.1, edge: 0 });
    p.pop();
    // the footboard at the right
    p.box(16.8, -D - 0.5, 3.6, 2.4, D * 2 + 1, 15.4, { top: 0.26, left: 0.2, right: 0.065, edge: 0 });
    // the near legs
    leg(p, -14, D - 1);
    leg(p, 14, D - 1);
    // the side rail along the near side: a bright bar on two posts, clear of the mattress
    for (const x of [-1, 11]) p.box(x, D + 0.4, ZM + 2, 1.2, 0.9, 7.6, { top: 0.3, left: 0.3, right: 0.12, edge: 0 });
    p.box(-2.5, D + 0.4, ZM + 8.6, 16, 0.9, 1.8, { top: 0.4, left: 0.4, right: 0.14, edge: 0 });
    // the plus badge pops in over the headboard
    const b = pop(cl((h - 0.6) / 0.4));
    if (b > 0) {
      const [x, y] = p.pt([-20.2, D + 0.5, 25.6]), r = 4 * b;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      });
    }
  },
};
